'use strict';

const fs = require('node:fs');
const path = require('node:path');

const PRODUCTION_API = 'https://patrolsync-backend.onrender.com';
const PRODUCTION_FRONTEND_SERVICE = 'srv-d9p147rncjis73ervs9g';
const STATIC_EXTENSIONS = new Set(['.html', '.css', '.json', '.svg', '.webmanifest', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2', '.ttf']);
const REVIEWED_SCRIPTS = new Set(['patrolsync-guard-ui.js', 'patrolsync-module.js', 'service-worker.js']);
const SKIP_DIRECTORIES = new Set(['.git', '.github', 'test', 'scripts', 'node_modules', 'vision-staging-dist']);
const STAGING_BANNER = '<div id="patrolsync-staging-banner" role="status" style="position:fixed;bottom:0;left:0;right:0;z-index:2147483647;padding:5px 10px;background:#9a3412;color:#fff;text-align:center;font:700 12px system-ui,sans-serif;pointer-events:none">PATROLSYNC STAGING — TEST DATA ONLY</div>';

function validatedApiBase(value) {
  let url;
  try { url = new URL(String(value || '')); }
  catch (_) { throw new Error('STAGING_API_BASE must be an HTTPS Render staging URL'); }
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.onrender.com') ||
      !url.hostname.includes('staging') || url.origin === PRODUCTION_API ||
      url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('STAGING_API_BASE must be a distinct HTTPS Render staging origin');
  }
  return url.origin;
}

function buildStaging({ root, outputDir, apiBase, confirmed, renderServiceId }) {
  if (confirmed !== 'yes') throw new Error('PATROLSYNC_STAGING_BUILD=yes is required');
  if (renderServiceId === PRODUCTION_FRONTEND_SERVICE) throw new Error('Refusing to build staging assets on the production frontend service');
  const stagingApi = validatedApiBase(apiBase);
  const sourceRoot = path.resolve(root);
  const destination = path.resolve(outputDir);
  if (destination === sourceRoot || !destination.startsWith(sourceRoot + path.sep)) throw new Error('Output must be a child of the source directory');
  if (fs.existsSync(destination)) throw new Error('Staging output already exists; use a clean checkout');

  let files = 0;
  let replacements = 0;
  function copyDirectory(source, target) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.has(entry.name)) copyDirectory(path.join(source, entry.name), path.join(target, entry.name));
        continue;
      }
      if (!entry.isFile()) continue;
      const extension = path.extname(entry.name).toLowerCase();
      if (extension === '.js' && !REVIEWED_SCRIPTS.has(entry.name)) throw new Error(`Unreviewed JavaScript asset: ${entry.name}`);
      if (extension !== '.js' && !STATIC_EXTENSIONS.has(extension)) continue;
      const from = path.join(source, entry.name);
      const to = path.join(target, entry.name);
      if (['.html', '.js', '.css', '.json', '.svg', '.webmanifest'].includes(extension)) {
        const input = fs.readFileSync(from, 'utf8');
        const count = input.split(PRODUCTION_API).length - 1;
        replacements += count;
        let output = input.replaceAll(PRODUCTION_API, stagingApi);
        if (extension === '.html') {
          if (!/<body\b[^>]*>/i.test(output)) throw new Error(`Missing body in ${entry.name}`);
          output = output.replace(/<body\b[^>]*>/i, match => match + STAGING_BANNER);
          if (/<head\b[^>]*>/i.test(output)) {
            output = output.replace(/<head\b[^>]*>/i, match => match + '<meta name="robots" content="noindex,nofollow">');
          }
        }
        if (output.includes(PRODUCTION_API)) throw new Error(`Production API remains in ${entry.name}`);
        fs.writeFileSync(to, output);
      } else fs.copyFileSync(from, to);
      files++;
    }
  }
  copyDirectory(sourceRoot, destination);
  if (!fs.existsSync(path.join(destination, 'index.html')) || replacements === 0) throw new Error('Incomplete staging artifact: index or API replacements missing');
  return { files, replacements, outputDir: destination, apiOrigin: stagingApi };
}

if (require.main === module) {
  try {
    const root = path.resolve(__dirname, '..');
    const result = buildStaging({
      root,
      outputDir: path.join(root, 'vision-staging-dist'),
      apiBase: process.env.STAGING_API_BASE,
      confirmed: process.env.PATROLSYNC_STAGING_BUILD,
      renderServiceId: process.env.RENDER_SERVICE_ID
    });
    console.log(`Staging-only artifact checked: ${result.files} files; ${result.replacements} API references redirected to ${result.apiOrigin}`);
  } catch (error) {
    console.error(`Staging build refused: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { buildStaging, validatedApiBase };

