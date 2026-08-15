#!/usr/bin/env node
/**
 * Compose Structured Phi hand SVGs for batch icons (parallel waves).
 * Skips keepers and existing files unless --force.
 *
 * Usage:
 *   node scripts/compose-hand-icons.mjs --batch=250
 *   node scripts/compose-hand-icons.mjs --batch=1000 --force-missing
 *   node scripts/compose-hand-icons.mjs --batch=250 --concurrency=8
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { cpus } from "node:os";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const OUT = join(ROOT, "drafts/oola-structured-phi/recraft-v4.1-pro-vector");
const KEEPERS = new Set(["mail", "house", "search"]);

const SVG_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">';
const SVG_CLOSE = "</svg>";

function wrap(inner) {
  return `${SVG_OPEN}\n  ${inner}\n${SVG_CLOSE}\n`;
}

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Explicit overrides for known smoke icons — never overwrite keepers. */
const EXPLICIT = {
  // left intentionally empty for keepers; compose skips them
};

function arrow(dir) {
  const map = {
    left: ['<path d="M19 12 H5"/>', '<path d="M11 6 L5 12 L11 18"/>'],
    right: ['<path d="M5 12 H19"/>', '<path d="M13 6 L19 12 L13 18"/>'],
    up: ['<path d="M12 19 V5"/>', '<path d="M6 11 L12 5 L18 11"/>'],
    down: ['<path d="M12 5 V19"/>', '<path d="M6 13 L12 19 L18 13"/>'],
    "up-left": ['<path d="M17 17 L7 7"/>', '<path d="M7 15 V7 H15"/>'],
    "up-right": ['<path d="M7 17 L17 7"/>', '<path d="M9 7 H17 V15"/>'],
    "down-left": ['<path d="M17 7 L7 17"/>', '<path d="M7 9 V17 H15"/>'],
    "down-right": ['<path d="M7 7 L17 17"/>', '<path d="M9 17 H17 V9"/>'],
  };
  return wrap((map[dir] || map.right).join("\n  "));
}

function chevron(dir) {
  const map = {
    down: '<path d="M6 9 L12 15 L18 9"/>',
    up: '<path d="M6 15 L12 9 L18 15"/>',
    left: '<path d="M15 6 L9 12 L15 18"/>',
    right: '<path d="M9 6 L15 12 L9 18"/>',
  };
  return wrap(map[dir] || map.down);
}

