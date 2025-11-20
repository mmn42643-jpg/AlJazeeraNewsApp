import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Parser from "rss-parser";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const rss = new Parser();

// الدوال المساعدة
function extractImage(item) {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item["media:content"]?.$?.url) return item["media:content"].$?.url;
  if (item["media:thumbnail"]?.url) return item["media:thumbnail"].url;
  const html = item.content || item["content:encoded"] || "";
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/);
  return m ? m[1] : null;
}

app.get("/news/:cat", async (req, res) => {
  try {
    const cat = req.params.cat;
    const url = process.env.RSS_POLITICS; // نستخدم نفس المصدر أولاً
    if (!url) return res.status(400).json({ error: "RSS غير معرف" });

    const feed = await rss.parseURL(url);
    let items = feed.items.map(it => ({
      title: it.title || "",
      link: it.link || "",
      content: it["content:encoded"] || it.content || "",
      contentSnippet: it.contentSnippet || "",
      img: extractImage(it)
    }));

    // ترشيح حسب الفئة
    if (cat === "politics") {
      items = items.filter(i => /سياسة|politic/i.test(i.title + i.content));
    } else if (cat === "breaking") {
      items = items.filter(i => /عاجل|breaking/i.test(i.title + i.content));
    } else if (cat === "general") {
      // عام = ما يقع في الفئتين السابقين
      items = items.filter(i => !(/سياسة|عاجل|breaking|politic/i.test(i.title + i.content)));
    }

    res.json(items.slice(0, 30));
  } catch (err) {
    console.error("RSS error:", err);
    res.status(500).json({ error: "تعذر جلب الأخبار" });
  }
});

// تبويب يوتيوب
app.get("/youtube", async (req, res) => {
  try {
    const apiKey = process.env.YT_API;
    const channelId = process.env.ALJAZEERA_CHANNEL_ID;
    if (!apiKey || !channelId) return res.status(400).json({ error: "مفتاح YouTube أو CHANNEL_ID مفقود" });

    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&maxResults=12&type=video`;
    const r = await fetch(url);
    const j = await r.json();

    const items = (j.items || []).map(it => ({
      title: it.snippet.title,
      desc: it.snippet.description,
      img: it.snippet.thumbnails.high?.url || it.snippet.thumbnails.default?.url,
      vid: it.id.videoId,
      link: `https://www.youtube.com/watch?v=${it.id.videoId}`
    }));

    res.json(items);
  } catch (err) {
    console.error("YouTube error:", err);
    res.status(500).json({ error: "تعذر جلب فيديوهات" });
  }
});

// بقية الطلبات توجه إلى index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
