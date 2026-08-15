#!/usr/bin/env node
/**
 * Parallel OpenRouter chat completions → Structured Phi SVG drafts.
 *
 * Prefer free models, then cheap, then one power fallback. QA after each write.
 * Hero lock (search/house/mail/layout-grid) is frozen unless --force-keepers.
 * Old gold-25 is NOT skipped by default (use --skip-old-gold to preserve).
 *
 * Usage:
 *   npm run generate:llm -- --batch=drafts/batch-100.json --force --concurrency=8
 *   npm run generate:llm -- --dry-run --icon=flame
 *   npm run generate:llm -- --force --skip-old-gold
 *
 * Env:
 *   OPENROUTER_API_KEY (required)
 *   OOLA_LLM_FREE   comma-separated model ids (optional override)
 *   OOLA_LLM_CHEAP  comma-separated
 *   OOLA_LLM_POWER  comma-separated
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OUT_DIR = join(
  ROOT,
  "drafts/oola-structured-phi/recraft-v4.1-pro-vector",
);
/** Hero style lock — do not overwrite unless --force-keepers */
const KEEPERS = new Set(["oola", "mail", "house", "search", "layout-grid"]);
const GOLD_25 = new Set(
  JSON.parse(readFileSync(join(ROOT, "drafts/batch-25.json"), "utf8")).icons.map(
    (i) => i.name,
  ),
);

/** Live OpenRouter free/cheap cascade (refreshed 2026-08) */
const DEFAULT_FREE = [
  "cohere/north-mini-code:free",
  "poolside/laguna-s-2.1:free",
  "google/gemma-4-31b-it:free",
  "openai/gpt-oss-20b:free",
];
const DEFAULT_CHEAP = [
  "qwen/qwen3.7-flash",
  "qwen/qwen3-coder-30b-a3b-instruct",
  "openai/gpt-5-nano",
];
const DEFAULT_POWER = ["anthropic/claude-sonnet-4", "google/gemini-2.5-pro"];

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

