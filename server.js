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
app.use(express.static("")); // ليتمكن من تقديم index.html وملفات CSS/JS

// RSS parser
const rssParser = new Parser();

// Route for RSS news
app.get("/news", async (req, res) => {
  try {
    const feed = await rssParser.parseURL(process.env.RSS_URL);
    res.json(feed.items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "تعذر جلب الأخبار" });
  }
});

// Route for YouTube videos
app.get("/youtube", async (req, res) => {
  try {
    const client = new Client();
    const channelId = process.env.CHANNEL_ID;
    const channel = await client.getChannel(channelId);
    const videos = channel.videos.map(video => ({
      title: video.title,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      thumbnail: video.thumbnails[0].url
    }));
    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "تعذر جلب فيديوهات اليوتيوب" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
