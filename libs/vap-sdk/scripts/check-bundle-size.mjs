import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Tree-shaking check, run by `build`.
 *
 * Bundles a few typical imports of this package the way a storefront's bundler would — everything outside the package
 * left external, so only the SDK's own code is counted — and fails when one pulls in more of the SDK than its budget.
 * A budget that fails says some import stopped being tree-shakable: a top-level call, a barrel that runs code, or a
 * module every operation reaches (as the GraphQL codegen's shared document map once was).
 *
 *   node scripts/check-bundle-size.mjs          # check against the budgets
 *   node scripts/check-bundle-size.mjs --report # also list the SDK files each case pulls in
 */

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, '..');
const dist = join(pkgRoot, 'dist');
const require = createRequire(join(pkgRoot, 'package.json'));
const { build } = require('esbuild');

// Each case: what a consumer writes, and how much of this package's built code it may pull in (minified bytes)
const CASES = [
  {
    name: 'money helper',
    code: `import { formatMoney } from '@vritti/vap-sdk/money'; console.log(formatMoney);`,
    budget: 6_000,
  },
  {
    name: 'checkout urls',
    code: `import { checkoutRetryUrl } from '@vritti/vap-sdk'; console.log(checkoutRetryUrl);`,
    budget: 3_000,
  },
  {
    name: 'cart operations',
    code: `import { createCartOperations } from '@vritti/vap-sdk'; console.log(createCartOperations);`,
    budget: 20_000,
  },
  {
    name: 'razorpay plugin',
    code: `import { razorpay } from '@vritti/vap-sdk/razorpay'; console.log(razorpay);`,
    budget: 12_000,
  },
  {
    name: 'checkout page (client)',
    code: `import { CheckoutView } from '@vritti/vap-sdk/next/checkout-ui/client'; console.log(CheckoutView);`,
    budget: 120_000,
  },
];

// The package's own entry points, resolved to dist as the exports map does
const ENTRIES = {
  '': 'core/index.js',
  '/money': 'core/money.js',
  '/checkout': 'checkout/index.js',
  '/razorpay': 'checkout/razorpay.js',
  '/hdfc': 'checkout/hdfc.js',
  '/cashfree': 'checkout/cashfree.js',
  '/easebuzz': 'checkout/easebuzz.js',
  '/next/checkout-ui/client': 'next/checkout-ui/client.js',
};

const selfAndExternals = {
  name: 'sdk-only',
  setup(b) {
    b.onResolve({ filter: /^@vritti\/vap-sdk(\/.*)?$/ }, (args) => {
      const sub = args.path.slice('@vritti/vap-sdk'.length);
      const file = ENTRIES[sub];
      // A server tier reached from a client module (e.g. through a server action's module) is not in a client bundle
      if (!file) return { path: args.path, external: true };
      return { path: join(dist, file) };
    });
    // Server actions: a client bundle holds a reference to them, not their code
    b.onResolve({ filter: /payments-actions\.js$/ }, (args) => ({ path: args.path, external: true }));
    // Everything that is not this package is the consumer's to bundle; only the SDK is measured
    b.onResolve({ filter: /^[^./]/ }, (args) => ({ path: args.path, external: true }));
  },
};

const report = process.argv.includes('--report');
const work = mkdtempSync(join(tmpdir(), 'vap-size-'));
const failures = [];
try {
  for (const testCase of CASES) {
    const entry = join(work, `${testCase.name.replace(/\W+/g, '-')}.js`);
    writeFileSync(entry, testCase.code);
    const result = await build({
      entryPoints: [entry],
      bundle: true,
      minify: true,
      treeShaking: true,
      format: 'esm',
      platform: 'browser',
      write: false,
      metafile: true,
      logLevel: 'silent',
      plugins: [selfAndExternals],
    });
    const output = Object.values(result.metafile.outputs)[0];
    const sdkInputs = Object.entries(output.inputs).filter(([path]) => /(^|\/)dist\//.test(path));
    const bytes = sdkInputs.reduce((sum, [, input]) => sum + input.bytesInOutput, 0);
    const over = bytes > testCase.budget;
    if (over) failures.push(testCase.name);
    console.log(
      `${over ? '✗' : '✓'} ${testCase.name.padEnd(24)} ${String(bytes).padStart(8)} B  (budget ${testCase.budget})`,
    );
    if (report || over) {
      for (const [path, input] of sdkInputs.sort((a, b) => b[1].bytesInOutput - a[1].bytesInOutput).slice(0, 8)) {
        console.log(`      ${String(input.bytesInOutput).padStart(8)}  ${path.replace(/^.*?dist\//, '')}`);
      }
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(`\nTree shaking regressed for: ${failures.join(', ')}`);
  process.exit(1);
}
