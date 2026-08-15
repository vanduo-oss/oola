## ADDED Requirements

### Requirement: hand-authored-smoke-set

Smoke icons MAY be hand-authored Structured Phi outlines when model output fails QA.

#### Scenario: smoke icons are valid outlines
- **GIVEN** the ten smoke draft SVGs
- **WHEN** inspected
- **THEN** each MUST use `viewBox="0 0 24 24"` and MUST NOT contain a full-canvas opaque backdrop path

### Requirement: pro-vector-only

Smoke drafts MUST use `recraft/recraft-v4.1-pro-vector` only.

#### Scenario: output path
- **GIVEN** icon `search`
- **WHEN** generation completes
- **THEN** the file MUST exist under `drafts/oola-structured-phi/recraft-v4.1-pro-vector/`

### Requirement: style-keepers

Icons `mail`, `house`, and `search` MUST be style keepers skipped unless `--force-keepers`.

#### Scenario: force skips keepers by default
- **GIVEN** `--force` without `--force-keepers`
- **WHEN** generation runs
- **THEN** keepers MUST NOT be regenerated

### Requirement: input-reference-style-lock

Non-keeper generation MUST attach one keeper SVG via `input_references`.

#### Scenario: reference attached
- **GIVEN** regenerating a non-keeper
- **WHEN** the API request is built
- **THEN** it MUST include exactly one `input_references` entry

### Requirement: primary-variant

Active generation MUST target `oola-structured-phi` only.

#### Scenario: single style profile
- **GIVEN** prompt templates
- **WHEN** drafts generate
- **THEN** the active profile MUST be `oola-structured-phi`

### Requirement: prompt-embeds-style-guide

Prompts MUST embed keeper-look constraints; writes MUST strip C2PA metadata.

#### Scenario: sanitize strips metadata
- **GIVEN** SVG with `<metadata>`
- **WHEN** saved
- **THEN** metadata MUST be removed

### Requirement: manifest-and-auth

Generation MUST use `OPENROUTER_API_KEY`, request SVG, write `MANIFEST.json`, never commit secrets.

#### Scenario: missing key fails closed
- **GIVEN** no API key
- **WHEN** non-dry-run starts
- **THEN** the process MUST exit non-zero
