# Deploy

Como publicar o CineList em produção (Vercel, Render, etc.).

## Variáveis de ambiente em produção

Configure no painel do seu provedor as mesmas variáveis do [Setup](setup.md), com valores de produção:

| Variável | Produção |
|----------|----------|
| `NEXTAUTH_URL` | URL pública do app (ex: `https://cinelist.vercel.app`) |
| `AUTH_SECRET` | Segredo forte (ex: `openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | Mesmo Client ID, com redirect URI de produção |
| `AUTH_GOOGLE_SECRET` | Client Secret do Google |
| `NEXT_PUBLIC_API_URL` | URL da API em produção |
| `TMDB_READ_ACCESS_TOKEN` | Token TMDB (leitura) |

No **Google Cloud Console**, adicione em **Authorized redirect URIs** a URL:

```
https://seu-dominio.com/api/auth/callback/google
```

---

## Vercel

1. Conecte o repositório no [Vercel](https://vercel.com).
2. Framework: **Next.js** (detectado automaticamente).
3. Em **Environment Variables**, preencha todas as variáveis acima.
4. Deploy: a cada push na branch configurada o Vercel faz build e publica.

Build command: `npm run build`  
Output: pasta `.next` (padrão Next.js).

---

## Render (ou outro Node)

1. Crie um **Web Service**.
2. Build command: `npm install && npm run build`
3. Start command: `npm run start`
4. Defina as variáveis de ambiente no painel.
5. Garanta que a API do backend esteja acessível pela URL configurada em `NEXT_PUBLIC_API_URL`.

---

## Checklist pós-deploy

- [ ] Login com Google funciona (redirect URI de produção configurado).
- [ ] Lista de filmes e ações (criar, editar, excluir) funcionam (API acessível e CORS ok).
- [ ] Busca TMDB (autocomplete) funciona (`TMDB_READ_ACCESS_TOKEN` definido).
- [ ] Sorteio e lista de sorteados funcionam.
- [ ] `NEXTAUTH_URL` sem barra no final e usando HTTPS em produção.