function parseList(envVal, fallback) {
  if (!envVal?.trim()) return fallback;
  return envVal
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseArgs(argv) {
  const opts = {
    batch: "drafts/batch-100.json",
    concurrency: 8,
    dryRun: false,
    force: false,
    forceKeepers: false,
    skipOldGold: false,
    icon: null,
  };
  for (const a of argv) {
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--force") opts.force = true;
    else if (a === "--force-keepers") opts.forceKeepers = true;
    else if (a === "--skip-old-gold") opts.skipOldGold = true;
    else if (a.startsWith("--batch=")) opts.batch = a.slice(8);
    else if (a.startsWith("--concurrency="))
      opts.concurrency = Number(a.slice(14)) || 8;
    else if (a.startsWith("--icon=")) opts.icon = a.slice(7);
  }
  return opts;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractSvg(text) {
  if (!text) return null;
  let t = text.trim();
  const fence = t.match(/```(?:svg|xml)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const idx = t.indexOf("<svg");
  if (idx === -1) return null;
  t = t.slice(idx);
  const end = t.lastIndexOf("</svg>");
  if (end === -1) return null;
  t = t.slice(0, end + "</svg>".length);
  return sanitizeSvg(t);
}

function sanitizeSvg(svg) {
  let out = svg.trim();
  if (out.startsWith("<?xml")) {
    const i = out.indexOf("<svg");
    if (i !== -1) out = out.slice(i);
  }
  out = out.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
  out = out.replace(/\s+xmlns:c2pa="[^"]*"/g, "");
  // Normalize common LLM omissions
  if (!/stroke-width=/i.test(out)) {
    out = out.replace(/<svg\b/i, '<svg stroke-width="1.5"');
  }
  if (!/stroke-linecap=/i.test(out)) {
    out = out.replace(/<svg\b/i, '<svg stroke-linecap="round"');
  }
  if (!/stroke-linejoin=/i.test(out)) {
    out = out.replace(/<svg\b/i, '<svg stroke-linejoin="round"');
  }
  if (!/fill="none"/i.test(out)) {
    out = out.replace(/<svg\b/i, '<svg fill="none"');
  }
  if (!/stroke="currentColor"/i.test(out) && !/stroke="currentcolor"/i.test(out)) {
    out = out.replace(/<svg\b/i, '<svg stroke="currentColor"');
  }
  return `${out.trim()}\n`;
}

/** Inline QA (mirrors scripts/qa-icons.mjs core checks). */
function qaSvg(raw, name) {
  const issues = [];
  if (!/viewBox="0 0 24 24"/i.test(raw)) issues.push("bad viewBox");
  if (!/stroke-width="1\.5"/i.test(raw)) issues.push("stroke-width not 1.5");
  if (!/stroke-linecap="round"/i.test(raw)) issues.push("no round cap");
  if (!/stroke-linejoin="round"/i.test(raw)) issues.push("no round join");
  if (!/fill="none"/i.test(raw)) issues.push("fill not none");
  if (/<(text|image)\b/i.test(raw)) issues.push("text/image");
  if (/href="data:image/i.test(raw)) issues.push("raster");
  if (/M\s*0(?:\.0+)?\s+0[\s\S]{0,80}2048/i.test(raw))
    issues.push("full-canvas");
  const paths = [...raw.matchAll(/\bd="([^"]*)"/gi)].map((m) => m[1]);
  const cmds = paths.reduce(
    (n, d) => n + (d.match(/[MmLlHhVvCcSsQqTtAaZz]/g) || []).length,
    0,
  );
  if (cmds > 80) issues.push(`too complex (${cmds})`);

  // Padding band (~0.5–23.5) — match qa-icons.mjs
  for (const d of paths) {
    const nums = [...d.matchAll(/-?\d*\.?\d+/g)].map((m) => Number(m[0]));
    for (let i = 0; i + 1 < nums.length; i++) {
      const a = nums[i];
      const b = nums[i + 1];
      if (a >= -2 && a <= 26 && b >= -2 && b <= 26) {
        if (a < 0.5 || b < 0.5 || a > 23.5 || b > 23.5) {
          issues.push("outside padding band");
          break;
        }
      }
    }
    if (issues.includes("outside padding band")) break;
  }

  return { ok: issues.length === 0, issues };
}

function loadKeeperExamples() {
  const names = ["search", "house", "mail", "layout-grid"];
  return names
    .map((n) => {
      const p = join(OUT_DIR, `${n}.svg`);
      if (!existsSync(p)) return null;
      return { name: n, svg: readFileSync(p, "utf8").trim() };
    })
    .filter(Boolean);
}

function buildMessages(icon, examples) {
  const exemplars = examples
    .map((e) => `### ${e.name}.svg\n${e.svg}`)
    .join("\n\n");

  const system = `You are an expert SVG icon designer for the OOLA icon set (Structured Phi).
Return ONLY a single valid SVG element. No markdown, no explanation.

Hard rules:
- viewBox="0 0 24 24"
- fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
- Geometry stays in roughly 2–22 on both axes (2px padding)
- Soft ~2–3px corner radius (no hard-mitered apexes)
- Straight lines straight; circles true circles
- No gradients, shadows, 3D, text, rasters, metadata, or full-canvas backgrounds
- Cogs/gears: max 6 teeth
- Bells: flared lip + clapper (not a droplet)
- Prefer simple geometric UI glyphs matching the exemplar stroke mass`;

  const user = `Style exemplars (match this language):

${exemplars}

Design icon "${icon.name}" (${icon.hint}; category ${icon.category || "misc"}).
Output the complete <svg>...</svg> now.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

async function chatCompletion({
  apiKey,
  model,
  messages,
  referer,
  title,
}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": referer,
      "X-Title": title,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      max_tokens: 1200,
    }),
  });

  const bodyText = await res.text();
  let data;
  try {
    data = JSON.parse(bodyText);
  } catch {
    throw new Error(`Non-JSON (${res.status}): ${bodyText.slice(0, 200)}`);
  }
  if (!res.ok) {
    const msg = data?.error?.message || bodyText.slice(0, 300);
    const err = new Error(`${model} HTTP ${res.status}: ${msg}`);
    err.status = res.status;
    throw err;
  }
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${model}: empty content`);
  return {
    content,
    usage: data.usage || null,
    id: data.id || null,
  };
}

async function generateOne(icon, ctx) {
  const outFile = join(OUT_DIR, `${icon.name}.svg`);
  const isGold = GOLD_25.has(icon.name);
  const isKeeper = KEEPERS.has(icon.name);

  if (isKeeper && !ctx.forceKeepers) {
    return { name: icon.name, status: "kept", model: null };
  }
  if (isGold && ctx.skipOldGold && !ctx.forceKeepers) {
    return { name: icon.name, status: "gold-skip", model: null };
  }
  if (existsSync(outFile) && !ctx.force && !isGold) {
    return { name: icon.name, status: "skipped", model: null };
  }

  if (ctx.dryRun) {
    return { name: icon.name, status: "dry-run", model: ctx.cascade[0] };
  }

  const messages = buildMessages(icon, ctx.examples);
  let lastErr = null;

  for (const model of ctx.cascade) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await chatCompletion({
          apiKey: ctx.apiKey,
          model,
          messages,
          referer: ctx.referer,
          title: ctx.title,
        });
        const svg = extractSvg(result.content);
        if (!svg) {
          lastErr = new Error("no svg in response");
          continue;
        }
        const qa = qaSvg(svg, icon.name);
        if (!qa.ok) {
          lastErr = new Error(`qa: ${qa.issues.join(", ")}`);
          continue;
        }
        writeFileSync(outFile, svg);
        return {
          name: icon.name,
          status: "wrote",
          model,
          usage: result.usage,
          attempt,
        };
      } catch (e) {
        lastErr = e;
        // Rate limit / overload → brief backoff
        if (e.status === 429 || e.status === 502 || e.status === 503) {
          await sleep(800 * attempt);
        }
      }
    }
  }

  return {
    name: icon.name,
    status: "failed",
    model: null,
    error: String(lastErr?.message || lastErr),
  };
}

