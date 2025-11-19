// مثال لإضافة دعم YouTube
async function loadYouTube() {
  const content = document.getElementById('content');
  content.innerHTML = 'جارٍ تحميل فيديوهات يوتيوب...';
  try {
    const res = await fetch('/youtube');
    const data = await res.json();
    if (data.error) {
      content.innerHTML = data.error;
      return;
    }
    content.innerHTML = data.items.map(item => `
      <div>
        <h3>${item.snippet.title}</h3>
        <img src="${item.snippet.thumbnails.medium.url}" alt="">
      </div>
    `).join('');
  } catch {
    content.innerHTML = 'تعذر جلب فيديوهات اليوتيوب';
  }
}

document.querySelector('[data-tab="youtube"]').addEventListener('click', loadYouTube);
