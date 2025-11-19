// Fetch RSS news
fetch("/news")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("news-container");
    data.forEach(item => {
      const div = document.createElement("div");
      div.innerHTML = `<h3>${item.title}</h3><a href="${item.link}" target="_blank">قراءة المزيد</a>`;
      container.appendChild(div);
    });
  })
  .catch(err => {
    console.error(err);
    document.getElementById("news-container").innerText = "تعذر تحميل الأخبار";
  });

// Fetch YouTube videos
fetch("/youtube")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("youtube-container");
    data.forEach(video => {
      const div = document.createElement("div");
      div.innerHTML = `<h4>${video.title}</h4><a href="${video.url}" target="_blank"><img src="${video.thumbnail}" alt="${video.title}"></a>`;
      container.appendChild(div);
    });
  })
  .catch(err => {
    console.error(err);
    document.getElementById("youtube-container").innerText = "تعذر تحميل الفيديوهات";
  });async function loadPolitics(){ politicsSection.innerHTML="<p>جاري جلب أخبار السياسة...</p>"; try{ const items=await getJSON("politics"); politicsSection.innerHTML=""; items.forEach(it=>politicsSection.appendChild(createCardElement(it,isFavByItem(it)))); }catch(e){ console.error(e); politicsSection.innerHTML="<p>تعذر جلب الأخبار.</p>"; }}
async function loadYoutube(){ youtubeSection.innerHTML="<p>جاري جلب فيديوهات اليوتيوب...</p>"; try{ const items=await getJSON("youtube"); youtubeSection.innerHTML=""; items.forEach(it=>youtubeSection.appendChild(createCardElement(it,isFavByItem(it)))); }catch(e){ console.error(e); youtubeSection.innerHTML="<p>تعذر جلب فيديوهات اليوتيوب.</p>"; }}
async function loadAll(){ try{ await Promise.all([loadPolitics(),loadYoutube()]); renderFavorites(); refreshDisplayedFavButtons(); }catch(e){ console.error(e); }}
refreshBtn.onclick=loadAll;
loadAll();
