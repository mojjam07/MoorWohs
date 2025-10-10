const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST || 'smtp.gmail.com',
  port: config.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS
  }
});

// Verify transporter configuration only if email user is configured
if (config.EMAIL_USER) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email transporter verification failed:', error);
    } else {
      console.log('Email transporter is ready to send messages');
    }
  });
} else {
  console.log('Email configuration not provided, skipping transporter verification');
}

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: config.EMAIL_FROM || config.EMAIL_USER,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send contact notification email
const sendContactNotification = async (contactData) => {
  const { name, email, message } = contactData;

  const subject = 'New Contact Form Submission';
  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br>')}</p>
    <hr>
    <p>This message was sent from your portfolio contact form.</p>
  `;

  // Send to admin (you can configure this email in config)
  const adminEmail = config.ADMIN_EMAIL || 'admin@example.com';

  return await sendEmail(adminEmail, subject, html);
};

module.exports = {
  sendEmail,
  sendContactNotification
};
