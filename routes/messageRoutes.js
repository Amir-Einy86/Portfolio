const express = require('express');
const router = express.Router();
const { createMessage } = require('../controllers/messageController');
const rateLimit = require('../middlewares/rateLimit');

// هر IP حداکثر ۵ پیام در ساعت
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'تعداد پیام‌هات زیاد شده؛ لطفاً یه ساعت دیگه دوباره امتحان کن',
});

// فقط یه مسیر لازم داریم: POST /api/messages
router.post('/', contactLimiter, createMessage);

module.exports = router;
