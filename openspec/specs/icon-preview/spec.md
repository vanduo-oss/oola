# icon-preview Specification

## Purpose
VD3-based local preview for Structured Phi drafts at smoke and scale (250–1000+), with keeper badges, weight columns, and theme-aware color.

## Requirements

### Requirement: weight-grid

The preview MUST show icons in a table with six weight columns (Regular, Fill, Bold, Light, Thin, Duotone) derived from preview-only transforms of the Regular SVG.

#### Scenario: six weight columns
- **GIVEN** the drafts preview page
- **WHEN** the comparison table renders
- **THEN** there MUST be exactly six weight columns with OOLA tokens

### Requirement: scale-pagination

When the catalog exceeds 50 icons, the drafts grid MUST paginate (default page size 50) or otherwise avoid rendering the full set at once.

#### Scenario: page size
- **GIVEN** a catalog of 250 icons
- **WHEN** the drafts section loads
- **THEN** at most one page of rows (default 50) MUST render initially

### Requirement: lazy-svg-load

Draft SVG modules MUST load lazily (non-eager glob or equivalent) so adding files does not require loading every SVG string at boot.

#### Scenario: missing icon
- **GIVEN** a catalog name without a file
- **WHEN** a cell renders
- **THEN** a missing placeholder MAY show without crashing the page

### Requirement: keeper-badges

Keeper icons (`mail`, `house`, `search`) MUST be visually marked in the grid.

#### Scenario: keeper label
- **GIVEN** the icon row for `mail`
- **WHEN** rendered
- **THEN** a keeper badge MUST appear next to the name

### Requirement: theme-aware-icon-color

Icons MUST render with `currentColor`. While the theme primary is the default, icons MUST appear pure black (`#000`) in both light and dark modes. After the user picks a custom primary in the theme customizer, icons MUST use `var(--vd-color-primary)`.

#### Scenario: custom primary recolors icons
- **GIVEN** the preview with default primary (icons black)
- **WHEN** the user selects a non-default primary
- **THEN** draft icons MUST change to the primary color token

### Requirement: fill-open-path-fallback

Preview Fill weight MUST NOT render blank cells for open-path glyphs; it MUST fall back to the Regular outline (optionally muted).

#### Scenario: plus fill
- **GIVEN** icon `plus` in the Fill column
- **WHEN** rendered
- **THEN** a visible outline MUST appear (not an empty cell)

### Requirement: vd3-shell

The preview MUST keep a glass navbar with theme switcher and theme customizer using `@vanduo-oss/vd3`.

#### Scenario: theme controls available
- **GIVEN** the preview app
- **WHEN** the navbar is shown
- **THEN** theme switcher and theme customizer controls MUST be available
