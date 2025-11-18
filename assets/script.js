/* ---------- عناصر DOM ---------- */
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".tab-content");
const themeToggle = document.getElementById("themeToggle");
const refreshBtn = document.getElementById("refreshBtn");
const politicsSection = document.getElementById("politics");
const youtubeSection = document.getElementById("youtube");
const favSection = document.getElementById("favorites");
const articlePage = document.getElementById("articlePage");
const articleContent = document.getElementById("articleContent");
document.getElementById("closeArticle").onclick = ()=>{articlePage.classList.add("hidden"); articlePage.setAttribute("aria-hidden","true");};

// تبويبات
tabs.forEach(btn=>btn.addEventListener("click",()=>{ tabs.forEach(t=>t.classList.remove("active")); contents.forEach(c=>c.classList.remove("active")); btn.classList.add("active"); document.getElementById(btn.dataset.tab).classList.add("active");}));

// وضع تلقائي
if(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches){document.body.classList.add("dark"); themeToggle.textContent="☀️";}
themeToggle.onclick = ()=>{document.body.classList.toggle("dark"); themeToggle.textContent=document.body.classList.contains("dark")?"☀️":"🌙";};

// مفضلة
let favorites = JSON.parse(localStorage.getItem("favNews")||"[]");
function saveFav(){ localStorage.setItem("favNews",JSON.stringify(favorites)); }
function isFavByItem(item){ return favorites.findIndex(f=>f.link===item.link||f.vid===item.vid)!==-1; }
function toggleFavByLink(item){ const idx=favorites.findIndex(f=>f.link===item.link||f.vid===item.vid); if(idx>=0)favorites.splice(idx,1); else favorites.push(item); saveFav(); renderFavorites(); refreshDisplayedFavButtons();}
window.toggleFavByLink = toggleFavByLink;
function renderFavorites(){ favSection.innerHTML=""; if(!favorites.length){favSection.innerHTML="<p>قائمة المفضلة فارغة.</p>"; return;} favorites.forEach(it=>favSection.appendChild(createCardElement(it,true))); }
function refreshDisplayedFavButtons(){ document.querySelectorAll(".favorite-btn").forEach(btn=>{ const card=btn.closest(".card"); if(!card)return; const title=card.querySelector("h3")?.textContent||""; const found=favorites.find(f=>f.title===title); if(found){btn.classList.add("active"); btn.innerText="🌟";} else{btn.classList.remove("active"); btn.innerText="⭐";}});}

// إنشاء بطاقة
function createCardElement(item,isFav=false){ const card=document.createElement("article"); card.className="card"; if(item.img){const img=document.createElement("img"); img.src=item.img; img.alt=item.title||"image"; img.onerror=()=>img.src="https://via.placeholder.com/800x450?text=No+Image"; card.appendChild(img);} const body=document.createElement("div"); body.className="card-body"; const h3=document.createElement("h3"); h3.textContent=item.title||""; const p=document.createElement("p"); p.innerHTML=item.desc||""; body.appendChild(h3); body.appendChild(p); card.appendChild(body); const footer=document.createElement("div"); footer.className="card-buttons"; const readBtn=document.createElement("button"); readBtn.className="action-btn"; readBtn.textContent="قراءة الخبر"; readBtn.onclick=()=>openArticleInApp(item); const favBtn=document.createElement("button"); favBtn.className="favorite-btn"; favBtn.title="أضف للمفضلة"; favBtn.innerText=isFav?"🌟":"⭐"; favBtn.onclick=e=>{ e.stopPropagation(); toggleFavByLink(item); if(isFavByItem(item)){favBtn.classList.add("active"); favBtn.innerText="🌟";}else{favBtn.classList.remove("active"); favBtn.innerText="⭐";}}; footer.appendChild(readBtn); footer.appendChild(favBtn); card.appendChild(footer); return card;}

// فتح الخبر أو فيديو
function openArticleInApp(item){ articlePage.classList.remove("hidden"); articlePage.setAttribute("aria-hidden","false"); const link=item.link||(item.vid?`https://www.youtube.com/watch?v=${item.vid}`:"#"); if(link.includes("youtube.com/watch")||item.vid){ const vid=item.vid||link.split("v=")[1]||""; articleContent.innerHTML=`<h2>${item.title||""}</h2><iframe class="youtube-player" src="https://www.youtube.com/embed/${vid}" frameborder="0" allowfullscreen></iframe>`; return;} articleContent.innerHTML=`<h2>${item.title||""}</h2><iframe class="youtube-player" src="${link}" frameborder="0"></iframe><p style="margin-top:10px">إذا لم يظهر المحتوى أعلاه، اضغط لفتحه في نافذة جديدة:</p><a href="${link}" target="_blank" rel="noopener">فتح في تبويب جديد</a>`;}

// Fetch API
async function getJSON(path){ const API_BASE="https://aljazeeranewsapp.onrender.com/"; const url=API_BASE+path; const res=await fetch(url); if(!res.ok)throw new Error("fetch failed"); return await res.json(); }
async function loadPolitics(){ politicsSection.innerHTML="<p>جاري جلب أخبار السياسة...</p>"; try{ const items=await getJSON("politics"); politicsSection.innerHTML=""; items.forEach(it=>politicsSection.appendChild(createCardElement(it,isFavByItem(it)))); }catch(e){ console.error(e); politicsSection.innerHTML="<p>تعذر جلب الأخبار.</p>"; }}
async function loadYoutube(){ youtubeSection.innerHTML="<p>جاري جلب فيديوهات اليوتيوب...</p>"; try{ const items=await getJSON("youtube"); youtubeSection.innerHTML=""; items.forEach(it=>youtubeSection.appendChild(createCardElement(it,isFavByItem(it)))); }catch(e){ console.error(e); youtubeSection.innerHTML="<p>تعذر جلب فيديوهات اليوتيوب.</p>"; }}
async function loadAll(){ try{ await Promise.all([loadPolitics(),loadYoutube()]); renderFavorites(); refreshDisplayedFavButtons(); }catch(e){ console.error(e); }}
refreshBtn.onclick=loadAll;
loadAll();