function composeFromName(name, category) {
  if (EXPLICIT[name]) return wrap(EXPLICIT[name]);

  // Arrows / chevrons
  let m;
  if ((m = /^arrow-(up|down|left|right)$/.exec(name))) return arrow(m[1]);
  if ((m = /^arrow-(up-left|up-right|down-left|down-right)$/.exec(name)))
    return arrow(m[1]);
  if ((m = /^chevron-(up|down|left|right)$/.exec(name))) return chevron(m[1]);
  if (name === "chevrons-up")
    return wrap(
      '<path d="M7 15 L12 10 L17 15"/>\n  <path d="M7 11 L12 6 L17 11"/>',
    );
  if (name === "chevrons-down")
    return wrap(
      '<path d="M7 9 L12 14 L17 9"/>\n  <path d="M7 13 L12 18 L17 13"/>',
    );
  if (name === "chevrons-left")
    return wrap(
      '<path d="M15 7 L10 12 L15 17"/>\n  <path d="M11 7 L6 12 L11 17"/>',
    );
  if (name === "chevrons-right")
    return wrap(
      '<path d="M9 7 L14 12 L9 17"/>\n  <path d="M13 7 L18 12 L13 17"/>',
    );
  if (name === "chevrons-up-down")
    return wrap(
      '<path d="M7 9 L12 4 L17 9"/>\n  <path d="M7 15 L12 20 L17 15"/>',
    );

  if (name === "x" || name.endsWith("-x") || name === "x-mark")
    return wrap('<path d="M6 6 L18 18"/>\n  <path d="M18 6 L6 18"/>');
  if (name === "check" || name === "check-check")
    return wrap('<path d="M5 12.5 L10 17.5 L19 6.5"/>');
  if (name === "minus" || name === "minus-circle")
    return name.includes("circle")
      ? wrap('<circle cx="12" cy="12" r="8"/>\n  <path d="M8 12 H16"/>')
      : wrap('<path d="M5 12 H19"/>');
  if (name === "plus" || name === "plus-circle")
    return name.includes("circle")
      ? wrap(
          '<circle cx="12" cy="12" r="8"/>\n  <path d="M12 8 V16"/>\n  <path d="M8 12 H16"/>',
        )
      : wrap('<path d="M12 5 V19"/>\n  <path d="M5 12 H19"/>');
  if (name === "menu")
    return wrap(
      '<path d="M4 7 H20"/>\n  <path d="M4 12 H20"/>\n  <path d="M4 17 H20"/>',
    );
  if (name === "ellipsis" || name === "more-horizontal")
    return wrap(
      '<circle cx="6" cy="12" r="1"/>\n  <circle cx="12" cy="12" r="1"/>\n  <circle cx="18" cy="12" r="1"/>',
    );
  if (name === "more-vertical")
    return wrap(
      '<circle cx="12" cy="6" r="1"/>\n  <circle cx="12" cy="12" r="1"/>\n  <circle cx="12" cy="18" r="1"/>',
    );

  // Circles with glyphs
  if (name.startsWith("circle-")) {
    const rest = name.slice(7);
    const inner =
      rest === "check"
        ? '<path d="M8 12.2 L10.8 15 L16.5 9"/>'
        : rest === "x" || rest === "x-mark"
          ? '<path d="M9 9 L15 15"/>\n  <path d="M15 9 L9 15"/>'
          : rest === "plus"
            ? '<path d="M12 8 V16"/>\n  <path d="M8 12 H16"/>'
            : rest === "minus"
              ? '<path d="M8 12 H16"/>'
              : rest === "play"
                ? '<path d="M10 8.5 L16 12 L10 15.5 Z"/>'
                : rest === "pause"
                  ? '<path d="M9 8 V16"/>\n  <path d="M15 8 V16"/>'
                  : rest === "stop"
                    ? '<path d="M9 9 H15 V15 H9 Z"/>'
                    : rest === "alert" || rest === "help"
                      ? '<path d="M12 8 V13"/>\n  <circle cx="12" cy="16.5" r="0.6"/>'
                      : '<circle cx="12" cy="12" r="2.5"/>';
    return wrap(`<circle cx="12" cy="12" r="8"/>\n  ${inner}`);
  }

  if (name === "info")
    return wrap(
      '<circle cx="12" cy="12" r="8"/>\n  <path d="M12 11 V16"/>\n  <circle cx="12" cy="8" r="0.6"/>',
    );
  if (name === "ban")
    return wrap(
      '<circle cx="12" cy="12" r="8"/>\n  <path d="M6.5 6.5 L17.5 17.5"/>',
    );

  // Slash / off
  if (name.endsWith("-off") || name.endsWith("-slash")) {
    const base = name.replace(/-off$|-slash$/, "");
    // generic: rounded diamond + slash
    return wrap(
      `<circle cx="12" cy="12" r="7.5"/>\n  <path d="M5 5 L19 19"/>`,
    );
  }

  // Files / folders
  if (name === "file" || name.startsWith("file-"))
    return wrap(
      '<path d="M7 4.5 H13 L17.5 9 V19.5 C17.5 20.3 16.8 21 16 21 H7 C6.2 21 5.5 20.3 5.5 19.5 V6 C5.5 5.2 6.2 4.5 7 4.5 Z"/>\n  <path d="M13 4.5 V9 H17.5"/>',
    );
  if (name.startsWith("folder"))
    return wrap(
      '<path d="M3 19.5 V8 C3 6.9 3.9 6 5 6 H9.5 L11.5 8 H19 C20.1 8 21 8.9 21 10 V19.5 C21 20.6 20.1 21.5 19 21.5 H5 C3.9 21.5 3 20.6 3 19.5 Z"/>',
    );

  // Media
  if (name === "image" || name === "image-plus")
    return wrap(
      '<path d="M4.5 6.5 H19.5 C20.6 6.5 21.5 7.4 21.5 8.5 V17.5 C21.5 18.6 20.6 19.5 19.5 19.5 H4.5 C3.4 19.5 2.5 18.6 2.5 17.5 V8.5 C2.5 7.4 3.4 6.5 4.5 6.5 Z"/>\n  <circle cx="9" cy="11" r="1.8"/>\n  <path d="M3.5 17.5 L9 13 L12.5 15.5 L16 12 L20.5 17"/>',
    );
  if (name === "mic")
    return wrap(
      '<path d="M9 5.5 C9 3.8 10.3 2.5 12 2.5 C13.7 2.5 15 3.8 15 5.5 V11 C15 12.7 13.7 14 12 14 C10.3 14 9 12.7 9 11 Z"/>\n  <path d="M6.5 11 C6.5 14.6 9 17 12 17 C15 17 17.5 14.6 17.5 11"/>\n  <path d="M12 17 V20.5"/>',
    );
  if (name === "play")
    return wrap('<path d="M8 5.5 L18 12 L8 18.5 Z"/>');
  if (name === "pause")
    return wrap('<path d="M8 5 V19"/>\n  <path d="M16 5 V19"/>');

  // Communication
  if (name === "message-circle" || name === "messages-square")
    return wrap(
      '<path d="M5 6.5 H19 C20.1 6.5 21 7.4 21 8.5 V14.5 C21 15.6 20.1 16.5 19 16.5 H10 L6 20 V16.5 H5 C3.9 16.5 3 15.6 3 14.5 V8.5 C3 7.4 3.9 6.5 5 6.5 Z"/>',
    );
  if (name === "message-square")
    return wrap(
      '<path d="M5 5.5 H19 C20.1 5.5 21 6.4 21 7.5 V14.5 C21 15.6 20.1 16.5 19 16.5 H9 L5 20 V5.5 Z"/>',
    );
  if (name.startsWith("phone"))
    return wrap(
      '<path d="M7 3.5 H9.4 C10.2 3.5 10.8 4.2 10.6 5 L10 8.1 C9.9 8.7 9.4 9.1 8.8 9.3 L7.2 9.9 C8.5 12.6 11.4 15.5 14.1 16.8 L14.7 15.2 C14.9 14.6 15.3 14.1 15.9 14 L19 13.4 C19.8 13.2 20.5 13.8 20.5 14.6 V17 C20.5 18.9 18.9 20.4 17 20 C10.6 18.8 5.2 13.4 4 7 C3.6 5.1 5.1 3.5 7 3.5 Z"/>',
    );
  if (name === "at-sign")
    return wrap(
      '<circle cx="12" cy="12" r="3.2"/>\n  <path d="M15.2 12 V14.2 C15.2 16 16.4 17.2 18.2 16.6 C20.2 15.8 21.5 13.6 21 11 C20.3 7 16.6 4 12.2 4 C7.2 4 3.5 8 4.2 13 C4.8 16.8 8.2 19.5 12 19.5"/>',
    );

  // UI actions common
  if (name === "bookmark")
    return wrap(
      '<path d="M7 4.5 H17 C17.8 4.5 18.5 5.2 18.5 6 V20 L12 15.5 L5.5 20 V6 C5.5 5.2 6.2 4.5 7 4.5 Z"/>',
    );
  if (name === "link")
    return wrap(
      '<path d="M10 14 L8.5 15.5 C7.1 16.9 7.1 19.1 8.5 20.5 C9.9 21.9 12.1 21.9 13.5 20.5 L15 19"/>\n  <path d="M14 10 L15.5 8.5 C16.9 7.1 19.1 7.1 20.5 8.5 C21.9 9.9 21.9 12.1 20.5 13.5 L19 15"/>\n  <path d="M9.5 14.5 L14.5 9.5"/>',
    );

  if (name === "external-link" || name === "arrow-up-right")
    return name === "arrow-up-right"
      ? arrow("up-right")
      : wrap(
          '<path d="M12 5 H18.5 V11.5"/>\n  <path d="M18 5.5 L10 13.5"/>\n  <path d="M7 7.5 H5.5 C4.7 7.5 4 8.2 4 9 V18.5 C4 19.3 4.7 20 5.5 20 H15 C15.8 20 16.5 19.3 16.5 18.5 V17"/>',
        );

  if (name === "share")
    return wrap(
      '<circle cx="7" cy="12" r="2.5"/>\n  <circle cx="17" cy="7" r="2.5"/>\n  <circle cx="17" cy="17" r="2.5"/>\n  <path d="M9.2 11 L14.8 8.2"/>\n  <path d="M9.2 13 L14.8 15.8"/>',
    );
  if (name === "filter")
    return wrap('<path d="M4 6 H20 L14 12.5 V18 L10 20 V12.5 Z"/>');
  if (name === "sliders-horizontal" || name === "settings-2")
    return wrap(
      '<path d="M4 8 H20"/>\n  <path d="M4 16 H20"/>\n  <circle cx="9" cy="8" r="2"/>\n  <circle cx="15" cy="16" r="2"/>',
    );

  if (name === "clock")
    return wrap(
      '<circle cx="12" cy="12" r="8"/>\n  <path d="M12 8 V12.5 L15.5 15"/>',
    );
  if (name === "key")
    return wrap(
      '<circle cx="8.5" cy="12" r="3.5"/>\n  <path d="M11.5 12 H20 V15"/>\n  <path d="M16.5 12 V14.5"/>',
    );
  if (name === "zap")
    return wrap('<path d="M13 3 L5.5 13.5 H11.5 L11 21 L18.5 10.5 H12.5 Z"/>');
  if (name === "sun")
    return wrap(
      '<circle cx="12" cy="12" r="3.5"/>\n  <path d="M12 3.5 V5.5 M12 18.5 V20.5 M3.5 12 H5.5 M18.5 12 H20.5 M6 6 L7.4 7.4 M16.6 16.6 L18 18 M18 6 L16.6 7.4 M7.4 16.6 L6 18"/>',
    );
  if (name === "moon")
    return wrap(
      '<path d="M18.5 14.5 C15.5 17.8 10.2 17.5 7.5 14.2 C4.8 10.9 5.8 5.9 9.5 4 C7 8.5 9.5 14 15.5 15.5 C16.5 15.7 17.5 15.2 18.5 14.5 Z"/>',
    );
  if (name === "cloud")
    return wrap(
      '<path d="M7.5 17.5 H17 C19.2 17.5 21 15.7 21 13.5 C21 11.5 19.5 9.9 17.6 9.6 C16.9 7.2 14.7 5.5 12 5.5 C9 5.5 6.5 7.6 6.1 10.5 C4.2 10.9 3 12.5 3 14.3 C3 16.1 4.4 17.5 6.2 17.5 H7.5"/>',
    );
  if (name === "database")
    return wrap(
      '<ellipse cx="12" cy="6" rx="7" ry="2.5"/>\n  <path d="M5 6 V17 C5 18.4 8.1 19.5 12 19.5 C15.9 19.5 19 18.4 19 17 V6"/>\n  <path d="M5 11.5 C5 12.9 8.1 14 12 14 C15.9 14 19 12.9 19 11.5"/>',
    );
  if (name === "cpu")
    return wrap(
      '<path d="M8 8 H16 V16 H8 Z"/>\n  <path d="M12 3.5 V8 M12 16 V20.5 M3.5 12 H8 M16 12 H20.5 M6 3.5 V8 M18 3.5 V8 M6 16 V20.5 M18 16 V20.5"/>',
    );
  if (name === "battery-full" || name === "battery-medium" || name === "battery")
    return wrap(
      '<path d="M3.5 8.5 H17.5 C18.6 8.5 19.5 9.4 19.5 10.5 V15.5 C19.5 16.6 18.6 17.5 17.5 17.5 H3.5 C2.4 17.5 1.5 16.6 1.5 15.5 V10.5 C1.5 9.4 2.4 8.5 3.5 8.5 Z"/>\n  <path d="M19.5 11.5 H21.5 V14.5 H19.5"/>\n  <path d="M5 11 H15 V15 H5 Z"/>',
    );

  if (name === "upload")
    return wrap(
      '<path d="M12 16 V6"/>\n  <path d="M7.5 10 L12 5.5 L16.5 10"/>\n  <path d="M4 18.5 H20"/>',
    );
  if (name === "copy")
    return wrap(
      '<path d="M9 9 H18.5 C19.3 9 20 9.7 20 10.5 V19.5 C20 20.3 19.3 21 18.5 21 H9 C8.2 21 7.5 20.3 7.5 19.5 V10.5 C7.5 9.7 8.2 9 9 9 Z"/>\n  <path d="M5.5 15 V5.5 C5.5 4.7 6.2 4 7 4 H15"/>',
    );
  if (name === "clipboard" || name === "clipboard-list")
    return wrap(
      '<path d="M9 5.5 H7.5 C6.4 5.5 5.5 6.4 5.5 7.5 V19 C5.5 20.1 6.4 21 7.5 21 H16.5 C17.6 21 18.5 20.1 18.5 19 V7.5 C18.5 6.4 17.6 5.5 16.5 5.5 H15"/>\n  <path d="M9 4.5 H15 V7 H9 Z"/>',
    );
  if (name === "pencil" || name === "pen" || name === "pen-line")
    return wrap(
      '<path d="M13.5 5.5 L18.5 10.5 L9 20 H4 V15 Z"/>\n  <path d="M12 7 L17 12"/>',
    );
  if (name === "scissors")
    return wrap(
      '<circle cx="7" cy="7" r="2.5"/>\n  <circle cx="7" cy="17" r="2.5"/>\n  <path d="M9 8.5 L19 17"/>\n  <path d="M9 15.5 L19 7"/>',
    );
  if (name === "printer")
    return wrap(
      '<path d="M7 8.5 V4.5 H17 V8.5"/>\n  <path d="M5.5 8.5 H18.5 C19.6 8.5 20.5 9.4 20.5 10.5 V16 H16.5 V13.5 H7.5 V16 H3.5 V10.5 C3.5 9.4 4.4 8.5 5.5 8.5 Z"/>\n  <path d="M7.5 16 H16.5 V20.5 H7.5 Z"/>',
    );
  if (name === "globe")
    return wrap(
      '<circle cx="12" cy="12" r="8"/>\n  <path d="M4 12 H20"/>\n  <path d="M12 4 C14.5 7 14.5 17 12 20 C9.5 17 9.5 7 12 4 Z"/>',
    );
  if (name === "home")
    return wrap(
      '<path d="M4.5 11.2 L10.8 5.2 C11.4 4.6 12.6 4.6 13.2 5.2 L19.5 11.2 V18.5 C19.5 19.6 18.6 20.5 17.5 20.5 H6.5 C5.4 20.5 4.5 19.6 4.5 18.5 Z"/>\n  <path d="M10 20.5 V15.2 C10 14.5 10.5 14 11.2 14 H12.8 C13.5 14 14 14.5 14 15.2 V20.5"/>',
    );
  if (name === "settings" || name === "wrench")
    return name === "settings"
      ? null // fall through to cog-like
      : wrap(
          '<path d="M16 5.5 C17.5 4 20 4.5 20.5 7 C18.5 7.5 17 9 16.5 11 L8.5 19 C7.5 20 5.5 20 4.5 19 C3.5 18 3.5 16 4.5 15 L12.5 7 C13.5 6 15 5.8 16 5.5 Z"/>',
        );

  if (name === "settings") {
    // 6-tooth mini cog
    return wrap(
      '<path d="M8.9 6.63 L10.15 3.7 L13.85 3.7 L15.1 6.63 L18.26 6.25 L20.11 9.46 L18.2 12 L20.11 14.54 L18.26 17.75 L15.1 17.37 L13.85 20.3 L10.15 20.3 L8.9 17.37 L5.74 17.75 L3.89 14.54 L5.8 12 L3.89 9.46 L5.74 6.25 Z"/>\n  <circle cx="12" cy="12" r="3.75"/>',
    );
  }

  if (name === "shopping-cart")
    return wrap(
      '<path d="M3.5 5 H6 L8.5 15.5 H17.5 L20 8 H8"/>\n  <circle cx="10" cy="19" r="1.5"/>\n  <circle cx="16.5" cy="19" r="1.5"/>',
    );
  if (name === "credit-card")
    return wrap(
      '<path d="M3.5 7.5 H20.5 C21.3 7.5 22 8.2 22 9 V17 C22 17.8 21.3 18.5 20.5 18.5 H3.5 C2.7 18.5 2 17.8 2 17 V9 C2 8.2 2.7 7.5 3.5 7.5 Z"/>\n  <path d="M2 11 H22"/>',
    );
  if (name === "tag")
    return wrap(
      '<path d="M4 4.5 H11 L19.5 13 L13 19.5 L4.5 11 V4.5 Z"/>\n  <circle cx="8" cy="8" r="1.2"/>',
    );
  if (name === "flag")
    return wrap(
      '<path d="M6 4 V20"/>\n  <path d="M6 5 H16.5 L14.5 9 L16.5 13 H6"/>',
    );
  if (name === "award" || name === "trophy")
    return wrap(
      '<path d="M8 5 H16 V10 C16 12.2 14.2 14 12 14 C9.8 14 8 12.2 8 10 Z"/>\n  <path d="M8 7 H5.5 C5.5 9 6.5 10.5 8 11"/>\n  <path d="M16 7 H18.5 C18.5 9 17.5 10.5 16 11"/>\n  <path d="M12 14 V17"/>\n  <path d="M9 20 H15 L13.5 17 H10.5 Z"/>',
    );

  // Deterministic geometric fallback — unique per name, still Structured Phi
  return fallbackGlyph(name, category);
}

