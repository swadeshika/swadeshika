require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('--- Email Diagnostic Script ---');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
  console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME ? 'SET' : 'NOT SET');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET');
  
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Critical Error: Missing email credentials in process.env');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Adding debug options
    debug: true,
    logger: true 
  });

  const mailOptions = {
    from: `Diagnostic Test <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
    to: process.env.EMAIL_USERNAME, // Sending to self for testing
    subject: 'Swadeshika Production Email Test',
    text: 'If you receive this, the email configuration is CORRECT on this server.',
  };

  try {
    console.log('Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('❌ Email Sending Failed!');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    if (err.response) {
      console.error('SMTP Response:', err.response);
    }
    
    // Common Troubleshooting Tips based on error
    if (err.code === 'EAUTH') {
      console.log('\n💡 Hint: Authentication failed. Check your App Password or Allow Less Secure Apps (if applicable).');
    } else if (err.code === 'ECONNECTION' || err.code === 'ETIMEDOUT') {
      console.log('\n💡 Hint: Connection blocked. Your server might be blocking outgoing port 587/465.');
      console.log('   - If on AWS EC2: Check Security Groups (Outbound Rules).');
      console.log('   - If on DigitalOcean: Check dashboard for blocked SMTP.');
    }
  }
}

testEmail();
