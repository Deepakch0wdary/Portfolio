import { Resend } from 'resend';

// Lazy initialize Resend client to prevent duplicate client creation
let resend = null;

/**
 * Sends a formatted Email notification to the contact inbox.
 * 
 * @param {Object} params
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {string} params.email
 * @param {string} params.mobile
 * @param {string} params.message
 * @param {string} params.date - Formatted date/time generated on server
 * @returns {Promise<{success: boolean, id: string}>}
 */
export async function sendEmailNotification({ firstName, lastName, email, mobile, message, date }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  const toEmail = process.env.CONTACT_EMAIL || 'v.deepak332100@gmail.com';

  // Verify credentials server-side only
  if (!apiKey || !fromEmail) {
    console.error("[Resend Error] Missing Resend configuration environment variables.");
    throw new Error("Configuration error");
  }

  if (!resend) {
    resend = new Resend(apiKey);
  }

  const emailSubject = `New Portfolio Contact — ${firstName} ${lastName}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #ff2a2a; margin-top: 0;">New Portfolio Contact</h2>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Mobile:</strong> +91 ${mobile}</p>
      
      <p><strong>Message:</strong></p>
      <div style="background: #f9f9f9; border-left: 5px solid #ff2a2a; margin: 15px 0; padding: 15px; font-style: italic; white-space: pre-wrap;">${message}</div>
      
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #777;"><strong>Source:</strong> Personal Portfolio Website</p>
      <p style="font-size: 12px; color: #777;"><strong>Permission:</strong> Granted to contact at this email address</p>
      <p style="font-size: 12px; color: #777;"><strong>Submitted At:</strong> ${date}</p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: emailSubject,
      html: htmlContent,
      replyTo: email
    });
    return { success: true, id: data.id };
  } catch (error) {
    // Only log error details server-side, do not leak secrets
    console.error("[Resend API Error]:", error.message || error);
    throw new Error("Resend API submission failed", { cause: error });
  }
}
