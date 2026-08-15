## ADDED Requirements

### Requirement: canvas-grid

Every OOLA outline icon MUST use a `24 × 24` px canvas with `viewBox="0 0 24 24"`, 2 px safe padding, and a 20 × 20 live area.

#### Scenario: viewBox present
- **GIVEN** a generated outline SVG
- **WHEN** it is inspected
- **THEN** it MUST include `viewBox="0 0 24 24"`

### Requirement: stroke-and-shape-language

Outline icons MUST use uniform 2 px stroke, round caps/joins, 2 px corner radius, no fill, `currentColor`, and true geometric lines/circles.

#### Scenario: no organic distortion
- **GIVEN** an outline glyph
- **WHEN** inspected
- **THEN** it MUST NOT use wavy strokes, gradients, shadows, or droplet ornaments

### Requirement: phi-proportion-system

Multi-element icons MUST follow φ sizing (primary ≈12.4, secondary ≈7.6, tertiary ≈4.7, badge 8, dot 2).

#### Scenario: search magnifier sizes
- **GIVEN** `search`
- **WHEN** measured
- **THEN** lens ≈7.6 px and handle ≈4.7 px

### Requirement: modifier-system

Badges MUST be 8 px bottom-right; slashes MUST be 45° 2 px; `-search` MUST use magnifier phi sizes.

#### Scenario: badge placement
- **GIVEN** a badge modifier icon
- **WHEN** rendered
- **THEN** the badge MUST sit bottom-right at 8 px

### Requirement: quality-checklist

Icons MUST parse as XML, omit text/image/rasters, keep 2 px strokes, respect live area, and remain legible at 16 px.

#### Scenario: reject invalid markup
- **GIVEN** SVG with `<text>` or raster
- **WHEN** QA runs
- **THEN** the icon MUST be rejected
