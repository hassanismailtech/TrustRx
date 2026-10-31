const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

test('public experience exposes safe routed pages with shared design tokens', () => {
  const css = read('public', 'assets', 'trustrx.css');
  assert.match(css, /--signal:#ff724c/);
  assert.match(css, /prefers-reduced-motion/);
  for (const route of ['index.html', path.join('system', 'index.html'), path.join('trust', 'index.html'), path.join('pilot', 'index.html'), path.join('about', 'index.html'), path.join('research', 'index.html'), path.join('security', 'index.html'), path.join('privacy', 'index.html'), path.join('docs', 'index.html')]) {
    assert.match(read('public', route), /\/assets\/trustrx\.css/);
  }
  assert.doesNotMatch(read('public', 'index.html'), /privateKey|submit-case|health oracle/i);
});

test('documentation route is public-safe and provides an accessible path to curated source material', () => {
  const docs = read('public', 'docs', 'index.html');
  assert.match(docs, /Skip to content/);
  assert.match(docs, /id="content"/);
  assert.match(docs, /Publication boundary/);
  assert.match(docs, /github\.com\/hassanismailtech\/TrustRx\/tree\/main\/docs/);
  assert.doesNotMatch(docs, /privateKey|submit-case|patient record/i);
});

test('static public experience has a safe, non-indexed missing-route fallback', () => {
  const notFound = read('public', '404.html');
  assert.match(notFound, /name="robots" content="noindex"/);
  assert.match(notFound, /not accept health reports/i);
  assert.match(notFound, /href="\/docs"/);
});

test('reviewer console prototype is kept outside deployable public assets and marked synthetic', () => {
  const prototype = read('frontend', 'reviewer-console', 'index.html');
  assert.match(prototype, /SYNTHETIC PROTOTYPE/);
  assert.equal(fs.existsSync(path.join(root, 'public', 'reviewer-console')), false);
});
