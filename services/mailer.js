// این فایل فقط مسئول فرستادن ایمیله - کاری به دیتابیس یا تلگرام نداره
const nodemailer = require('nodemailer');

// transporter یعنی "فرستنده" - با اطلاعات جیمیلت می‌سازیمش
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // App Password، نه رمز اصلی جیمیل
  },
});

// یه تابع ساده که اطلاعات پیام رو می‌گیره و ایمیل می‌فرسته
async function sendContactEmail({ name, email, message }) {
  await transporter.sendMail({
    from: process.env.GMAIL_USER, // ایمیل فرستنده همیشه خود جیمیل خودته
    to: process.env.GMAIL_USER, // به خودت می‌فرستیم چون این فرم تماس با توعه
    replyTo: email, // ولی اگه ریپلای بزنی، میره برای کسی که پیام داده
    subject: `پیام جدید از پورتفولیو - ${name}`,
    text: `نام: ${name}\nایمیل: ${email}\n\nپیام:\n${message}`,
  });
}

module.exports = { sendContactEmail };
