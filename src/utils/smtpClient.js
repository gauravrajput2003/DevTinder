// const nodemailer = require('nodemailer');

// // Create a reusable transporter using SMTP settings from env
// // Supports popular providers like Brevo/SendGrid/Mailgun or any SMTP server
// // Required env (example):
// // SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE ("true"|"false"), SMTP_FROM
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT || 587),
//   secure: String(process.env.SMTP_SECURE || 'false') === 'true',
//   auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   } : undefined,
// });

// async function sendSMTPMail({ to, subject, html, text, from, replyTo }) {
//   const info = await transporter.sendMail({
//     from: from || process.env.SMTP_FROM,
//     to,
//     subject,
//     html,
//     text,
//     replyTo,
//   });
//   return info;
// }

// module.exports = { transporter, sendSMTPMail };
