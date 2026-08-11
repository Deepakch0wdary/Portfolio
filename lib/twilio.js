import twilio from 'twilio';

// Lazy initialize Twilio client to prevent duplicate client creation
let client = null;

function formatWhatsAppNumber(num) {
  if (!num) return '';
  const trimmed = num.trim();
  return trimmed.startsWith('whatsapp:') ? trimmed : `whatsapp:${trimmed}`;
}

function maskNumber(num) {
  if (!num) return 'unknown';
  const clean = num.replace('whatsapp:', '').trim();
  if (clean.length <= 4) return clean;
  return `...${clean.slice(-4)}`;
}

/**
 * Sends a formatted WhatsApp notification to the destination number.
 * 
 * @param {Object} params
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {string} params.email
 * @param {string} params.mobile
 * @param {string} params.message
 * @param {string} params.date - Formatted date/time generated on server
 * @returns {Promise<{success: boolean, sid: string, status: string}>}
 */
export async function sendWhatsAppNotification({ firstName, lastName, email, mobile, message, date }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM;
  const toWhatsApp = process.env.MY_WHATSAPP_NUMBER;

  // Verify credentials server-side only
  if (!accountSid || !authToken || !fromWhatsApp || !toWhatsApp) {
    console.error("[Twilio Diagnostic] Missing configuration environment variables.");
    throw new Error("Configuration error");
  }

  if (!client) {
    client = twilio(accountSid, authToken);
  }

  const fromFormatted = formatWhatsAppNumber(fromWhatsApp);
  const toFormatted = formatWhatsAppNumber(toWhatsApp);

  console.log(`[Twilio Diagnostic] Request: STARTED | From: ${maskNumber(fromFormatted)} | To: ${maskNumber(toFormatted)}`);

  // Build the message payload
  const messageBody = `🔔 NEW PORTFOLIO CONTACT

━━━━━━━━━━━━━━━━━━

👤 NAME
${firstName} ${lastName}

📧 EMAIL
${email}

📱 MOBILE
+91 ${mobile}

💬 MESSAGE
${message}

━━━━━━━━━━━━━━━━━━

🌐 SOURCE
Personal Portfolio Website

⏰ SUBMITTED
${date}

━━━━━━━━━━━━━━━━━━`;

  try {
    const res = await client.messages.create({
      from: fromFormatted,
      to: toFormatted,
      body: messageBody,
    });
    console.log(`[Twilio Diagnostic] Response: SUCCESS | Message SID: ${res.sid} | Status: ${res.status}`);
    return { success: true, sid: res.sid, status: res.status };
  } catch (error) {
    console.error(`[Twilio Diagnostic] Response: FAILED | Error: ${error.message || error}`);
    throw new Error("Twilio API submission failed", { cause: error });
  }
}
