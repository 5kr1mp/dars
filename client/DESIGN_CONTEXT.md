# Design Context for Domestic Abuse Reporting System

## Overview
This document defines the visual design system for the Domestic Abuse Reporting and Response Platform. The system is designed to feel trustworthy, calm, professional, and human-designed, resembling government portals, healthcare systems, and municipal dashboards.

## Spacing System
- **Base unit**: 8px rhythm
- **CSS tokens** (use these consistently across all components):
  - `--space-1: 4px`
  - `--space-2: 8px`
  - `--space-3: 12px`
  - `--space-4: 16px`
  - `--space-5: 20px`
  - `--space-6: 24px`
  - `--space-8: 32px`
  - `--space-10: 40px`
  - `--space-12: 56px`

- **Application rules**:
  - Page margins/padding: `var(--space-6)` left/right, `var(--space-8)` top/bottom
  - Section gaps: `var(--space-8)` (32px)
  - Component gaps: `var(--space-3)` (12px) to `var(--space-4)` (16px)
  - Card padding: `var(--space-4) var(--space-5)` (16px 20px) for content, `var(--space-6)` (24px) for large cards

## Typography Scale
- **Font families**:
  - Body: IBM Plex Sans (--font-sans)
  - Headings: Sora (--font-display)

- **Heading sizes**:
  - h1: 28-30px, 700 weight, -0.01em letter spacing
  - h2: 22px, 700 weight, -0.01em letter spacing
  - h3: 17px, 600 weight, -0.01em letter spacing

- **Body text**: 15px, line-height 1.5
- **Small/muted text**: 13px, `var(--color-text-muted)`
- **Labels**: 12px uppercase, 0.05-0.06em letter spacing, 600 weight

## Border Radius Rules
- Use only design token radii:
  - Small elements: `var(--radius-sm)` (3px) — badges, inputs
  - Medium elements: `var(--radius-md)` (5px) — buttons, small cards
  - Large elements: `var(--radius-lg)` (8px) — main cards
  - Extra large: `var(--radius-xl)` (11px) — rarely used
  - Circular: `var(--radius-full)` (999px) — pills, avatars

- **Avoid**: Hard-coded pixel values, "pill-shaped everything" styling

## Shadow Rules
- **Minimal elevation approach**:
  - Default cards: `var(--shadow-xs)` (0 1px 2px rgba(20, 30, 45, 0.05))
  - Hover/interactive: `var(--shadow-sm)` (0 2px 6px rgba(20, 30, 45, 0.06))
  - Rarely used: `var(--shadow-md)`, `var(--shadow-lg)`

- **Avoid**: Heavy shadows, glowing effects, floating animations, transform-based hover states

## Card Styling Rules
- **Base card**:
  - Background: `var(--color-surface)` (white)
  - Border: 1px solid `var(--color-border)`
  - Border radius: `var(--radius-lg)`
  - Shadow: `var(--shadow-xs)`

- **Padded card** (`.card--padded`):
  - Padding: `var(--space-6)` (24px)

- **Hover behavior**:
  - Box-shadow increase to `var(--shadow-sm)` only
  - Border-color change (optional)
  - NO transform or translate effects

## Section Spacing Standards
- **Page layout**:
  - Outer container padding: `var(--space-6)` (24px) left/right
  - Page heading spacing: `margin-bottom: var(--space-4)` (16px)
  - Section margins: `margin-top: var(--space-8)` (32px)
  - Filter/control areas: `margin-bottom: var(--space-4)`

- **Grid-based layouts**:
  - Column gaps: `var(--space-4)` or `var(--space-3-5)` (14-16px)
  - Row alignment: consistent with 8px rhythm

## Button Styling Rules
- **Standard button**:
  - Padding: `var(--space-2) var(--space-3)` (8px 12px) — small
  - Border radius: `var(--radius-md)` (10px)
  - Font weight: 600
  - Font size: 13px
  - Transitions: only color/background, never transform

