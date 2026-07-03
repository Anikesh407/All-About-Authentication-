import { createTransport } from "nodemailer";

const sendMail = async ({ email, subject, html }) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject,
    html,

  });
}

export default sendMail;