import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// جلب الأخبار حسب التبويب
app.get("/news/:category", async (req, res) => {
  try {
    const cat = req.params.category;
    let rssUrl =
      cat === "politics" ? process.env.RSS_POLITICS :
      cat === "breaking" ? process.env.RSS_BREAKING :
      cat === "general" ? process.env.RSS_GENERAL :
      null;

    if (!rssUrl) return res.json({ error: "قسم غير معروف" });

    const response = await fetch(rssUrl);
    const data = await response.json();
    if (!data.items) return res.json({ error: "لم يتم العثور على أخبار" });

    res.json(data.items);
  } catch (err) {
    console.error("News fetch error:", err);
    res.json({ error: "تعذر جلب الأخبار" });
  }
});

// جلب فيديوهات يوتيوب
app.get("/youtube", async (req, res) => {
  try {
    const apiKey = process.env.YT_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    if (!apiKey || !channelId) return res.status(400).json({ error: "YOUTUBE API_KEY أو CHANNEL_ID مفقود" });

    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12&type=video`;
    const r = await fetch(url);
    const j = await r.json();
    const items = (j.items || []).map(it => ({
      title: it.snippet.title,
      link: `https://www.youtube.com/watch?v=${it.id.videoId}`,
      vid: it.id.videoId,
      img: it.snippet.thumbnails?.high?.url || it.snippet.thumbnails?.medium?.url || "",
      description: it.snippet.description
    }));
    res.json(items);
  } catch (err) {
    console.error("YouTube error:", err);
    res.status(500).json({ error: "تعذر جلب فيديوهات اليوتيوب" });
  }
});

// أي رابط آخر يرسل index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
