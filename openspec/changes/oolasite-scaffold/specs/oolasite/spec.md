## Purpose

Experimental OOLA website shell for oola.vanduo.dev: a single SPA screen and a bottom glass dock with theme controls on @vanduo-oss/vd3.

## ADDED Requirements

### Requirement: spa-shell

The site MUST render a single SPA shell at `/`. Dock and in-page actions MUST swap Home, Icons, and About panels in place without changing the URL. Unknown paths MUST show the same shell (Home panel by default), not a separate 404 page.

#### Scenario: home panel loads
- **GIVEN** a visitor opens the site root
- **WHEN** the shell renders
- **THEN** an OOLA hero MUST be visible with actions that open the Icons and About panels

#### Scenario: unknown path
- **GIVEN** a visitor opens an unknown path
- **WHEN** the catch-all route renders
- **THEN** the same SPA shell MUST be shown with the Home panel

#### Scenario: dock switches panels
- **GIVEN** the shell is shown
- **WHEN** the visitor activates a dock item
- **THEN** the matching panel MUST replace the main content without a route change, and that dock item MUST be marked current (`aria-current`)

### Requirement: panel-motion

Panel switches MUST animate with a fade and a slight vertical translation (~400–550ms) unless the visitor prefers reduced motion, in which case the swap MUST be instant with no stagger.

#### Scenario: dock panel choreography
- **GIVEN** the shell is shown and the visitor does not prefer reduced motion
- **WHEN** they activate a different dock item
- **THEN** the outgoing panel MUST fade and recede and the incoming panel MUST fade in and rise

#### Scenario: reduced motion
- **GIVEN** `prefers-reduced-motion: reduce`
- **WHEN** the visitor switches panels
- **THEN** the matching panel MUST appear immediately with no animation or stagger

### Requirement: bottom-dock

Primary navigation MUST be a fixed bottom dock (not a top glass navbar): content-hugging width, large height, highly rounded corners, glass surface, with Home / Icons / About controls always visible.

#### Scenario: dock placement
- **GIVEN** any site panel
- **WHEN** the shell renders
- **THEN** the primary nav MUST be fixed near the bottom center of the viewport and MUST NOT span the full viewport width

#### Scenario: theme controls on dock
- **GIVEN** the dock is shown
- **WHEN** the visitor looks at the trailing actions
- **THEN** a theme switcher MUST be available and a theme customizer MUST NOT be shown

#### Scenario: dock brand
- **GIVEN** the dock is shown
- **WHEN** the leftmost chrome renders
- **THEN** it MUST show the mark `oola | ūla` and activating it MUST reset to the home panel without a route change

### Requirement: vd3-published-dep

The site MUST consume published `@vanduo-oss/vd3` (version ≥ 1.4.0) from the npm registry, not a local `link:` working tree, and MUST isolate theme storage with a dedicated prefix.

#### Scenario: storage prefix
- **GIVEN** the site boots next to another vanduo app on the same origin
- **WHEN** theme preferences are persisted
- **THEN** keys MUST use the `oola-bw-` storage prefix
