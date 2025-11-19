import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import 'dotenv/config';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('root'));

const YT_API_KEY = process.env.YT_API_KEY; // ضع مفتاحك هنا
const CHANNEL_ID = process.env.CHANNEL_ID; // اختياري

app.get('/youtube', async (req, res) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=5`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.json({ error: "تعذر جلب فيديوهات اليوتيوب" });
  }
});

app.get('/news/:category', async (req, res) => {
  const category = req.params.category;
  try {
    // مثال: جلب الأخبار من RSS عام
    const rssUrl = process.env.RSS_URL; // ضع رابط RSS
    const response = await fetch(rssUrl);
    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.json({ error: "تعذر جلب الأخبار" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
