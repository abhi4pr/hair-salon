const { transporter } = require('../config/mailer');

const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"Salon App" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
