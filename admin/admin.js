const passwordInput = document.querySelector('#password');
const loginStatus = document.querySelector('#login-status');
const dashboard = document.querySelector('#dashboard');
const editor = document.querySelector('#editor');
const published = document.querySelector('#published');
const postsElement = document.querySelector('#posts');
const form = document.querySelector('#post-form');
const previewCategory = document.querySelector('#preview-category');
const previewTitle = document.querySelector('#preview-title');
const previewExcerpt = document.querySelector('#preview-excerpt');
const previewBody = document.querySelector('#preview-body');
let password = '';

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` };
}

async function loadPosts() {
  try {
    const response = await fetch('/api/posts');
    if (!response.ok) throw new Error('Não foi possível carregar as publicações.');
    const { posts } = await response.json();
    postsElement.innerHTML = posts.length ? posts.map((post) => `
      <article class="post"><small>${escapeHtml(post.category)} · Publicado em ${new Date(post.createdAt).toLocaleDateString('pt-BR')}</small>
      <h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.excerpt)}</p>
      <button class="secondary" data-delete="${escapeHtml(post.id)}" type="button">Excluir publicação</button></article>`).join('') : '<p>Nenhuma publicação ainda.</p>';
  } catch (error) {
    postsElement.innerHTML = '<p>Não foi possível carregar as publicações.</p>';
  }
}

function setPreview(element, value, placeholder) {
  element.textContent = value || placeholder;
  element.classList.toggle('preview-placeholder', !value);
}

function updatePreview() {
  setPreview(previewCategory, document.querySelector('#category').value.trim(), 'Saúde feminina');
  setPreview(previewTitle, document.querySelector('#title').value.trim(), 'O título aparecerá aqui');
  setPreview(previewExcerpt, document.querySelector('#excerpt').value.trim(), 'O resumo aparecerá aqui para apresentar o conteúdo.');
  setPreview(previewBody, document.querySelector('#body').value.trim(), 'Escreva o conteúdo para visualizar uma prévia da publicação.');
}

document.querySelector('#login').addEventListener('click', async () => {
  password = passwordInput.value;
  if (!password) return;
  loginStatus.textContent = 'Verificando acesso…';
  const response = await fetch('/api/posts', { method: 'POST', headers: authHeaders(), body: JSON.stringify({}) });
  if (response.status === 422) {
    loginStatus.textContent = '';
    document.querySelector('#login-card').classList.add('hidden');
    dashboard.classList.remove('hidden'); editor.classList.remove('hidden'); published.classList.remove('hidden');
    updatePreview();
    await loadPosts();
  } else {
    loginStatus.textContent = 'Senha inválida.';
  }
});

form.querySelectorAll('input, textarea').forEach((field) => field.addEventListener('input', updatePreview));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.querySelector('#post-status');
  status.textContent = 'Publicando…';
  const payload = Object.fromEntries(['category', 'title', 'excerpt', 'body'].map((id) => [id, document.querySelector(`#${id}`).value]));
  const response = await fetch('/api/posts', { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
  const result = await response.json();
  if (!response.ok) { status.textContent = result.error || 'Não foi possível publicar.'; return; }
  event.target.reset(); document.querySelector('#category').value = 'Saúde feminina'; updatePreview();
  status.textContent = 'Publicado com sucesso.'; await loadPosts();
});

postsElement.addEventListener('click', async (event) => {
  const id = event.target.dataset.delete;
  if (!id || !confirm('Excluir esta publicação?')) return;
  const response = await fetch(`/api/posts?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: authHeaders() });
  if (!response.ok) { alert('Não foi possível excluir esta publicação.'); return; }
  await loadPosts();
});
