const express = require('express');
const router = express.Router();
const { createMessage } = require('../controllers/messageController');

// فقط یه مسیر لازم داریم: POST /api/messages
router.post('/', createMessage);

module.exports = router;
