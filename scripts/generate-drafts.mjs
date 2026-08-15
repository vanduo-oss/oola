#!/usr/bin/env node
/**
 * Generate OOLA Structured Phi draft SVGs via OpenRouter (Pro Vector + style lock).
 *
 * Usage:
 *   cp .env.example .env   # set OPENROUTER_API_KEY
 *   npm run generate:drafts
 *   npm run generate:drafts -- --force          # regen non-keepers only
 *   npm run generate:drafts -- --force-keepers  # also regen keepers (costly)
 *
 * Flags:
 *   --dry-run          Print prompts only
 *   --force            Overwrite non-keeper SVGs
 *   --force-keepers    Allow overwriting keep icons (mail/house/search)
 *   --model=SHORT_ID   Only one model
 *   --icon=NAME        Only one icon
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const API_URL = "https://openrouter.ai/api/v1/images";
const VARIANT = "oola-structured-phi";
const DELAY_MS = 800;
const MAX_RETRIES = 4;

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
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

function parseArgs(argv) {
  const opts = {
    dryRun: false,
    force: false,
    forceKeepers: false,
    model: null,
    icon: null,
  };
  for (const a of argv) {
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--force") opts.force = true;
    else if (a === "--force-keepers") opts.forceKeepers = true;
    else if (a.startsWith("--model=")) opts.model = a.slice("--model=".length);
    else if (a.startsWith("--icon=")) opts.icon = a.slice("--icon=".length);
  }
  return opts;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function renderPrompt(template, hint) {
  return template.replaceAll("{hint}", hint);
}

function looksLikeSvg(text) {
  const t = text.trim();
  return t.startsWith("<svg") || t.startsWith("<?xml");
}

function sanitizeSvg(svg) {
  let out = svg.trim();
  if (out.startsWith("<?xml")) {
    const idx = out.indexOf("<svg");
    if (idx !== -1) out = out.slice(idx);
  }
  out = out.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
  out = out.replace(/\s+xmlns:c2pa="[^"]*"/g, "");
  return `${out.trim()}\n`;
}

function decodeImagePayload(item) {
  if (!item) throw new Error("Empty image payload");

  if (typeof item.svg === "string" && looksLikeSvg(item.svg)) {
    return { svg: item.svg, mediaType: "image/svg+xml", source: "svg" };
  }
  if (typeof item.url === "string" && item.url.startsWith("data:image/svg")) {
    const b64 = item.url.split(",")[1];
    return {
      svg: Buffer.from(b64, "base64").toString("utf8"),
      mediaType: "image/svg+xml",
      source: "data-url",
    };
  }

  const b64 = item.b64_json || item.b64Json;
  if (!b64) {
    throw new Error(
      `No b64_json/svg in response item: ${JSON.stringify(Object.keys(item))}`,
    );
  }

  const buf = Buffer.from(b64, "base64");
  const asUtf8 = buf.toString("utf8");
  if (looksLikeSvg(asUtf8)) {
    return {
      svg: asUtf8,
      mediaType: item.media_type || "image/svg+xml",
      source: "b64-svg",
    };
  }

  throw new Error(
    `Response is not SVG (media_type=${item.media_type || "unknown"}, startsWith=${asUtf8.slice(0, 40).replace(/\n/g, " ")})`,
  );
}

function refDataUrl(refPath) {
  const svg = readFileSync(refPath, "utf8");
  const b64 = Buffer.from(svg, "utf8").toString("base64");
  return `data:image/svg+xml;base64,${b64}`;
}

async function generateImage({
  apiKey,
  model,
  prompt,
  referer,
  title,
  referenceDataUrl,
}) {
  const body = {
    model,
    prompt,
    n: 1,
    aspect_ratio: "1:1",
    output_format: "svg",
  };

  if (referenceDataUrl) {
    body.input_references = [
      {
        type: "image_url",
        image_url: { url: referenceDataUrl },
      },
    ];
  }

  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(referer ? { "HTTP-Referer": referer } : {}),
        ...(title ? { "X-Title": title } : {}),
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }

    if (res.status === 429 || res.status === 502 || res.status === 503) {
      const wait = DELAY_MS * Math.pow(2, attempt);
      lastErr = new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
      await sleep(wait);
      continue;
    }

    if (!res.ok) {
      const msg =
        json?.error?.message ||
        json?.message ||
        text.slice(0, 500) ||
        res.statusText;
      throw new Error(`OpenRouter ${res.status}: ${msg}`);
    }

    const item = json?.data?.[0];
    const decoded = decodeImagePayload(item);
    return {
      ...decoded,
      usage: json.usage || null,
      id: json.id || json.generation_id || null,
      created: json.created || null,
    };
  }
  throw lastErr || new Error("Retries exhausted");
}

async function main() {
  loadEnvFile(join(ROOT, ".env"));
  const opts = parseArgs(process.argv.slice(2));

  const batchPath = join(ROOT, "drafts", "batch-25.json");
  const templatesPath = join(ROOT, "prompt-templates.json");
  const batch = JSON.parse(readFileSync(batchPath, "utf8"));
  const templates = JSON.parse(readFileSync(templatesPath, "utf8"));

  const variant = batch.meta.variant || VARIANT;
  const promptTemplate = templates.prompt_variants?.[variant];
  if (!promptTemplate) {
    throw new Error(`Missing prompt_variants.${variant}`);
  }

  const styleLockSuffix = templates.style_lock?.suffix || "";
  const refsDir = join(
    ROOT,
    templates.style_lock?.references_dir || "drafts/references",
  );
  const keepSet = new Set(batch.meta.keep || []);
  const styleRefs = batch.meta.style_references || [...keepSet];

  let models =
    batch.meta.models ||
    templates.generation_params?.openrouter_image_api?.models;
  if (!models?.length) throw new Error("No models configured in batch-25.json");
  if (opts.model) {
    models = models.filter(
      (m) => m.short_id === opts.model || m.id === opts.model,
    );
    if (!models.length) {
      throw new Error(`No model matched --model=${opts.model}`);
    }
  }

  const icons = opts.icon
    ? batch.icons.filter((i) => i.name === opts.icon)
    : batch.icons;
  if (!icons.length) throw new Error("No icons matched filters");

  const apiKey = process.env.OPENROUTER_API_KEY;
  const referer =
    process.env.OPENROUTER_HTTP_REFERER ||
    "https://github.com/vanduo-oss/oola";
  const title = process.env.OPENROUTER_APP_TITLE || "oola-drafts";

  if (!opts.dryRun && !apiKey) {
    console.error(
      "Missing OPENROUTER_API_KEY. Copy .env.example → .env and set your key.",
    );
    process.exit(1);
  }

  const manifestPath = join(ROOT, "drafts", "MANIFEST.json");
  let manifest = { runs: [], updated_at: null };
  if (existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      if (!Array.isArray(manifest.runs)) manifest.runs = [];
    } catch {
      manifest = { runs: [], updated_at: null };
    }
  }

  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  const run = {
    id: runId,
    started_at: new Date().toISOString(),
    variant,
    dry_run: opts.dryRun,
    items: [],
  };

  console.log(
    `OOLA ${variant}: ${icons.length} icons × ${models.length} models` +
      (opts.dryRun ? " (dry-run)" : "") +
      (keepSet.size ? ` (keep: ${[...keepSet].join(",")})` : ""),
  );

  let regenIndex = 0;

  for (const model of models) {
    const outDir = join(ROOT, "drafts", variant, model.short_id);
    mkdirSync(outDir, { recursive: true });

    for (const icon of icons) {
      const outFile = join(outDir, `${icon.name}.svg`);
      const isKeeper = keepSet.has(icon.name);
      const rel = `drafts/${variant}/${model.short_id}/${icon.name}.svg`;

      const refName = styleRefs[regenIndex % styleRefs.length];
      const refPath = join(refsDir, `${refName}.svg`);
      let prompt = renderPrompt(promptTemplate, icon.hint);
      if (styleLockSuffix) prompt = `${prompt}. ${styleLockSuffix}`;

      if (isKeeper && !opts.forceKeepers) {
        console.log(`keep  ${rel} (style keeper; use --force-keepers to redo)`);
        run.items.push({
          model: model.id,
          short_id: model.short_id,
          name: icon.name,
          status: "kept",
          path: rel,
        });
        continue;
      }

      if (!opts.force && !opts.forceKeepers && existsSync(outFile) && !opts.dryRun) {
        console.log(`skip  ${rel} (exists; use --force)`);
        run.items.push({
          model: model.id,
          short_id: model.short_id,
          name: icon.name,
          status: "skipped",
          path: rel,
        });
        continue;
      }

      if (opts.dryRun) {
        console.log(
          `\n[${model.short_id}/${icon.name}] ref=${refName}\n${prompt}`,
        );
        run.items.push({
          model: model.id,
          short_id: model.short_id,
          name: icon.name,
          status: "dry-run",
          prompt,
          reference: refName,
        });
        regenIndex += 1;
        continue;
      }

      if (!existsSync(refPath)) {
        throw new Error(`Missing style reference: ${refPath}`);
      }

      process.stdout.write(`gen   ${rel} (ref=${refName}) ... `);
      const result = await generateImage({
        apiKey,
        model: model.id,
        prompt,
        referer,
        title,
        referenceDataUrl: refDataUrl(refPath),
      });

      const svg = sanitizeSvg(result.svg);
      if (!looksLikeSvg(svg)) {
        throw new Error(`Normalized output is not SVG for ${rel}`);
      }
      writeFileSync(outFile, svg, "utf8");
      console.log(`ok (${result.mediaType}, $${result.usage?.cost ?? "?"})`);

      run.items.push({
        model: model.id,
        short_id: model.short_id,
        name: icon.name,
        status: "ok",
        path: rel,
        prompt,
        reference: refName,
        media_type: result.mediaType,
        generation_id: result.id,
        usage: result.usage,
        created: result.created,
      });

      regenIndex += 1;
      await sleep(DELAY_MS);
    }
  }

  run.finished_at = new Date().toISOString();
  manifest.runs.unshift(run);
  manifest.updated_at = run.finished_at;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`\nWrote ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
