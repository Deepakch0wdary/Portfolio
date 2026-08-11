import twilio from 'twilio';

// Lazy initialize Twilio client to prevent duplicate client creation
let client = null;

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
 * @returns {Promise<{success: boolean, sid: string}>}
 */
export async function sendWhatsAppNotification({ firstName, lastName, email, mobile, message, date }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM;
  const toWhatsApp = process.env.MY_WHATSAPP_NUMBER;

  // Verify credentials server-side only
  if (!accountSid || !authToken || !fromWhatsApp || !toWhatsApp) {
    console.error("[Twilio Error] Missing configuration environment variables.");
    throw new Error("Configuration error");
  }

  if (!client) {
    client = twilio(accountSid, authToken);
  }

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
      from: fromWhatsApp,
      to: toWhatsApp,
      body: messageBody,
    });
    return { success: true, sid: res.sid };
  } catch (error) {
    // Only log the actual error message server-side, never expose tokens/details to the client
    console.error("[Twilio API Error]:", error.message || error);
    throw new Error("Twilio API submission failed", { cause: error });
  }
}
