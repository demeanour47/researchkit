# Design system

The visual language every page and tool shares. Values live in code, in `src/ui/design/`; this document says how they fit together and the rules for using them.

## Sources of truth

| Concern | Module | Used as |
|---|---|---|
| Colour, light and dark palettes, contrast promises | `colors.ts` | `bg-surface`, `text-text-muted`, `border-border` … |
| Type scale and typefaces | `typography.ts` | `text-display-lg` → `text-caption`, `font-display` |
| Spacing scale and semantic spacing | `spacing.ts` | `p-4`, `gap-6`, `py-section`, `min-h-control` |
| Radius | `radius.ts` | `rounded-control`, `rounded-tile`, `rounded-panel`, `rounded-pill` |
| Shadows and stacking | `elevation.ts` | `shadow-card`, `shadow-lift`, `shadow-raised`, `shadow-overlay`, `z-(--z-sticky)` |
| Durations and easing | `motion.ts` | `duration-(--duration-quick)`, `ease-standard`, `ease-emphasized` |
| Named animations | `animations.ts` | `animate-rise-in`, `animate-scale-in`, `animate-spin` … |
| Icons (Lucide, vendored) | `icons.ts` | `<Icon name="…" />`, `SEMANTIC_ICONS` |
| Breakpoints and page widths | `tokens.ts` | `md:`, `max-w-page`, `max-w-reading`, `max-w-intro` |

`theme.ts` renders every value as a CSS custom property (`--rk-*`), inlined by the root layout. The Tailwind roles in `src/ui/tokens/*.css` only point at those properties, so a value is changed in one place. `src/ui/design/design.test.ts` fails the build if a colour pair loses its contrast, if the style sheets read a property the theme doesn't define, or if the breakpoints (which media queries can't read from properties) drift.

## Colour

- Roles name a job, never a hue. The design vocabulary maps to roles in `DESIGN_COLORS`: primary is `action`, background is `canvas`, muted is `text-muted`, and so on.
- The dark palette is designed, not inverted: surfaces lighten as they come forward (`sunken` < `canvas` < `surface` < `raised`), text is softened from pure white, and accents are lighter and calmer.
- Status colours (`success`, `warning`, `danger`) and tag colours always travel with words or an icon.
- `paper` stays white in both schemes: it previews printed output.

## Type

Display Large (`display-lg`, once per site), Display, H1 (`title`), H2 (`heading`), H3 (`subheading`), H4 (`heading-sm`), Body Large (`lead`), Body, Small, Caption. Headings balance their lines; paragraphs avoid orphans. Prose sits at `max-w-reading` (68ch); introductions under headings at `max-w-intro` (60ch).

## Components

Build from the smallest part that fits, and never restyle a part locally.

- **Surfaces:** `Card` and `cardClasses()` are the only card surface. Cards that link are one `coverLinkClasses` link stretched over the card, so the card lifts under the pointer and draws the focus ring around itself. `FeatureCard`, `QuickAction`, `StatCard`/`MetricCard`, `FeatureBanner`, `CatalogueCard` (tools, guides, styles) and `CategoryCard` are compositions of it; `ComingSoon` is its dashed, non-link counterpart.
- **Actions:** `Button` (primary, secondary, outline, ghost, danger; `busy` shows a spinner), `ButtonLink` for navigation that looks like a button, `IconButton` for icon-only actions (a label is required).
- **Labels:** `Badge` (neutral, info, accent, success, caution, danger, outline); `Tag` is `Badge` limited to the tones tools use. Caution always shows an icon.
- **Page structure:** every page opens with `Hero` (the only place its h1 lives), then `Section` + `SectionHeader` (eyebrow, title, description, action). `PageContainer` sets the width; `ContentContainer` sets prose measure.
- **Controls:** `SearchBar`, `ChoiceChips` (native radios; `segmented` for a few short options), `Toolbar` (a labelled group, not an ARIA toolbar), plus the form fields.
- **Feedback:** `Callout`, `EmptyState` (always with a way forward), `LoadingIndicator` (announced), `Skeleton` (decorative only).
- **Site:** `SiteHeader` (sticky, active indicator, ⌘K search, theme, GitHub, version), `SiteFooter`, `Breadcrumbs`, `CommandPalette`, `ThemeSwitcher`.

## Motion

Motion explains a change: a card lifts, a dialog scales in, an arrow nudges. Durations are 120–320 ms. Under `prefers-reduced-motion` every duration is zero, so all token-driven motion stops without components having to check.

## Accessibility rules

- One h1 per page, in the `Hero`; headings never skip a level.
- Current and selected states combine weight, fill and a border or bar; never colour alone.
- Controls that need JavaScript (search, theme, filters) stay hidden, keeping their space, until scripts run; the page is complete without them.
- Focus is always visible: the `focus-ring` utility, or the card-level ring for cover links.
