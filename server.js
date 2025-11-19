import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import RSSParser from 'rss-parser';
import { Youtube } from 'youtubei.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// تقديم ملفات الواجهة الأمامية
app.use(express.static(path.join(__dirname, 'assets')));

// مسار الصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets', 'index.html'));
});

// API لجلب أخبار RSS
app.get('/politics', async (req, res) => {
  try {
    const parser = new RSSParser();
    const feed = await parser.parseURL(process.env.RSS_URL); // ضع رابط RSS في ملف .env
    res.json(feed.items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'تعذر جلب الأخبار' });
  }
});

// API لجلب فيديوهات YouTube
app.get('/youtube', async (req, res) => {
  try {
    const youtube = new Youtube({ apiKey: process.env.YT_API_KEY });
    const channelId = process.env.YT_CHANNEL_ID;
    const channel = await youtube.getChannel(channelId);
    const videos = channel.videos.slice(0, 10).map(v => ({
      title: v.title,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      thumbnail: v.thumbnails[0].url,
      published: v.uploadedAt
    }));
    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'تعذر جلب فيديوهات اليوتيوب' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
