## ADDED Requirements

### Requirement: pro-only-grid

Preview MUST show a single Pro Vector column.

#### Scenario: one model column
- **GIVEN** the drafts preview
- **WHEN** the table renders
- **THEN** there MUST be exactly one model column

### Requirement: keeper-badges

Keeper icons MUST show a keeper badge.

#### Scenario: keeper label
- **GIVEN** row `mail`
- **WHEN** rendered
- **THEN** a keeper badge MUST appear

### Requirement: theme-aware-icon-color

Icons MUST be black on default primary and follow `--vd-color-primary` when customized.

#### Scenario: custom primary recolors icons
- **GIVEN** default primary
- **WHEN** a custom primary is picked
- **THEN** icons MUST use the primary token

### Requirement: vd3-shell

Preview MUST keep vd3 glass navbar with theme switcher and customizer.

#### Scenario: theme controls available
- **GIVEN** the preview app
- **WHEN** the navbar shows
- **THEN** theme switcher and customizer MUST be available
