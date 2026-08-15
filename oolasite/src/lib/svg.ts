/**
 * Normalize draft SVGs so paint uses `currentColor`.
 * Also strips Recraft full-canvas backdrop fills that would become solid squares.
 */
export function toCurrentColorSvg(raw: string): string {
  let svg = raw.trim();

  // Drop C2PA / other metadata blobs.
  svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");

  // Recraft often paints a full-canvas white rect; strip it before recolor.
  svg = svg.replace(
    /<path\b[^>]*\bd="\s*M\s*0(?:\.0+)?\s+0(?:\.0+)?\s+L\s+2048(?:\.0+)?\s+0(?:\.0+)?\s+L\s+2048(?:\.0+)?\s+2048(?:\.0+)?\s+L\s+0(?:\.0+)?\s+2048(?:\.0+)?\s+L\s+0(?:\.0+)?\s+0(?:\.0+)?\s*z?\s*"[^>]*\/?>/gi,
    "",
  );
  svg = svg.replace(
    /<path\b[^>]*fill="(?:rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|#fff(?:fff)?|white)"[^>]*\bd="[^"]*M\s*0[^"]*2048[^"]*"[^>]*\/?>/gi,
    "",
  );
  svg = svg.replace(
    /<rect\b[^>]*(?:width="2048"|height="2048")[^>]*\/?>/gi,
    "",
  );

  // Prefer a square viewBox; drop fixed pixel width/height so CSS sizes them.
  svg = svg.replace(/\s(width|height)="[^"]*"/gi, "");
  svg = svg.replace(/\spreserveAspectRatio="[^"]*"/gi, "");
  if (!/\spreserveAspectRatio=/i.test(svg)) {
    svg = svg.replace(
      /<svg\b([^>]*)>/i,
      '<svg$1 preserveAspectRatio="xMidYMid meet">',
    );
  }

  const recolor = (attr: "fill" | "stroke", value: string): string => {
    const v = value.trim().toLowerCase();
    if (!v || v === "none" || v === "currentcolor" || v.startsWith("url(")) {
      return `${attr}="${value}"`;
    }
    return `${attr}="currentColor"`;
  };

  svg = svg.replace(
    /\bfill="([^"]*)"/gi,
    (_m, value: string) => recolor("fill", value),
  );
  svg = svg.replace(
    /\bstroke="([^"]*)"/gi,
    (_m, value: string) => recolor("stroke", value),
  );

  svg = svg.replace(/style="([^"]*)"/gi, (_m, style: string) => {
    const next = style
      .replace(
        /(fill|stroke)\s*:\s*(?!none\b)(?!currentColor\b)(?!url\()[^;]+/gi,
        "$1: currentColor",
      )
      .trim();
    return next ? `style="${next}"` : "";
  });

  return svg;
}

export type WeightApplyOptions = {
  strokeWidth: number;
  fill: boolean;
  duotone: boolean;
};

/** True if SVG has a closed shape Fill can paint (circle/rect/ellipse/polygon or path with Z). */
export function hasClosedFillRegion(raw: string): boolean {
  const svg = toCurrentColorSvg(raw);
  if (/<(circle|ellipse|rect|polygon)\b/i.test(svg)) return true;
  const paths = [...svg.matchAll(/<path\b[^>]*\bd="([^"]*)"/gi)];
  return paths.some((m) => /[Zz]\s*$|[Zz]\s+/m.test(m[1]) || /[Zz]/.test(m[1]));
}

/**
 * Preview-only weight transforms on a normalized SVG string.
 * Does not write new asset files — used by the weights strip.
 * Fill on open-path-only glyphs falls back to Regular stroke (no blank cells).
 */
export function applyWeightSvg(
  raw: string,
  weight: WeightApplyOptions,
): string {
  let svg = toCurrentColorSvg(raw);

  const setRootAttr = (name: string, value: string) => {
    if (new RegExp(`\\s${name}=`, "i").test(svg)) {
      svg = svg.replace(
        new RegExp(`\\s${name}="[^"]*"`, "i"),
        ` ${name}="${value}"`,
      );
    } else {
      svg = svg.replace(/<svg\b/i, `<svg ${name}="${value}"`);
    }
  };

  if (weight.fill) {
    if (!hasClosedFillRegion(raw)) {
      // Open strokes (plus, minus, x, menu, …): keep Regular outline so Fill isn't blank.
      setRootAttr("fill", "none");
      setRootAttr("stroke", "currentColor");
      setRootAttr("stroke-width", String(weight.strokeWidth));
      return svg;
    }
    setRootAttr("fill", "currentColor");
    setRootAttr("stroke", "none");
    // Ensure child strokes don't outline a filled glyph oddly.
    svg = svg.replace(/\bstroke="[^"]*"/gi, 'stroke="none"');
    svg = svg.replace(/\bfill="none"/gi, 'fill="currentColor"');
    return svg;
  }

  setRootAttr("fill", "none");
  setRootAttr("stroke", "currentColor");
  setRootAttr("stroke-width", String(weight.strokeWidth));
  // Normalize any explicit stroke-width on children to the weight.
  svg = svg.replace(
    /\bstroke-width="[^"]*"/gi,
    `stroke-width="${weight.strokeWidth}"`,
  );

  if (!weight.duotone) return svg;

  // Duotone: clone inner shapes as a light fill layer behind the outline.
  const inner = svg.match(/<svg\b[^>]*>([\s\S]*)<\/svg>/i)?.[1] ?? "";
  const filledLayer = inner
    .replace(/\bfill="[^"]*"/gi, 'fill="currentColor"')
    .replace(/\bstroke="[^"]*"/gi, 'stroke="none"')
    .replace(
      /<(path|circle|rect|polygon|polyline)\b(?![^>]*\bfill=)/gi,
      '<$1 fill="currentColor"',
    );

  const outlineLayer = inner;
  return svg.replace(
    /(<svg\b[^>]*>)[\s\S]*(<\/svg>)/i,
    `$1<g fill="currentColor" stroke="none" opacity="0.2">${filledLayer}</g><g fill="none" stroke="currentColor" stroke-width="${weight.strokeWidth}">${outlineLayer}</g>$2`,
  );
}
