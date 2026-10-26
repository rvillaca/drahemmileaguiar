const json = (data, status = 200) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'no-store' }
});

const clean = (value, maxLength) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

function isAuthorized(request, env) {
  const password = env.CMS_PASSWORD;
  return Boolean(password) && request.headers.get('authorization') === `Bearer ${password}`;
}

async function listPosts(database) {
  const { results } = await database.prepare(
    'SELECT id, title, excerpt, body, category, created_at FROM posts ORDER BY created_at DESC'
  ).all();

  return results.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    category: post.category,
    createdAt: post.created_at
  }));
}

export async function onRequest({ request, env }) {
  try {
    const database = env.POSTS_DB;
    if (!database) return json({ error: 'Banco de conteúdos não configurado.' }, 503);

    if (request.method === 'GET') return json({ posts: await listPosts(database) });

    if (request.method === 'POST') {
      if (!isAuthorized(request, env)) return json({ error: 'Não autorizado.' }, 401);

      const payload = await request.json().catch(() => ({}));
      const title = clean(payload.title, 120);
      const excerpt = clean(payload.excerpt, 280);
      const body = clean(payload.body, 8000);
      const category = clean(payload.category, 48) || 'Saúde feminina';

      // The CMS validates its password with an intentionally empty POST request.
      if (!title || !excerpt || !body) {
        return json({ error: 'Preencha título, resumo e conteúdo.' }, 422);
      }

      const post = {
        id: `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
        title,
        excerpt,
        body,
        category,
        createdAt: new Date().toISOString()
      };

      await database.prepare(
        'INSERT INTO posts (id, title, excerpt, body, category, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(post.id, post.title, post.excerpt, post.body, post.category, post.createdAt).run();

      return json({ post }, 201);
    }

    if (request.method === 'DELETE') {
      if (!isAuthorized(request, env)) return json({ error: 'Não autorizado.' }, 401);
      const id = new URL(request.url).searchParams.get('id');
      if (!id || !/^[a-zA-Z0-9-]+$/.test(id)) return json({ error: 'Publicação inválida.' }, 400);

      await database.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
      return json({ deleted: true });
    }

    return json({ error: 'Método não permitido.' }, 405);
  } catch (error) {
    console.error('CMS posts error', error);
    return json({ error: 'Não foi possível concluir esta operação.' }, 500);
  }
}
