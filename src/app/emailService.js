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
    text: `Welcome to Online Order ${userName},
    \n\nThank you for registering. We're excited to have you on board!\n Please use ${userEmail} to login to your account.
    \n\nBest,\nOnline Order Management System.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

function sendEmail(to, subject, message) {

  const mailOptions = {
      from: "deviieydevendranath@gmail.com",
      to,
      subject,
      text: message
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error("Error sending email:", error);
      } else {
          console.log("Email sent:", info.response);
      }
  });
}

// Send Order Confirmation Email
async function sendOrderConfirmationEmail(userEmail, orderNumber, address, userN) {
  const mailOptions = {
    from: "deviieydevendranath@gmail.com",
    to: userEmail,
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <h3>Order Confirmation</h3>
      <p>Hi ${userN}</p>
      <p>Boom! ✋ Your order is officially locked in and ready to roll. Our team is giving you a virtual high-five right now because you've made an awesome choice.</p>
      <p>Don't forget to use this order number as reference <strong>${orderNumber }</strong></p>
      <p>Keep an eye on your email, cause we’ll be sending you order status updates. Need to know sooner? Simply log into your online profile and view your order status there.</p>
      <p>Thanks for ordering and shopping at BMC.com</p>
    `,
  };

  const adminMailOptions = {
    from: "deviieydevendranath@gmail.com",
    to: "deviieydevendranath@gmail.com",
    subject: `New Order Alert - ${orderNumber}`,
    html: `
      <h3>New Order Alert</h3>
      <p>A new order has been placed.</p>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>User Name:</strong> ${userN}</p>
      <p><strong>Customer Email:</strong> ${userEmail}</p>
      <p><strong>Shipping Address:</strong> ${address}</p>
      <p>Please review the order in the admin dashboard.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(adminMailOptions);
    console.log("Order confirmation emails sent.");
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
}
async function sendEmailNotification(email, orderNumber, newStatus) {
  try {

    let mailOptions = {
      from: '"BMC Online Management System" <deviieydevendranath@gmail.com>',
      to: email,
      subject: `Order #${orderNumber} Status Update`,
      text: `Dear Customer,\n\nYour order #${orderNumber} has been updated to: ${newStatus}.\n\nThank you for shopping with us!\n\nBest regards,\nBMC Online Management System Team`
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email} for Order #${orderNumber} with status ${newStatus}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// function sendOrderConfirmationEmail(userId, orderNumber) {
//   const userEmail = getUserEmail(userId); // Fetch from DB

//   const emailBody = `
//     <h3>Order Confirmation</h3>
//     <p>Thank you for your order!</p>
//     <p>Your Order Number: <strong>${orderNumber}</strong></p>
//     <p>We are processing your order and will notify you when it ships.</p>
//   `;

//   sendEmail(userEmail, "Order Confirmation", emailBody); // Replace with actual email function

//   // Notify admin
//   sendEmail("deviieydevendranath@gmail.com", "New Order Alert", `New order received: ${orderNumber}`);
// }

// module.exports = { sendOrderConfirmationEmail, transporter };
module.exports = { sendWelcomeEmail };
module.exports = { sendEmail };
module.exports = { sendOrderConfirmationEmail, transporter};
module.exports = {sendEmailNotification};