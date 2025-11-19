// server.js (كامل)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Parser from "rss-parser";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from project root (index.html, css/, assets/, img/)
app.use(express.static(path.join(__dirname)));

// RSS parser
const rss = new Parser({
  // optional custom fields if needed
});

// Helper to choose RSS URL for a tab
function getRssUrlForTab(tab) {
  if (tab === "politics") return process.env.RSS_POLITICS || process.env.RSS_URL;
  if (tab === "breaking") return process.env.RSS_BREAKING || process.env.RSS_URL;
  if (tab === "aljazeera") return process.env.RSS_ALJAZEERA || process.env.RSS_URL;
  return process.env.RSS_URL;
}

// Extract an image URL from item (best-effort)
function extractImage(item) {
  if (!item) return null;
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  if (item["media:content"] && item["media:content"]["$"] && item["media:content"]["$"].url) return item["media:content"]["$"].url;
  if (item["media:thumbnail"] && item["media:thumbnail"].url) return item["media:thumbnail"].url;
  // try to find img src in content
  const html = item.content || item["content:encoded"] || "";
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m) return m[1];
  return null;
}

// Endpoint: get news by tab (politics, breaking, aljazeera)
app.get("/news/:tab", async (req, res) => {
  try {
    const tab = req.params.tab || "politics";
    const rssUrl = getRssUrlForTab(tab);
    if (!rssUrl) return res.status(400).json({ error: "RSS URL غير موجود. ضع RSS في متغيرات البيئة." });
    const feed = await rss.parseURL(rssUrl);
    // Map to lighter JSON and remove duplicates by link
    const seen = new Set();
    const items = (feed.items || []).map(it => {
      const img = extractImage(it);
      return {
        title: it.title || "",
        link: it.link || it.guid || "",
        pubDate: it.pubDate || it.isoDate || "",
        contentSnippet: it.contentSnippet || (it.content || "").replace(/<[^>]*>/g, "").slice(0, 220),
        content: it.content || it["content:encoded"] || "",
        img: img,
        source: feed.title || ""
      };
    }).filter(i => {
      if (!i.link) return false;
      if (seen.has(i.link)) return false;
      seen.add(i.link);
      return true;
    }).slice(0, 40); // limit
    res.json(items);
  } catch (err) {
    console.error("RSS error:", err);
    res.status(500).json({ error: "تعذر جلب الأخبار" });
  }
});

// Endpoint: Simple YouTube fetch using API key (optional)
app.get("/youtube", async (req, res) => {
  try {
    const apiKey = process.env.YT_API_KEY;
    const channelId = process.env.CHANNEL_ID;
    if (!apiKey || !channelId) return res.status(400).json({ error: "YOUTUBE API_KEY أو CHANNEL_ID مفقود" });
    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12&type=video`;
    const r = await fetch(url);
    const j = await r.json();
    // map to a compact structure
    const items = (j.items || []).map(it => ({
      title: it.snippet.title,
      link: `https://www.youtube.com/watch?v=${it.id.videoId}`,
      vid: it.id.videoId,
      img: it.snippet.thumbnails?.high?.url || it.snippet.thumbnails?.medium?.url || ""
    }));
    res.json(items);
  } catch (err) {
    console.error("YouTube error:", err);
    res.status(500).json({ error: "تعذر جلب فيديوهات اليوتيوب" });
  }
});

// Serve index.html for any other route (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
