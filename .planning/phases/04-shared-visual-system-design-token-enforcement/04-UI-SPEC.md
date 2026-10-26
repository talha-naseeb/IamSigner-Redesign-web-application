# Phase 04: UI Design Contract (`04-UI-SPEC.md`)

**Phase:** `04-shared-visual-system-design-token-enforcement`  
**Status:** Verified (`PASS` across all 7 GSD UI-SPEC quality dimensions)  
**Date:** 2026-10-24  
**Requirements Covered:** `UI-01`, `UI-02`, `UI-03`  
**Architectural Decisions Enforced:** `DEC-03` (Shared Design Tokens & Zero Decorative Box-Shadows), React 19 + Single Unified UI Layer

---

## 1. Design System & Token Contract (`UI-01`, `UI-03`)

All routes, layouts, dialogs, tables, and form controls MUST consume the centralized `--modern-*` CSS custom properties defined in [`src/index.css`](../../../src/index.css). Route-specific hardcoded hex/RGB surface colors are prohibited.

### 1.1 Core Surface & Hierarchy Tokens

| Token | Role | Light (`concept-2`) | Dark (`concept-2`) | Dark (`management`) | Light (`management`) |
|---|---|---|---|---|---|
| `--modern-bg` | Page canvas background | `#f7f5ff` | `#07060f` | `#001629` | `#f4f7fa` |
| `--modern-card` | Primary card, shell panel, modal, and table container surface | `#ffffff` | `#12102a` | `#002c52` | `#ffffff` |
| `--modern-raised` | Nested control surface, input background, table header, hover row | `#f0edfb` | `#0e0c1e` | `#002c52` | `#edf2f6` |
| `--modern-surface` | Secondary interactive / hover surface | `#f3f0ff` | `#0d0b1b` | `#002c52` | `#f8fafc` |
| `--modern-border` | Standard 1px structural divider & card boundary | `rgba(52, 40, 100, 0.14)` | `rgba(190, 181, 255, 0.11)` | `rgba(255, 255, 255, 0.09)` | `rgba(0, 22, 41, 0.14)` |
| `--modern-border-strong` | Interactive input border, active control boundary | `rgba(52, 40, 100, 0.22)` | `rgba(190, 181, 255, 0.18)` | `rgba(255, 255, 255, 0.18)` | `rgba(0, 22, 41, 0.20)` |
| `--modern-text` | Primary foreground copy & headings | `#201b32` | `#e9e8f5` | `#ffffff` | `#001629` |
| `--modern-muted` | Secondary labels, captions, table headers, placeholders | `#756f89` | `#9a98b8` | `#999999` | `#667788` |
| `--modern-violet` / `--modern-primary` | Brand accent, active indicator, primary CTA fill, focus ring | `#7357dc` | `#8b6cff` | `#fe5800` | `#fe5800` |
| `--modern-violet-soft` | Subtle active pill / badge / hover tint | `rgba(115, 87, 220, 0.10)` | `rgba(139, 108, 255, 0.14)` | `rgba(254, 88, 0, 0.14)` | `rgba(254, 88, 0, 0.14)` |

### 1.2 Semantic Status Tokens

| Token | Value | Usage |
|---|---|---|
| `--modern-success` | `#10b981` | Completed documents, verified signatures, valid form states |
| `--modern-warning` | `#f59e0b` | Pending documents, expiring subscriptions, caution alerts |
| `--modern-danger` | `#ef4444` | Declined documents, destructive actions, validation errors |
| `--modern-info` | `#0ea5e9` | Shared documents, informational banners, tooltips |

### 1.3 Theme & Palette Engine (`src/Context/ThemeContext.js`)

- **Theme Modes:** `data-theme="light"` and `data-theme="dark"` persisted under `localStorage["theme"]`.
- **Palettes:** `data-palette="concept-2"` (default violet/indigo identity) and `data-palette="management"` (Oxford Blue / Prussian Blue / Orange Pantone identity) persisted under `localStorage["iam-signer-palette"]`.
- **Zero-Flicker Switching:** `switchThemeWithoutTransition` and `switchPaletteWithoutTransition` temporarily attach `.theme-switching` to `document.documentElement` across two `requestAnimationFrame` ticks to suppress transition lag during theme toggles.

---

## 2. UI Package Consolidation Contract (React 19 + Single UI Layer)

IAMSigner has migrated from **React 18 to React 19 (`^19.3.1`)** and consolidated four disparate UI libraries (**PrimeReact**, **MUI**, **Bootstrap CSS**, and **React-Bootstrap**) into a **single local UI layer**.

### 2.1 Approved UI Stack

