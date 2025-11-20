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
app.use(express.static(path.join(__dirname)));

const rss = new Parser();

/* جلب الأخبار */
app.get("/news/:cat", async (req, res) => {
  try {
    const cat = req.params.cat;

    const urls = {
      politics: process.env.RSS_POLITICS,
      breaking: process.env.RSS_BREAKING,
      general: process.env.RSS_GENERAL
    };

    const url = urls[cat];
    if (!url) return res.json([]);

    const feed = await rss.parseURL(url);

    const list = feed.items.map(i => ({
      title: i.title,
      desc: i.contentSnippet || "",
      img: i.enclosure?.url || "",
      link: i.link,
      full: i["content:encoded"] || i.content || ""
    }));

    res.json(list.slice(0, 40));
  } catch (e) {
    res.json([]);
  }
});

/* يوتيوب */
app.get("/youtube", async (req, res) => {
  try {
    const api = process.env.YT_API_KEY;
    const id = process.env.CHANNEL_ID;

    const url = `https://www.googleapis.com/youtube/v3/search?key=${api}&channelId=${id}&part=snippet&maxResults=20&type=video`;

    const r = await fetch(url);
    const j = await r.json();

    const list = j.items.map(v => ({
      title: v.snippet.title,
      desc: v.snippet.description,
      img: v.snippet.thumbnails.high.url,
      vid: v.id.videoId
    }));

    res.json(list);
  } catch {
    res.json([]);
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(process.env.PORT || 3000);
