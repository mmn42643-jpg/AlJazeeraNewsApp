import express from "express";
import cors from "cors";
import Parser from "rss-parser";
import { Innertube } from "youtubei.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const parser = new Parser();
const youtube = await Innertube.create();

app.use(cors());
app.use(express.json());
app.use(express.static("")); // لخدمة ملفات index.html و assets و css

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "." });
});

app.get("/politics", async (req, res) => {
  try {
    const feed = await parser.parseURL(process.env.RSS_URL);
    res.json(feed.items.slice(0, 10));
  } catch (err) {
    res.json({ error: "تعذر جلب الأخبار" });
  }
});

app.get("/youtube", async (req, res) => {
  try {
    const channel = await youtube.getChannel(process.env.YOUTUBE_CHANNEL_ID);
    const videos = channel.videos.slice(0, 10).map(v => ({
      title: v.title,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      thumbnail: v.thumbnails[0].url
    }));
    res.json(videos);
  } catch (err) {
    res.json({ error: "تعذر جلب فيديوهات اليوتيوب" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
