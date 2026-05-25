# Kapil Chauhan AI Automation Funnel

Static landing page plus a small Node email backend for AI Automation Audit requests.

## Local Website

```bash
npm install
npm start
```

Open:

```text
http://127.0.0.1:3000/index.html
```

## Email Backend

Copy `.env.example` to `.env` and fill in SMTP values.

The audit form posts to `/api/audit-request` when the site is served by `server.js`.

## GitHub Pages

GitHub Pages deploys only the static website files:

- `index.html`
- `styles.css`
- `script.js`
- `assets/`

GitHub Pages cannot run the Node SMTP backend. There are two ways to make the audit form actually deliver email from the deployed site:

### Option A — Web3Forms (free, no server)

1. Go to https://web3forms.com, enter your email, and you'll receive an `access_key` by mail.
2. In `index.html`, find this tag and replace the placeholder:

   ```html
   <meta name="web3forms-access-key" content="YOUR_WEB3FORMS_ACCESS_KEY">
   ```

3. Commit and push. Submissions arrive in the inbox you registered with Web3Forms.

### Option B — Host the Node backend yourself

Deploy `server.js` somewhere that runs Node (Render, Railway, Fly.io, etc.) with your SMTP env vars, then point the static site at it:

```html
<meta name="audit-api-base" content="https://your-backend-domain.com">
```

When `web3forms-access-key` is set, it takes priority. If neither is configured and the site is on `github.io`, the form opens a `mailto:` draft as a fallback.
