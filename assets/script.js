/* المفضلة */
let fav = JSON.parse(localStorage.getItem("favorites")||"[]");

function isFavorite(item){
  return fav.some(f=>f.link===item.link);
}

function toggleFavorite(item){
  if(isFavorite(item)){
    fav = fav.filter(f=>f.link!==item.link);
  } else {
    fav.push(item);
  }
  localStorage.setItem("favorites",JSON.stringify(fav));
}

function renderFavorites(){
  if(fav.length===0){
    content.innerHTML="<p>لا توجد عناصر في المفضلة</p>";
    return;
  }
  renderNews(fav);
}

/* صفحة القراءة */
const reader = document.getElementById("reader");
const readerTitle = document.getElementById("readerTitle");
const readerImg = document.getElementById("readerImg");
const readerBody = document.getElementById("readerBody");

document.getElementById("closeReader").onclick=()=>reader.classList.add("hidden");

function openReader(item){
  readerTitle.textContent = item.title;
  readerImg.src = item.img || "img/no.jpg";
  readerBody.innerHTML = item.content;
  reader.classList.remove("hidden");
}

/* يوتيوب */
async function loadYouTube(){
  const res = await fetch("/youtube");
  const data = await res.json();

  content.innerHTML="";

  data.forEach(v=>{
    const card=document.createElement("div");
    card.className="card";

    card.innerHTML=`
      <img src="${v.img}">
      <div class="title">${v.title}</div>
      <div class="snippet">${v.desc || ''}</div>
      <div class="actions">
        <button class="readBtn">تشغيل</button>
        <button class="favBtn">⭐</button>
      </div>
    `;

    // تشغيل الفيديو
    card.querySelector(".readBtn").onclick=()=>openVideo(v.vid);

    // مفضلة
    card.querySelector(".favBtn").onclick=(e)=>{
      toggleFavorite(v);
      e.target.textContent = isFavorite(v) ? "🌟" : "⭐";
    };

    content.appendChild(card);
  });
}

/* مشغل الفيديو */
const videoPlayer = document.getElementById("videoPlayer");
const videoFrame = document.getElementById("videoFrame");

document.getElementById("closeVideo").onclick=()=>{
  videoPlayer.classList.add("hidden");
  videoFrame.src="";
};

function openVideo(id){
  videoFrame.src = `https://www.youtube.com/embed/${id}`;
  videoPlayer.classList.remove("hidden");
}

/* الوضع الليلي */
const themeToggle = document.getElementById("themeToggle");
themeToggle.onclick=()=>{
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
};

/* تكبير وتصغير الخط */
let fz = 16;
document.getElementById("fontPlus").onclick=()=>{
  fz++; document.body.style.fontSize=`${fz}px`;
};
document.getElementById("fontMinus").onclick=()=>{
  fz = Math.max(12, fz-1);
  document.body.style.fontSize=`${fz}px`;
};
