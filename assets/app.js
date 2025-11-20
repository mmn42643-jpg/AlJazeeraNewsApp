// عناصر DOM
const splash = document.getElementById("splash");
const tabs = document.querySelectorAll(".tab");
const list = document.getElementById("list");
const themeToggle = document.getElementById("themeToggle");
const fontPlus = document.getElementById("fontPlus");
const fontMinus = document.getElementById("fontMinus");
const refreshBtn = document.getElementById("refreshBtn");
const articlePage = document.getElementById("articlePage");
const articleContent = document.getElementById("articleContent");
const closeArticle = document.getElementById("closeArticle");

const searchInput = document.getElementById("searchInput");
const tabBurgerBtn = document.getElementById("tabBurgerBtn");
const tabMenu = document.getElementById("tabMenu");
const currentTabLabel = document.getElementById("currentTabLabel");

let fontSize = 16;
let favorites = JSON.parse(localStorage.getItem("favNews") || "[]");
let currentTab = "politics";
let allItems = []; // لتخزين الأخبار والفيديوهات

// حفظ واسترجاع المفضلة
function saveFav(){ localStorage.setItem("favNews", JSON.stringify(favorites)); }
function isFavByItem(item){ return favorites.findIndex(f=>f.link===item.link)!==-1; }
function toggleFavByLink(item){
  const idx=favorites.findIndex(f=>f.link===item.link);
  if(idx>=0) favorites.splice(idx,1);
  else favorites.push(item);
  saveFav();
  renderActiveTab(currentTab);
}

window.toggleFavByLink = toggleFavByLink;
window.isFavByItem = isFavByItem;
window.openArticleInApp = openArticleInApp;

// --- الوضع الليلي / النهاري ---
if(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches){
  document.body.classList.add("dark");
  themeToggle.textContent="☀️";
}
themeToggle.onclick = ()=>{
  document.body.classList.toggle("dark");
  themeToggle.textContent=document.body.classList.contains("dark")?"☀️":"🌙";
  // تغيير شعار التطبيق عند التبديل
  const logo=document.getElementById("appLogo");
  logo.src=document.body.classList.contains("dark")?"img/logo-dark.png":"img/logo-light.png";
};

// --- تكبير وتصغير الخط ---
fontPlus.onclick = ()=> { fontSize++; document.body.style.fontSize = fontSize + "px"; }
fontMinus.onclick = ()=> { fontSize=Math.max(12,fontSize-1); document.body.style.fontSize = fontSize + "px"; }

// --- تحديث ---
refreshBtn.onclick = ()=> renderActiveTab(currentTab);

// --- البرغر للتبويبات ---
tabBurgerBtn.onclick = ()=> tabMenu.classList.toggle("hidden");
tabMenu.querySelectorAll("li").forEach(li=>{
  li.addEventListener("click", ()=>{
    const tab=li.dataset.tab;
    currentTab=tab;
    currentTabLabel.textContent=li.textContent;
    tabMenu.classList.add("hidden");
    renderActiveTab(tab);
  });
});

// --- البحث ---
searchInput.addEventListener("input", ()=>{
  const query=searchInput.value.toLowerCase();
  const filtered = allItems.filter(item=>{
    return (item.title||"").toLowerCase().includes(query) || (item.contentSnippet||item.description||"").toLowerCase().includes(query);
  });
  renderList(filtered,currentTab);
});

// --- فتح المقال أو الفيديو ---
function openArticleInApp(item,type="news"){
  articlePage.classList.remove("hidden");
  articlePage.setAttribute("aria-hidden","false");
  if(type==="youtube" && item.vid){
    articleContent.innerHTML=`<h2>${escapeHtml(item.title)}</h2>
      <iframe class="youtube-player" src="https://www.youtube.com/embed/${item.vid}" frameborder="0" allowfullscreen></iframe>
      <p>${escapeHtml(item.description||"")}</p>`;
    return;
  }
  articleContent.innerHTML=`<h2>${escapeHtml(item.title)}</h2>
    <div id="articleFrameWrap">
      <iframe id="articleFrame" class="youtube-player" src="${item.link}" frameborder="0"></iframe>
    </div>
    <p style="margin-top:10px">إذا لم يظهر المحتوى أعلاه، اضغط لفتحه في نافذة جديدة:</p>
    <a href="${item.link}" target="_blank" rel="noopener">فتح في تبويب جديد</a>`;
}
closeArticle.onclick = ()=>{
  articlePage.classList.add("hidden");
  articlePage.setAttribute("aria-hidden","true");
};

// --- عرض المفضلة ---
function renderFavoritesTab(){
  list.innerHTML="";
  if(!favorites.length){ list.innerHTML="<p>قائمة المفضلة فارغة.</p>"; return; }
  favorites.forEach(it=>{
    const el=createCardElement(it,true,it.vid?"youtube":"news");
    el.querySelector(".favorite-btn").onclick=(e)=>{
      e.stopPropagation(); toggleFavByLink(it);
    };
    list.appendChild(el);
  });
}

// --- عرض القائمة ---
function renderList(items,tab){
  list.innerHTML="";
  if(!items.length){ list.innerHTML="<p>لا توجد عناصر.</p>"; return; }
  items.forEach(it=>{
    const el=createCardElement(it,isFavByItem(it),tab==="youtube"?"youtube":"news");
    list.appendChild(el);
  });
}

// --- جلب الأخبار والفيديوهات ---
async function renderActiveTab(tab){
  splash.style.display="flex";
  list.innerHTML="<p>جاري جلب المحتوى...</p>";
  allItems=[];
  try{
    if(tab==="favorites"){ renderFavoritesTab(); return; }

    let url=tab==="youtube"?"/youtube":`/news/${tab}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error("fetch failed");
    const items = await res.json();
    allItems=items;
    renderList(items,tab);
  }catch(e){
    console.error(e);
    list.innerHTML="<p>تعذر جلب المحتوى.</p>";
  }finally{
    setTimeout(()=>{ splash.style.display="none"; },300);
  }
}

// --- بدء التطبيق ---
renderActiveTab(currentTab);
