import { sendWhatsAppNotification } from '../lib/twilio.js';
import { sendEmailNotification } from '../lib/resend.js';

// In-memory rate limiting map (IP -> timestamps array)
const rateLimitMap = new Map();

// Simple in-memory rate limiter: max 3 requests per 1 minute
function isRateLimited(ip) {
  const now = Date.now();
  const timeframe = 60000; // 1 minute
  const maxRequests = 3;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const timestamps = rateLimitMap.get(ip);
  const activeTimestamps = timestamps.filter(t => now - t < timeframe);

  if (activeTimestamps.length >= maxRequests) {
    return true;
  }

  activeTimestamps.push(now);
  rateLimitMap.set(ip, activeTimestamps);
  return false;
}

// Utility to parse JSON body across raw http (Vite Dev Server) and pre-parsed http (Vercel)
async function parseBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
  }

  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > 10240) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
      }
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', err => reject(err));
  });
}

// Helper to send JSON responses consistently in both raw Node HTTP and Vercel environments
function sendJSON(res, statusCode, data) {
  if (res.headersSent) return;
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(data);
  } else {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
  }
}

// Escapes special characters to prevent HTML/Script injection
function sanitizeInput(val) {
  if (typeof val !== 'string') return '';
  return val
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^\d{10}$/;

function isConfigured(val) {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  if (s === '' || s.includes('your_') || s.includes('placeholder') || s.startsWith('ac_') || s === 're_your_api_key') {
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    } else {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      return res.end();
    }
  }

  // 1. Enforce POST HTTP Method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return sendJSON(res, 405, { success: false, error: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} Not Allowed` });
  }

  // 2. Protect against excessively large payload header size
  const contentLength = req.headers['content-length'];
  if (contentLength && parseInt(contentLength, 10) > 10240) {
    return sendJSON(res, 413, { success: false, error: 'PAYLOAD_TOO_LARGE', message: 'Payload too large' });
  }

  // 3. Enforce rate limiting by IP
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
  if (isRateLimited(ip)) {
    return sendJSON(res, 429, { success: false, error: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' });
  }

  try {
    // 4. Parse incoming request body
    const body = await parseBody(req);

    // 5. Honeypot check (hidden "website" field to catch automated bot submissions)
    if (body.website && body.website.trim() !== '') {
      return sendJSON(res, 200, { success: true, message: 'Message sent successfully' });
    }

    // 6. Extract form fields
    const { firstName, lastName, email, mobile, message, permission } = body;

    // Validate permission
    if (permission !== true) {
      return sendJSON(res, 400, { success: false, error: 'VALIDATION_ERROR', message: 'Invalid form data' });
    }

    // Sanitize and validate inputs
    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedLastName = sanitizeInput(lastName);
    const sanitizedEmail = email ? email.trim() : '';
    const sanitizedMessage = sanitizeInput(message);

    if (
      !sanitizedFirstName || sanitizedFirstName.length < 2 ||
      !sanitizedLastName || sanitizedLastName.length < 2 ||
      !sanitizedEmail || !emailRegex.test(sanitizedEmail) ||
      !mobile || !mobileRegex.test(mobile) ||
      !sanitizedMessage || sanitizedMessage.length < 5 || sanitizedMessage.length > 2000
    ) {
      return sendJSON(res, 400, { success: false, error: 'VALIDATION_ERROR', message: 'Invalid form data' });
    }

    // 7. Check credentials configuration
    const twilioValid = isConfigured(process.env.TWILIO_ACCOUNT_SID) && isConfigured(process.env.TWILIO_AUTH_TOKEN) && isConfigured(process.env.TWILIO_WHATSAPP_FROM) && isConfigured(process.env.MY_WHATSAPP_NUMBER);
    const resendValid = isConfigured(process.env.RESEND_API_KEY) && isConfigured(process.env.EMAIL_FROM);

    if (!twilioValid && !resendValid) {
      console.error("[Contact API Error] Neither Twilio nor Resend are configured with valid credentials.");
      return sendJSON(res, 500, {
        success: false,
        error: 'CONFIGURATION_ERROR',
        message: 'Notification credentials are not configured on the server. Please add your API keys to .env.local'
      });
    }

    // 8. Generate submission timestamp on the server (Indian timezone context)
    const now = new Date();
    const formattedDate = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });

    let whatsappSuccess = false;
    let emailSuccess = false;

    // 9. Route notification to Twilio WhatsApp client if configured
    if (twilioValid) {
      try {
        await sendWhatsAppNotification({
          firstName: sanitizedFirstName,
          lastName: sanitizedLastName,
          email: sanitizedEmail,
          mobile: mobile,
          message: sanitizedMessage,
          date: formattedDate
        });
        whatsappSuccess = true;
      } catch (error) {
        console.error("[Contact API Twilio Dispatch Error]:", error?.message || error);
      }
    } else {
      console.warn("[Contact API Warning] Twilio credentials not configured; skipping WhatsApp notification.");
    }

    // 10. Route notification to Resend email client if configured
    if (resendValid) {
      try {
        await sendEmailNotification({
          firstName: sanitizedFirstName,
          lastName: sanitizedLastName,
          email: sanitizedEmail,
          mobile: mobile,
          message: sanitizedMessage,
          date: formattedDate
        });
        emailSuccess = true;
      } catch (error) {
        console.error("[Contact API Resend Dispatch Error]:", error?.message || error);
      }
    } else {
      console.warn("[Contact API Warning] Resend credentials not configured; skipping Email notification.");
    }

    // 11. Handle delivery results
    if (whatsappSuccess || emailSuccess) {
      return sendJSON(res, 200, { success: true, message: 'Message sent successfully' });
    }

    // If both configured attempts failed
    if (twilioValid && resendValid) {
      return sendJSON(res, 500, { success: false, error: 'NOTIFICATION_SERVICE_ERROR', message: 'Unable to send message' });
    } else if (twilioValid) {
      return sendJSON(res, 500, { success: false, error: 'WHATSAPP_SERVICE_ERROR', message: 'Unable to send WhatsApp message' });
    } else {
      return sendJSON(res, 500, { success: false, error: 'EMAIL_SERVICE_ERROR', message: 'Unable to send email' });
    }

  } catch (error) {
    if (error.message === 'PAYLOAD_TOO_LARGE') {
      return sendJSON(res, 413, { success: false, error: 'PAYLOAD_TOO_LARGE', message: 'Payload too large' });
    }
    console.error("[Contact API Internal Server Error]:", error);
    return sendJSON(res, 500, { success: false, error: 'INTERNAL_SERVER_ERROR', message: 'Unable to send message' });
  }
}
