// Controller فرم تماس - وقتی کسی فرم رو submit می‌کنه، همه چی از اینجا شروع میشه
const Message = require('../models/Message');
const { sendContactEmail } = require('../services/mailer');
const { sendTelegramMessage } = require('../services/telegram');

exports.createMessage = async (req, res) => {
  const { name, email, message } = req.body;

  // اعتبارسنجی ساده - قبل از هر کاری چک می‌کنیم فیلدها خالی نباشن
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'نام، ایمیل و متن پیام الزامیه' });
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
