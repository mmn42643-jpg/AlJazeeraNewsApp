function escapeHtml(str){
  return String(str||"").replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
}

function createCardElement(item, isFav=false, type="news"){
  const card=document.createElement("article");
  card.className="card";

  if(item.img){
    const img=document.createElement("img");
    img.className="thumb";
    img.src=item.img;
    img.alt=item.title||"image";
    img.onerror=()=> img.src="https://via.placeholder.com/800x450?text=No+Image";
    card.appendChild(img);
  }

  const body=document.createElement("div");
  body.className="card-body";
  const h3=document.createElement("h3");
  h3.textContent=item.title||"";
  const p=document.createElement("p");
  p.innerHTML=item.contentSnippet || item.description || "";
  body.appendChild(h3);
  body.appendChild(p);
  card.appendChild(body);

  const footer=document.createElement("div");
  footer.className="card-buttons";

  const readBtn=document.createElement("button");
  readBtn.className="action-btn";
  readBtn.textContent= type==="news"?"قراءة الخبر":"تشغيل الفيديو";
  readBtn.onclick=()=> window.openArticleInApp(item,type);

  const favBtn=document.createElement("button");
  favBtn.className="favorite-btn";
  favBtn.innerText=isFav?"🌟":"⭐";
  if(isFav) favBtn.classList.add("active");
  favBtn.onclick=(e)=>{
    e.stopPropagation();
    window.toggleFavByLink(item);
    if(window.isFavByItem(item)){ favBtn.classList.add("active"); favBtn.innerText="🌟"; }
    else{ favBtn.classList.remove("active"); favBtn.innerText="⭐"; }
  };

  footer.appendChild(readBtn);
  footer.appendChild(favBtn);
  card.appendChild(footer);
  return card;
}
