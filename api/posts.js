import { del, list, put } from '@vercel/blob';

const POSTS_PREFIX = 'site-content/posts/';

function response(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' }
  });
}

function isAuthorized(request) {
  const password = process.env.CMS_PASSWORD;
  const provided = request.headers.get('authorization');
  return Boolean(password) && provided === `Bearer ${password}`;
}

function clean(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

async function allPosts() {
  const { blobs } = await list({ prefix: POSTS_PREFIX, limit: 100 });
  const posts = await Promise.all(blobs.map(async (blob) => {
    const result = await fetch(blob.url);
    return result.ok ? result.json() : null;
  }));
  return posts.filter(Boolean).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export default {
  async fetch(request) {
    try {
      if (request.method === 'GET') {
        return response({ posts: await allPosts() });
      }

      if (request.method === 'POST') {
        if (!isAuthorized(request)) return response({ error: 'Não autorizado.' }, 401);

        const payload = await request.json();
        const title = clean(payload.title, 120);
        const excerpt = clean(payload.excerpt, 280);
        const body = clean(payload.body, 8000);
        const category = clean(payload.category, 48) || 'Saúde feminina';

        if (!title || !excerpt || !body) {
          return response({ error: 'Preencha título, resumo e conteúdo.' }, 422);
        }

        const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
        const post = { id, title, excerpt, body, category, createdAt: new Date().toISOString() };

        await put(`${POSTS_PREFIX}${id}.json`, JSON.stringify(post), {
          access: 'public',
          addRandomSuffix: false,
          contentType: 'application/json; charset=utf-8',
          cacheControlMaxAge: 0
        });

        return response({ post }, 201);
      }

      if (request.method === 'DELETE') {
        if (!isAuthorized(request)) return response({ error: 'Não autorizado.' }, 401);
        const id = new URL(request.url).searchParams.get('id');
        if (!id || !/^[a-zA-Z0-9-]+$/.test(id)) return response({ error: 'Publicação inválida.' }, 400);

        const { blobs } = await list({ prefix: `${POSTS_PREFIX}${id}.json` });
        if (blobs[0]) await del(blobs[0].url);
        return response({ deleted: true });
      }

      return response({ error: 'Método não permitido.' }, 405);
    } catch (error) {
      console.error('CMS posts error', error);
      return response({ error: 'Não foi possível concluir esta operação.' }, 500);
    }
  }
};
