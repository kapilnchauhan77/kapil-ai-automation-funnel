import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const origin = 'https://kapilchauhan.netlify.app';
const read = path => readFile(new URL(path, root), 'utf8');

test('sitemap pages have unique metadata, canonical URLs and linked structured data', async () => {
  const sitemap = await read('sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(urls.length, 15);
  assert.equal(new Set(urls).size, urls.length);
  const titles = new Set();
  const descriptions = new Set();
  for (const url of urls) {
    assert.equal(new URL(url).origin, origin);
    const path = new URL(url).pathname;
    const html = await read(path.slice(1) + (path.endsWith('/') ? 'index.html' : ''));
    assert.equal([...html.matchAll(/<h1\b/gi)].length, 1, url);
    const title = [...html.matchAll(/<title>(.*?)<\/title>/gs)];
    const description = [...html.matchAll(/<meta name="description" content="([^"]+)"/g)];
    const canonical = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)];
    assert.equal(title.length, 1, url);
    assert.equal(description.length, 1, url);
    assert.equal(canonical.length, 1, url);
    assert.equal(canonical[0][1], url);
    assert.ok(!titles.has(title[0][1]), `Duplicate title: ${url}`);
    assert.ok(!descriptions.has(description[0][1]), `Duplicate description: ${url}`);
    titles.add(title[0][1]);
    descriptions.add(description[0][1]);
    assert.doesNotMatch(html, /noindex|nosnippet/);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
    assert.ok(blocks.length, `Missing structured data: ${url}`);
    const nodes = blocks.flatMap(block => {
      const schema = JSON.parse(block[1]);
      assert.equal(schema['@context'], 'https://schema.org');
      return schema['@graph'] || [schema];
    });
    const page = nodes.find(node => ['ProfilePage', 'CollectionPage', 'WebPage'].includes(node['@type']));
    assert.equal(page.url, url);
    assert.equal(page.isPartOf['@id'], `${origin}/#website`);
    if (path === '/case/') {
      const items = nodes.find(node => node['@type'] === 'ItemList');
      const listed = items.itemListElement.map(item => typeof item.item === 'string' ? item.item : item.item?.url || item.url);
      assert.deepEqual([...listed].sort(), urls.filter(item => item.endsWith('.html')).sort());
    } else if (path.endsWith('.html')) {
      const breadcrumb = nodes.find(node => node['@type'] === 'BreadcrumbList');
      assert.equal(breadcrumb.itemListElement.length, 3);
      const last = breadcrumb.itemListElement.at(-1);
      assert.equal(typeof last.item === 'string' ? last.item : last.item['@id'], url);
      const work = nodes.find(node => node['@type'] === 'CreativeWork');
      assert.equal(work.author['@id'], `${origin}/#person`);
    }
  }
});

test('canonical alternate paths redirect permanently and crawlers can read the site', async () => {
  const rules = await read('_redirects');
  assert.ok(rules.includes('/index.html / 301!'));
  assert.ok(rules.includes('/case/index.html /case/ 301!'));
  const sitemap = await read('sitemap.xml');
  for (const [, url] of sitemap.matchAll(/<loc>([^<]+\.html)<\/loc>/g)) {
    const path = new URL(url).pathname;
    assert.ok(rules.includes(`${path.slice(0, -5)} ${path} 301!`));
  }
  const robots = await read('robots.txt');
  assert.match(robots, /User-agent: \*\s+Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/kapilchauhan\.netlify\.app\/sitemap.xml/);
  assert.doesNotMatch(robots, /Disallow:\s*\//);
});
