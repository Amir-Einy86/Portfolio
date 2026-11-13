// هدرهای امنیتی - همون کاری که پکیج helmet می‌کنه، به شکل ساده و بدون نصب پکیج اضافه
module.exports = function securityHeaders(req, res, next) {
  // مرورگر نوع فایل رو حدس نزنه (جلوی اجرای فایل‌ها با نوع اشتباه رو می‌گیره)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // سایت‌های دیگه نتونن سایتت رو داخل iframe نشون بدن (جلوی clickjacking)
  res.setHeader('X-Frame-Options', 'DENY');
  // وقتی روی لینک بیرونی کلیک میشه، آدرس کامل صفحه‌ی تو برای اون سایت فرستاده نشه
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // دسترسی به دوربین، میکروفون و موقعیت مکانی بسته‌ست چون سایت لازمشون نداره
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // CSP: مشخص می‌کنه صفحه از کجا اجازه داره اسکریپت، فونت و عکس بار کنه
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  // روی https، مرورگر تا یک سال همیشه با https بیاد (فقط وقتی سایت واقعاً https باشه)
  if (req.secure) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
};
