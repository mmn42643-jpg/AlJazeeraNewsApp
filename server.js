// server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors()); // للسماح للتطبيق بالوصول للـ API

const PORT = process.env.PORT || 1000;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ALJAZEERA_RSS = process.env.ALJAZEERA_RSS;

// مسار لجلب الأخبار السياسية من الجزيرة
app.get("/politics", async (req, res) => {
  try {
    const response = await fetch(ALJAZEERA_RSS);
    const text = await response.text();
    // يمكن استخدام xml2js أو أي مكتبة لتحويل RSS إلى JSON
    res.send({ success: true, data: text });
  } catch (e) {
    res.status(500).send({ success: false, error: e.message });
  }
});

// مسار لجلب فيديوهات اليوتيوب من القناة
app.get("/youtube", async (req, res) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10`;
    const response = await fetch(url);
    const data = await response.json();
    res.send({ success: true, data });
  } catch (e) {
    res.status(500).send({ success: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
