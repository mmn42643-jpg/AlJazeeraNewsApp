let currentTab = "politics";
let fontSize = 1;
let favorites = JSON.parse(localStorage.getItem("fav") || "[]");

const content = document.getElementById("content");
const reader = document.getElementById("reader");
const readerContent = document.getElementById("reader-content");
const videoSec = document.getElementById("video-player");
const videoFrame = document.getElementById("video-frame");

function saveFav() {
  localStorage.setItem("fav", JSON.stringify(favorites));
}

function toggleFav(item) {
  const exists = favorites.find(f => f.link === item.link || f.vid === item.vid);
  if (exists) favorites = favorites.filter(f => f.link !== item.link && f.vid !== item.vid);
  else favorites.push(item);
  saveFav();
  loadTab(currentTab);
}

function isFav(item) {
  return favorites.some(f => f.link === item.link || f.vid === item.vid);
}

async function loadTab(tab) {
  currentTab = tab;
  document.querySelector(".current-tab").innerText =
    tab === "politics" ? "سياسية" :
    tab === "breaking" ? "عاجلة" :
    tab === "general" ? "عامة" :
    tab === "youtube" ? "يوتيوب" :
    "المفضلة";

  if (tab === "favorites") {
    renderCards(favorites);
    return;
  }

  const url = tab === "youtube" ? "/youtube" : `/news/${tab}`;
  const r = await fetch(url);
  const data = await r.json();
  renderCards(data);
}

function renderCards(list) {
  content.innerHTML = "";

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${item.img}" onerror="this.style.display='none'">
      <div class="card-title">${item.title}</div>
      <div class="card-desc">${item.desc?.slice(0,150)}...</div>

      <div class="card-actions">
        ${item.vid ?
          `<button onclick="openVideo('${item.vid}')">تشغيل</button>` :
          `<button onclick='openReader(${JSON.stringify(item)})'>قراءة</button>`
        }

        <button onclick='toggleFav(${JSON.stringify(item)})'>
          ${isFav(item) ? "🌟" : "⭐️"}
        </button>
      </div>
    `;

    content.appendChild(card);
  });
}

function openReader(item) {
  reader.classList.remove("hidden");
  readerContent.innerHTML = item.full || "";
}

document.getElementById("close-reader").onclick = () => {
  reader.classList.add("hidden");
};

function openVideo(id) {
  videoFrame.src = `https://www.youtube.com/embed/${id}`;
  videoSec.classList.remove("hidden");
}

document.getElementById("close-video").onclick = () => {
  videoSec.classList.add("hidden");
  videoFrame.src = "";
};

/* -----------------------------------------------
   بحث
------------------------------------------------*/
document.getElementById("btn-search-toggle").onclick = () => {
  document.getElementById("search-bar").classList.toggle("hidden");
};

document.getElementById("search-input").oninput = (e) => {
  const t = e.target.value.trim();
  if (!t) return loadTab(currentTab);

  const cards = [...content.children];
  cards.forEach(c => {
    let title = c.querySelector(".card-title").innerText;
    let desc = c.querySelector(".card-desc").innerText;
    c.style.display = (title.includes(t) || desc.includes(t)) ? "block" : "none";
  });
};

/* -----------------------------------------------
   ثيم
------------------------------------------------*/
document.getElementById("btn-theme").onclick = () => {
  document.body.classList.toggle("dark");
  document.getElementById("theme-icon").src =
    document.body.classList.contains("dark")
      ? "img/icon-sun.png"
      : "img/icon-moon.png";
};

/* -----------------------------------------------
   تكبير وتصغير
------------------------------------------------*/
document.getElementById("btn-font-plus").onclick = () => {
  fontSize += 0.1;
  document.body.style.fontSize = fontSize + "em";
};

document.getElementById("btn-font-minus").onclick = () => {
  fontSize -= 0.1;
  document.body.style.fontSize = fontSize + "em";
};

/* -----------------------------------------------
   تحديث
------------------------------------------------*/
document.getElementById("btn-refresh").onclick = () => {
  loadTab(currentTab);
};

/* -----------------------------------------------
   قائمة البرغر
------------------------------------------------*/
document.querySelector(".burger-btn").onclick = () => {
  document.getElementById("side-menu").classList.toggle("hidden");
};

document.querySelectorAll("#side-menu li").forEach(li => {
  li.onclick = () => {
    loadTab(li.dataset.tab);
    document.getElementById("side-menu").classList.add("hidden");
  };
});
