# Setup

Guide to set up the CineList project locally.

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** or **pnpm**
- Backend API running (NestJS) or a public URL configured

## Installation

```bash
git clone <repo-url>
cd movies-list-frontend
npm install
```

## Environment variables

Create a `.env.local` file in the project root (never commit this file). Use the variables below:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (e.g. `https://your-api.onrender.com/api/v1`) |
| `AUTH_SECRET` | Yes | Secret for signing Auth.js cookies/tokens (e.g. `openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | Yes | Google Cloud Console OAuth 2.0 Client ID |
| `AUTH_GOOGLE_SECRET` | Yes | Google OAuth Client Secret |
| `NEXTAUTH_URL` | Dev | In development use `http://localhost:3000` (or the port from `npm run dev`) |
| `TMDB_READ_ACCESS_TOKEN` | Yes* | TMDB API read token (movie autocomplete). Get it at [TMDB](https://www.themoviedb.org/settings/api). |

\* Without the TMDB token, the movie search for adding to the list will not work.

### Minimal `.env.local` example

```env
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your-base64-secret
AUTH_GOOGLE_ID=xxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxx
NEXT_PUBLIC_API_URL=https://your-api.example.com/api/v1
TMDB_READ_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9...
```

## Running the project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in the terminal).

## Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Next.js) |
| `npm run build` | Production build |
| `npm run start` | Start production server (after `build`) |
| `npm run lint` | Run ESLint |

## Next steps

- [Authentication](authentication.md) — Google login flow and backend integration
- [API Reference](api-reference.md) — endpoints and HTTP client usage
- [Deployment](deployment.md) — deploy to Vercel, Render, or similar
