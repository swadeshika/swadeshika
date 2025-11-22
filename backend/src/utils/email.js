const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter
  // For production, use SendGrid, Mailgun, or Gmail (with App Password)
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail'
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define email options
  const mailOptions = {
    from: `Swadeshika Support <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // You can add HTML support later
  };

  // 3. Send email
  try {
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
        console.log('⚠️  Email credentials missing in .env. Logging email to console instead:');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${options.email}`);
  } catch (err) {
    console.error('❌ Error sending email:', err);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
