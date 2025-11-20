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

function rssUrl(cat){
  if(cat==="politics") return process.env.RSS_POLITICS;
  if(cat==="breaking") return process.env.RSS_BREAKING;
  if(cat==="general") return process.env.RSS_GENERAL;
  return null;
}

function extractImage(item){
  if(item.enclosure?.url) return item.enclosure.url;
  if(item["media:content"]?.$?.url) return item["media:content"].$?.url;
  if(item["media:thumbnail"]?.url) return item["media:thumbnail"].url;

  const html = item.content || item["content:encoded"] || "";
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/);
  return m ? m[1] : null;
}

app.get("/news/:cat", async (req,res)=>{
  try{
    const url = rssUrl(req.params.cat);
    if(!url) return res.json([]);

    const feed = await rss.parseURL(url);
    const seen = new Set();
    const items = feed.items.map(it=>{
      const img = extractImage(it);
      return {
        title: it.title || "",
        link: it.link || "",
        content: it["content:encoded"] || it.content || "",
        contentSnippet: (it.contentSnippet || "").slice(0,220),
        img
      };
    }).filter(i=>{
      if(!i.link || seen.has(i.link)) return false;
      seen.add(i.link);
      return true;
    }).slice(0,30);

    res.json(items);
  }catch(err){
    res.json([]);
  }
});

/* يوتيوب الجزيرة */
app.get("/youtube", async (req,res)=>{
  try{
    const url = `https://www.googleapis.com/youtube/v3/search?key=${process.env.YT_API}&channelId=${process.env.ALJAZEERA}&part=snippet,id&type=video&maxResults=12`;

    const r = await fetch(url);
    const j = await r.json();

    const items = (j.items || []).map(v=>({
      title:v.snippet.title,
      desc:v.snippet.description,
      img:v.snippet.thumbnails.high.url,
      vid:v.id.videoId,
      link:`https://www.youtube.com/watch?v=${v.id.videoId}`
    }));

    res.json(items);
  }catch(err){
    res.json([]);
  }
});

app.get("*",(req,res)=>
  res.sendFile(path.join(__dirname,"index.html"))
);

app.listen(3000,()=>console.log("SERVER READY"));
