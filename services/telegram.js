// این فایل فقط مسئول فرستادن پیام به تلگرامه
const fetch = require('node-fetch');

async function sendTelegramMessage({ name, email, message }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // آدرس API ربات تلگرام همیشه همین شکلیه: .../bot<TOKEN>/sendMessage
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const text = `📩 پیام جدید از پورتفولیو\n\nنام: ${name}\nایمیل: ${email}\n\nپیام:\n${message}`;

  // یه درخواست POST به تلگرام می‌زنیم و متن پیام رو می‌فرستیم
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  const data = await res.json();
  if (!data.ok) {
    // اگه خود تلگرام خطا برگردوند (مثلاً توکن اشتباهه)، به صورت Error پرتابش می‌کنیم
    throw new Error('ارسال تلگرام ناموفق بود: ' + JSON.stringify(data));
  }
}

module.exports = { sendTelegramMessage };
