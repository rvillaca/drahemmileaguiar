const passwordInput = document.querySelector('#password');
const loginStatus = document.querySelector('#login-status');
const editor = document.querySelector('#editor');
const published = document.querySelector('#published');
const postsElement = document.querySelector('#posts');
let password = '';

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` };
}

async function loadPosts() {
  const response = await fetch('/api/posts');
  const { posts } = await response.json();
  postsElement.innerHTML = posts.length ? posts.map((post) => `
    <article class="post"><small>${post.category} · ${new Date(post.createdAt).toLocaleDateString('pt-BR')}</small>
    <h3>${post.title}</h3><p>${post.excerpt}</p>
    <button class="secondary" data-delete="${post.id}" type="button">Excluir</button></article>`).join('') : '<p>Nenhuma publicação ainda.</p>';
}

document.querySelector('#login').addEventListener('click', async () => {
  password = passwordInput.value;
  if (!password) return;
  loginStatus.textContent = 'Verificando acesso…';
  const response = await fetch('/api/posts', { method: 'POST', headers: authHeaders(), body: JSON.stringify({}) });
  if (response.status === 422) {
    loginStatus.textContent = '';
    document.querySelector('#login-card').classList.add('hidden');
    editor.classList.remove('hidden'); published.classList.remove('hidden');
    await loadPosts();
  } else {
    loginStatus.textContent = 'Senha inválida.';
  }
});

document.querySelector('#post-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.querySelector('#post-status');
  status.textContent = 'Publicando…';
  const payload = Object.fromEntries(['category', 'title', 'excerpt', 'body'].map((id) => [id, document.querySelector(`#${id}`).value]));
  const response = await fetch('/api/posts', { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
  const result = await response.json();
  if (!response.ok) { status.textContent = result.error || 'Não foi possível publicar.'; return; }
  event.target.reset(); document.querySelector('#category').value = 'Saúde feminina';
  status.textContent = 'Publicado com sucesso.'; await loadPosts();
});

postsElement.addEventListener('click', async (event) => {
  const id = event.target.dataset.delete;
  if (!id || !confirm('Excluir esta publicação?')) return;
  await fetch(`/api/posts?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: authHeaders() });
  await loadPosts();
});
