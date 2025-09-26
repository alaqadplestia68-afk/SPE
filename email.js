import nodemailer from 'nodemailer';

const host = process.env.EMAIL_SMTP_HOST;
const port = Number(process.env.EMAIL_SMTP_PORT || 587);
const user = process.env.EMAIL_SMTP_USER;
const pass = process.env.EMAIL_SMTP_PASS;
const from = process.env.EMAIL_FROM;

let transporter = null;
if (host && user && pass) {
  transporter = nodemailer.createTransport({
    host, port, secure: false,
    auth: { user, pass }
  });
}

export async function sendCredentialEmail(to, password) {
  if (!transporter) throw new Error('Email transporter not configured');
  await transporter.sendMail({
    from,
    to,
    subject: 'Your SPE UNIBEN election login',
    html: `<p>Hello,</p><p>Your login: <b>${to}</b></p><p>Password: <b>${password}</b></p><p>Login and vote at the election portal.</p>`
  });
}
