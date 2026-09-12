# Case studies

The live case-study base is `https://kapilchauhan.netlify.app/case/`.
Netlify runs `npm run build` and publishes `dist`. The build copies only the
pages listed in `CASE_PAGES` in `scripts/build-site.mjs`: `case/index.html`
plus the 11 named case files. `_template.html`, `_drafts`, this README, and
generators never publish.

For a new case, copy a reviewed current published page as the structural base
and replace its content with verified qualitative material. Remove estimates,
`VERIFY` comments, and testimonials unless you can verify them independently.
Then add the new filename and slug to `CASE_PAGES`, `_redirects`, and
`sitemap.xml`.

Run `npm run build` and confirm the exact file in `dist/case/`. Netlify
publication follows the configured site deploy, so a push alone is not delivery
evidence.

GitHub Pages is a manually dispatched retirement redirect workflow. Run
`Retire GitHub Pages Site` with the verified Netlify root. Its build preserves
`/case/` and each matching `/case/<slug>.html` path.
