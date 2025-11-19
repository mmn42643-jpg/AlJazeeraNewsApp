const content = document.getElementById("content");
const tabNews = document.getElementById("tab-news");
const tabYouTube = document.getElementById("tab-youtube");

tabNews.addEventListener("click", async () => {
  content.innerHTML = "جارٍ تحميل الأخبار...";
  const res = await fetch("/politics");
  const data = await res.json();
  if (data.error) content.innerHTML = data.error;
  else content.innerHTML = data.map(item => `<h3>${item.title}</h3><p>${item.contentSnippet}</p>`).join("");
});

tabYouTube.addEventListener("click", async () => {
  content.innerHTML = "جارٍ تحميل فيديوهات يوتيوب...";
  const res = await fetch("/youtube");
  const data = await res.json();
  if (data.error) content.innerHTML = data.error;
  else content.innerHTML = data.map(video => `<h3>${video.title}</h3><a href="${video.url}" target="_blank"><img src="${video.thumbnail}" alt="${video.title}" /></a>`).join("");
});
