// Controller فرم تماس - وقتی کسی فرم رو submit می‌کنه، همه چی از اینجا شروع میشه
const Message = require('../models/Message');
const { sendContactEmail } = require('../services/mailer');
const { sendTelegramMessage } = require('../services/telegram');

// حداکثر طول هر فیلد - که کسی نتونه متن‌های خیلی بزرگ بفرسته
const LIMITS = { name: 80, email: 120, message: 3000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// فقط رشته قبول می‌کنیم (نه آبجکت یا آرایه) و فاصله‌های اول و آخر رو حذف می‌کنیم
const clean = (value) => (typeof value === 'string' ? value.trim() : '');

exports.createMessage = async (req, res) => {
  const body = req.body || {};
  // اسم توی عنوان ایمیل میره، پس خط جدید نباید داشته باشه
  const name = clean(body.name).replace(/[\r\n]+/g, ' ');
  const email = clean(body.email);
  const message = clean(body.message);

  // اعتبارسنجی - قبل از هر کاری چک می‌کنیم فیلدها درست باشن
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'نام، ایمیل و متن پیام الزامیه' });
  }
  if (name.length > LIMITS.name || email.length > LIMITS.email || message.length > LIMITS.message) {
    return res.status(400).json({ message: 'یکی از فیلدها خیلی طولانیه' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: 'ایمیل واردشده معتبر نیست' });
  }

  try {
    // اول پیام رو توی دیتابیس ذخیره می‌کنیم (status پیش‌فرض: pending)
    const newMessage = await Message.create({ name, email, message });

    // ایمیل اصل کاره - اگه این خطا بده، کل درخواست رو خطا می‌دونیم
    await sendContactEmail({ name, email, message });

    // تلگرام "best-effort"ـه: سعی می‌کنیم بفرستیم، ولی اگه خطا داد
    // (مثلاً تلگرام فیلتر بود) کاربر چیزی نمی‌فهمه، فقط توی لاگ سرور می‌بینیم
    try {
      await sendTelegramMessage({ name, email, message });
    } catch (telegramErr) {
      console.error('ارسال تلگرام ناموفق بود (نادیده گرفته شد):', telegramErr.message);
    }

    newMessage.status = 'sent';
    await newMessage.save();

    res.status(201).json({ message: 'پیام با موفقیت ارسال شد' });
  } catch (err) {
    console.error('خطا در پردازش پیام:', err.message);
    // اگه به اینجا رسیدیم یعنی خود ایمیل (نه تلگرام) خطا داده
    res.status(500).json({ message: 'پیام ذخیره شد ولی در ارسال مشکلی پیش اومد' });
  }
};
