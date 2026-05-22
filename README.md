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

GitHub Pages cannot run the Node SMTP backend. On the GitHub Pages version, the form opens an email draft fallback unless a hosted API URL is configured.

To use a hosted backend later, add this to `index.html` with your server URL:

```html
<meta name="audit-api-base" content="https://your-backend-domain.com">
```
