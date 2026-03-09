

## Fix Welcome Hero Card Contrast

**Problem:** The `gradient-hero` background uses `--gradient-hero: linear-gradient(135deg, hsl(220 25% 8%), hsl(220 18% 16%))` — very dark slate colors. The text uses `text-primary-foreground` which maps to `hsl(220 25% 6%)` in light mode — nearly identical dark color, making text invisible.

**Fix in `src/pages/Dashboard.tsx`:**
Replace the dark-on-dark text colors with white/light tones that contrast against the dark gradient:

- `text-primary-foreground` → `text-white`
- `text-primary-foreground/80` → `text-white/80`
- `text-primary-foreground/30` → `text-white/30`
- `bg-primary-foreground/20` → `bg-white/20`
- `text-secondary` on the Wallet icon stays (gold, already visible on dark)

This affects lines 67-82 in the welcome hero card section.