- **Link-style buttons**:
  - Background: none
  - Border: none
  - Color: `var(--color-primary-700)`
  - Padding: small, for touch targets
  - Hover: background-color change only

## Icon Usage Conventions
- **Icon system**: Lucide Icons (SVG format)
- **Size**: 16-20px for UI icons, 24px for decorative
- **Stroke width**: 2 for most icons
- **Rendering**: Use `v-html` in Vue for inline SVG content
- **Color**: `var(--color-primary-600)` for primary, inherit text color for contextual
- **Positioning**: Left-aligned with text, vertical alignment: middle
- **Never use**: Emoji icons (replace all with SVG equivalents)

## Responsive Layout Behavior
- **Desktop** (1200px+):
  - Full grid layouts as designed
  - Sidebar/aside panels remain visible

- **Tablet** (720-1200px):
  - Single-column stacking for secondary panels
  - Grids remain intact but may compress
  - Touch-friendly spacing maintained

- **Mobile** (<720px):
  - Single column everywhere
  - Stacked grids: `grid-template-columns: 1fr`
  - Maintained gap/padding consistency
  - Buttons/controls: minimum 44px touch target

- **Consistency**: Keep 8px rhythm across all breakpoints

## Gradient Usage
- **Sparingly used**:
  - Background gradients: Subtle, light-to-same-color fades
  - Example: `background: linear-gradient(180deg, var(--color-primary-50), var(--color-surface))`
  - Avoid: Multiple bright colors, diagonal gradients for emphasis

- **Rule**: Gradients only for subtle visual separation, not as design decoration

## Visual Tone Guidelines
- **Core principles**:
  - Calm and trustworthy (government service aesthetic)
  - Professional and human-designed (not startup/AI)
  - Restrained and purposeful (no excessive decoration)
  - Accessible and readable (high contrast, clear hierarchy)

- **Color application**:
  - Use existing palette: preserve primary (teal), accent (rose), neutrals
  - Muted colors for trust (no neon or oversaturated hues)
  - Semantic colors for states: success (green), warning (orange), danger (red), info (blue)

- **Animation approach**:
  - Transitions only: 0.15s for interactive states
  - No entrance animations beyond fade-in
  - No hover transforms or floating effects

- **Spacing as design**:
  - Generous whitespace for readability
  - Consistent rhythm prevents visual chaos
  - Balanced content density (not cramped, not sparse)

## Code Quality Standards
- **CSS organization**:
  - Use design tokens everywhere (no magic numbers)
  - Group related styles together
  - Comment sections for clarity
  - Remove unused styles

- **Vue patterns**:
  - Scoped CSS only
  - Consistent class naming
  - Inline styles only for dynamic values
  - Keep component structure unchanged

- **Maintenance**:
  - All spacing uses `var(--space-*)` tokens
  - All colors use `var(--color-*)` tokens
  - All radii use `var(--radius-*)` tokens
  - All shadows use `var(--shadow-*)` tokens

## Example: Good vs Bad

### Spacing
✅ Good: `padding: var(--space-4) var(--space-5); margin-bottom: var(--space-3);`
❌ Bad: `padding: 18px 20px; margin-bottom: 10px;`

### Hover State
✅ Good: `transition: box-shadow 0.15s, border-color 0.15s;` + `:hover { box-shadow: var(--shadow-sm); }`
❌ Bad: `transition: transform 0.1s; :hover { transform: translateY(-2px); }`

### Icons
✅ Good: Replace 📍 with `<svg>...</svg>` (Lucide pin icon)
❌ Bad: Keep emoji or use image files

### Cards
✅ Good: Consistent padding, subtle shadow, no transform on hover
❌ Bad: Random padding, heavy shadows, floating effect on hover

## Future Considerations
- Maintain this spacing/styling pattern as new pages are added
- Always refer back to these tokens before hardcoding values
- Test responsive behavior on tablet/mobile for consistency
- Keep this document updated as patterns evolve
