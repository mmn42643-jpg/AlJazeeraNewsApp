import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Parser from "rss-parser";
import { Client } from "youtubei.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const parser = new Parser();
const youtube = new Client();

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// جلب أخبار RSS
app.get("/politics", async (req, res) => {
  try {
    const feed = await parser.parseURL(process.env.RSS_URL);
    res.json(feed.items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "تعذر جلب الأخبار" });
  }
});

// جلب فيديوهات قناة يوتيوب
app.get("/youtube", async (req, res) => {
  try {
    const channel = await youtube.getChannel(process.env.CHANNEL_ID);
    const videos = channel.videos.map(v => ({
      title: v.title,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      thumbnail: v.thumbnails[0]?.url
    }));
    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "تعذر جلب فيديوهات اليوتيوب" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
