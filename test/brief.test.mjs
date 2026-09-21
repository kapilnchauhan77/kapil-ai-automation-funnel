import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const script = await readFile(new URL('../script.js', import.meta.url), 'utf8');

function setup(t, clipboard) {
  const dom = new JSDOM(html, { url: 'https://kapilchauhan.netlify.app/', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  if (clipboard) Object.defineProperty(dom.window.navigator, 'clipboard', { value: clipboard });
  dom.window.eval(script);
  const get = id => dom.window.document.getElementById(id);
  const change = (id, value, event = 'change') => {
    get(id).value = value;
    get(id).dispatchEvent(new dom.window.Event(event, { bubbles: true }));
  };
  return { dom, get, change };
}

test('email button exposes options and both draft links preserve the current brief', t => {
  const { dom, get, change } = setup(t);
  assert.equal(get('briefEmailOptions').hidden, true);
  get('emailBrief').click();
  assert.equal(get('briefEmailOptions').hidden, false);
  assert.equal(get('emailBrief').getAttribute('aria-expanded'), 'true');
  change('projectContext', 'Quotes & reports + 50%\nहिंदी <demo@example.com>', 'input');
  change('projectBudget', '$10,000+');
  change('projectTimeline', 'Within a month');
  const website = dom.window.document.querySelector('input[value="website"]');
  website.click();
  change('projectGoal', 'Build a web product');
  const expected = get('briefPreview').textContent;
  assert.match(expected, /Track: Website development/);
  assert.match(expected, /Budget: \$10,000\+/);
  assert.match(expected, /Timeline: Within a month/);
  assert.ok(expected.includes('Quotes & reports + 50%\nहिंदी <demo@example.com>'));
  const gmail = new URL(get('gmailBrief').href);
  assert.equal(gmail.origin, 'https://mail.google.com');
  assert.equal(gmail.searchParams.get('to'), 'kapilnchauhan77@gmail.com');
  assert.equal(gmail.searchParams.get('su'), 'Project brief: Build a web product');
  assert.equal(gmail.searchParams.get('body'), expected);
  const mail = new URL(get('mailAppBrief').href);
  assert.equal(mail.protocol, 'mailto:');
  assert.equal(mail.pathname, 'kapilnchauhan77@gmail.com');
  assert.equal(mail.searchParams.get('subject'), gmail.searchParams.get('su'));
  assert.equal(mail.searchParams.get('body'), expected);
  get('emailBrief').click();
  assert.equal(get('briefEmailOptions').hidden, true);
  assert.equal(get('emailBrief').getAttribute('aria-expanded'), 'false');
});

test('copy writes the current brief and clears stale success feedback after edits', async t => {
  let copied;
  const { get, change } = setup(t, { writeText: async text => { copied = text; } });
  change('projectContext', 'Current project details', 'input');
  get('copyBrief').click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(copied, get('briefPreview').textContent);
  assert.match(get('briefStatus').textContent, /^Brief copied/);
  assert.equal(get('briefCopyFallback').hidden, true);
  change('projectContext', 'Updated details', 'input');
  assert.doesNotMatch(get('briefStatus').textContent, /^Brief copied/);
});

for (const mode of ['denied', 'unavailable']) {
  test(`clipboard ${mode} exposes and selects the complete brief for manual copying`, async t => {
    const clipboard = mode === 'denied' ? { writeText: async () => { throw new Error('NotAllowedError'); } } : undefined;
    const { dom, get, change } = setup(t, clipboard);
    get('emailBrief').click();
    change('projectContext', 'Full context '.repeat(100), 'input');
    get('copyBrief').click();
    await new Promise(resolve => setImmediate(resolve));
    const fallback = get('briefCopyText');
    assert.equal(get('briefCopyFallback').hidden, false);
    assert.equal(fallback.value, get('briefPreview').textContent);
    assert.equal(dom.window.document.activeElement, fallback);
    assert.equal(fallback.selectionStart, 0);
    assert.equal(fallback.selectionEnd, fallback.value.length);
    assert.match(get('briefStatus').textContent, /Automatic copying is unavailable/);
    change('projectContext', 'Revised context', 'input');
    assert.equal(fallback.value, get('briefPreview').textContent);
  });
}