function fallbackGlyph(name, category) {
  const h = hash(name);
  const variant = h % 7;
  const a = 4 + (h % 3);
  const b = 20 - (h % 3);

  if (category === "arrows" || variant === 0) {
    return wrap(
      `<path d="M${a} 12 H${b}"/>\n  <path d="M${b - 5} 7 L${b} 12 L${b - 5} 17"/>`,
    );
  }
  if (variant === 1) {
    return wrap(
      `<path d="M${a} ${a} H${b} V${b} H${a} Z"/>\n  <circle cx="12" cy="12" r="${3 + (h % 3)}"/>`,
    );
  }
  if (variant === 2) {
    return wrap(
      `<circle cx="12" cy="12" r="8"/>\n  <path d="M8 ${8 + (h % 4)} H16 M12 8 V16"/>`,
    );
  }
  if (variant === 3) {
    return wrap(
      `<path d="M6 ${6 + (h % 3)} H18 C19  ${6 + (h % 3)} 20 7 20 8.5 V16.5 C20 18 19 19 18 19 H6 C5 19 4 18 4 16.5 V8.5 C4 7 5 ${6 + (h % 3)} 6 ${6 + (h % 3)} Z"/>`,
    );
  }
  if (variant === 4) {
    return wrap(
      `<path d="M12 4 L19 9.5 V18.5 H5 V9.5 Z"/>\n  <path d="M10 18.5 V13 H14 V18.5"/>`,
    );
  }
  if (variant === 5) {
    return wrap(
      `<path d="M7 8 H17 V17 C17 18.5 15.5 19.5 14 19.5 H10 C8.5 19.5 7 18.5 7 17 Z"/>\n  <path d="M9 8 V6.5 C9 5.2 10.2 4.5 12 4.5 C13.8 4.5 15 5.2 15 6.5 V8"/>`,
    );
  }
  // triangle + bar
  return wrap(
    `<path d="M12 ${4.5 + (h % 2)} L19.5 18 H4.5 Z"/>\n  <path d="M12 10 V14"/>\n  <circle cx="12" cy="16.2" r="0.6"/>`,
  );
}

