# Setup

Guia para configurar o projeto CineList localmente.

## Pré-requisitos

- **Node.js** 18+ (recomendado 20+)
- **npm** ou **pnpm**
- Backend da API em execução (NestJS) ou URL pública configurada

## Instalação

```bash
git clone <url-do-repositorio>
cd movies-list-frontend
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto (nunca commite este arquivo). Use as variáveis abaixo:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_URL` | Sim | URL base da API do backend (ex: `https://sua-api.onrender.com/api/v1`) |
| `AUTH_SECRET` | Sim | Segredo para assinar cookies/tokens do Auth.js (gere com `openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | Sim | Client ID do projeto no Google Cloud Console (OAuth 2.0) |
| `AUTH_GOOGLE_SECRET` | Sim | Client Secret do OAuth Google |
| `NEXTAUTH_URL` | Dev | Em desenvolvimento use `http://localhost:3000` (ou a porta do `npm run dev`) |
| `TMDB_READ_ACCESS_TOKEN` | Sim* | Token de leitura da API TMDB (autocomplete de filmes). Obtenha em [TMDB](https://www.themoviedb.org/settings/api). |

\* Sem o token TMDB, a busca por filmes para adicionar à lista não funcionará.

### Exemplo mínimo `.env.local`

```env
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=seu-segredo-base64-aqui
AUTH_GOOGLE_ID=xxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxx
NEXT_PUBLIC_API_URL=https://sua-api.exemplo.com/api/v1
TMDB_READ_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9...
```

## Executando o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) (ou a porta exibida no terminal).

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Next.js) |
| `npm run build` | Build de produção |
| `npm run start` | Inicia o servidor de produção (após `build`) |
| `npm run lint` | Executa o ESLint |

## Próximos passos

- [Autenticação](authentication.md) — fluxo de login com Google e integração com o backend
- [API Reference](api-reference.md) — endpoints e uso do cliente HTTP
- [Deploy](deployment.md) — publicar em Vercel, Render ou similar
