require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const messageRoutes = require('./routes/messageRoutes');
const securityHeaders = require('./middlewares/securityHeaders');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

connectDB();

// روی هاست (مثل لیارا) سایت پشت یه پروکسی اجرا میشه؛ این باعث میشه IP واقعی بازدیدکننده
// رو بگیریم (برای rate limit لازمه). با TRUST_PROXY=1 توی .env روشن میشه.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);

app.disable('x-powered-by'); // نگیم سرور با Express ساخته شده
app.use(securityHeaders);

// CORS: فقط آدرس‌هایی که توی CORS_ORIGINS نوشتی اجازه دارن از مرورگر به API درخواست بدن.
// وقتی صفحه و API روی یک دامنه‌ان، اصلاً به CORS نیازی نیست و این فقط برای حالت‌های خاصه.
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  '/api',
  cors({
    origin(origin, cb) {
      // origin خالی یعنی درخواست از همین دامنه یا از ابزاری مثل curl
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      // در حالت توسعه، باز کردن index.html مستقیم از روی فایل (origin = "null") هم مجازه
      if (!isProd && (origin === 'null' || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
        return cb(null, true);
      }
      return cb(null, false);
    },
  })
);

app.use(express.json({ limit: '10kb' })); // پیام تماس هیچ‌وقت از ۱۰ کیلوبایت بزرگ‌تر نیست

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/messages', messageRoutes);
app.use('/api', (req, res) => res.status(404).json({ message: 'مسیر پیدا نشد' }));

// فقط پوشه‌ی public به بیرون سرو میشه (index.html و عکس‌ها).
// هرگز کل پوشه‌ی پروژه رو سرو نکن، وگرنه .env و کدها قابل دانلود میشن.
app.use(express.static(path.join(__dirname, 'public'), { maxAge: isProd ? '1d' : 0, index: 'index.html' }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));

// اگه جایی خطای پیش‌بینی‌نشده پیش اومد (مثلاً JSON خراب)، جزئیات به کاربر نشون داده نمیشه
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error('خطای سرور:', err.message);
  res.status(status).json({ message: status === 413 ? 'پیام خیلی طولانیه' : 'درخواست نامعتبره' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 سرور روی پورت ${PORT} روشنه`));
