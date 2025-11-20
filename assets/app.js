const content = document.getElementById("content");
const tabs = document.querySelectorAll(".tabs button");

// تبديل التبويبات
tabs.forEach(btn=>{
  btn.addEventListener("click",()=>{
    tabs.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    loadTab(btn.dataset.tab);
  });
});

// جلب البيانات من السيرفر
async function loadTab(tab){
  if(tab==="favorites"){ return renderFavorites(); }
  if(tab==="youtube"){ return loadYouTube(); }

  const res = await fetch(`/news/${tab}`);
  const data = await res.json();
  renderNews(data);
}

function renderNews(data){
  content.innerHTML="";
  data.forEach(item=>{
    const card = document.createElement("div");
    card.className="card";

    card.innerHTML = `
      <img src="${item.img || 'img/no.jpg'}">
      <div class="title">${item.title}</div>
      <div class="snippet">${item.contentSnippet}</div>
      <div class="actions">
        <button class="readBtn">قراءة</button>
        <button class="favBtn">⭐</button>
      </div>
    `;

    /* قراءة */
    card.querySelector(".readBtn").onclick=()=>{
      openReader(item);
    };

    /* مفضلة */
    card.querySelector(".favBtn").onclick=(e)=>{
      toggleFavorite(item);
      e.target.textContent = isFavorite(item) ? "🌟" : "⭐️";
    };

    content.appendChild(card);
  });
}