| Layer | Package / Module | Responsibility |
|---|---|---|
| Core Runtime | `react@^19.3.1`, `react-dom@^19.3.1` | Concurrent rendering, `useId`, `createPortal`, ref forwarding |
| Headless Primitives | `src/Components/UI/dialogPrimitive.jsx` | Pure local React 19 modal/drawer engine (portal, focus trap, scroll lock, ESC/backdrop dismissal, ARIA) — zero external UI primitive libraries |
| Styling Engine | `tailwindcss@^3.4.19`, `class-variance-authority`, `clsx`, `tailwind-merge` | Token-mapped utility classes (`bg-card`, `text-foreground`, `border-border`) |
| Unified Dialogs & Drawers | `src/Components/Common/AppModal/AppModal.jsx`, `AppConfirmModal.jsx`, `src/Components/Common/AppDrawer/AppDrawer.jsx` | Canonical modal and side-drawer components |
| Shadcn Primitives | `src/components/ui/dialog.jsx`, `sheet.jsx`, `Button`, `Card`, `Input`, `Badge`, `EmailChips.jsx` | Core design-system building blocks |
| Compatibility Adapters | `src/components/ui/shadcnCompat.jsx`, `src/components/ui/dataPrimitives.jsx`, `src/components/ui/iconCompat.jsx` | Drop-in token-aware adapters for legacy JSX call-sites (`Container`, `Row`, `Col`, `Form`, `Table`, `Pagination`, `Paper`, `Stack`, `Grid`) |
| Iconography | `lucide-react@^1.61.0` (primary), `src/components/ui/iconCompat.jsx` | Crisp 2px stroke vector icons |

### 2.2 Deprecation & Cleanup Rules

1. **Zero Multi-Library Imports:** No file in `src/` may import from `@mui/*`, `primereact/*`, `bootstrap/*`, or `react-bootstrap/*`.
2. **Unused Dependency Removal:** `styled-components` (`^6.6.0` in `package.json`, `0` imports in `src/`) is slated for removal from `package.json`, and remaining `react-icons` imports (`95` occurrences) should progressively converge on `lucide-react`.
3. **Single Component Folder:** Reconcile `src/components/ui/` and `src/Components/UI/` so legacy wrapper stylesheets (`Button.css`, `Card.css`, `Input.css`, `Modal.css`) do not reintroduce shadows or non-token colors.

---

## 3. Typography & Hierarchy Scale

| Role | Token / Class | Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| UI Font Family | `--modern-font-ui` | `"Sora", "Inter", sans-serif` | 400–700 | — | All application shells, tables, forms, dialogs |
| Monospace Font | `--modern-font-mono` | `"JetBrains Mono", monospace` | 400–600 | — | Audit trail hashes, IP addresses, API keys, webhook secrets |
| Signature Fonts | `.style1` – `.style19` | Curated Google Fonts | 400–700 | — | Public & self-sign signature pad previews (`Dancing Script`, `Great Vibes`, etc.) |
| Page Title | `--type-page` | `1.75rem` (28px) | `700` | `1.25` | Top-level route headers |
| Section Header | `--type-section` | `1.25rem` (20px) | `650` | `1.3` | Card titles, `.pendingtable h1..h4`, modal titles |
| Subtitle | `--type-subtitle` | `1.125rem` (18px) | `600` | `1.4` | Stepper headers, drawer titles |
| Body Copy | `--type-body` | `0.9375rem` (15px) | `400` | `1.5` | Standard paragraphs, descriptions |
| Control / Cell | `--type-label` | `0.875rem` (14px) | `500` | `1.45` | Table body cells (`.TableCell`), form labels, buttons |
| Table Header | `.TableHeaderCell` | `0.72rem` (11.5px) | `700` | `1.4` | Uppercase, `letter-spacing: 0.055em`, `color: var(--modern-muted)` |

---

## 4. Surface, Elevation & Interaction Rules (`UI-02`, `DEC-03`)

Per [`AGENTS.md`](../../../AGENTS.md) and `DEC-03`:

1. **Strict Zero Decorative `box-shadow` Policy:**
   - Dashboard cards, profile cards, status panels, section containers, table wrappers, and shell surfaces (`Sidebar`, `Navbar`, `.card`, `.pendingtable`, `.dashboard-stat-card`) MUST NOT use decorative `box-shadow`.
   - Visual hierarchy is established strictly via surface layering (`--modern-bg` -> `--modern-card` -> `--modern-raised`) and `1px solid var(--modern-border)` / `var(--modern-border-strong)`.
   - **Permitted Exceptions:** Floating overlays that sit above the document flow (`AppModal` / `DialogContent`, `AppDrawer` / `SheetContent`, floating dropdown menus, date-picker popovers, and physical PDF page canvas `.signaturePage .doc-image`).
2. **Hover & Active States:**
   - Signal hover and selection via token-based background (`var(--modern-raised)` / `var(--modern-violet-soft)`), border (`var(--modern-violet)` / `var(--modern-border-strong)`), or text color changes.
   - **Prohibited:** Vertical lift (`transform: translateY(-2px)`) or hover drop-shadows on cards, rows, or buttons.
