## Purpose

Icons catalog panel for the OOLA experiment site: Structured Phi drafts with weight columns, pagination, keepers, and theme-aware color.

## ADDED Requirements

### Requirement: icons-panel-catalog

The Icons panel MUST show the Structured Phi draft catalog with six weight columns and pagination (default page size 50).

#### Scenario: page size
- **GIVEN** a catalog larger than 50 icons
- **WHEN** the Icons panel is shown
- **THEN** at most one page of rows (default 50) MUST render initially

### Requirement: keeper-badges-on-site

Keeper icons (`mail`, `house`, `search`) MUST be visually marked in the catalog grid.

#### Scenario: keeper label
- **GIVEN** the icon row for `mail`
- **WHEN** rendered in the Icons panel
- **THEN** a keeper badge MUST appear next to the name

### Requirement: theme-aware-icon-color-on-site

Icons MUST render with `currentColor` so they follow text: black in light mode, white/grey in dark mode. The site MUST NOT offer a color customizer.

#### Scenario: icons follow theme text
- **GIVEN** the Icons panel in light mode
- **WHEN** draft icons render
- **THEN** they MUST use `currentColor` (black text)

#### Scenario: icons invert in dark
- **GIVEN** the Icons panel in dark mode
- **WHEN** draft icons render
- **THEN** they MUST use `currentColor` (light text)

### Requirement: fill-open-path-fallback-on-site

Fill weight MUST NOT render blank cells for open-path glyphs; it MUST fall back to the Regular outline.

#### Scenario: plus fill
- **GIVEN** icon `plus` in the Fill column in the Icons panel
- **WHEN** rendered
- **THEN** a visible outline MUST appear (not an empty cell)
