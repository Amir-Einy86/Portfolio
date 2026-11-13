// مدل پیام‌های فرم تماس با من - هر پیامی که کاربر از سایت بفرسته اینجا ذخیره میشه
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // اسم فرستنده - اجباریه
      trim: true, // فاصله‌های اضافه‌ی اول و آخر رو خودش حذف می‌کنه
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // همه ایمیل‌ها رو حروف کوچیک ذخیره می‌کنه که یکدست باشه
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'], // فقط همین سه تا مقدار مجازن
      default: 'pending', // وقتی پیام تازه ذخیره میشه، هنوز به جیمیل/تلگرام نرفته
    },
  },
  {
    timestamps: true, // createdAt رو لازم داریم که بفهمیم پیام کی اومده
  }
);

module.exports = mongoose.model('Message', messageSchema);
