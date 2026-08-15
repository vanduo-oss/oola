#!/usr/bin/env node
/**
 * Select diverse icons from icon-master-list.json into batch-N.json
 * and sync preview/src/data/icon-names.json
 *
 * Usage: node scripts/select-batch.mjs --count=250
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const count = Number(
  (process.argv.find((a) => a.startsWith("--count=")) || "--count=250").split(
    "=",
  )[1],
);

const KEEP = [
  "search",
  "house",
  "user",
  "cog",
  "heart",
  "star",
  "plus",
  "trash",
  "mail",
  "bell",
  "x",
  "check",
  "menu",
  "minus",
  "arrow-left",
  "arrow-right",
  "chevron-down",
  "eye",
  "lock",
  "calendar",
  "camera",
  "map-pin",
  "phone",
  "download",
  "folder",
];

const master = JSON.parse(
  readFileSync(join(ROOT, "icon-master-list.json"), "utf8"),
);

const byName = new Map(master.icons.map((i) => [i.name, i]));

/** Prefer high set overlap, then fill. */
function pick(n) {
  const selected = [];
  const seen = new Set();
  const add = (name) => {
    if (seen.has(name) || selected.length >= n) return;
    const meta = byName.get(name);
    if (!meta) return;
    seen.add(name);
    selected.push({
      name,
      hint: meta.prompt_hint || name.replace(/-/g, " "),
      category: meta.category || "misc",
      sets_count: meta.sets_count,
    });
  };

  for (const k of KEEP) add(k);

  const ranked = [...master.icons]
    .filter((i) => !seen.has(i.name))
    .sort((a, b) => {
      if (b.sets_count !== a.sets_count) return b.sets_count - a.sets_count;
      return a.name.localeCompare(b.name);
    });

  // Round-robin categories for diversity among top overlap
  const buckets = new Map();
  for (const i of ranked) {
    if (!buckets.has(i.category)) buckets.set(i.category, []);
    buckets.get(i.category).push(i);
  }
  const cats = [...buckets.keys()].sort();
  let guard = 0;
  while (selected.length < n && guard < n * 20) {
    guard++;
    let progressed = false;
    for (const c of cats) {
      const list = buckets.get(c);
      if (!list?.length) continue;
      const next = list.shift();
      add(next.name);
      progressed = true;
      if (selected.length >= n) break;
    }
    if (!progressed) break;
  }

  // Fill remainder by ranked order
  for (const i of ranked) {
    if (selected.length >= n) break;
    add(i.name);
  }

  return selected;
}

const icons = pick(count);
const batch = {
  meta: {
    description: `Structured Phi batch (${icons.length}) — hand/agent authored 24x24 outlines`,
    variant: "oola-structured-phi",
    source: "hand",
    models: [
      {
        id: "hand",
        short_id: "recraft-v4.1-pro-vector",
        label: "Hand (Structured Phi)",
      },
    ],
    keep: ["mail", "house", "search"],
    style_references: ["search", "house", "mail"],
  },
  icons,
};

const batchPath = join(ROOT, "drafts", `batch-${count}.json`);
writeFileSync(batchPath, JSON.stringify(batch, null, 2) + "\n");

const namesPath = join(ROOT, "preview/src/data/icon-names.json");
writeFileSync(
  namesPath,
  JSON.stringify(
    icons.map((i) => i.name),
    null,
    2,
  ) + "\n",
);

console.log(`Wrote ${batchPath} (${icons.length} icons)`);
console.log(`Wrote ${namesPath}`);
if (existsSync(join(ROOT, "drafts/batch-25.json")) && count > 25) {
  console.log("Note: batch-25.json retained for history.");
}
