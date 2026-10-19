# UI redesign rules

These rules apply to every UI redesign or visual enhancement in this repository.

## Scope

- Keep redesign work presentation-only. Do not change API calls, services, route behavior, permissions, validation, data handling, or user workflows as part of a visual refresh.
- Preserve existing interactions and accessible names, keyboard access, focus behavior, and responsive behavior while changing presentation.
- Record visual coverage in [UI_MODULE_INVENTORY.md](UI_MODULE_INVENTORY.md) whenever a module's UI status changes.

## Shared visual system

- Treat the refreshed UI as one system across routes. Use the shared `--modern-*` color and typography tokens from `src/index.css`; do not introduce route-specific hard-coded surface colors.
- Use the same token roles in light mode, dark mode, and each supported palette: `--modern-bg` for page backgrounds, `--modern-raised` for nested surfaces and controls, `--modern-card` for cards and shell panels, `--modern-border` / `--modern-border-strong` for boundaries, and `--modern-text` / `--modern-muted` for text.
- Keep the navigation sidebar, header, page background, cards, forms, tables, and dialogs visually related. A refreshed route must use the same palette and component rules as other refreshed routes.
- Do not add decorative `box-shadow` to dashboard or profile cards, panels, section containers, or shell surfaces. Use surface color and borders to show hierarchy. Use `outline` for keyboard focus indicators.
- Keep hover and selected states clear through token-based border, surface, or text changes; do not use shadows or vertical lift to signal interaction.
- Keep responsive layouts and translated/RTL layouts intact.

## Inventory status meanings

- **Old UI**: the route still primarily uses the legacy visual treatment; redesign is pending.
- **Mixed UI**: shared tokens or refreshed components exist, but the route still contains legacy layout or controls.
- **New UI**: the active route uses the refreshed visual system end to end.

The inventory records what the current source shows. It is a visual migration tracker and must not imply that an old implementation is preserved in source control.
