// عناصر
const content = document.getElementById("content");
const tabs = document.querySelectorAll(".tabs button");
const themeToggle = document.getElementById("themeToggle");
const fontPlus = document.getElementById("fontPlus");
const fontMinus = document.getElementById("fontMinus");

let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let fontSize = parseInt(localStorage.getItem("fontSize") || "16");

// تفعيل الوضع حسب نظام الجهاز أولاً
if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
} else {
  themeToggle.textContent = "🌙";
}

// أحداث التبويبات
tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    loadTab(btn.dataset.tab);
  });
});

// تغيير الثيم
themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

// تكبير / تصغير الخط
fontPlus.onclick = () => {
  fontSize++;
  document.body.style.fontSize = fontSize + "px";
  localStorage.setItem("fontSize", fontSize);
};
fontMinus.onclick = () => {
  fontSize = Math.max(12, fontSize - 1);
  document.body.style.fontSize = fontSize + "px";
  localStorage.setItem("fontSize", fontSize);
};
document.body.style.fontSize = fontSize + "px";

// وظائف مفضلة
function isFavorite(item) {
  return favorites.some(f => f.link === item.link || f.vid === item.vid);
}
function toggleFavorite(item) {
  if (isFavorite(item)) {
    favorites = favorites.filter(f => !(f.link === item.link || f.vid === item.vid));
  } else {
    favorites.push(item);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// تحميل الأخبار
async function loadTab(tab) {
  if (tab === "favorites") {
    renderCards(favorites);
    return;
  }
  if (tab === "youtube") {
    const res = await fetch("/youtube");
    const data = await res.json();
    renderCards(data, true);
    return;
  }

  const res = await fetch(`/news/${tab}`);
  const data = await res.json();
  renderCards(data);
}

// رسم البطاقات (خبر أو فيديو)
function renderCards(items, isVideo = false) {
  content.innerHTML = "";
  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = item.img || "";
    card.appendChild(img);

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = item.title;
    card.appendChild(title);

    const snippet = document.createElement("div");
    snippet.className = "snippet";
    snippet.textContent = isVideo ? item.desc : item.contentSnippet;
    card.appendChild(snippet);

    const actions = document.createElement("div");
    actions.className = "actions";

    const readBtn = document.createElement("button");
    readBtn.className = "readBtn";
    readBtn.textContent = isVideo ? "تشغيل" : "قراءة";
    readBtn.onclick = () => {
      if (isVideo) {
        openVideo(item.vid);
      } else {
        openReader(item);
      }
    };
    actions.appendChild(readBtn);

    const favBtn = document.createElement("button");
    favBtn.className = "favBtn";
    favBtn.textContent = isFavorite(item) ? "🌟" : "⭐️";
    favBtn.onclick = (e) => {
      e.stopPropagation();
      toggleFavorite(item);
      favBtn.textContent = isFavorite(item) ? "🌟" : "⭐️";
    };
    actions.appendChild(favBtn);

    card.appendChild(actions);
    content.appendChild(card);
  });
}

// فتح صفحة قراءة
const reader = document.getElementById("reader");
const readerTitle = document.getElementById("readerTitle");
const readerImg = document.getElementById("readerImg");
const readerBody = document.getElementById("readerBody");
document.getElementById("closeReader").onclick = () => reader.classList.add("hidden");

function openReader(item) {
  readerTitle.textContent = item.title;
  readerImg.src = item.img || "";
  readerBody.innerHTML = item.content;
  reader.classList.remove("hidden");
}

// تشغيل فيديو
const videoPlayer = document.getElementById("videoPlayer");
const videoFrame = document.getElementById("videoFrame");
document.getElementById("closeVideo").onclick = () => {
  videoPlayer.classList.add("hidden");
  videoFrame.src = "";
};
function openVideo(vid) {
  videoFrame.src = `https://www.youtube.com/embed/${vid}`;
  videoPlayer.classList.remove("hidden");
}
