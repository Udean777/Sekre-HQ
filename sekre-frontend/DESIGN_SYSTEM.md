# Design System Documentation

## Overview

This design system provides a consistent foundation for the Sekre project UI. It includes design tokens, utility classes, and helper functions.

## Design Tokens

All design tokens are defined in `src/lib/styles/design-tokens.css` as CSS custom properties.

### Colors

#### Primary (Blue)
- `--color-primary-500`: Main brand color
- `--color-primary-600`: Hover state
- `--color-primary-700`: Active state

#### Semantic Colors
- `--color-success-*`: Green shades for success states
- `--color-warning-*`: Amber shades for warnings
- `--color-error-*`: Red shades for errors
- `--color-info-*`: Cyan shades for informational messages

#### Neutral (Gray)
- `--color-gray-*`: Gray scale from 50 to 950

### Typography

#### Font Families
```css
--font-sans: Inter, system-ui, sans-serif
--font-mono: Fira Code, Consolas, monospace
```

#### Font Sizes
- `--text-xs`: 12px
- `--text-sm`: 14px
- `--text-base`: 16px
- `--text-lg`: 18px
- `--text-xl`: 20px
- `--text-2xl`: 24px
- `--text-3xl`: 30px
- `--text-4xl`: 36px

#### Font Weights
- `--font-normal`: 400
- `--font-medium`: 500
- `--font-semibold`: 600
- `--font-bold`: 700

### Spacing

Spacing follows a consistent scale:
- `--spacing-1`: 4px
- `--spacing-2`: 8px
- `--spacing-3`: 12px
- `--spacing-4`: 16px
- `--spacing-6`: 24px
- `--spacing-8`: 32px
- `--spacing-12`: 48px

### Shadows

- `--shadow-sm`: Small shadow for subtle elevation
- `--shadow-md`: Medium shadow for cards
- `--shadow-lg`: Large shadow for modals
- `--shadow-xl`: Extra large shadow for popovers

### Border Radius

- `--radius-sm`: 2px
- `--radius-base`: 4px
- `--radius-md`: 6px
- `--radius-lg`: 8px
- `--radius-xl`: 12px
- `--radius-full`: 9999px (for circles)

### Transitions

- `--transition-fast`: 150ms
- `--transition-base`: 200ms
- `--transition-slow`: 300ms

## Utility Functions

### Class Name Utilities

```typescript
import { cn } from '$lib/utils';

// Merge classes with proper precedence
cn('px-4 py-2', isActive && 'bg-blue-500', 'px-6')
// Result: 'py-2 bg-blue-500 px-6'
```

### Formatting Utilities

```typescript
import { formatCurrency, formatDate, formatRelativeTime } from '$lib/utils';

// Format currency
formatCurrency(1000000) // 'Rp 1.000.000'

// Format date
formatDate(new Date(), 'short') // '11 Mei 2026'

// Format relative time
formatRelativeTime(new Date(Date.now() - 3600000)) // '1 jam yang lalu'
```

## Animation Classes

### Entrance Animations
- `.animate-fade-in`: Fade in animation
- `.animate-slide-in-up`: Slide in from bottom
- `.animate-slide-in-down`: Slide in from top
- `.animate-scale-in`: Scale in animation

### Continuous Animations
- `.animate-spin`: Spinning animation (for loaders)
- `.animate-pulse`: Pulsing animation
- `.animate-bounce`: Bouncing animation

### Hover Effects
- `.hover-lift`: Lift on hover with shadow
- `.hover-scale`: Scale up on hover

### Loading States
- `.skeleton`: Skeleton loading animation
- `.loading-dots`: Animated loading dots

## Usage Examples

### Using Design Tokens

```svelte
<div style="
  background-color: var(--color-primary-500);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
">
  Content
</div>
```

### Using Utility Classes

```svelte
<div class="card hover-lift">
  <h3 class="text-primary">Title</h3>
  <p class="text-secondary">Description</p>
</div>
```

### Using Animations

```svelte
<div class="animate-fade-in">
  Fading in content
</div>

<button class="hover-lift">
  Hover me
</button>
```

## Best Practices

1. **Use Design Tokens**: Always use CSS custom properties instead of hardcoded values
2. **Consistent Spacing**: Use the spacing scale for margins and paddings
3. **Semantic Colors**: Use semantic color names (success, error, warning) instead of color names
4. **Accessibility**: Ensure proper color contrast ratios (WCAG AA minimum)
5. **Performance**: Use CSS animations over JavaScript when possible
6. **Responsive**: Design mobile-first, then enhance for larger screens

## Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Use Tailwind's responsive prefixes:
```svelte
<div class="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

## Dark Mode (Optional)

Dark mode is prepared but disabled by default. To enable:

1. Remove the `color-scheme: light` declaration in `design-tokens.css`
2. Add dark mode toggle functionality
3. Test all components in dark mode

## Component Guidelines

When creating new components:

1. Use design tokens for all styling
2. Support all necessary variants (size, color, state)
3. Include proper accessibility attributes
4. Add loading and error states
5. Make it responsive
6. Add hover and focus states
7. Document props and usage

## Resources

- Design tokens: `src/lib/styles/design-tokens.css`
- Global styles: `src/lib/styles/globals.css`
- Animations: `src/lib/styles/animations.css`
- Utilities: `src/lib/utils/`
