require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

connectDB();

// cors لازمه چون فرانت‌اند (فایل html) روی یه آدرس دیگه (یا حتی فایل لوکال) اجرا میشه
// و مرورگر بدون این، درخواست رو مسدود می‌کنه
app.use(cors());
app.use(express.json());

app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 سرور روی پورت ${PORT} روشنه`));
