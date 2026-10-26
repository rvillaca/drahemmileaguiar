# Publicação gratuita na Cloudflare

Este projeto está preparado para ser publicado no **Cloudflare Pages** com o painel de conteúdos preservado em uma base **Cloudflare D1**.

## Configuração inicial

1. Crie uma conta gratuita na Cloudflare e adicione o domínio comprado à conta.
2. Em **Workers & Pages**, crie um projeto **Pages** conectado ao repositório `rvillaca/drahemmileaguiar`.
3. Configure o projeto com:
   - **Production branch:** `main`
   - **Build command:** deixe vazio
   - **Build output directory:** `.`
4. Em **Workers & Pages > D1**, crie o banco `drahemmile-posts`.
5. Execute o arquivo `migrations/0001_create_posts.sql` no console do banco D1.
6. No projeto Pages, acesse **Settings > Bindings** e adicione o banco D1 com o nome da variável `POSTS_DB`.
7. Em **Settings > Variables and Secrets**, adicione o segredo `CMS_PASSWORD` com a senha já usada pelo painel administrativo.
8. Faça um novo deploy do projeto Pages. O endpoint `/api/posts` será atendido pela função em `functions/api/posts.js`.

## Domínio

No projeto Pages, em **Custom domains**, adicione o domínio principal e `www`. Caso o domínio use os nameservers da Cloudflare, a configuração é automática; caso contrário, a Cloudflare mostrará os registros DNS necessários.

## Migração dos conteúdos existentes

Antes de desligar a Vercel, copie as publicações existentes do endpoint atual para a tabela `posts` do D1. Depois de confirmar que o painel administrativo cria, lista e exclui conteúdos normalmente na Cloudflare, a Vercel pode ser desativada.
