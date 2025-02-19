const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Or use SMTP settings
  auth: {
    user: "deviieydevendranath@gmail.com",
    pass: "kldu rwun zuyr wylt",
  },
});

async function sendWelcomeEmail(userEmail, userName) {
  const mailOptions = {
    from: "deviieydevendranath@gmail.com",
    to: userEmail,
    subject: "Welcome to Our Platform!",
    text: `Welcome to Online Order ${userName},\n\nThank you for registering. We're excited to have you on board!\n\nBest,\nOnline Order Management System.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = { sendWelcomeEmail };