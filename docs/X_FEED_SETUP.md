# NPC Rwanda X Feed Setup

The homepage's X section uses the server-side X API and renders recent posts as native website cards. It does not use the X timeline embed.

## Required environment variables

Add these to the production environment file used by the Next.js/PM2 process:

```env
X_BEARER_TOKEN=your_x_app_bearer_token
X_USERNAME=npc_rwanda
```

- Create an app in the [X Developer Console](https://developer.x.com/).
- Copy the app's **Bearer Token** from its Keys and Tokens section.
- Keep the token on the server. Do not prefix it with `NEXT_PUBLIC_`, put it in frontend code, or commit it to Git.
- `X_USERNAME` is optional; it defaults to `npc_rwanda`.

## API access and billing

The app needs permission to read public user information and the user's recent posts through X API v2. X currently describes its developer platform as pay-per-use. Its pricing page lists post reads at **$0.005 per resource fetched** and user reads at **$0.010 per resource fetched**; check the Developer Console for the current rates and available access before enabling the integration.

The feed caches the X responses for 15 minutes, so visitors do not each trigger a separate X API request.

## Deploy

After adding the variables to the server's production `.env` file:

```bash
cd /var/www/NPCRwanda
git pull --ff-only origin main
npm run build
pm2 restart npcrwanda --update-env
```

If PM2 does not load the updated environment file, restart the app using the same ecosystem/process configuration that loads the production `.env` file. Never paste the Bearer Token into chat or a GitHub commit.

## Troubleshooting

- If the homepage says the feed is unavailable, confirm the token is present in the environment used by PM2.
- Check that the X Developer App is active and has access to the user lookup and user-post timeline endpoints.
- Inspect the server logs for the HTTP status logged by the X feed API route. A 401/403 usually indicates an invalid token or insufficient API access; 429 indicates rate limiting or exhausted usage.
