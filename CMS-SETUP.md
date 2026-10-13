# Painel de conteúdos

O painel estará em `/admin/` após o deploy. Ele publica conteúdos educativos na seção **Conteúdos** do site.

## Configuração necessária no Vercel

1. Crie um **Vercel Blob Store** com acesso **Public** e conecte-o a este projeto em Production e Preview.
2. Em *Project Settings → Environment Variables*, crie `CMS_PASSWORD` com uma senha forte e exclusiva do painel. Não use o token da Vercel.
3. Faça o deploy do projeto.

O Vercel adiciona automaticamente as credenciais do Blob ao projeto conectado. O código não armazena senhas no navegador nem no repositório.

## Uso

1. Acesse `https://drahemmileaguiar.vercel.app/admin/`.
2. Informe a senha definida em `CMS_PASSWORD`.
3. Preencha categoria, título, resumo e conteúdo, depois clique em **Publicar no site**.

As publicações são educacionais e públicas por definição. Não use dados de pacientes, imagens identificáveis sem autorização ou promessas de resultado.
