#!/usr/bin/env node
/**
 * Agent-author Structured Phi geometric icons for drafts/batch-100.json.
 * Skips hero lock (search/house/mail/layout-grid). Overwrites non-hero targets.
 *
 * Usage: node scripts/author-batch-100.mjs
 *        node scripts/author-batch-100.mjs --dry-run
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "drafts/oola-structured-phi/recraft-v4.1-pro-vector");
const HERO = new Set(["search", "house", "mail", "layout-grid"]);

const OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">';
const CLOSE = "</svg>";

function wrap(inner) {
  return `${OPEN}\n  ${inner.trim()}\n${CLOSE}\n`;
}

/** Icons better left to OpenRouter / later polish (organic metaphors). */
export const ORGANIC = new Set([
  "flame",
  "cake",
  "baby",
  "bug",
  "church",
  "beer",
  "backpack",
  "graduation-cap",
  "bus",
  "trophy",
  "award",
  "bandage",
  "scissors",
  "heart",
  "star",
  "bell",
  "cog",
  "user",
  "map-pin",
  "eye",
  "lock",
  "map",
  "book-open",
  "shield-alert",
  "chart-pie",
  "badge-check",
  "dollar-sign",
  "key",
  "briefcase-medical",
  "briefcase",
  "banknote",
  "zap",
  "sun",
  "cloud",
  "cloud-download",
  "cloud-upload",
  "share",
  "italic",
  "bold",
  "list-ordered",
  "messages-square",
  "message-circle",
  "message-square",
  "user-minus",
  "user-plus",
  "camera-off",
  "folder-open",
  "file-text",
  "square-pen",
  "at-sign",
  "calendar",
  "camera",
  "phone",
  "trash",
  "download",
  "folder",
  "battery-full",
  "battery-medium",
  "bookmark",
  "copy",
  "link",
  "fast-forward",
  "redo-2",
  "undo-2",
  "clock",
]);

