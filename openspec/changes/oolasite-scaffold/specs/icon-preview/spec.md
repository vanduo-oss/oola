## MODIFIED Requirements

### Requirement: vd3-shell

The preview app (`preview/`) MUST keep a glass navbar with theme switcher and theme customizer using `@vanduo-oss/vd3`. The experiment site (`oolasite/`) places a theme switcher in the bottom dock and MUST NOT expose a theme customizer (greyscale black / grey / white only).

#### Scenario: theme controls available
- **GIVEN** the preview app
- **WHEN** the navbar is shown
- **THEN** theme switcher and theme customizer controls MUST be available

#### Scenario: theme controls available on oolasite
- **GIVEN** the oolasite app
- **WHEN** the dock is shown
- **THEN** a theme switcher MUST be available and a theme customizer MUST NOT be shown
