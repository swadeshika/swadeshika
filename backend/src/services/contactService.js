const ContactModel = require('../models/contactModel');

class ContactService {
     /**
      * Get all submissions
      * @param {Object} query 
      */
     static async getAllSubmissions(query) {
          // Enforce integer conversion for pagination here
          const page = parseInt(query.page) || 1;
          const limit = parseInt(query.limit) || 20;
          return await ContactModel.findAll({ ...query, page, limit });
     }

     /**
      * Get single submission
      * @param {number} id 
      */
     static async getSubmissionById(id) {
          return await ContactModel.findById(id);
     }

     /**
      * Create new submission
      * @param {Object} data 
      */
     static async createSubmission(data) {
          const submission = await ContactModel.create(data);

          // Send Email Notifications (Async)
          const { sendEmail } = require('../utils/email');
          const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USERNAME;

          // 1. Admin Notification
          sendEmail({
               email: adminEmail,
               subject: `New Contact Form: ${data.subject}`,
               message: `Name: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`,
               html: `
                    <h3>New Contact Submission</h3>
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Subject:</strong> ${data.subject}</p>
                    <p><strong>Message:</strong><br>${data.message.replace(/\n/g, '<br>')}</p>
               `
          }).catch(err => console.error('Failed to send contact admin notification:', err));

          // 2. User Auto-Response (Acknowledgement)
          if (data.email) {
               sendEmail({
                    to: data.email, // using 'to' or 'email' depending on utility implementation (utility handles both usually?)
                    // wait, utility uses options.email (line 17 of email.js).
                    // let's check email.js signature. options.email is used for 'to'.
                    email: data.email,
                    subject: 'We received your message - Swadeshika',
                    message: `Hi ${data.name},\n\nThank you for contacting us. We have received your message regarding "${data.subject}" and will get back to you shortly.\n\nBest Regards,\nSwadeshika Team`,
                    html: `
                         <div style="font-family: Arial, sans-serif;">
                              <h3 style="color: #2D5F3F;">Thank you for contacting us!</h3>
                              <p>Hi ${data.name},</p>
                              <p>We have received your message regarding <strong>${data.subject}</strong>.</p>
                              <p>Our team will review it and get back to you shortly.</p>
                              <br>
                              <p>Best Regards,<br><strong>Swadeshika Team</strong></p>
                         </div>
                    `
               }).catch(err => console.error('Failed to send contact auto-response:', err));
          }

          return submission;
     }

     /**
      * Update submission status
      * @param {number} id 
      * @param {string} status 
      */
     static async updateStatus(id, status) {
          const submission = await ContactModel.findById(id);
          if (!submission) return null;

          await ContactModel.update(id, { status });

          // Return updated object
          return { ...submission, status };
     }

     /**
      * Reply to submission
      * @param {number} id 
      * @param {string} replyMessage 
      */
     static async replyToSubmission(id, replyMessage) {
          // 1. Get submission to find email
          const submission = await ContactModel.findById(id);
          if (!submission) throw new Error('Submission not found');

          // 2. Send email using nodemailer
          const { sendEmail } = require('../utils/email');
          try {
              await sendEmail({
                  to: submission.email,
                  subject: `Re: ${submission.subject || 'Your Contact Form Submission'}`,
                  text: replyMessage,
                  html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                          <h2 style="color: #2D5F3F;">Swadeshika Team Response</h2>
                          <p>Dear ${submission.name},</p>
                          <p>${replyMessage.replace(/\n/g, '<br>')}</p>
                          <hr style="border: 1px solid #E8DCC8; margin: 20px 0;">
                          <p style="font-size: 12px; color: #8B6F47;">
                              This is a response to your contact form submission.<br>
                              Original Subject: ${submission.subject || 'N/A'}
                          </p>
                      </div>
                  `
              });
          } catch (emailError) {
              console.error('Failed to send reply email:', emailError);
              // Don't throw - still update status even if email fails
          }

          // 3. Update status to 'replied'
          await ContactModel.update(id, { status: 'replied' });

          return true;
     }

     /**
      * Delete (Archive) submission
      * @param {number} id 
      */
     static async deleteSubmission(id) {
          return await ContactModel.delete(id);
     }
}

module.exports = ContactService;
