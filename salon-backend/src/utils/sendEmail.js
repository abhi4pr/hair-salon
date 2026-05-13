import { transporter } from '../config/mailer.js';

const sendEmail = async ({ to, subject, html, text }) => {
  await transporter.sendMail({
    from: `"Salon App" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
};

export default sendEmail;
