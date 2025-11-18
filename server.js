// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// متغيرات البيئة
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ALJAZEERA_RSS = process.env.ALJAZEERA_RSS;

// ---------------------------------
// جلب الأخبار من RSS قناة الجزيرة
const Parser = require('rss-parser');
const parser = new Parser();

app.get('/politics', async (req, res) => {
  try {
    const feed = await parser.parseURL(ALJAZEERA_RSS);
    const items = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      desc: item.contentSnippet || item.content || '',
      img: item.enclosure?.url || null
    }));
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'تعذر جلب الأخبار' });
  }
});

// ---------------------------------
// جلب آخر فيديوهات يوتيوب للقناة
app.get('/youtube', async (req, res) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10`;
    const response = await fetch(url);
    const data = await response.json();
    const videos = data.items
      .filter(item => item.id.kind === 'youtube#video')
      .map(item => ({
        title: item.snippet.title,
        link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        vid: item.id.videoId,
        img: item.snippet.thumbnails.high.url,
        desc: item.snippet.description
      }));
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'تعذر جلب فيديوهات اليوتيوب' });
  }
});

// ---------------------------------
// صفحة رئيسية
app.get('/', (req, res) => {
  res.send('خدمة الأخبار تعمل بنجاح');
});

// ---------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