async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  const n = Math.min(concurrency, Math.max(1, items.length));
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

function appendManifest(run) {
  const path = join(ROOT, "drafts/MANIFEST.json");
  let data = { runs: [] };
  if (existsSync(path)) {
    try {
      data = JSON.parse(readFileSync(path, "utf8"));
      if (!Array.isArray(data.runs)) data = { runs: [] };
    } catch {
      data = { runs: [] };
    }
  }
  data.runs.push(run);
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

async function main() {
  loadEnvFile(join(ROOT, ".env"));
  const opts = parseArgs(process.argv.slice(2));
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!opts.dryRun && !apiKey) {
    console.error("Missing OPENROUTER_API_KEY in .env");
    process.exit(1);
  }

  const batchPath = join(ROOT, opts.batch);
  if (!existsSync(batchPath)) {
    console.error(`Missing batch file: ${opts.batch}`);
    process.exit(1);
  }
  const batch = JSON.parse(readFileSync(batchPath, "utf8"));
  let icons = batch.icons || [];
  if (opts.icon) icons = icons.filter((i) => i.name === opts.icon);
  // Hero keepers always filtered out of generation targets unless forced
  const targets = icons.filter(
    (i) => opts.forceKeepers || !KEEPERS.has(i.name),
  );

  const free = parseList(process.env.OOLA_LLM_FREE, DEFAULT_FREE);
  const cheap = parseList(process.env.OOLA_LLM_CHEAP, DEFAULT_CHEAP);
  const power = parseList(process.env.OOLA_LLM_POWER, DEFAULT_POWER);
  const cascade = [...free, ...cheap, ...power];

  mkdirSync(OUT_DIR, { recursive: true });
  const examples = loadKeeperExamples();
  if (examples.length < 2) {
    console.error(
      "Need at least 2 keeper SVGs for few-shot (search/house/mail/layout-grid)",
    );
    process.exit(1);
  }

  console.log(
    `LLM SVG gen: ${targets.length} targets, concurrency=${opts.concurrency}` +
      (opts.dryRun ? " (dry-run)" : "") +
      (opts.skipOldGold ? " (skip-old-gold)" : ""),
  );
  console.log(`Cascade: ${cascade.join(" → ")}`);
  console.log(`Keepers frozen: ${[...KEEPERS].join(", ")}`);

  const ctx = {
    apiKey,
    cascade,
    examples,
    dryRun: opts.dryRun,
    force: opts.force,
    forceKeepers: opts.forceKeepers,
    skipOldGold: opts.skipOldGold,
    referer:
      process.env.OPENROUTER_HTTP_REFERER ||
      "https://github.com/vanduo-oss/oola",
    title: process.env.OPENROUTER_APP_TITLE || "oola-llm-svgs",
  };

  const started = new Date().toISOString();
  let done = 0;
  const results = await mapPool(targets, opts.concurrency, async (icon) => {
    const r = await generateOne(icon, ctx);
    done++;
    const tag =
      r.status === "wrote"
        ? `ok ${r.model}`
        : r.status === "failed"
          ? `FAIL ${r.error}`
          : r.status;
    console.log(`[${done}/${targets.length}] ${icon.name}: ${tag}`);
    return r;
  });

  const tallies = {};
  for (const r of results) {
    tallies[r.status] = (tallies[r.status] || 0) + 1;
  }
  console.log("Tallies:", tallies);

  if (!opts.dryRun) {
    appendManifest({
      type: "openrouter-llm-svg",
      started,
      finished: new Date().toISOString(),
      batch: opts.batch,
      concurrency: opts.concurrency,
      cascade,
      tallies,
      items: results,
    });

    // Sync preview catalog from OUT_DIR (never shrink below existing 250 set)
    const catalogPath = join(ROOT, "preview/src/data/icon-names.json");
    let existing = [];
    if (existsSync(catalogPath)) {
      try {
        existing = JSON.parse(readFileSync(catalogPath, "utf8"));
        if (!Array.isArray(existing)) existing = [];
      } catch {
        existing = [];
      }
    }
    const onDisk = readdirSync(OUT_DIR)
      .filter((f) => f.endsWith(".svg"))
      .map((f) => f.replace(/\.svg$/, ""));
    const names = [...new Set([...existing, ...onDisk])].sort();
    writeFileSync(catalogPath, JSON.stringify(names, null, 2) + "\n");
    console.log(`Catalog synced: ${names.length} icons`);
  }

  const failed = results.filter((r) => r.status === "failed");
  if (failed.length) {
    console.error(`${failed.length} failed. Sample:`, failed.slice(0, 8));
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
