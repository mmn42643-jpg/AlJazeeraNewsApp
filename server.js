import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// السماح للواجهة الأمامية بالاتصال بالسيرفر
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// رابط RSS الخاص بالجزيرة
const ALJAZEERA_RSS = process.env.ALJAZEERA_RSS;

// جلب الأخبار من RSS
app.get("/news", async (req, res) => {
  try {
    const { data } = await axios.get(ALJAZEERA_RSS);
    res.send(data); // ترجع XML
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطأ في جلب الأخبار" });
  }
});

// جلب فيديوهات اليوتيوب
app.get("/videos", async (req, res) => {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = process.env.CHANNEL_ID;

    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=20`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطأ في جلب الفيديوهات" });
  }
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
