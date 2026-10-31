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
  for (const route of ['index.html', path.join('system', 'index.html'), path.join('trust', 'index.html'), path.join('pilot', 'index.html'), path.join('about', 'index.html'), path.join('research', 'index.html'), path.join('security', 'index.html'), path.join('privacy', 'index.html')]) {
    assert.match(read('public', route), /\/assets\/trustrx\.css/);
  }
  assert.doesNotMatch(read('public', 'index.html'), /privateKey|submit-case|health oracle/i);
});

test('reviewer console prototype is kept outside deployable public assets and marked synthetic', () => {
  const prototype = read('frontend', 'reviewer-console', 'index.html');
  assert.match(prototype, /SYNTHETIC PROTOTYPE/);
  assert.equal(fs.existsSync(path.join(root, 'public', 'reviewer-console')), false);
});
