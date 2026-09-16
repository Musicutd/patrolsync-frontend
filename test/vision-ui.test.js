'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('Vision frontend scripts have valid JavaScript syntax', () => {
  new vm.Script(read('patrolsync-module.js'), { filename: 'patrolsync-module.js' });
  for (const name of ['dashboard.html', 'access_control.html', 'vision_overview.html']) {
    const html = read(name);
    const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
    assert.ok(scripts.length > 0, `${name} should contain an inline script`);
    for (const match of scripts) new vm.Script(match[1], { filename: name });
  }
});

test('Vision navigation is added only after an enabled server status', () => {
  const shell = read('patrolsync-module.js');
  const dashboard = read('dashboard.html');
  assert.match(shell, /\/api\/vision\/status/);
  assert.match(shell, /!response\.ok\s*\|\|\s*!\(await response\.json\(\)\)\.enabled/);
  assert.match(dashboard, /\/api\/vision\/status/);
  assert.match(dashboard, /!response\.ok\s*\|\|\s*!\(await response\.json\(\)\)\.enabled/);
});

test('direct Vision page stays hidden until access is confirmed', () => {
  const page = read('vision_overview.html');
  assert.match(page, /<body[^>]*visibility:hidden/);
  assert.match(page, /if\(!status\.enabled\)\{location\.replace\('dashboard\.html'\)/);
  assert.match(page, /document\.body\.style\.visibility='visible'/);
});
