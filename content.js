(() => {
  const grid = document.querySelector('.content-hub .content-grid');
  if (!grid) return;
  const intro = document.querySelector('.content-hub .section-head p');
  if (intro) {
    intro.textContent = 'Conteúdos informativos publicados e atualizados pela própria Dra. Hemmile Aguiar neste espaço.';
  }

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));

  const formatDate = (value) => new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  }).format(new Date(value));

  fetch('/api/posts')
    .then((response) => response.ok ? response.json() : Promise.reject())
    .then(({ posts }) => {
      if (!posts?.length) return;
      grid.innerHTML = posts.slice(0, 6).map((post) => `
        <article class="article-card">
          <span>${escapeHtml(post.category)} · ${formatDate(post.createdAt)}</span>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.excerpt)}</p>
          <details><summary>Ler conteúdo</summary><p>${escapeHtml(post.body).replace(/\n/g, '<br>')}</p></details>
        </article>`).join('');
    })
    .catch(() => { /* Os conteúdos institucionais seguem disponíveis como fallback. */ });
})();
