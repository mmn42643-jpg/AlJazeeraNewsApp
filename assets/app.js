// جلب الأخبار من RSS الجزيرة
async function loadNews() {
    const url = "https://www.aljazeera.net/xml/rss/all.xml";

    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    const xml = await response.text();

    const parser = new DOMParser();
    const data = parser.parseFromString(xml, "text/xml");

    const items = data.querySelectorAll("item");
    const newsContainer = document.getElementById("news");

    newsContainer.innerHTML = "<h2>آخر الأخبار السياسية</h2>";

    items.forEach((item, index) => {
        if (index > 10) return; // 10 أخبار فقط
        const title = item.querySelector("title").textContent;
        const link = item.querySelector("link").textContent;
        const desc = item.querySelector("description").textContent;

        newsContainer.innerHTML += `
            <div class="article">
                <h3>${title}</h3>
                <p>${desc}</p>
                <a href="${link}" target="_blank">اقرأ المزيد</a>
            </div>
        `;
    });
}

// جلب فيديوهات قناة الجزيرة (يوتيوب)
async function loadVideos() {
    const API_KEY = "YOUR_API_KEY"; // ضع مفتاحك هنا
    const channelId = "UCfiwzLy-8yKzIbsmZS66v6Q"; // قناة الجزيرة

    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet&order=date&maxResults=8`;

    const res = await fetch(url);
    const data = await res.json();

    const videoList = document.getElementById("video-list");

    data.items.forEach(video => {
        const vid = video.id.videoId;

        videoList.innerHTML += `
            <div class="video-card">
                <iframe src="https://www.youtube.com/embed/${vid}" allowfullscreen></iframe>
            </div>
        `;
    });
}

loadNews();
loadVideos();
