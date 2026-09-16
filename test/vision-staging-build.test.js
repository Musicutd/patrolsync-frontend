'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildStaging, validatedApiBase } = require('../scripts/build-vision-staging');

test('staging build rejects production, unconfirmed and malformed targets', () => {
  for (const value of ['', 'https://patrolsync-backend.onrender.com', 'http://patrolsync-staging.onrender.com', 'https://example.com', 'https://patrolsync-staging.onrender.com/path']) {
    assert.throws(() => validatedApiBase(value));
  }
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vision-build-deny-'));
  try {
    fs.writeFileSync(path.join(root, 'index.html'), 'https://patrolsync-backend.onrender.com');
    const args = { root, outputDir: path.join(root, 'vision-staging-dist'), apiBase: 'https://patrolsync-vision-staging-backend.onrender.com' };
    assert.throws(() => buildStaging({ ...args, confirmed: '' }), /required/);
    assert.throws(() => buildStaging({ ...args, confirmed: 'yes', renderServiceId: 'srv-d9p147rncjis73ervs9g' }), /production frontend/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('staging artifact replaces production API and leaves source unchanged', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vision-build-pass-'));
  try {
    const original = 'fetch("https://patrolsync-backend.onrender.com/api/vision/status")';
    fs.writeFileSync(path.join(root, 'index.html'), original);
    fs.writeFileSync(path.join(root, 'patrolsync-module.js'), original);
    const outputDir = path.join(root, 'vision-staging-dist');
    const result = buildStaging({ root, outputDir, apiBase: 'https://patrolsync-vision-staging-backend.onrender.com', confirmed: 'yes' });
    assert.equal(result.replacements, 2);
    assert.match(fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8'), /patrolsync-vision-staging-backend/);
    assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), original);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

