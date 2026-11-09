import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwind from '@tailwindcss/postcss';
import postcss from 'postcss';

/**
 * Builds `dist/next/checkout-ui/checkout-ui.css` — the VAP checkout page's one stylesheet, the same on every storefront.
 *
 * Tailwind v4 compiles the classes the checkout's components and the Quantum UI components they use actually carry,
 * on Quantum's own theme tokens (the core product's light theme). The result is then sealed off from the page around it:
 *
 *   - every rule is scoped under `.vap-checkout-root` (and the Radix popper wrapper a tooltip portals into), so nothing
 *     reaches the storefront's own elements;
 *   - cascade layers are flattened: unlayered rules beat any layered rule of the storefront, whatever its specificity;
 *   - a reset puts back what a storefront's element rules (`h2 { font-family }`, `p { color }`) would otherwise leak in;
 *   - rem becomes px, so a storefront's root font size does not resize the page;
 *   - `.dark` tokens are dropped: the checkout is light only.
 */

// The elements Radix portals to <body>, matched as themselves; a sheet whose components never portal (the card) leaves
// them out, so its selectors stay short
const PORTALS = ':is([data-radix-popper-content-wrapper], [data-slot="dialog-overlay"], [data-slot="dialog-content"])';
const ROOT_WITH_PORTALS =
  ':is(.vap-checkout-root, [data-radix-popper-content-wrapper], [data-slot="dialog-overlay"], [data-slot="dialog-content"])';
const ROOT_ONLY = '.vap-checkout-root';
const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, '..');
const require = createRequire(join(pkgRoot, 'package.json'));

// Quantum's shipped stylesheet: its token section (theme variables, `@theme inline`, fonts, component keyframes) sits
// between the layer-order statement and the compiled utilities, which are not needed — Tailwind recompiles only what
// the page uses
const quantumCss = readFileSync(require.resolve('@vritti/quantum-ui/index.css'), 'utf8');
const tokensStart = quantumCss.indexOf('@layer theme, base, components, utilities;');
const tokensEnd = quantumCss.indexOf('@layer properties');
if (tokensStart < 0 || tokensEnd < tokensStart)
  throw new Error('Quantum UI stylesheet layout changed — update build-checkout-css.mjs');
const quantumTokens = quantumCss.slice(tokensStart, tokensEnd);

// The package does not export its package.json, so find it above the stylesheet it does export
let quantumDir = dirname(require.resolve('@vritti/quantum-ui/index.css'));
while (!existsSync(join(quantumDir, 'package.json'))) quantumDir = dirname(quantumDir);
const quantumPkg = JSON.parse(readFileSync(join(quantumDir, 'package.json'), 'utf8'));
// ── Sealing ─────────────────────────────────────────────────────────────────────────────────────────

const GLOBAL_ROOTS = new Set([':root', ':host', 'html', 'body', '.light']);

