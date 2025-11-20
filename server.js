import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import Parser from "rss-parser";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config(); // لا يضر إن لم يكن .env موجوداً

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const rss = new Parser();

// اسماء المتغيرات المقبولة (تدعم عدة تسميات شائعة)
const ENV = {
  RSS_POLITICS: process.env.RSS_POLITICS || process.env.RSS_POLITIC || "https://api.rss2json.com/v1/api.json?rss_url=https://www.aljazeera.net/xml/rss/arabic-rss.xml",
  RSS_BREAKING: process.env.RSS_BREAKING || process.env.RSS_BREAK || "https://api.rss2json.com/v1/api.json?rss_url=https://www.aljazeera.net/xml/rss/all.xml",
  RSS_GENERAL: process.env.RSS_GENERAL || process.env.RSS || "https://api.rss2json.com/v1/api.json?rss_url=https://www.aljazeera.net/xml/rss/all.xml",
  YT_API_KEY: process.env.YT_API_KEY || process.env.YOUTUBE_API_KEY || process.env.YT_API || "",
  CHANNEL_ID: process.env.CHANNEL_ID || process.env.YOUTUBE_CHANNEL_ID || process.env.ALJAZEERA_CHANNEL_ID || "UCfiwzLy-8yKzIbsmZTzxDgw"
};

// Helper: when rss2json style (json with items) vs plain XML via rss-parser
async function fetchJsonFeed(url){
  try {
    // If url returns JSON (rss2json), use fetch + json
    if (url.includes("api.rss2json.com") || url.endsWith(".json")) {
      const r = await fetch(url);
      const j = await r.json();
      // rss2json returns items directly
      if (j.items && Array.isArray(j.items)) return j.items;
      // some endpoints put feed->items
      if (j.feed && j.feed.items) return j.feed.items;
      return [];
    } else {
      // attempt to parse XML using rss-parser via network (rss.parseURL)
      const feed = await rss.parseURL(url);
      return feed.items || [];
    }
  } catch (e) {
    console.error("fetchJsonFeed error for", url, e);
    return [];
  }
}

app.get("/news/:category", async (req, res) => {
  try {
    const cat = req.params.category;
    let url =
      cat === "politics" ? ENV.RSS_POLITICS :
      cat === "breaking" ? ENV.RSS_BREAKING :
      cat === "general" ? ENV.RSS_GENERAL :
      null;

    if (!url) return res.status(400).json({ error: "قسم غير معروف" });

    const items = await fetchJsonFeed(url);

    // Normalize items: try to produce title, link, contentSnippet, content, img
    const normalized = (items || []).map(it => {
      const title = it.title || it.title_no_format || "";
      const link = it.link || it.url || it.guid || "";
      const content = it.content || it["content:encoded"] || it.description || "";
      const contentSnippet = it.contentSnippet || (typeof content === "string" ? content.replace(/<[^>]*>/g, "").slice(0,220) : "");
      // try common image fields
      let img = "";
      if (it.thumbnail) img = it.thumbnail;
      if (!img && it.enclosure && it.enclosure.url) img = it.enclosure.url;
      if (!img && it.media && it.media.thumbnail && it.media.thumbnail.url) img = it.media.thumbnail.url;
      if (!img && it["media:thumbnail"] && it["media:thumbnail"].url) img = it["media:thumbnail"].url;
      // fallback: if rss2json returns enclosure
      if (!img && it.enclosure && it.enclosure.link) img = it.enclosure.link;
      return { title, link, content, contentSnippet, img };
    });

    res.json(normalized.slice(0, 40));
  } catch (err) {
    console.error("News fetch error:", err);
    res.status(500).json({ error: "تعذر جلب الأخبار" });
  }
});

app.get("/youtube", async (req, res) => {
  try {
    const apiKey = ENV.YT_API_KEY;
    const channelId = ENV.CHANNEL_ID;
    if (!apiKey) {
      // لا نكسر الواجهة: نعيد [] بدلاً من خطأ كامل
      console.warn("YouTube API key not set. Returning empty list.");
      return res.json([]);
    }
    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12&type=video`;
    const r = await fetch(url);
    const j = await r.json();
    const items = (j.items || []).map(it => ({
      title: it.snippet.title,
      link: `https://www.youtube.com/watch?v=${it.id.videoId}`,
      vid: it.id.videoId,
      img: it.snippet.thumbnails?.high?.url || it.snippet.thumbnails?.medium?.url || "",
      description: it.snippet.description || ""
    }));
    res.json(items);
  } catch (err) {
    console.error("YouTube error:", err);
    res.status(500).json({ error: "تعذر جلب فيديوهات اليوتيوب" });
  }
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