const ICONS = {
  // —— primitives ——
  plus: wrap(`<path d="M12 5 V19"/>\n  <path d="M5 12 H19"/>`),
  minus: wrap(`<path d="M5 12 H19"/>`),
  x: wrap(`<path d="M6 6 L18 18"/>\n  <path d="M18 6 L6 18"/>`),
  check: wrap(`<path d="M5 12.5 L10 17.5 L19 6.5"/>`),
  menu: wrap(
    `<path d="M4 7 H20"/>\n  <path d="M4 12 H20"/>\n  <path d="M4 17 H20"/>`,
  ),
  equal: wrap(`<path d="M6 9 H18"/>\n  <path d="M6 15 H18"/>`),
  divide: wrap(
    `<circle cx="12" cy="7" r="1"/>\n  <path d="M6 12 H18"/>\n  <circle cx="12" cy="17" r="1"/>`,
  ),

  // —— arrows ——
  "arrow-left": wrap(
    `<path d="M19 12 H5"/>\n  <path d="M11 6 L5 12 L11 18"/>`,
  ),
  "arrow-right": wrap(
    `<path d="M5 12 H19"/>\n  <path d="M13 6 L19 12 L13 18"/>`,
  ),
  "arrow-up": wrap(
    `<path d="M12 19 V5"/>\n  <path d="M6 11 L12 5 L18 11"/>`,
  ),
  "arrow-down": wrap(
    `<path d="M12 5 V19"/>\n  <path d="M6 13 L12 19 L18 13"/>`,
  ),
  "arrow-up-right": wrap(
    `<path d="M7 17 L17 7"/>\n  <path d="M9 7 H17 V15"/>`,
  ),
  "arrow-up-left": wrap(
    `<path d="M17 17 L7 7"/>\n  <path d="M7 15 V7 H15"/>`,
  ),
  "arrow-down-right": wrap(
    `<path d="M7 7 L17 17"/>\n  <path d="M9 17 H17 V9"/>`,
  ),
  "arrow-down-left": wrap(
    `<path d="M17 7 L7 17"/>\n  <path d="M7 9 V17 H15"/>`,
  ),

  // —— chevrons ——
  "chevron-down": wrap(`<path d="M6 9 L12 15 L18 9"/>`),
  "chevron-up": wrap(`<path d="M6 15 L12 9 L18 15"/>`),
  "chevron-left": wrap(`<path d="M15 6 L9 12 L15 18"/>`),
  "chevron-right": wrap(`<path d="M9 6 L15 12 L9 18"/>`),
  "chevrons-down": wrap(
    `<path d="M7 9 L12 14 L17 9"/>\n  <path d="M7 13 L12 18 L17 13"/>`,
  ),
  "chevrons-left": wrap(
    `<path d="M15 7 L10 12 L15 17"/>\n  <path d="M11 7 L6 12 L11 17"/>`,
  ),
  "chevrons-up-down": wrap(
    `<path d="M7 9 L12 4 L17 9"/>\n  <path d="M7 15 L12 20 L17 15"/>`,
  ),

  // —— circle badges ——
  "circle-check": wrap(
    `<circle cx="12" cy="12" r="8"/>\n  <path d="M8 12.2 L10.8 15 L16.5 9"/>`,
  ),
  "circle-plus": wrap(
    `<circle cx="12" cy="12" r="8"/>\n  <path d="M12 8 V16"/>\n  <path d="M8 12 H16"/>`,
  ),
  "circle-pause": wrap(
    `<circle cx="12" cy="12" r="8"/>\n  <path d="M9.5 8.5 V15.5"/>\n  <path d="M14.5 8.5 V15.5"/>`,
  ),
  "circle-play": wrap(
    `<circle cx="12" cy="12" r="8"/>\n  <path d="M10 8.5 L16 12 L10 15.5 Z"/>`,
  ),
  "circle-stop": wrap(
    `<circle cx="12" cy="12" r="8"/>\n  <rect x="9" y="9" width="6" height="6" rx="1"/>`,
  ),
  "circle-ellipsis": wrap(
    `<circle cx="12" cy="12" r="8"/>\n  <circle cx="8" cy="12" r="1"/>\n  <circle cx="12" cy="12" r="1"/>\n  <circle cx="16" cy="12" r="1"/>`,
  ),
  "circle-question-mark": wrap(
    `<circle cx="12" cy="12" r="8"/>\n  <path d="M9.5 9.2 C9.5 7.6 10.6 6.5 12 6.5 C13.4 6.5 14.5 7.5 14.5 8.8 C14.5 10.2 13.2 10.8 12 11.8 V13"/>\n  <circle cx="12" cy="16" r="0.7"/>`,
  ),
  ban: wrap(
    `<circle cx="12" cy="12" r="8"/>\n  <path d="M6.5 6.5 L17.5 17.5"/>`,
  ),

  // —— audited gold / high-traffic UI (agent restyle) ——
  user: wrap(
    `<circle cx="12" cy="8" r="3.5"/>\n  <path d="M5.5 19.5 C5.5 15.6 8.2 13 12 13 C15.8 13 18.5 15.6 18.5 19.5"/>`,
  ),
  cog: wrap(
    `<path d="M8.9 6.63 L10.15 3.7 L13.85 3.7 L15.1 6.63 L18.26 6.25 L20.11 9.46 L18.2 12 L20.11 14.54 L18.26 17.75 L15.1 17.37 L13.85 20.3 L10.15 20.3 L8.9 17.37 L5.74 17.75 L3.89 14.54 L5.8 12 L3.89 9.46 L5.74 6.25 Z"/>\n  <circle cx="12" cy="12" r="3.75"/>`,
  ),
  heart: wrap(
    `<path d="M12 20 S3.5 14.2 3.5 9 C3.5 6.2 5.6 4.2 8.2 4.5 C9.6 4.7 10.8 5.6 12 7 C13.2 5.6 14.4 4.7 15.8 4.5 C18.4 4.2 20.5 6.2 20.5 9 C20.5 14.2 12 20 12 20 Z"/>`,
  ),
  star: wrap(
    `<path d="M12 3.5 L14.4 9.2 L20.5 9.7 L15.9 13.8 L17.3 19.8 L12 16.7 L6.7 19.8 L8.1 13.8 L3.5 9.7 L9.6 9.2 Z"/>`,
  ),
  trash: wrap(
    `<path d="M5 8.5 H19"/>\n  <path d="M9.5 4.5 H14.5"/>\n  <path d="M7.5 8.5 V18 C7.5 19.1 8.4 20 9.5 20 H14.5 C15.6 20 16.5 19.1 16.5 18 V8.5"/>\n  <path d="M10.5 11.5 V16.5 M13.5 11.5 V16.5"/>`,
  ),
  bell: wrap(
    `<path d="M6 16 C6 16 5.2 13.2 5.2 10.5 C5.2 6.8 8.1 4 12 4 C15.9 4 18.8 6.8 18.8 10.5 C18.8 13.2 18 16 18 16 L19.5 17.5 H4.5 Z"/>\n  <path d="M10.5 17.5 C10.5 18.9 11.2 20 12 20 C12.8 20 13.5 18.9 13.5 17.5"/>`,
  ),
  eye: wrap(
    `<path d="M2.5 12 C4.5 7.5 8 5 12 5 C16 5 19.5 7.5 21.5 12 C19.5 16.5 16 19 12 19 C8 19 4.5 16.5 2.5 12 Z"/>\n  <circle cx="12" cy="12" r="3"/>`,
  ),
  lock: wrap(
    `<path d="M7 11 H17 C18.1 11 19 11.9 19 13 V19 C19 20.1 18.1 21 17 21 H7 C5.9 21 5 20.1 5 19 V13 C5 11.9 5.9 11 7 11 Z"/>\n  <path d="M8 11 V8 C8 5.8 9.8 4 12 4 C14.2 4 16 5.8 16 8 V11"/>`,
  ),
  calendar: wrap(
    `<path d="M4.5 6.5 H19.5 C20.6 6.5 21.5 7.4 21.5 8.5 V19.5 C21.5 20.6 20.6 21.5 19.5 21.5 H4.5 C3.4 21.5 2.5 20.6 2.5 19.5 V8.5 C2.5 7.4 3.4 6.5 4.5 6.5 Z"/>\n  <path d="M2.5 10.5 H21.5"/>\n  <path d="M8 3.5 V7"/>\n  <path d="M16 3.5 V7"/>`,
  ),
  camera: wrap(
    `<path d="M3.5 8.5 H7 L8.5 6 H15.5 L17 8.5 H20.5 C21.6 8.5 22.5 9.4 22.5 10.5 V18.5 C22.5 19.6 21.6 20.5 20.5 20.5 H3.5 C2.4 20.5 1.5 19.6 1.5 18.5 V10.5 C1.5 9.4 2.4 8.5 3.5 8.5 Z"/>\n  <circle cx="12" cy="14" r="3.5"/>`,
  ),
  "map-pin": wrap(
    `<path d="M12 21 C12 21 5 14.5 5 10 C5 6.1 8.1 3 12 3 C15.9 3 19 6.1 19 10 C19 14.5 12 21 12 21 Z"/>\n  <circle cx="12" cy="10" r="2.5"/>`,
  ),
  phone: wrap(
    `<path d="M7 3.5 H9.4 C10.2 3.5 10.8 4.2 10.6 5 L10 8.1 C9.9 8.7 9.4 9.1 8.8 9.3 L7.2 9.9 C8.5 12.6 11.4 15.5 14.1 16.8 L14.7 15.2 C14.9 14.6 15.3 14.1 15.9 14 L19 13.4 C19.8 13.2 20.5 13.8 20.5 14.6 V17 C20.5 18.9 18.9 20.4 17 20 C10.6 18.8 5.2 13.4 4 7 C3.6 5.1 5.1 3.5 7 3.5 Z"/>`,
  ),
  download: wrap(
    `<path d="M12 4 V14"/>\n  <path d="M7.5 10 L12 14.5 L16.5 10"/>\n  <path d="M5 18.5 H19"/>`,
  ),
  folder: wrap(
    `<path d="M3 19.5 V8 C3 6.9 3.9 6 5 6 H9.5 L11.5 8 H19 C20.1 8 21 8.9 21 10 V19.5 C21 20.6 20.1 21.5 19 21.5 H5 C3.9 21.5 3 20.6 3 19.5 Z"/>`,
  ),
  "folder-open": wrap(
    `<path d="M3 19.5 V8 C3 6.9 3.9 6 5 6 H9.5 L11.5 8 H19 C20.1 8 21 8.9 21 10 V12"/>\n  <path d="M3 19.5 L5.5 12.5 H21.5 L19 19.5 H3 Z"/>`,
  ),
  file: wrap(
    `<path d="M7 3.5 H13 L18.5 9 V19.5 C18.5 20.3 17.8 21 17 21 H7 C6.2 21 5.5 20.3 5.5 19.5 V5 C5.5 4.2 6.2 3.5 7 3.5 Z"/>\n  <path d="M13 3.5 V9 H18.5"/>`,
  ),
  "file-text": wrap(
    `<path d="M7 3.5 H13 L18.5 9 V19.5 C18.5 20.3 17.8 21 17 21 H7 C6.2 21 5.5 20.3 5.5 19.5 V5 C5.5 4.2 6.2 3.5 7 3.5 Z"/>\n  <path d="M13 3.5 V9 H18.5"/>\n  <path d="M8.5 13 H15.5 M8.5 16.5 H13.5"/>`,
  ),
  "battery-full": wrap(
    `<path d="M3.5 8.5 H17.5 C18.6 8.5 19.5 9.4 19.5 10.5 V15.5 C19.5 16.6 18.6 17.5 17.5 17.5 H3.5 C2.4 17.5 1.5 16.6 1.5 15.5 V10.5 C1.5 9.4 2.4 8.5 3.5 8.5 Z"/>\n  <path d="M19.5 11.5 H21.5 V14.5 H19.5"/>\n  <path d="M5 10.8 H16 V15.2 H5 Z"/>`,
  ),
  "battery-medium": wrap(
    `<path d="M3.5 8.5 H17.5 C18.6 8.5 19.5 9.4 19.5 10.5 V15.5 C19.5 16.6 18.6 17.5 17.5 17.5 H3.5 C2.4 17.5 1.5 16.6 1.5 15.5 V10.5 C1.5 9.4 2.4 8.5 3.5 8.5 Z"/>\n  <path d="M19.5 11.5 H21.5 V14.5 H19.5"/>\n  <path d="M5 10.8 H11 V15.2 H5 Z"/>`,
  ),
  cloud: wrap(
    `<path d="M7.5 17.5 H17 C19.2 17.5 21 15.7 21 13.5 C21 11.5 19.5 9.9 17.6 9.6 C16.9 7.2 14.7 5.5 12 5.5 C9 5.5 6.5 7.6 6.1 10.5 C4.2 10.9 3 12.5 3 14.3 C3 16.1 4.4 17.5 6.2 17.5 H7.5"/>`,
  ),
  "cloud-download": wrap(
    `<path d="M7.5 15.5 H16.5 C18.4 15.5 20 13.9 20 12 C20 10.3 18.8 8.9 17.2 8.6 C16.6 6.6 14.7 5.2 12.4 5.2 C9.9 5.2 7.8 6.9 7.3 9.3 C5.7 9.6 4.5 11 4.5 12.7 C4.5 14.4 5.8 15.5 7.5 15.5 Z"/>\n  <path d="M12 11 V19"/>\n  <path d="M9 16.5 L12 19.5 L15 16.5"/>`,
  ),
  "cloud-upload": wrap(
    `<path d="M7.5 15.5 H16.5 C18.4 15.5 20 13.9 20 12 C20 10.3 18.8 8.9 17.2 8.6 C16.6 6.6 14.7 5.2 12.4 5.2 C9.9 5.2 7.8 6.9 7.3 9.3 C5.7 9.6 4.5 11 4.5 12.7 C4.5 14.4 5.8 15.5 7.5 15.5 Z"/>\n  <path d="M12 19 V11"/>\n  <path d="M9 13.5 L12 10.5 L15 13.5"/>`,
  ),
  sun: wrap(
    `<circle cx="12" cy="12" r="3.5"/>\n  <path d="M12 3.5 V5.5 M12 18.5 V20.5 M3.5 12 H5.5 M18.5 12 H20.5 M6 6 L7.4 7.4 M16.6 16.6 L18 18 M18 6 L16.6 7.4 M7.4 16.6 L6 18"/>`,
  ),
  zap: wrap(
    `<path d="M13 3 L5.5 13.5 H11.5 L11 21 L18.5 10.5 H12.5 Z"/>`,
  ),
  clock: wrap(
    `<circle cx="12" cy="12" r="8"/>\n  <path d="M12 8 V12.5 L15.5 15"/>`,
  ),
  key: wrap(
    `<circle cx="8.5" cy="12" r="3.5"/>\n  <path d="M11.5 12 H20 V15"/>\n  <path d="M16.5 12 V14.5"/>`,
  ),
  ban: wrap(
    `<circle cx="12" cy="12" r="8"/>\n  <path d="M6.5 6.5 L17.5 17.5"/>`,
  ),
  share: wrap(
    `<circle cx="7" cy="12" r="2.5"/>\n  <circle cx="17" cy="7" r="2.5"/>\n  <circle cx="17" cy="17" r="2.5"/>\n  <path d="M9.2 11 L14.8 8.2"/>\n  <path d="M9.2 13 L14.8 15.8"/>`,
  ),
  bookmark: wrap(
    `<path d="M7 4.5 H17 C17.8 4.5 18.5 5.2 18.5 6 V20 L12 15.5 L5.5 20 V6 C5.5 5.2 6.2 4.5 7 4.5 Z"/>`,
  ),
  copy: wrap(
    `<path d="M9 9 H18.5 C19.3 9 20 9.7 20 10.5 V19.5 C20 20.3 19.3 21 18.5 21 H9 C8.2 21 7.5 20.3 7.5 19.5 V10.5 C7.5 9.7 8.2 9 9 9 Z"/>\n  <path d="M5.5 15 V5.5 C5.5 4.7 6.2 4 7 4 H15"/>`,
  ),
  link: wrap(
    `<path d="M10 14 L8.5 15.5 C7.1 16.9 7.1 19.1 8.5 20.5 C9.9 21.9 12.1 21.9 13.5 20.5 L15 19"/>\n  <path d="M14 10 L15.5 8.5 C16.9 7.1 19.1 7.1 20.5 8.5 C21.9 9.9 21.9 12.1 20.5 13.5 L19 15"/>\n  <path d="M9.5 14.5 L14.5 9.5"/>`,
  ),
  "at-sign": wrap(
    `<circle cx="12" cy="12" r="3.2"/>\n  <path d="M15.2 12 V14.2 C15.2 16 16.4 17.2 18.2 16.6 C20.2 15.8 21.5 13.6 21 11 C20.3 7 16.6 4 12.2 4 C7.2 4 3.5 8 4.2 13 C4.8 16.8 8.2 19.5 12 19.5"/>`,
  ),
  "message-circle": wrap(
    `<path d="M12 3.5 C7.3 3.5 3.5 7 3.5 11.2 C3.5 13.4 4.5 15.3 6.1 16.6 L5 20.5 L9.2 18.8 C10.1 19.1 11 19.2 12 19.2 C16.7 19.2 20.5 15.7 20.5 11.5 C20.5 7.3 16.7 3.5 12 3.5 Z"/>`,
  ),
  "message-square": wrap(
    `<path d="M5 4.5 H19 C20.1 4.5 21 5.4 21 6.5 V14.5 C21 15.6 20.1 16.5 19 16.5 H10 L5.5 20.5 V16.5 H5 C3.9 16.5 3 15.6 3 14.5 V6.5 C3 5.4 3.9 4.5 5 4.5 Z"/>`,
  ),
  "messages-square": wrap(
    `<path d="M7 5.5 H18 C19.1 5.5 20 6.4 20 7.5 V13 C20 14.1 19.1 15 18 15 H12 L8.5 17.5 V15 H7 C5.9 15 5 14.1 5 13 V7.5 C5 6.4 5.9 5.5 7 5.5 Z"/>\n  <path d="M5 10 V16.5 C5 17.6 5.9 18.5 7 18.5 H8.5 V20.5 L12 18.5 H16"/>`,
  ),
  "user-plus": wrap(
    `<circle cx="10" cy="8" r="3.2"/>\n  <path d="M3.5 19.5 C3.5 15.9 6 13.5 10 13.5 C14 13.5 16.5 15.9 16.5 19.5"/>\n  <path d="M18 8 V14 M15 11 H21"/>`,
  ),
  "user-minus": wrap(
    `<circle cx="10" cy="8" r="3.2"/>\n  <path d="M3.5 19.5 C3.5 15.9 6 13.5 10 13.5 C14 13.5 16.5 15.9 16.5 19.5"/>\n  <path d="M15 11 H21"/>`,
  ),
  "camera-off": wrap(
    `<path d="M3.5 8.5 H7 L8.5 6 H13"/>\n  <path d="M17 8.5 H20.5 C21.6 8.5 22.5 9.4 22.5 10.5 V18.5 C22.5 19.6 21.6 20.5 20.5 20.5 H8"/>\n  <path d="M9.5 14 C9.8 12.2 11.2 11 12.8 11"/>\n  <path d="M4 4 L20 20"/>`,
  ),
  "square-pen": wrap(
    `<path d="M4.5 4.5 H14.5 L19.5 9.5 V19.5 C19.5 20.6 18.6 21.5 17.5 21.5 H4.5 C3.4 21.5 2.5 20.6 2.5 19.5 V6.5 C2.5 5.4 3.4 4.5 4.5 4.5 Z"/>\n  <path d="M14.5 4.5 V9.5 H19.5"/>\n  <path d="M8 17.5 L16 9.5 L18 11.5 L10 19.5 H8 Z"/>`,
  ),
  "book-open": wrap(
    `<path d="M12 6 C10 4.5 7.5 4 5 4.5 V18 C7.5 17.5 10 18 12 19.5"/>\n  <path d="M12 6 C14 4.5 16.5 4 19 4.5 V18 C16.5 17.5 14 18 12 19.5"/>`,
  ),
  map: wrap(
    `<path d="M3.5 6.5 L9 4.5 L15 7 L20.5 5 V17.5 L15 19.5 L9 17 L3.5 19 Z"/>\n  <path d="M9 4.5 V17 M15 7 V19.5"/>`,
  ),
  "shield-alert": wrap(
    `<path d="M12 3.5 L19.5 6.5 V12 C19.5 16.2 16.2 19.5 12 20.5 C7.8 19.5 4.5 16.2 4.5 12 V6.5 Z"/>\n  <path d="M12 9 V13"/>\n  <circle cx="12" cy="16" r="0.7"/>`,
  ),
  "chart-pie": wrap(
    `<path d="M12 3.5 A8.5 8.5 0 1 0 20.5 12 H12 Z"/>\n  <path d="M12 3.5 V12 H20.5"/>`,
  ),
  "badge-check": wrap(
    `<path d="M12 3.5 L14.2 5.2 L16.9 4.8 L17.8 7.4 L20.3 8.6 L19.2 11.2 L20.3 13.8 L17.8 15 L16.9 17.6 L14.2 17.2 L12 19 L9.8 17.2 L7.1 17.6 L6.2 15 L3.7 13.8 L4.8 11.2 L3.7 8.6 L6.2 7.4 L7.1 4.8 L9.8 5.2 Z"/>\n  <path d="M8.5 11.5 L11 14 L15.5 9"/>`,
  ),
  "dollar-sign": wrap(
    `<path d="M12 3.5 V20.5"/>\n  <path d="M15.5 7.5 C15.5 5.8 14 4.5 12 4.5 C9.8 4.5 8 5.7 8 7.5 C8 9.5 9.5 10.2 12 11 C14.5 11.8 16 12.8 16 15 C16 17.2 14.2 18.5 12 18.5 C9.6 18.5 8 17.2 8 15.5"/>`,
  ),
  briefcase: wrap(
    `<path d="M4 8.5 H20 C21.1 8.5 22 9.4 22 10.5 V18.5 C22 19.6 21.1 20.5 20 20.5 H4 C2.9 20.5 2 19.6 2 18.5 V10.5 C2 9.4 2.9 8.5 4 8.5 Z"/>\n  <path d="M8 8.5 V6.5 C8 5.4 8.9 4.5 10 4.5 H14 C15.1 4.5 16 5.4 16 6.5 V8.5"/>\n  <path d="M2 13.5 H22"/>`,
  ),
  "briefcase-medical": wrap(
    `<path d="M4 8.5 H20 C21.1 8.5 22 9.4 22 10.5 V18.5 C22 19.6 21.1 20.5 20 20.5 H4 C2.9 20.5 2 19.6 2 18.5 V10.5 C2 9.4 2.9 8.5 4 8.5 Z"/>\n  <path d="M8 8.5 V6.5 C8 5.4 8.9 4.5 10 4.5 H14 C15.1 4.5 16 5.4 16 6.5 V8.5"/>\n  <path d="M12 12.5 V17 M9.5 14.75 H14.5"/>`,
  ),
  banknote: wrap(
    `<path d="M3.5 7.5 H20.5 C21.3 7.5 22 8.2 22 9 V17 C22 17.8 21.3 18.5 20.5 18.5 H3.5 C2.7 18.5 2 17.8 2 17 V9 C2 8.2 2.7 7.5 3.5 7.5 Z"/>\n  <circle cx="12" cy="12.5" r="2.2"/>\n  <path d="M5.5 10 V15 M18.5 10 V15"/>`,
  ),
  bold: wrap(
    `<path d="M7 5 H12.5 C14.7 5 16.5 6.6 16.5 8.7 C16.5 10.2 15.6 11.4 14.2 11.9 C16 12.3 17.3 13.7 17.3 15.6 C17.3 18 15.3 19.5 12.8 19.5 H7 Z"/>\n  <path d="M10 5 V19.5 M10 11.5 H14"/>`,
  ),
  italic: wrap(
    `<path d="M14 5 H19"/>\n  <path d="M5 19 H10"/>\n  <path d="M15.5 5 L8.5 19"/>`,
  ),
  "list-ordered": wrap(
    `<path d="M10 7 H20 M10 12 H20 M10 17 H20"/>\n  <path d="M4.5 5.5 V9.5 M4.5 5.5 H6.5 M4 12 H6.5 V14.5 H4 M4 17 H6.5 C6.5 18.2 5.7 18.8 4.8 18.8"/>`,
  ),
  "fast-forward": wrap(
    `<path d="M5 7 L12 12 L5 17 Z"/>\n  <path d="M12 7 L19 12 L12 17 Z"/>`,
  ),
  "redo-2": wrap(
    `<path d="M15 3.3 L20 7.8 L15 12.3"/>\n  <path fill-opacity="0" d="M20 7.8 H10.5 C7.08 7.8 4.3 10.58 4.3 14 C4.3 17.42 7.08 20.2 10.5 20.2 H14"/>`,
  ),
  "undo-2": wrap(
    `<path d="M9 3.3 L4 7.8 L9 12.3"/>\n  <path fill-opacity="0" d="M4 7.8 H13.5 C16.92 7.8 19.7 10.58 19.7 14 C19.7 17.42 16.92 20.2 13.5 20.2 H10"/>`,
  ),
  scissors: wrap(
    `<circle cx="7" cy="7" r="2.5"/>\n  <circle cx="7" cy="17" r="2.5"/>\n  <path d="M9 8.5 L19 17"/>\n  <path d="M9 15.5 L19 7"/>`,
  ),
  trophy: wrap(
    `<path d="M8 5 H16 V10 C16 12.2 14.2 14 12 14 C9.8 14 8 12.2 8 10 Z"/>\n  <path d="M8 7 H5.5 C5.5 9 6.5 10.5 8 11"/>\n  <path d="M16 7 H18.5 C18.5 9 17.5 10.5 16 11"/>\n  <path d="M12 14 V17"/>\n  <path d="M9 20 H15 L13.5 17 H10.5 Z"/>`,
  ),
  award: wrap(
    `<circle cx="12" cy="9" r="5.5"/>\n  <path d="M9 13.5 L8 20.5 L12 18 L16 20.5 L15 13.5"/>`,
  ),
};

function main() {
  const dry = process.argv.includes("--dry-run");
  const onlyOrganic = process.argv.includes("--list-organic");
  const batch = JSON.parse(readFileSync(join(ROOT, "drafts/batch-100.json"), "utf8"));
  const names = batch.icons.map((i) => i.name);

  if (onlyOrganic) {
    const organic = names.filter((n) => !HERO.has(n) && !ICONS[n]);
    console.log(organic.join("\n"));
    console.log(`# organic count: ${organic.length}`);
    return;
  }

  mkdirSync(OUT, { recursive: true });
  let wrote = 0;
  let skippedHero = 0;
  let deferred = 0;

  for (const name of names) {
    if (HERO.has(name)) {
      skippedHero++;
      continue;
    }
    const svg = ICONS[name];
    if (!svg) {
      deferred++;
      continue;
    }
    const path = join(OUT, `${name}.svg`);
    if (dry) {
      console.log(`would write ${name}`);
      wrote++;
      continue;
    }
    writeFileSync(path, svg);
    wrote++;
  }

  console.log(
    JSON.stringify({ wrote, skippedHero, deferred, dry }, null, 2),
  );
}

main();