function scopeSelector(selector, { root, portals }) {
  const trimmed = selector.trim();
  if (/(^|[\s>+~(,])\.dark\b/.test(trimmed)) return null;
  if (GLOBAL_ROOTS.has(trimmed)) return root;
  for (const global of GLOBAL_ROOTS) {
    if (trimmed.startsWith(`${global} `)) return `${root} ${trimmed.slice(global.length + 1)}`;
  }
  if (trimmed === '*') return `${root}, ${root} *`;
  // A class or attribute rule also matches on the portalled elements themselves: the dialog's content element carries
  // `fixed`, `bg-background` … on itself, and is not its own descendant
  if (portals && /^[.[]/.test(trimmed)) return `${root} ${trimmed}, ${PORTALS}${trimmed}`;
  return `${root} ${trimmed}`;
}

// The sealing pass for one sheet. `portals`: also match what Radix portals to <body>. `fonts`: keep Quantum's embedded
// faces (the checkout page sets its own type); without, the sheet falls back to the system face
function sealPlugin({ portals, fonts }) {
  const root = portals ? ROOT_WITH_PORTALS : ROOT_ONLY;
  return {
    postcssPlugin: 'vap-seal',
    OnceExit(css) {
      // Flatten cascade layers, keeping source order (theme, base, components, utilities)
      css.walkAtRules('layer', (rule) => {
        if (rule.nodes) rule.replaceWith(rule.nodes);
        else rule.remove();
      });
      css.walkRules((rule) => {
        if (rule.parent?.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
        const scoped = rule.selectors.map((selector) => scopeSelector(selector, { root, portals })).filter(Boolean);
        if (scoped.length === 0) rule.remove();
        else rule.selector = [...new Set(scoped)].join(',\n');
      });
      css.walkDecls((decl) => {
        if (decl.value.includes('rem')) decl.value = remToPx(decl.value);
      });
      css.walkAtRules('media', (rule) => {
        rule.params = remToPx(rule.params);
      });
      // The page sets text in the sans face and order numbers in the mono one; the serif display face is never used
      css.walkAtRules('font-face', (rule) => {
        const family = rule.nodes?.find((node) => node.type === 'decl' && node.prop === 'font-family');
        if (!fonts || (family && /playfair/i.test(family.value))) rule.remove();
      });
      css.prepend(postcss.parse(reset(root)));
    },
  };
}

function remToPx(value) {
  return value.replace(/(-?\d*\.?\d+)rem\b/g, (_, n) => `${Number((Number(n) * 16).toFixed(4))}px`);
}

// What a storefront's element rules would otherwise set on the checkout's elements. Zero-specificity `:where` inside
// the root keeps it at one class, so every utility and preflight rule that follows still wins
function reset(root) {
  return `
${root} {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.5;
  font-weight: 400;
  letter-spacing: var(--tracking-normal);
  color: var(--foreground);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
}
${root} :where(*, ::before, ::after) {
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-style: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  text-shadow: none;
  color: inherit;
  box-sizing: border-box;
}
`;
}

// The Quantum component files a stylesheet's components import, and every file they import in turn — Tailwind scans
// these for the classes the components render
function quantumSources(entries) {
  const sources = new Set();
  const walk = (file) => {
    if (sources.has(file)) return;
    sources.add(file);
    for (const match of readFileSync(file, 'utf8').matchAll(/(?:from|import)\s*['"](\.[^'"]+)['"]/g)) {
      const target = resolve(dirname(file), match[1]);
      const found = [target, `${target}.js`].find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
      if (found?.endsWith('.js')) walk(found);
    }
  };
  for (const entry of entries) {
    const target = quantumPkg.exports[entry];
    walk(join(quantumDir, typeof target === 'string' ? target : target.import));
  }
  return sources;
}

// One sealed stylesheet: Tailwind over `scan` (the package's own sources) and the Quantum components they use
async function buildSheet({ name, scan, quantumEntries, title, portals, fonts }) {
  const sources = quantumSources(quantumEntries);
  const input = `
@import "tailwindcss" source(none);
@import "tw-animate-css";
${scan.map((path) => `@source "${join(pkgRoot, path)}";`).join('\n')}
${[...sources].map((file) => `@source "${file}";`).join('\n')}
${quantumTokens}
@layer base {
  * { border-color: var(--border); }
}
`;
  const result = await postcss([
    tailwind({ base: pkgRoot, optimize: { minify: false } }),
    sealPlugin({ portals, fonts }),
  ]).process(input, {
    from: join(pkgRoot, `src/next/checkout-ui/${name}.input.css`),
  });
  const out = join(pkgRoot, `dist/next/checkout-ui/${name}.css`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(
    out,
    `/* @vritti/vap-sdk — ${title}. Generated by scripts/build-checkout-css.mjs; scoped to .vap-checkout-root. */\n${result.css}`,
  );
  console.log(`${name}.css: ${Math.round(result.css.length / 1024)} KB from ${sources.size} Quantum UI files`);
}

// The checkout page
await buildSheet({
  name: 'checkout-ui',
  title: 'the VAP checkout page',
  scan: ['src/next/checkout-ui'],
  quantumEntries: ['./Alert', './Button', './Collapsible', './Dialog', './RadioGroup', './Spinner', './TextField'],
  portals: true,
  fonts: true,
});
// The "checkout in progress" card on storefront pages: its own small sheet, so those pages skip the checkout's
await buildSheet({
  name: 'checkout-card',
  title: 'the "checkout in progress" card',
  scan: ['src/next/checkout-ui/card'],
  quantumEntries: ['./Button', './Spinner'],
  portals: false,
  fonts: false,
});
