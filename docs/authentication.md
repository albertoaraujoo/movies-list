# Autenticação

O CineList usa **Auth.js v5** (NextAuth) com provedor **Google OAuth 2.0** e troca de token com o backend NestJS.

## Fluxo resumido

1. Usuário clica em "Entrar com Google" na página `/login`.
2. Auth.js redireciona para o Google e, após aprovação, recebe um `id_token`.
3. No callback JWT, o frontend chama `POST /auth/google` no **backend** enviando o `id_token`.
4. O backend valida o token, cria ou encontra o usuário e devolve um `accessToken` JWT próprio.
5. Esse `accessToken` é guardado na sessão (cookie) e usado em todas as requisições à API (filmes, sorteio, etc.).

## Configuração Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/) e crie ou selecione um projeto.
2. Em **APIs & Services** → **Credentials**, crie um **OAuth 2.0 Client ID** (tipo "Web application").
3. Em **Authorized redirect URIs** adicione:
   - Desenvolvimento: `http://localhost:3000/api/auth/callback/google`
   - Produção: `https://seu-dominio.com/api/auth/callback/google`
4. Copie **Client ID** e **Client Secret** para `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` no `.env.local`.

## Arquivos principais

| Arquivo | Função |
|---------|--------|
| `src/auth.ts` | Configuração do NextAuth (Google provider, callbacks JWT/session) |
| `src/app/login/page.tsx` | Página de login com botão Google |
| `src/lib/api.ts` | Função `loginWithGoogle(idToken)` que chama o backend |

## Sessão no frontend

A sessão estendida inclui:

- `session.user` — `id`, `name`, `email`, `image` (do backend após troca de token)
- `session.accessToken` — JWT do backend, usado no header `Authorization: Bearer <token>` nas chamadas à API

Uso típico em componentes ou Server Actions:

```ts
import { auth } from "@/auth";

const session = await auth();
if (!session?.accessToken) {
  redirect("/login");
}
// Chamar getMovies(params, session.accessToken), etc.
```

## Logout

`signOut()` do Auth.js limpa a sessão e os cookies. O backend pode manter o token até expirar; para revogação imediata seria necessário um endpoint de logout no backend.

## Segurança

- **Nunca** exponha `AUTH_SECRET`, `AUTH_GOOGLE_SECRET` ou `TMDB_READ_ACCESS_TOKEN` no cliente.
- Use `AUTH_SECRET` forte (ex.: `openssl rand -base64 32`) e rotacione se houver vazamento.
- Em produção, defina `NEXTAUTH_URL` com a URL pública correta (ex.: `https://app.cinelist.com`).
