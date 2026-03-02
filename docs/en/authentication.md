# Authentication

CineList uses **Auth.js v5** (NextAuth) with **Google OAuth 2.0** and exchanges the token with the NestJS backend.

## Flow overview

1. User clicks "Sign in with Google" on `/login`.
2. Auth.js redirects to Google and, after approval, receives an `id_token`.
3. In the JWT callback, the frontend calls `POST /auth/google` on the **backend** with the `id_token`.
4. The backend validates the token, creates or finds the user, and returns its own JWT `accessToken`.
5. This `accessToken` is stored in the session (cookie) and used for all API requests (movies, draw, etc.).

## Google Cloud setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Under **APIs & Services** → **Credentials**, create an **OAuth 2.0 Client ID** (type "Web application").
3. In **Authorized redirect URIs** add:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
4. Copy **Client ID** and **Client Secret** to `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env.local`.

## Main files

| File | Purpose |
|------|---------|
| `src/auth.ts` | NextAuth config (Google provider, JWT/session callbacks) |
| `src/app/login/page.tsx` | Login page with Google button |
| `src/lib/api.ts` | `loginWithGoogle(idToken)` calling the backend |

## Session on the frontend

The extended session includes:

- `session.user` — `id`, `name`, `email`, `image` (from backend after token exchange)
- `session.accessToken` — Backend JWT, used in `Authorization: Bearer <token>` for API calls

Typical usage in components or Server Actions:

```ts
import { auth } from "@/auth";

const session = await auth();
if (!session?.accessToken) {
  redirect("/login");
}
// Call getMovies(params, session.accessToken), etc.
```

## Logout

Auth.js `signOut()` clears the session and cookies. The backend may keep the token until expiry; for immediate revocation you would need a backend logout endpoint.

## Security

- **Never** expose `AUTH_SECRET`, `AUTH_GOOGLE_SECRET`, or `TMDB_READ_ACCESS_TOKEN` on the client.
- Use a strong `AUTH_SECRET` (e.g. `openssl rand -base64 32`) and rotate if leaked.
- In production, set `NEXTAUTH_URL` to the correct public URL (e.g. `https://app.cinelist.com`).
