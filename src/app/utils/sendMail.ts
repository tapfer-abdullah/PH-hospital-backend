import nodemailer from "nodemailer";
import envConfig from "../config/index.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: envConfig.NODE_MAILER.SENDER_EMAIL,
    pass: envConfig.NODE_MAILER.MAIL_PASS,
  },
});

const sendMail = async (to: string, subject: string, html: string) => {
  // Create a test account or replace with real credentials.

  const info = await transporter.sendMail({
    from: `"AK-Health Care" <${envConfig.NODE_MAILER.SENDER_EMAIL}>`,
    to: to,
    subject: subject,
    text: html, // plain‑text body
    html: html, // HTML body
  });

  return info;
};

export default sendMail;
