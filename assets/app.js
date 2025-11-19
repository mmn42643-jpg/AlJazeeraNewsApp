const splash=document.getElementById("splash");
const tabs=document.querySelectorAll(".tab");
const list=document.getElementById("list");
const themeToggle=document.getElementById("themeToggle");
const fontPlus=document.getElementById("fontPlus");
const fontMinus=document.getElementById("fontMinus");
const refreshBtn=document.getElementById("refreshBtn");
const articlePage=document.getElementById("articlePage");
const articleContent=document.getElementById("articleContent");
const closeArticle=document.getElementById("closeArticle");

let fontSize=16;
let favorites=JSON.parse(localStorage.getItem("favNews")||"[]");

function saveFav(){ localStorage.setItem("favNews",JSON.stringify(favorites)); }
function isFavByItem(item){ return favorites.findIndex(f=>f.link===item.link)!==-1; }
function toggleFavByLink(item){
  const idx=favorites.findIndex(f=>f.link===item.link);
  if(idx>=0) favorites.splice(idx,1); else favorites.push(item);
  saveFav();
  renderActiveTab(currentTab);
}
window.toggleFavByLink=toggleFavByLink;
window.isFavByItem=isFavByItem;
window.openArticleInApp=openArticleInApp;

let currentTab="politics";
tabs.forEach(btn=>{
  btn.addEventListener("click",()=>{
    tabs.forEach(t=>t.classList.remove("active"));
    btn.classList.add("active");
    currentTab=btn.dataset.tab;
    renderActiveTab(currentTab);
  });
});

// theme toggle
if(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches){
  document.body.classList.add("dark");
  themeToggle.textContent="☀️";
}
themeToggle.onclick=()=>{ document.body.classList.toggle("dark"); themeToggle.textContent=document.body.classList.contains("dark")?"☀️":"🌙"; };

// font size toggle
function applyFontSize(){ document.body.style.fontSize=fontSize+"px"; }
fontPlus.onclick=()=>{ fontSize++; applyFontSize(); }
fontMinus.onclick=()=>{ fontSize=Math.max(12,fontSize-1); applyFontSize(); }

// refresh
refreshBtn.onclick=()=> renderActiveTab(currentTab);

// favorites
function renderFavoritesTab(){
  list.innerHTML="";
  if(!favorites.length){ list.innerHTML="<p>قائمة المفضلة فارغة.</p>"; return; }
  favorites.forEach(it=>{
    const el=createCardElement(it,true);
    el.querySelector(".favorite-btn").onclick=(e)=>{ e.stopPropagation(); toggleFavByLink(it); };
    list.appendChild(el);
  });
}

// open article
function openArticleInApp(item){
  articlePage.classList.remove("hidden");
  articlePage.setAttribute("aria-hidden","false");
  const link=item.link||(item.vid?`https://www.youtube.com/watch?v=${item.vid}`:"#");
  if(item.vid || link.includes("youtube.com/watch")){
    const vid=item.vid||(link.split("v=")[1]||"");
    articleContent.innerHTML=`<h2>${escapeHtml(item.title||"")}</h2>
      <iframe class="youtube-player" src="https://www.youtube.com/embed/${vid}" frameborder="0" allowfullscreen></iframe>
      <p>${escapeHtml(item.content||item.contentSnippet||"")}</p>`;
    return;
  }
  articleContent.innerHTML=`<h2>${escapeHtml(item.title||"")}</h2>
    <div id="articleFrameWrap">
      <iframe id="articleFrame" class="youtube-player" src="${item.link}" frameborder="0"></iframe>
    </div>
    <p style="margin-top:10px">إذا لم يظهر المحتوى أعلاه، اضغط لفتحه في نافذة جديدة:</p>
    <a href="${item.link}" target="_blank" rel="noopener">فتح في تبويب جديد</a>`;
}
closeArticle.onclick=()=>{ articlePage.classList.add("hidden"); articlePage.setAttribute("aria-hidden","true"); };

// render news tab
async function renderActiveTab(tab){
  list.innerHTML="<p>جاري جلب الأخبار...</p>";
  if(tab==="favorites"){ renderFavoritesTab(); return; }
  try{
    const res=await fetch(`/news/${tab}`);
    if(!res.ok) throw new Error("fetch failed");
    const items=await res.json();
    list.innerHTML="";
    items.forEach(it=>{ const el=createCardElement(it,isFavByItem(it)); list.appendChild(el); });
  }catch(e){
    console.error(e);
    list.innerHTML="<p>تعذر جلب الأخبار. تأكد من تشغيل السيرفر ووجود روابط RSS صحيحة.</p>";
  }finally{ setTimeout(()=>{ splash.style.display="none"; },500); }
}

// start
renderActiveTab(currentTab);
