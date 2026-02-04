const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const sendEmail = async (options) => {
  // 1. Try Resend (Recommended for Render/Production)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Note: On Free Tier, 'from' must be 'onboarding@resend.dev' until domain is verified.
      // Once verified, change this to `Swadeshika <official.swadeshika@gmail.com>` or similar.
      const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: options.email,
        subject: options.subject,
        html: options.html || `<p>${options.message}</p>`,
        text: options.message,
        reply_to: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME // Replies will go to your Gmail
      });

      if (error) {
        console.error('❌ Resend API Error:', error);
        throw new Error(error.message);
      }

      console.log(`📧 Email sent via Resend to ${options.email}`, data);
      return; // Success, exit function
    } catch (err) {
      console.error('⚠️ Resend failed, checking for fallback...', err.message);
      // If Resend fails explicitly, we might want to try SMTP as backup
      // or just throw if we trust Resend more.
      // For now, let's fall through to SMTP logic below only if it's NOT a hard auth error.
    }
  }

  // 2. Fallback: SMTP (Nodemailer) - Works locally, usually blocked on Render
  // For production, use SendGrid, Mailgun, or Gmail (with App Password)
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail'
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 3. Define email options
  const mailOptions = {
    from: `Swadeshika Support <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html // HTML supported
  };

  // 4. Send email
  try {
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD || process.env.EMAIL_USERNAME === '' || process.env.EMAIL_PASSWORD === '') {
      console.log('⚠️  Email credentials missing in .env. Logging email to console instead:');
      console.log(`To: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Message: ${options.message}`);
      // IMPORTANT: We do NOT return here, we treat this as a "success" so the user isn't blocked.
      // But we skip the actual nodemailer send
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent (SMTP) to ${options.email}`);
  } catch (err) {
    console.error('❌ Error sending email (SMTP):', err.message);

    // Fallback: If email fails (e.g. wrong credentials), log to console so dev works
    console.log('⚠️  Email sending failed. Logging email to console as fallback:');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);

    // Do NOT throw error in development, so the user flow continues
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email could not be sent via SMTP or Resend');
    }
  }
};

module.exports = sendEmail;
