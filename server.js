import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import Parser from "rss-parser";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// تحميل الملفات الثابتة (html / css / js / img)
app.use(express.static(path.join(__dirname)));

const rss = new Parser();

const ENV = {
  RSS_POLITICS:
    process.env.RSS_POLITICS ||
    process.env.RSS_POLITIC ||
    "https://api.rss2json.com/v1/api.json?rss_url=https://www.aljazeera.net/xml/rss/arabic-rss.xml",

  RSS_BREAKING:
    process.env.RSS_BREAKING ||
    process.env.RSS_BREAK ||
    "https://api.rss2json.com/v1/api.json?rss_url=https://www.aljazeera.net/xml/rss/all.xml",

  RSS_GENERAL:
    process.env.RSS_GENERAL ||
    process.env.RSS ||
    "https://api.rss2json.com/v1/api.json?rss_url=https://www.aljazeera.net/xml/rss/all.xml",

  YT_API_KEY:
    process.env.YT_API_KEY ||
    process.env.YOUTUBE_API_KEY ||
    process.env.YT_API ||
    "",

  CHANNEL_ID:
    process.env.CHANNEL_ID ||
    process.env.YOUTUBE_CHANNEL_ID ||
    process.env.ALJAZEERA_CHANNEL_ID ||
    "UCfiwzLy-8yKzIbsmZTzxDgw"
};

async function fetchJsonFeed(url) {
  try {
    if (url.includes("api.rss2json.com") || url.endsWith(".json")) {
      const r = await fetch(url);
      const j = await r.json();

      if (j.items) return j.items;
      if (j.feed?.items) return j.feed.items;
      return [];
    } else {
      const feed = await rss.parseURL(url);
      return feed.items || [];
    }
  } catch (e) {
    console.error("fetchJsonFeed error:", e);
    return [];
  }
}

// ========== جلب الأخبار ==========
app.get("/news/:category", async (req, res) => {
  try {
    const cat = req.params.category;

    const url =
      cat === "politics"
        ? ENV.RSS_POLITICS
        : cat === "breaking"
        ? ENV.RSS_BREAKING
        : cat === "general"
        ? ENV.RSS_GENERAL
        : null;

    if (!url) {
      return res.status(400).json({ error: "قسم غير معروف" });
    }

    const items = await fetchJsonFeed(url);

    const normalized = (items || []).map((it) => {
      const title = it.title || "";
      const link = it.link || "";
      const content =
        it.content || it["content:encoded"] || it.description || "";
      const contentSnippet = content
        ? content.replace(/<[^>]*>/g, "").slice(0, 200)
        : "";

      let img = "";
      if (it.thumbnail) img = it.thumbnail;
      if (!img && it.enclosure?.url) img = it.enclosure.url;
      if (!img && it.media?.thumbnail?.url) img = it.media.thumbnail.url;

      return { title, link, contentSnippet, img };
    });

    res.json(normalized.slice(0, 40));
  } catch (err) {
    console.error("News fetch error:", err);
    res.status(500).json({ error: "تعذر جلب الأخبار" });
  }
});

// ========== جلب فيديوهات اليوتيوب ==========
app.get("/youtube", async (req, res) => {
  try {
    const apiKey = ENV.YT_API_KEY;
    const channelId = ENV.CHANNEL_ID;

    if (!apiKey) {
      console.warn("YT API KEY not set — returning empty list");
      return res.json([]);
    }

    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12&type=video`;

    const r = await fetch(url);
    const j = await r.json();

    const items = (j.items || []).map((it) => ({
      title: it.snippet.title,
      link: `https://www.youtube.com/watch?v=${it.id.videoId}`,
      vid: it.id.videoId,
      img:
        it.snippet.thumbnails?.high?.url ||
        it.snippet.thumbnails?.medium?.url ||
        "",
      description: it.snippet.description || ""
    }));

    res.json(items);
  } catch (err) {
    console.error("YouTube error:", err);
    res.status(500).json({ error: "تعذر جلب فيديوهات اليوتيوب" });
  }
});

// ========== الصفحة الرئيسية فقط ==========
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ========== تشغيل السيرفر ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
