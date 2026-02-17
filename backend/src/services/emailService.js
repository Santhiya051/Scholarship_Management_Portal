const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.fromEmail = process.env.FROM_EMAIL || 'noreply@scholarportal.edu';
    this.fromName = process.env.FROM_NAME || 'ScholarPortal';
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Welcome email for new users
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to ScholarPortal';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Welcome to ScholarPortal!</h2>
        <p>Dear ${user.first_name} ${user.last_name},</p>
        <p>Welcome to ScholarPortal! Your account has been successfully created.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse available scholarships</li>
          <li>Submit scholarship applications</li>
          <li>Track your application status</li>
          <li>Upload required documents</li>
        </ul>
        <p>
          <a href="${process.env.FRONTEND_URL}/login" 
             style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Login to Your Account
          </a>
        </p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The ScholarPortal Team</p>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Application submitted notification
  async sendApplicationSubmittedEmail(user, scholarship) {
    const subject = 'Application Submitted Successfully';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Application Submitted</h2>
        <p>Dear ${user.first_name} ${user.last_name},</p>
        <p>Your application for the <strong>${scholarship.name}</strong> has been successfully submitted.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Application Details:</h3>
          <p><strong>Scholarship:</strong> ${scholarship.name}</p>
          <p><strong>Amount:</strong> $${scholarship.amount.toLocaleString()}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Your application is now under review. You will receive email notifications as your application progresses through the review process.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/applications" 
             style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Application Status
          </a>
        </p>
        <p>Best regards,<br>The ScholarPortal Team</p>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Application approved notification
  async sendApplicationApprovedEmail(user, scholarship, application) {
    const subject = 'Congratulations! Your Scholarship Application Has Been Approved';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">🎉 Congratulations!</h2>
        <p>Dear ${user.first_name} ${user.last_name},</p>
        <p>We are delighted to inform you that your application for the <strong>${scholarship.name}</strong> has been approved!</p>
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="margin-top: 0; color: #065f46;">Award Details:</h3>
          <p><strong>Scholarship:</strong> ${scholarship.name}</p>
          <p><strong>Award Amount:</strong> $${scholarship.amount.toLocaleString()}</p>
          <p><strong>Academic Year:</strong> ${scholarship.academic_year}</p>
        </div>
        <p>The scholarship funds will be processed and disbursed according to our standard procedures. You will receive further communication regarding the disbursement timeline.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/applications/${application.id}" 
             style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Application Details
          </a>
        </p>
        <p>Once again, congratulations on this achievement!</p>
        <p>Best regards,<br>The ScholarPortal Team</p>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Application rejected notification
  async sendApplicationRejectedEmail(user, scholarship, reason = '') {
    const subject = 'Scholarship Application Update';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Application Update</h2>
        <p>Dear ${user.first_name} ${user.last_name},</p>
        <p>Thank you for your interest in the <strong>${scholarship.name}</strong>.</p>
        <p>After careful review, we regret to inform you that your application was not selected for this scholarship opportunity.</p>
        ${reason ? `
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h4 style="margin-top: 0;">Feedback:</h4>
          <p>${reason}</p>
        </div>
        ` : ''}
        <p>We encourage you to continue exploring other scholarship opportunities available through ScholarPortal. New scholarships are added regularly.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/scholarships" 
             style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Browse Other Scholarships
          </a>
        </p>
        <p>Best regards,<br>The ScholarPortal Team</p>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Document required notification
  async sendDocumentRequiredEmail(user, scholarship, missingDocuments) {
    const subject = 'Additional Documents Required';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Documents Required</h2>
        <p>Dear ${user.first_name} ${user.last_name},</p>
        <p>Your application for the <strong>${scholarship.name}</strong> requires additional documentation.</p>
        <div style="background-color: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h4 style="margin-top: 0;">Missing Documents:</h4>
          <ul>
            ${missingDocuments.map(doc => `<li>${doc}</li>`).join('')}
          </ul>
        </div>
        <p>Please upload the required documents as soon as possible to continue the review process.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/applications" 
             style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Upload Documents
          </a>
        </p>
        <p>Best regards,<br>The ScholarPortal Team</p>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Payment processed notification
  async sendPaymentProcessedEmail(user, scholarship, payment) {
    const subject = 'Scholarship Payment Processed';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Payment Processed</h2>
        <p>Dear ${user.first_name} ${user.last_name},</p>
        <p>Your scholarship payment has been successfully processed!</p>
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Details:</h3>
          <p><strong>Scholarship:</strong> ${scholarship.name}</p>
          <p><strong>Amount:</strong> $${payment.amount.toLocaleString()}</p>
          <p><strong>Reference Number:</strong> ${payment.reference_number}</p>
          <p><strong>Payment Method:</strong> ${payment.payment_method.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Processed Date:</strong> ${new Date(payment.processed_at).toLocaleDateString()}</p>
        </div>
        <p>The funds should appear in your account within 3-5 business days.</p>
        <p>If you have any questions about this payment, please contact our finance department.</p>
        <p>Best regards,<br>The ScholarPortal Team</p>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Deadline reminder
  async sendDeadlineReminderEmail(user, scholarship, daysLeft) {
    const subject = `Reminder: ${scholarship.name} Application Deadline Approaching`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">⏰ Deadline Reminder</h2>
        <p>Dear ${user.first_name} ${user.last_name},</p>
        <p>This is a friendly reminder that the application deadline for the <strong>${scholarship.name}</strong> is approaching.</p>
        <div style="background-color: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0;">Important Details:</h3>
          <p><strong>Scholarship:</strong> ${scholarship.name}</p>
          <p><strong>Amount:</strong> $${scholarship.amount.toLocaleString()}</p>
          <p><strong>Deadline:</strong> ${new Date(scholarship.application_deadline).toLocaleDateString()}</p>
          <p><strong>Days Remaining:</strong> ${daysLeft} days</p>
        </div>
        <p>Don't miss this opportunity! Make sure to submit your application before the deadline.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/scholarships/${scholarship.id}" 
             style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Apply Now
          </a>
        </p>
        <p>Best regards,<br>The ScholarPortal Team</p>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const subject = 'Password Reset Request';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Password Reset Request</h2>
        <p>Dear ${user.first_name} ${user.last_name},</p>
        <p>You have requested to reset your password for your ScholarPortal account.</p>
        <p>Click the button below to reset your password:</p>
        <p>
          <a href="${resetUrl}" 
             style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
        <p>Best regards,<br>The ScholarPortal Team</p>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }
}

module.exports = new EmailService();