function composeOne(icon, { force, forceKeepers }) {
  const name = icon.name;
  const outFile = join(OUT, `${name}.svg`);
  if (KEEPERS.has(name) && !forceKeepers) {
    return { name, status: "kept" };
  }
  if (existsSync(outFile) && !force) {
    return { name, status: "skipped" };
  }
  const svg = composeFromName(name, icon.category || "misc");
  writeFileSync(outFile, svg);
  return { name, status: "wrote" };
}

function parseArgs(argv) {
  const opts = {
    batch: 250,
    force: false,
    forceKeepers: false,
    forceMissing: true,
    concurrency: Math.min(8, cpus().length || 4),
  };
  for (const a of argv) {
    if (a.startsWith("--batch=")) opts.batch = Number(a.slice(8));
    else if (a === "--force") opts.force = true;
    else if (a === "--force-keepers") opts.forceKeepers = true;
    else if (a === "--force-missing") opts.forceMissing = true;
    else if (a.startsWith("--concurrency="))
      opts.concurrency = Number(a.slice(14));
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const batchPath = join(ROOT, "drafts", `batch-${opts.batch}.json`);
  if (!existsSync(batchPath)) {
    console.error(`Missing ${batchPath}. Run: npm run select:batch -- --count=${opts.batch}`);
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });
  const batch = JSON.parse(readFileSync(batchPath, "utf8"));
  const icons = batch.icons;
  const force = opts.force;
  // force-missing: write only if absent (default)
  const writeOpts = {
    force: force,
    forceKeepers: opts.forceKeepers,
  };

  const chunks = [];
  const n = Math.max(1, opts.concurrency);
  const size = Math.ceil(icons.length / n);
  for (let i = 0; i < n; i++) {
    chunks.push(icons.slice(i * size, (i + 1) * size));
  }

  const results = [];
  await Promise.all(
    chunks.map(
      (chunk) =>
        new Promise((resolve, reject) => {
          const worker = new Worker(fileURLToPath(import.meta.url), {
            workerData: { chunk, writeOpts, outDir: OUT },
          });
          worker.on("message", (msg) => {
            results.push(...msg);
            resolve();
          });
          worker.on("error", reject);
        }),
    ),
  );

  const tallies = { wrote: 0, skipped: 0, kept: 0 };
  for (const r of results) tallies[r.status] = (tallies[r.status] || 0) + 1;
  console.log(
    `Compose batch-${opts.batch}: wrote=${tallies.wrote || 0} skipped=${tallies.skipped || 0} kept=${tallies.kept || 0}`,
  );
}

if (isMainThread) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else {
  const { chunk, writeOpts } = workerData;
  // Re-import compose in worker by duplicating call path — functions are in this file
  const results = chunk.map((icon) => composeOne(icon, writeOpts));
  parentPort.postMessage(results);
}
