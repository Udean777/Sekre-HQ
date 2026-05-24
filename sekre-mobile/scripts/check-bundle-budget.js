#!/usr/bin/env node
/**
 * Bundle Budget Check
 *
 * Generate production JS bundle untuk Android + iOS, ukur size + module count,
 * dan fail kalau melebihi threshold yang didefinisikan di `bundle-budget.json`.
 *
 * Tujuan: prevent bundle bloat masuk main branch tanpa review eksplisit.
 *
 * Usage:
 *   node scripts/check-bundle-budget.js [--platform android|ios|both] [--update-baseline]
 *
 * Exit codes:
 *   0 — semua bundle dalam budget
 *   1 — minimal satu bundle melebihi budget
 *   2 — error generate bundle atau parse config
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');
const BUDGET_FILE = path.join(ROOT, 'bundle-budget.json');
const TEMP_DIR = path.join(ROOT, '.bundle-budget-tmp');

// Parse CLI args
const cliArgs = process.argv.slice(2);
const platformArg = cliArgs.find(a => a.startsWith('--platform='))?.split('=')[1] ?? 'both';
const updateBaseline = cliArgs.includes('--update-baseline');

const platforms = platformArg === 'both' ? ['android', 'ios'] : [platformArg];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtMB = bytes => (bytes / 1024 / 1024).toFixed(2);
const fmtPct = (val, max) => ((val / max) * 100).toFixed(1);

const log = (...args) => console.log(...args);
const logErr = (...args) => console.error(...args);

const ensureTempDir = () => {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
};

const cleanupTempDir = () => {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
};

// ─── Bundle generation ────────────────────────────────────────────────────────

const generateBundle = platform => {
  const bundlePath = path.join(TEMP_DIR, `${platform}-prod.bundle`);
  const sourcemapPath = path.join(TEMP_DIR, `${platform}-prod.bundle.map`);

  log(`\n→ Generating ${platform} production bundle...`);
  try {
    execSync(
      `bunx react-native bundle --platform ${platform} --dev false --minify true --entry-file index.js --bundle-output ${bundlePath} --sourcemap-output ${sourcemapPath}`,
      { cwd: ROOT, stdio: 'pipe' },
    );
  } catch (err) {
    logErr(`✗ Failed to generate ${platform} bundle:`);
    logErr(err.stdout?.toString() ?? err.message);
    process.exit(2);
  }

  return { bundlePath, sourcemapPath };
};

// ─── Bundle measurement ───────────────────────────────────────────────────────

const measureBundle = (bundlePath, sourcemapPath) => {
  const size = fs.statSync(bundlePath).size;

  // Parse source map untuk module count
  const map = JSON.parse(fs.readFileSync(sourcemapPath, 'utf8'));
  const sources = (map.sources || []).filter(s => s && s !== '__prelude__');
  const moduleCount = sources.length;

  return { size, moduleCount };
};

// ─── Budget check ─────────────────────────────────────────────────────────────

const checkBudget = (platform, measured, budget) => {
  const sizeOk = measured.size <= budget.maxBytes;
  const moduleOk = measured.moduleCount <= budget.maxModules;

  log(`\n  ${platform.toUpperCase()} bundle:`);
  log(`    Size:    ${fmtMB(measured.size)} MB / ${fmtMB(budget.maxBytes)} MB (${fmtPct(measured.size, budget.maxBytes)}%) ${sizeOk ? '✓' : '✗ OVER BUDGET'}`);
  log(`    Modules: ${measured.moduleCount} / ${budget.maxModules} (${fmtPct(measured.moduleCount, budget.maxModules)}%) ${moduleOk ? '✓' : '✗ OVER BUDGET'}`);

  return sizeOk && moduleOk;
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const main = () => {
  // Load budget config
  if (!fs.existsSync(BUDGET_FILE)) {
    logErr(`✗ Budget config not found: ${BUDGET_FILE}`);
    process.exit(2);
  }

  const budgets = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));

  ensureTempDir();

  const results = {};
  let allPassed = true;

  for (const platform of platforms) {
    if (!budgets[platform]) {
      logErr(`✗ No budget defined for platform: ${platform}`);
      cleanupTempDir();
      process.exit(2);
    }

    const { bundlePath, sourcemapPath } = generateBundle(platform);
    const measured = measureBundle(bundlePath, sourcemapPath);
    const passed = checkBudget(platform, measured, budgets[platform]);

    results[platform] = { ...measured, passed };
    if (!passed) allPassed = false;
  }

  if (updateBaseline) {
    log('\n→ Updating baseline values in bundle-budget.json...');
    for (const platform of platforms) {
      // Set max to 110% of current as new baseline (10% headroom)
      budgets[platform].maxBytes = Math.ceil(results[platform].size * 1.1);
      budgets[platform].maxModules = Math.ceil(results[platform].moduleCount * 1.1);
    }
    fs.writeFileSync(BUDGET_FILE, JSON.stringify(budgets, null, 2) + '\n');
    log('✓ Baseline updated.');
  }

  cleanupTempDir();

  if (!allPassed) {
    log('\n✗ Bundle budget check FAILED.');
    log('\nOptions:');
    log('  1. Reduce bundle size (audit imports, remove unused deps)');
    log('  2. Update baseline if increase is intentional:');
    log('     node scripts/check-bundle-budget.js --update-baseline');
    process.exit(1);
  }

  log('\n✓ All bundles within budget.');
  process.exit(0);
};

main();
