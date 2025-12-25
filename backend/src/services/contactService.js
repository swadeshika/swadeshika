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
          // Here we could add logic like sending an auto-response email to the user
          return await ContactModel.create(data);
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

          // 2. TODO: Integrte Nodemailer to send actual email
          console.log(`Sending email to ${submission.email}: ${replyMessage}`);

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
