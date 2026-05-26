# Case studies

Each file in this folder becomes a published case-study page at
`https://kapilnchauhan77.github.io/kapil-ai-automation-funnel/case/<slug>.html`.

The deploy workflow ships every `case/*.html` **except files starting
with `_`** — so `_template.html` stays in the repo as your master
template and never goes live.

## Workflow to publish a new case study

1. Copy the template:

   ```sh
   cp case/_template.html case/<slug>.html
   ```

   The slug is part of the URL — keep it short, lowercase, no spaces.
   Examples: `procys`, `openprovider`, `kore-labs`.

2. Open the new file and do a global Find & Replace for every
   `{{PLACEHOLDER}}` token. Every token appears in `UPPER_SNAKE_CASE`
   so a Find All ▸ Replace All on each one does the work.

   The full list of placeholders is:

   - `{{CASE_SLUG}}` — the URL slug, e.g. `procys`
   - `{{CLIENT_NAME}}` — display name, e.g. `Procys`
   - `{{INDUSTRY}}` — short label, e.g. `Document intelligence`
   - `{{YEAR}}` — the engagement year
   - `{{ENGAGEMENT_TYPE}}` — `Custom build` / `AI Automation Audit` / `AI Product MVP`
   - `{{ROLE}}` — your role, default `AI/ML Solution Architect`
   - `{{PUBLISH_DATE}}` — ISO date, e.g. `2026-05-26`
   - `{{META_DESCRIPTION}}` — one-line SEO description, ~150 chars
   - `{{HEADLINE_HTML}}` — the H1, including one `<em>…</em>` swap
   - `{{HEADLINE_PLAIN}}` — same H1 but with the `<em>` stripped (used in `<title>` + OG)
   - `{{SUBTITLE}}` — one-sentence summary under the H1
   - `{{METRIC_1_VALUE}}` / `{{METRIC_1_LABEL}}` — first big number + caption
   - `{{METRIC_2_VALUE}}` / `{{METRIC_2_LABEL}}`
   - `{{METRIC_3_VALUE}}` / `{{METRIC_3_LABEL}}`
   - `{{PROBLEM_P1}}` / `{{PROBLEM_P2}}` — "The problem" body paragraphs
   - `{{SOLUTION_P1}}` — "What I built" opening paragraph
   - `{{SOLUTION_BULLET_1..4}}` — four bullets in the solution list
   - `{{OUTCOME_P1}}` / `{{OUTCOME_P2}}` — "The outcome" paragraphs
   - `{{TECH_1..6}}` — tech-stack chips
   - `{{QUOTE_TEXT}}` / `{{QUOTE_AUTHOR}}` / `{{QUOTE_ROLE}}` — pull quote (delete the `<section class="case-quote">` block if you don't have one)

3. Append a new `<url>` entry for the case page to `../sitemap.xml`:

   ```xml
   <url>
     <loc>https://kapilnchauhan77.github.io/kapil-ai-automation-funnel/case/<slug>.html</loc>
     <lastmod>YYYY-MM-DD</lastmod>
     <changefreq>monthly</changefreq>
     <priority>0.8</priority>
   </url>
   ```

4. Commit + push. The GitHub Pages workflow rebuilds and ships the
   new page within ~30 seconds.

## Notes

- **Use real metrics.** The whole point of a case study page is one
  defensible number, not three soft "tends to" claims. If you don't
  have a hard number for a metric slot, leave that slot empty and use
  the remaining two — better to ship two real numbers than three
  vague ones.
- **Anonymizing.** If the client requires anonymization, replace
  `{{CLIENT_NAME}}` with a sector label ("A UK customs broker") and
  drop the pull-quote section. Keep the metrics — those are the proof.
- **OG image.** All case pages currently share the site-wide
  `og-image.png`. If you want a per-case OG card later, generate it
  from `assets/og-template.html` with the case title swapped in, save
  as `assets/case-<slug>.png`, and update the four `og:image` /
  `twitter:image` meta tags in the page head.
- **Inbound links matter.** Once a case is live, link to it from the
  main page's Voices section so it gets discovered by both crawlers
  and humans.
