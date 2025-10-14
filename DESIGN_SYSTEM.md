# Verity Design System

## Overview

Verity is a trust-driven fintech/hospitality product that communicates credibility, calm, and confidence. The design system draws inspiration from Stripe and Linear, but with warmer undertones to evoke "human verification."

## Color Philosophy

### Primary Palette — Trust Blue
- **Purpose**: Core action color (buttons, links, highlights)
- **Psychology**: Trust, reliability, professionalism
- **Usage**: Primary CTAs, navigation, form focus states

```css
--primary-500: #0f62fe;   /* main brand blue */
--primary-600: #0043ce;   /* hover states */
--primary-400: #4589ff;   /* light variants */
```

### Accent Palette — Warm Gold
- **Purpose**: Secondary actions, brand warmth, hospitality signals
- **Psychology**: Confidence, warmth, premium feel
- **Usage**: Icons, borders, empty states, secondary CTAs

```css
--accent-500: #faad14;    /* main accent */
--accent-600: #d48806;    /* hover states */
--accent-400: #ffc53d;    /* light variants */
```

### Surface Colors
- **Background**: `#f9fafb` (soft off-white)
- **Cards**: `#ffffff` (pure white)
- **Borders**: `#e5e7eb` (subtle gray)
- **Text**: `#0a0a0a` (near black)

## Typography

### Font Stack
- **Primary**: Inter (body text, UI elements)
- **Headings**: DM Sans (titles, headings)
- **Code**: ui-monospace (IDs, codes, technical text)

### Usage Guidelines

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| H1 | DM Sans | 700 | 2.25rem | 1.2 |
| H2 | DM Sans | 600 | 1.875rem | 1.3 |
| H3 | DM Sans | 600 | 1.5rem | 1.4 |
| Body | Inter | 400 | 1rem | 1.6 |
| Button | Inter | 600 | 0.875rem | 1.5 |
| Code | Mono | 400 | 0.875rem | 1.5 |

## Component Standards

### Buttons
```tsx
// Primary button
<Button className="bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md">
  Send Attestation
</Button>

// Secondary button
<Button variant="outline" className="border-primary-200 text-primary-500 hover:bg-primary-50">
  Cancel
</Button>
```

### Cards
```tsx
<Card className="bg-card border border-border shadow-sm rounded-lg p-6">
  <h2 className="font-heading text-lg text-foreground mb-4">Guest Information</h2>
  <p className="text-muted-foreground">Enter guest details below.</p>
</Card>
```

### Forms
```tsx
<Input className="border border-input focus:ring-2 focus:ring-primary-300 focus:border-primary-500 rounded-md" />
```

### Tables
```tsx
<table className="table-verity">
  <thead>
    <tr>
      <th className="text-left font-medium text-muted-foreground py-3 px-3 border-b border-border">
        Guest Name
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="hover:bg-muted/50">
      <td className="py-3 px-3 border-b border-border">John Doe</td>
    </tr>
  </tbody>
</table>
```

## Spacing Scale

Based on 4px grid system:
- `1` = 4px
- `2` = 8px
- `3` = 12px
- `4` = 16px
- `6` = 24px
- `8` = 32px
- `10` = 40px
- `12` = 48px

## Motion & Animation

### Timing
- **Page transitions**: 150ms ease-out
- **Button hover**: 100ms ease-in
- **Modal open/close**: 200ms fade

### Examples
```css
/* Fade in animation */
@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* Slide in animation */
@keyframes slide-in {
  0% { transform: translateY(-10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
```

## Accessibility

### Color Contrast
- All text maintains 4.5:1 contrast ratio (AA+)
- Primary blue (#0f62fe) on white: 4.8:1
- Gold accent (#faad14) on white: 2.1:1 (use with dark text)

### Focus States
```css
.focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### Screen Reader Support
- All form elements have visible labels
- Icons have proper aria-labels
- Toast notifications remain accessible

## Layout Standards

### Dashboard Grid
- **Sidebar**: 240px width
- **Header**: 64px height
- **Content**: Flexible width with max 1400px

### Form Layouts
- **Max width**: 640px for optimal readability
- **Vertical rhythm**: 40px gaps between sections
- **Field spacing**: 24px between form fields

## Iconography

### Lucide React Icons
- **Size**: 20-24px for UI elements
- **Stroke width**: 1.75
- **Color**: `--muted-foreground` (default), `--primary-500` (interactive)

### Usage
```tsx
import { CheckCircle, AlertCircle, User } from 'lucide-react'

<CheckCircle className="w-5 h-5 text-success" />
<AlertCircle className="w-5 h-5 text-error" />
<User className="w-5 h-5 text-muted-foreground" />
```

## Dark Mode Support

```css
[data-theme='dark'] {
  --background: #0b0c10;
  --foreground: #f4f4f4;
  --card: #16181d;
  --muted: #1f2229;
  --border: #2a2e35;
  --primary-500: #4589ff;
  --accent-500: #ffb000;
}
```

## Implementation Examples

### Landing Page Hero
```tsx
<section className="bg-background py-20">
  <div className="max-w-4xl mx-auto text-center">
    <h1 className="font-heading text-5xl font-bold text-foreground mb-6">
      Secure Guest Verification
    </h1>
    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
      Streamline check-in with trusted attestation technology
    </p>
    <Button className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-8 py-3 rounded-md">
      Get Started
    </Button>
  </div>
</section>
```

### Status Badges
```tsx
<Badge className="bg-success/10 text-success border-success/20">
  Verified
</Badge>
<Badge className="bg-warning/10 text-warning border-warning/20">
  Pending
</Badge>
<Badge className="bg-error/10 text-error border-error/20">
  Expired
</Badge>
```

## Design Tokens

All design tokens are available as CSS custom properties and can be used in Tailwind classes:

```css
/* Primary colors */
bg-primary-500
text-primary-600
border-primary-200

/* Accent colors */
bg-accent-500
text-accent-600
border-accent-200

/* Surface colors */
bg-background
text-foreground
border-border

/* Semantic colors */
text-success
text-warning
text-error
text-info
```

This design system ensures consistency, accessibility, and a professional appearance that builds trust with users while maintaining the warm, human touch essential for hospitality applications.
