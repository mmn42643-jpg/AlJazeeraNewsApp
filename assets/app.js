// عناصر DOM
const splash = document.getElementById("splash");
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

// الأيقونات (عناصر <img>)
const themeIcon = document.getElementById("themeIcon");
const refreshIcon = document.getElementById("refreshIcon");
const searchIcon = document.getElementById("searchIcon");
const fontPlusIcon = document.getElementById("fontPlusIcon");
const fontMinusIcon = document.getElementById("fontMinusIcon");
const menuIcon = document.getElementById("menuIcon");
const appLogo = document.getElementById("appLogo");

let fontSize = 16;
let favorites = JSON.parse(localStorage.getItem("favNews") || "[]");
let currentTab = "politics";
let allItems = []; // لتخزين الأخبار والفيديوهات

// حفظ واسترجاع المفضلة
function saveFav(){ localStorage.setItem("favNews", JSON.stringify(favorites)); }
function isFavByItem(item){ return favorites.findIndex(f=> (f.link && item.link && f.link===item.link) || (f.vid && item.vid && f.vid===item.vid) ) !== -1; }
function toggleFavByLink(item){
  const idx = favorites.findIndex(f=> (f.link && item.link && f.link===item.link) || (f.vid && item.vid && f.vid===item.vid) );
  if(idx >= 0) favorites.splice(idx,1);
  else favorites.push(item);
  saveFav();
  renderActiveTab(currentTab);
}

window.toggleFavByLink = toggleFavByLink;
window.isFavByItem = isFavByItem;
window.openArticleInApp = openArticleInApp;

// --- تحديث أيقونات حسب الوضع (light/dark) ---
function updateIconsForTheme(){
  const isDark = document.body.classList.contains("dark");
  // تطبيق أسماء الملفات كما عندك في repo
  themeIcon.src = isDark ? "img/sun.png" : "img/moon.png"; // inverse: show sun when dark to indicate switch
  refreshIcon.src = isDark ? "img/refresh-dark.png" : "img/refresh-light.png";
  searchIcon.src = isDark ? "img/search-dark.png" : "img/search-light.png";
  fontPlusIcon.src = isDark ? "img/font-plus-dark.png" : "img/font-plus-light.png";
  fontMinusIcon.src = isDark ? "img/font-minus-dark.png" : "img/font-minus-light.png";
  menuIcon.src = isDark ? "img/menu-dark.png" : "img/menu-light.png";
  appLogo.src = isDark ? "img/logo-dark.png" : "img/logo-light.png";
}

// --- الوضع الليلي / النهاري (يتوافق مع نظام الجهاز) ---
if(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches){
  document.body.classList.add("dark");
}
updateIconsForTheme();

themeToggle.addEventListener("click", ()=>{
  document.body.classList.toggle("dark");
  updateIconsForTheme();
});

// --- تكبير وتصغير الخط ---
fontPlus.addEventListener("click", ()=> { fontSize++; document.body.style.fontSize = fontSize + "px"; });
fontMinus.addEventListener("click", ()=> { fontSize = Math.max(12,fontSize-1); document.body.style.fontSize = fontSize + "px"; });

// --- تحديث ---
refreshBtn.addEventListener("click", ()=> renderActiveTab(currentTab));

// --- البرغر للتبويبات ---
tabBurgerBtn.addEventListener("click", ()=> tabMenu.classList.toggle("hidden"));
tabMenu.querySelectorAll("li").forEach(li=>{
  li.addEventListener("click", ()=>{
    const tab = li.dataset.tab;
    currentTab = tab;
    currentTabLabel.textContent = li.textContent;
    tabMenu.classList.add("hidden");
    renderActiveTab(tab);
  });
});

// --- البحث ---
searchInput.addEventListener("input", ()=>{
  const q = searchInput.value.trim().toLowerCase();
  if(!q) {
    renderList(allItems, currentTab);
    return;
  }
  const filtered = allItems.filter(item=>{
    const title = (item.title||"").toLowerCase();
    const desc = (item.contentSnippet || item.description || item.content || "").toLowerCase();
    return title.includes(q) || desc.includes(q);
  });
  renderList(filtered, currentTab);
});

// --- فتح المقال أو الفيديو ---
function openArticleInApp(item, type="news"){
  articlePage.classList.remove("hidden");
  articlePage.setAttribute("aria-hidden","false");
  if(type==="youtube" && item.vid){
    articleContent.innerHTML = `<h2>${escapeHtml(item.title)}</h2>
      <iframe class="youtube-player" src="https://www.youtube.com/embed/${item.vid}" frameborder="0" allowfullscreen></iframe>
      <p>${escapeHtml(item.description || "")}</p>`;
    return;
  }
  articleContent.innerHTML = `<h2>${escapeHtml(item.title)}</h2>
    <div id="articleFrameWrap">
      <iframe id="articleFrame" class="youtube-player" src="${item.link}" frameborder="0"></iframe>
    </div>
    <p style="margin-top:10px">إذا لم يظهر المحتوى أعلاه، اضغط لفتحه في نافذة جديدة:</p>
    <a href="${item.link}" target="_blank" rel="noopener">فتح في تبويب جديد</a>`;
}
closeArticle.addEventListener("click", ()=>{
  articlePage.classList.add("hidden");
  articlePage.setAttribute("aria-hidden","true");
});

// --- عرض المفضلة ---
function renderFavoritesTab(){
  list.innerHTML = "";
  if(!favorites.length){ list.innerHTML = "<p>قائمة المفضلة فارغة.</p>"; return; }
  favorites.forEach(it=>{
    const el = createCardElement(it, true, it.vid ? "youtube" : "news");
    el.querySelector(".favorite-btn").onclick = (e)=>{
      e.stopPropagation(); toggleFavByLink(it);
    };
    list.appendChild(el);
  });
}

// --- عرض القائمة ---
function renderList(items, tab){
  list.innerHTML = "";
  if(!items || !items.length){ list.innerHTML = "<p>لا توجد عناصر.</p>"; return; }
  items.forEach(it=>{
    const el = createCardElement(it, isFavByItem(it), tab === "youtube" ? "youtube" : "news");
    list.appendChild(el);
  });
}

// --- جلب الأخبار والفيديوهات ---
async function renderActiveTab(tab){
  splash.style.display = "flex";
  list.innerHTML = "<p>جاري جلب المحتوى...</p>";
  allItems = [];
  try{
    if(tab === "favorites"){ renderFavoritesTab(); return; }

    const url = tab === "youtube" ? "/youtube" : `/news/${tab}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error("fetch failed");
    const items = await res.json();

    // items could be empty or error object
    if(!Array.isArray(items)) {
      console.warn("Server returned non-array for", tab, items);
      list.innerHTML = "<p>تعذر جلب المحتوى.</p>";
      return;
    }

    allItems = items;
    renderList(items, tab);
  } catch(e){
    console.error(e);
    list.innerHTML = "<p>تعذر جلب المحتوى.</p>";
  } finally {
    setTimeout(()=>{ splash.style.display = "none"; }, 300);
  }
}

// --- بدء التطبيق ---
renderActiveTab(currentTab);
