// محدودیت تعداد درخواست (rate limit) - جلوی اسپم شدن فرم تماس رو می‌گیره
// هر IP توی هر بازه‌ی زمانی فقط تعداد محدودی پیام می‌تونه بفرسته.
// شمارنده‌ها توی حافظه‌ی سرور نگه داشته میشن؛ برای یه پورتفولیو با یک سرور کاملاً کافیه.
module.exports = function rateLimit({ windowMs, max, message }) {
  const hits = new Map(); // ip -> { count, resetAt }

  // هر چند دقیقه رکوردهای منقضی‌شده پاک میشن که حافظه پر نشه
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits) if (entry.resetAt <= now) hits.delete(ip);
  }, Math.min(windowMs, 10 * 60 * 1000)).unref();

  return function (req, res, next) {
    const now = Date.now();
    const ip = req.ip || 'unknown';
    let entry = hits.get(ip);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(ip, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ message });
    }
    next();
  };
};
