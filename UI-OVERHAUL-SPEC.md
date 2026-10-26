# RealityLoop AI — Executive Dashboard UI Overhaul

## Reference analysis
The implementation follows the supplied executive/industrial dashboard references: fixed dark navigation rail, compact sticky utility header, dense analytical panels, cyan structural lines, cool blue typography, low-radius surfaces, and high information density.

### Palette
- Canvas: `#041B2A`
- Sidebar: `#061524`; deep sidebar: `#030D18`
- Primary surface: `#072638`; raised surface: `#0A3044`; soft surface: `#0B354A`
- Structural border: `#14536A`; active/corner border: `#19B7D2`
- Primary text: `#EAF8FC`; secondary: `#9DC1CD`; muted: `#6E98A8`
- Cyan accent: `#22D3EE`; sky: `#62C7FF`; teal: `#2DD4BF`; blue: `#5B8CFF`
- Pink highlight: `#FF6F9F`; amber: `#F5B942`; success: `#4ADE80`; danger: `#FB7185`

### Geometry and hierarchy
- Desktop sidebar: 248px fixed; compact responsive rail: 68px.
- Sticky top utility bar: 68px.
- Content max width: 1600px; desktop padding: 24px.
- Dashboard grids use 14px gaps to preserve the dense reference composition.
- Panels use 4px radius, 1px structural border, cyan corner details, and a restrained `0 14px 36px rgba(0,7,14,.18)` shadow.
- Buttons are 36px high, 14px horizontal padding, 2px radius, uppercase micro-label typography.
- Primary page title: 28px; panel title: 17px; metadata/eyebrows: 9px with wide tracking.

## Architecture
- `src/theme.css` is the master CSS-token source of truth.
- `src/theme.ts` exposes the same design system to TypeScript components and future chart libraries.
- `src/components/DashboardChrome.tsx` owns the reusable sidebar and top utility header.
- `src/App.css` contains dashboard composition and component presentation.
- Existing simulation state, evaluation logic, tests, and browser `localStorage` persistence are preserved.

## Responsive behavior
- <=1100px: narrower sidebar and single-column main analytics body.
- <=760px: icon-only navigation rail and stacked metric grids.
- <=480px: reduced content padding and full-width action controls.
