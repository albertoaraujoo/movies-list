# Deployment

How to publish CineList to production (Vercel, Render, etc.).

## Environment variables in production

Configure the same variables as in [Setup](setup.md) in your provider's dashboard, with production values:

| Variable | Production |
|----------|-------------|
| `NEXTAUTH_URL` | Public app URL (e.g. `https://cinelist.vercel.app`) |
| `AUTH_SECRET` | Strong secret (e.g. `openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | Same Client ID, with production redirect URI |
| `AUTH_GOOGLE_SECRET` | Google Client Secret |
| `NEXT_PUBLIC_API_URL` | Production API URL |
| `TMDB_READ_ACCESS_TOKEN` | TMDB read token |

In **Google Cloud Console**, add to **Authorized redirect URIs**:

```
https://your-domain.com/api/auth/callback/google
```

---

## Vercel

1. Connect the repository on [Vercel](https://vercel.com).
2. Framework: **Next.js** (auto-detected).
3. In **Environment Variables**, set all variables above.
4. Deploy: each push to the configured branch triggers build and publish.

Build command: `npm run build`  
Output: `.next` folder (Next.js default).

---

## Render (or other Node host)

1. Create a **Web Service**.
2. Build command: `npm install && npm run build`
3. Start command: `npm run start`
4. Set environment variables in the dashboard.
5. Ensure the backend API is reachable at the URL set in `NEXT_PUBLIC_API_URL`.

---

## Post-deploy checklist

- [ ] Google login works (production redirect URI configured).
- [ ] Movie list and actions (create, edit, delete) work (API reachable and CORS ok).
- [ ] TMDB search (autocomplete) works (`TMDB_READ_ACCESS_TOKEN` set).
- [ ] Draw and drawn list work.
- [ ] `NEXTAUTH_URL` has no trailing slash and uses HTTPS in production.
