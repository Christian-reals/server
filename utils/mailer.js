const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
  // Create a transport object for sending email
  let transporter = nodemailer.createTransport({
    service:"gmail",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.PASSWORD
    }
  });

  // Define the email content
  let mailOptions = {
    from: '"Christainreals.com" <ayomikunfaluyi@gmail.com>',
    to: email,
    subject: 'Email Verification',
    html: `
      <p>Please click on the following link to verify your email address:</p>
      <a href="http://localhost:3000/verify-email/${token}">Verify Email</a>
    `
  };

  // Send the email
  let info = await transporter.sendMail(mailOptions);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendVerificationEmail;