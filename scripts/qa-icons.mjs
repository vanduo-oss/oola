#!/usr/bin/env node
/**
 * Machine QA for OOLA Structured Phi draft SVGs.
 * Usage: npm run qa:icons [-- path/or/glob...]
 * Exit 0 only if all checked files pass.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const DEFAULT_DIR = join(
  ROOT,
  "drafts/oola-structured-phi/recraft-v4.1-pro-vector",
);

const args = process.argv.slice(2).filter((a) => a !== "--");

function collectSvgFiles(targets) {
  const out = [];
  const walk = (p) => {
    if (!existsSync(p)) return;
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const name of readdirSync(p)) {
        if (name.startsWith(".")) continue;
        walk(join(p, name));
      }
    } else if (p.endsWith(".svg")) {
      out.push(p);
    }
  };
  if (!targets.length) walk(DEFAULT_DIR);
  else for (const t of targets) walk(join(ROOT, t));
  return out.sort();
}

function approxBounds(d) {
  const nums = [...d.matchAll(/-?\d*\.?\d+/g)].map((m) => Number(m[0]));
  if (nums.length < 2) return null;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  // Naive: treat pairs as x,y when possible — good enough for gross overflow.
  for (let i = 0; i + 1 < nums.length; i += 1) {
    const a = nums[i];
    const b = nums[i + 1];
    // Heuristic: coordinates for 24 grid are typically 0–24
    if (a >= -2 && a <= 26 && b >= -2 && b <= 26) {
      minX = Math.min(minX, a);
      maxX = Math.max(maxX, a);
      minY = Math.min(minY, b);
      maxY = Math.max(maxY, b);
    }
  }
  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

function qaFile(path) {
  const rel = relative(ROOT, path);
  const raw = readFileSync(path, "utf8");
  const issues = [];

  if (!/viewBox="0 0 24 24"/i.test(raw)) {
    issues.push('missing viewBox="0 0 24 24"');
  }
  if (!/stroke-width="1\.5"/i.test(raw)) {
    issues.push('missing stroke-width="1.5"');
  }
  if (!/stroke-linecap="round"/i.test(raw)) {
    issues.push('missing stroke-linecap="round"');
  }
  if (!/stroke-linejoin="round"/i.test(raw)) {
    issues.push('missing stroke-linejoin="round"');
  }
  if (!/fill="none"/i.test(raw)) {
    issues.push('missing fill="none"');
  }
  if (/<(text|image)\b/i.test(raw)) {
    issues.push("forbidden <text> or <image>");
  }
  if (/xlink:href="data:/i.test(raw) || /href="data:image/i.test(raw)) {
    issues.push("embedded raster data URI");
  }
  if (/<metadata[\s\S]*?<\/metadata>/i.test(raw)) {
    issues.push("metadata blob present");
  }
  // Full-canvas Recraft-style backdrop
  if (
    /M\s*0(?:\.0+)?\s+0(?:\.0+)?[\s\S]{0,80}2048/i.test(raw) ||
    /width="2048"|height="2048"/i.test(raw)
  ) {
    issues.push("full-canvas backdrop suspected");
  }

  const paths = [...raw.matchAll(/\bd="([^"]*)"/gi)].map((m) => m[1]);
  for (const d of paths) {
    const b = approxBounds(d);
    if (!b) continue;
    if (b.minX < -1 || b.minY < -1 || b.maxX > 25 || b.maxY > 25) {
      issues.push(
        `geometry out of canvas (~${b.minX.toFixed(1)},${b.minY.toFixed(1)})–(${b.maxX.toFixed(1)},${b.maxY.toFixed(1)})`,
      );
      break;
    }
  }

  // Soft live-area nudge (warning-as-fail for severe overflow past padding)
  for (const d of paths) {
    const b = approxBounds(d);
    if (!b) continue;
    if (b.minX < 0.5 || b.minY < 0.5 || b.maxX > 23.5 || b.maxY > 23.5) {
      issues.push("geometry outside ~2px padding band");
      break;
    }
  }

  const cmdBudget = paths.reduce(
    (n, d) => n + (d.match(/[MmLlHhVvCcSsQqTtAaZz]/g) || []).length,
    0,
  );
  if (cmdBudget > 80) {
    issues.push(`path too complex (${cmdBudget} commands; max 80)`);
  }

  return { rel, ok: issues.length === 0, issues };
}

const files = collectSvgFiles(args);
if (!files.length) {
  console.error("No SVG files found to QA.");
  process.exit(1);
}

const results = files.map(qaFile);
const failed = results.filter((r) => !r.ok);

console.log(`QA ${results.length} SVG(s)…`);
for (const r of results) {
  if (r.ok) console.log(`  ok   ${r.rel}`);
  else {
    console.log(`  FAIL ${r.rel}`);
    for (const i of r.issues) console.log(`       - ${i}`);
  }
}

if (failed.length) {
  console.error(`\n${failed.length}/${results.length} failed.`);
  process.exit(1);
}
console.log(`\nAll ${results.length} passed.`);
