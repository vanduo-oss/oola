# structured-phi Specification

## Purpose
Define the OOLA **Structured Phi** outline icon language: 24×24 grid, uniform 1.5px stroke, visibly soft ~2–3px corners, and golden-ratio element sizing. This is the hard style lock — drafts that fail these rules MUST NOT ship.

## Requirements

### Requirement: canvas-grid

Every OOLA outline icon MUST use a `24 × 24` px canvas with `viewBox="0 0 24 24"`, 2 px safe padding, and a 20 × 20 live area.

#### Scenario: viewBox present
- **GIVEN** a generated outline SVG
- **WHEN** it is inspected
- **THEN** it MUST include `viewBox="0 0 24 24"`
- **AND** geometry MUST stay within roughly 2–22 on both axes

### Requirement: stroke-and-shape-language

Outline icons MUST use a uniform **1.5 px** stroke, round line caps, round line joins, **~2–3 px** corner radius that reads as softened corners rather than hard miters, `fill="none"` (or equivalent), and `currentColor` for stroke/color. Straight lines MUST be straight; circles MUST be true circles. Roundness MUST live in corners and caps, not warped geometry.

#### Scenario: no organic distortion
- **GIVEN** an outline glyph
- **WHEN** compared to a geometric reference
- **THEN** it MUST NOT show hand-drawn wobble, wavy “watery” strokes, gradients, shadows, 3D, perspective, or decorative droplet ornaments

#### Scenario: corner signature
- **GIVEN** icons with roof peaks, box corners, or eaves (e.g. `house`)
- **WHEN** rendered at 24–48 px
- **THEN** apexes and box corners MUST use softened curves (not hard-mitered apexes)

### Requirement: phi-proportion-system

Multi-element icons MUST size primary/secondary/tertiary parts using φ ≈ 1.618 relative to the 20 px live area: primary ≈ 12.4 px, secondary ≈ 7.6 px, tertiary ≈ 4.7 px, badges 8 px, dots 2 px. Inner holes SHOULD be ≈ 0.618× their container.

#### Scenario: search magnifier sizes
- **GIVEN** the `search` icon (or `-search` modifier)
- **WHEN** lens and handle are measured
- **THEN** the lens (primary) SHOULD be ≈ 12.4 px diameter and the handle (tertiary) ≈ 4.7 px

### Requirement: complexity-and-legibility

Icons MUST remain legible at **16 px**. Gears/cogs MUST use **≤ 6 teeth**. Bell glyphs MUST show a flared bottom lip and a visible clapper — droplet-only bodies are forbidden.

#### Scenario: cog at 16px
- **GIVEN** `cog`
- **WHEN** rendered at 16 px
- **THEN** teeth MUST remain distinguishable (not fused into a ring)

#### Scenario: bell silhouette
- **GIVEN** `bell`
- **WHEN** inspected
- **THEN** it MUST include a flared lip and clapper, not a droplet-only body

### Requirement: modifier-system

Composite modifiers MUST follow fixed rules: badges (`-plus`, `-minus`, `-check`, `-x`, `-lock`, `-cog`, arrows) are 8 px, bottom-right, overlapping the base; slashes (`-off`, `-slash`) are a single 45° 1.5 px stroke top-left → bottom-right; `-search` uses the magnifier sizes above.

#### Scenario: badge placement
- **GIVEN** an icon name ending in a badge modifier
- **WHEN** the glyph is rendered
- **THEN** the badge MUST sit in the bottom-right and use the 8 px badge size

### Requirement: quality-checklist

Before accepting an icon into `drafts/`, it MUST pass machine QA (`npm run qa:icons`): parse as XML, omit `<text>` / `<image>` / rasters, keep uniform 1.5 px strokes with round caps/joins, respect the live area, and avoid full-canvas backdrop fills. Preview-only Fill weight MUST NOT blank open-path glyphs (fallback to Regular outline).

#### Scenario: reject invalid markup
- **GIVEN** an SVG containing `<text>` or an embedded raster
- **WHEN** QA runs
- **THEN** the icon MUST be rejected

#### Scenario: machine QA required
- **GIVEN** a new draft SVG
- **WHEN** it is added under `drafts/oola-structured-phi/`
- **THEN** `npm run qa:icons` MUST exit 0 for that file before the icon is considered accepted