3. **Keyboard Focus Indicators:**
   - All interactive controls MUST display a visible `outline: 2px solid var(--modern-primary)` with `outline-offset: 2px` on `:focus-visible`.

---

## 5. Component Specifications & States

### 5.1 Buttons & Loading States
- **Inline Button Spinner Rule (`AGENTS.md`):** Actions initiated by a button MUST render a compact spinning indicator (`.inline-button-spinner`, `margin-inline-end: 0.5rem`) inside the button while keeping the button label visible and `disabled` set.
- **No Full-Screen Lottie Overlay on Settings:** Profile, Delegation, and Change Password flows MUST NOT cover the screen with the signing/Lottie `.loader-overlay`.

### 5.2 Data Tables & Status Toolbars
- **Container:** `.ui-table-container` with `border: 1px solid var(--modern-border)`, `border-radius: 0.75rem` (12px) inside `.pendingtable` or `18px` standalone, `background: var(--modern-card)`.
- **Sticky Header:** `.ui-table-head .ui-table-cell` with `position: sticky; top: 0; z-index: 2; background: var(--modern-raised); color: var(--modern-muted)`.
- **Row Hover:** `.ui-table-body .ui-table-row:hover .ui-table-cell` transitions in `150ms` to `background: var(--modern-raised)`.
- **Pagination:** `<Pagination />` (`src/components/ui/dataPrimitives.jsx`) with accessible `aria-label="Pagination"`, `aria-current="page"`, and RTL-aware chevron rotation (`:dir(rtl) .ui-pagination-item-previous`).

### 5.3 Modals, Drawers & Notifications
- **Modals:** `<AppModal>` (`sm` `max-w-sm`, `md` `max-w-lg`, `lg` `max-w-2xl`, `xl` `max-w-4xl`, `full` `max-w-[95vw] h-[90vh]`) and `<AppConfirmModal>` (supports `danger`, `warning`, `primary` variants with `isLoading` inline spinner).
- **Drawers:** `<AppDrawer>` with logical `side="end"` / `side="start"` that automatically flips between `right` (LTR) and `left` (RTL).
- **Toasts:** Centralized in `src/Components/CommonModals/CustomToast/` using `react-toastify@^11.1.0` styled with `--modern-card`, `--modern-text`, and `--modern-border`.

---

## 6. Layout, Responsive & RTL Breakpoints

| Breakpoint | Width | Layout Behavior |
|---|---|---|
| Mobile (`xs`) | `< 576px` | Single-column cards, collapsible mobile drawer navigation, compact icon-only signing toolbar, full-bleed modals |
| Tablet (`sm` / `md`) | `576px – 991px` | 2-column dashboard status grid, stacked document status toolbar (`.document-status-toolbar` stretches, filters left-aligned), horizontal table scroll (`min-width: 46rem`) |
| Desktop (`lg` / `xl`) | `>= 992px` | Persistent/collapsible sidebar + header shell, 3-column dashboard status grid, 3-pane public/wizard signing canvas (`15%` left comments/fields, `70%` center document canvas, `15%` right page thumbnails) |
| Wide (`2xl`) | `>= 1400px` | Container max-width `1280px`–`1400px` centered on `--modern-bg` |

### 6.1 RTL & Bilingual Continuity (`en` / `ar`)
- `<html dir="rtl">` automatically mirrors flex/grid flow, table alignment (`text-align: start`), pagination chevrons, phone input flag dropdowns, and `<AppDrawer side="end">` slide direction.
- Use logical CSS properties (`margin-inline-start`, `margin-inline-end`, `padding-inline`, `border-inline-start`, `text-align: start`) instead of physical `left`/`right` in shared components.

---

## 7. Accessibility & Verification Criteria

1. **Dialog & Drawer Semantics:** Every `AppModal`, `AppDrawer`, and `shadcnCompat` `<Modal>` guarantees an accessible title (`DialogPrimitive.Title` or fallback `aria-label="Dialog"`), focus trapping, and `Escape` key dismissal.
2. **Keyboard Navigation:** All buttons, icon buttons (`IconButton`), tabs, pagination controls, and custom option tiles are reachable via `Tab` and operable via `Enter`/`Space` with `:focus-visible` outline rings.
3. **Color Contrast:** `--modern-text` on `--modern-bg` and `--modern-card` exceeds WCAG AA (4.5:1) across both `light` and `dark` modes in both `concept-2` and `management` palettes.
4. **Automated Verification Gate for Phase 4:**
   - `grep -rn "primereact\|@mui\|react-bootstrap" src/` returns `0` matches.
   - Non-overlay `box-shadow` declarations in dashboard/profile/shell CSS files are reduced to `0` (`box-shadow: none`).
   - `npm run build` (`vite build`) succeeds with zero unresolved imports or CSS syntax errors.
