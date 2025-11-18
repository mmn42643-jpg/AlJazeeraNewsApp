import express from "express";
import cors from "cors";
import Parser from "rss-parser";
import dotenv from "dotenv";
import { Client } from "youtubei.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const YT_API_KEY = process.env.YOUTUBE_API_KEY;

const parser = new Parser();
const ytClient = new Client();

// جلب الأخبار السياسية (مثال على قناة الجزيرة)
app.get("/politics", async (req, res) => {
  try {
    const feed = await parser.parseURL("https://www.aljazeera.net/aljazeera.rss"); 
    const items = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      desc: item.contentSnippet,
      img: item.enclosure?.url || ""
    }));
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "تعذر جلب الأخبار" });
  }
});

// جلب فيديوهات يوتيوب للقناة
app.get("/youtube", async (req, res) => {
  try {
    const channelId = "UCXIJgqnII2ZOINSWNOGFThA"; // قناة الجزيرة على YouTube
    const videos = await ytClient.getChannel(channelId).then(ch => ch.videos.slice(0, 10));
    const items = videos.map(v => ({
      title: v.title,
      vid: v.id,
      desc: v.description,
      img: v.thumbnails[0]?.url || ""
    }));
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "تعذر جلب فيديوهات اليوتيوب" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
