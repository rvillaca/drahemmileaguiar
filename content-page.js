(() => {
  const postsElement = document.querySelector('#published-posts');
  if (!postsElement) return;

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));

  const formatDate = (value) => new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  }).format(new Date(value));

  const paragraphs = (value) => escapeHtml(value).split(/\n{2,}/).filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`).join('');

  fetch('/api/posts')
    .then((response) => response.ok ? response.json() : Promise.reject())
    .then(({ posts }) => {
      if (!posts?.length) {
        postsElement.innerHTML = '<p class="editorial-empty">Em breve, novos conteúdos serão publicados aqui.</p>';
        return;
      }

      postsElement.innerHTML = posts.map((post, index) => `
        <article class="editorial-story" id="post-${escapeHtml(post.id)}">
          <span class="story-number">${String(index + 1).padStart(2, '0')}</span>
          <div>
            <span class="eyebrow">${escapeHtml(post.category)}</span>
            <p class="post-date"><time datetime="${escapeHtml(post.createdAt)}">Publicado em ${formatDate(post.createdAt)}</time></p>
            <h2>${escapeHtml(post.title)}</h2>
            <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
            <div class="post-body">${paragraphs(post.body)}</div>
          </div>
        </article>`).join('');
    })
    .catch(() => {
      postsElement.innerHTML = '<p class="editorial-empty">Não foi possível carregar os conteúdos neste momento.</p>';
    });
})();
