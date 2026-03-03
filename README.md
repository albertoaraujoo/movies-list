# CineList — Frontend

Interface para gerenciar sua lista pessoal de filmes com sorteio, integração TMDB e autenticação Google.

## Quick Start

```bash
# 1. Clone e instale
git clone <repo>
cd movies-list-frontend
npm install

# 2. Variáveis de ambiente
# Crie .env.local na raiz e preencha as variáveis (veja tabela abaixo).

# 3. Inicie o servidor
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

Crie `.env.local` na raiz (não commite). Consulte [docs/setup.md](docs/setup.md) para detalhes.

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL base da API do backend |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |
| `AUTH_SECRET` | Segredo para assinar os tokens do Auth.js |
| `TMDB_READ_ACCESS_TOKEN` | Token de leitura da API do TMDB |

## Documentação

Documentação por tópico (PT-BR e EN):

| Tópico | 🇧🇷 Português | 🇺🇸 English |
|--------|----------------|-------------|
| Setup | [docs/setup.md](docs/setup.md) | [docs/en/setup.md](docs/en/setup.md) |
| Autenticação | [docs/authentication.md](docs/authentication.md) | [docs/en/authentication.md](docs/en/authentication.md) |
| API Reference | [docs/api-reference.md](docs/api-reference.md) | [docs/en/api-reference.md](docs/en/api-reference.md) |
| Deploy | [docs/deployment.md](docs/deployment.md) | [docs/en/deployment.md](docs/en/deployment.md) |

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** strict mode
- **Tailwind CSS v4** + **shadcn/ui**
- **Auth.js v5** (Google Provider)
- **Framer Motion** (animações)
- **TanStack Query** (cache e sincronização)
- **Lucide React** (ícones)

## Funcionalidades

- Login com Google → troca de token com backend NestJS
- Lista de filmes com grid responsivo (2→4→5→6 colunas)
- Cards estilo poster (2:3) com glassmorphism
- **Página de detalhes do filme:** sinopse, duração, onde assistir no Brasil (streaming/aluguel/compra), ícones dos providers; botão “Sincronizar com TMDB” quando dados faltam
- Busca com autocomplete via TMDB
- Marcar filmes como assistidos
- Sorteio aleatório com animação de roleta
- Lista de sorteados com drag-and-drop
