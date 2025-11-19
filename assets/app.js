const tabs = document.querySelectorAll('nav button');
const content = document.getElementById('content');

tabs.forEach(tab => {
  tab.addEventListener('click', async () => {
    const category = tab.dataset.tab;
    content.innerHTML = 'جارٍ التحميل...';
    try {
      const res = await fetch(`/news/${category}`);
      const data = await res.json();
      content.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch {
      content.innerHTML = 'تعذر جلب الأخبار';
    }
  });
});
