# Premium Brutalist Aesthetic Guide — Guidorizzi App

## Overview

The Premium Brutalist aesthetic for the Guidorizzi App defines a modern, technical, and visually commanding design language. This guide documents the core principles, color palette, typography, components, and implementation details for achieving consistency across all UI elements.

---

## Core Principles

### 1. **High Contrast**
- **Dark Backgrounds:** Predominantly `#0a0a0a` (near black) and `#050505` for primary surfaces
- **Vibrant Neon Accents:** Electric colors that "pop" against dark backgrounds
  - Primary: `#00f0ff` (Cyan/Aquamarine)
  - Secondary: `#ff5500` (Neon Orange)
  - Tertiary: `#ccff00` (Neon Lime/Yellow)
  - Quaternary: `#00d084` (Neon Green)
- **Contrast Ratio:** Minimum 8:1 for accessibility in interactive elements

### 2. **Hard-Edge Shadows**
- **No Soft Gradients:** Avoid `blur-sm`, `blur-md` in shadows—only use sharp, defined shadows
- **Hard-Edge Drop Shadows:** Use CSS `box-shadow` with distinct x/y offsets
  - Format: `shadow-[8px_8px_0_rgba(color,opacity)]`
  - Offset typically 4-12px depending on element size
  - Opacity 0.4-0.8 for visibility without softness
- **Multiple Shadows:** Layer shadows for depth: `shadow-[8px 8px 0 color1], -4px -4px 0 color2]`
- **Never use:** `blur()` on shadows or `drop-shadow()`—always use `box-shadow`

### 3. **Robust Typography**
- **Font Families:**
  - **Heavy Sans-Serif:** `'Courier New', monospace` or `font-courier` for body text
  - **Heavy Weight:** Primary text uses `font-black` (weight 900)
  - **Terminal/Monospaced:** `font-mono` for numbers, code, and emphasis
- **Letter Spacing:** Increased tracking `tracking-wider`, `tracking-widest` for uppercase text
- **Size Hierarchy:**
  - Title: `text-4xl` to `text-6xl`, `font-black`
  - Heading: `text-2xl` to `text-3xl`, `font-black`
  - Label: `text-sm`, `font-bold`, `uppercase`
  - Body: `text-base`, `font-semibold`

### 4. **Thick Borders & Blocky Elements**
- **Border Thickness:** Minimum `border-3` (3px) for interactive elements, `border-4` (4px) for primary elements
- **Border Color:** Always use neon accent colors, not grays
- **No Rounded Corners:** Use `rounded-none` or minimal rounding (`rounded-sm`)
- **Sharp Edges:** Prefer geometric, rectangular shapes with clean 90° angles
- **Nested Borders:** Combine multiple borders for layered effect:
  ```css
  border-left: 6px solid #ff5500;
  border-top: 6px solid #ff5500;
  border-right: 2px solid #00f0ff;
  border-bottom: 2px solid #00f0ff;
  ```

### 5. **Minimalism & Functionality**
- **No Gradients:** Use flat, solid colors only
- **No Transparency Overlays:** Avoid `opacity-50` overlays—use solid backgrounds
- **White Space:** Generous padding (6-8 units) between elements
- **Content-First:** Remove decorative elements; prioritize information hierarchy
- **Density:** Loose spacing ensures clarity and impact

### 6. **Gridded Layouts**
- **Subtle Grid Backgrounds:** Use CSS `linear-gradient` for grid texture overlay
  - Opacity: 0.02-0.1 depending on context
  - Size: 40px-60px grid cells
  - Pattern: 45° diagonal or orthogonal
- **Grid Texture Code:**
  ```css
  backgroundImage: `
    linear-gradient(0deg, transparent 24%, rgba(255, 200, 0, 0.03) 25%, ...),
    linear-gradient(90deg, transparent 24%, rgba(255, 200, 0, 0.03) 25%, ...)
  `,
  backgroundSize: '50px 50px'
  ```
- **Alignment:** All elements snap to 4px or 8px grid for visual cohesion
- **Block-Based Layout:** Use CSS Grid or Flexbox with consistent gaps (6 units = 24px)

---

## Color Palette

| Name | Hex | Usage | Contrast |
|------|-----|-------|----------|
| **Blacks** | | | |
| Deep Black | `#050505` | Background (primary) | — |
| Pure Black | `#0a0a0a` | Surface/Cards | — |
| **Grays** | | | |
| Zinc 900 | `#121212` | Secondary surface | 7:1 with Lime |
| Zinc 700 | `#3f3f46` | Disabled/Muted text | 4.5:1 |
| Zinc 600 | `#52525b` | Secondary text | 5:1 |
| Zinc 400 | `#a1a1aa` | Tertiary text | 6:1 |
| **Neons** | | | |
| Cyan | `#00f0ff` | Primary accent (UI) | 11:1 |
| Orange | `#ff5500` | Secondary accent (Actions) | 9:1 |
| Lime Yellow | `#ccff00` | Tertiary accent (Progress) | 13:1 |
| Neon Green | `#00d084` | Quaternary accent (Success) | 10:1 |

### Accessibility Notes
- All neon colors meet WCAG AAA (7:1) contrast against pure black
- Use neon + black combinations exclusively for text/interactive elements
- Never layer two neons on each other

---

## Typography System

### Font Stack
```css
/* Sans-Serif Heavy */
font-family: 'Courier New', 'Courier', monospace;
font-weight: 900; /* font-black */

/* Monospaced */
font-family: 'Monaco', 'Courier New', monospace;
font-weight: 700-900;
```

### Size & Weight Scale
| Context | Size | Weight | Letter Spacing |
|---------|------|--------|-----------------|
| Hero Title | 4xl-6xl | black (900) | widest |
| Section Title | 2xl-3xl | black (900) | wider |
| Card Title | xl-2xl | black (900) | wide |
| Label/Button | sm-base | bold (700) | wider |
| Body Text | base | semibold (600) | normal |
| Helper Text | xs | bold (700) | wider |

### Tailwind Classes
```tailwind
/* Headlines */
.title-hero: text-5xl font-black font-mono tracking-widest uppercase
.title-section: text-3xl font-black font-mono tracking-wider uppercase
.title-card: text-xl font-black font-mono tracking-wider uppercase

/* Labels & Buttons */
.label: text-xs font-bold font-mono uppercase tracking-widest
.button-text: text-sm font-black font-mono uppercase tracking-wider

/* Body */
.body: text-base font-semibold font-mono
```

---

## Component Patterns

### 1. **Brutalist Card**
```jsx
<div
  className="p-6 bg-zinc-950 border-4 outline-none"
  style={{
    borderColor: neonColor,
    boxShadow: `8px 8px 0px ${neonColor}80`
  }}
>
  {/* Content */}
</div>
```

**Features:**
- Thick 4px border in neon color
- Hard-edge shadow 8px offset
- Dark solid background
- No rounded corners
- Generous internal padding

### 2. **Interactive Button (Hover Effect)**
```jsx
<motion.button
  whileHover={{ x: -4, y: -4 }}
  whileTap={{ x: 2, y: 2 }}
  className="border-4 bg-zinc-950 p-6"
  style={{
    borderColor: accentColor,
    boxShadow: `8px 8px 0px ${accentColor}66`
  }}
>
  {/* Content */}
</motion.button>
```

**Features:**
- Hover: Moves up-left, shadow grows
- Tap: Moves down-right, shadow shrinks
- Animated with Framer Motion
- No smooth transitions—snappy movement

### 3. **Search Input with Focus State**
```jsx
<div
  className="flex items-center border-4 bg-zinc-950"
  style={{
    borderColor: isFocused ? '#00f0ff' : '#333',
    boxShadow: isFocused 
      ? '6px 6px 0px rgba(0,240,255,0.8)'
      : '6px 6px 0px rgba(0,0,0,0.8)'
  }}
>
  <input
    placeholder="SEARCH"
    className="bg-transparent px-5 py-6 font-black uppercase font-mono"
  />
</div>
```

**Features:**
- Thick borders change color on focus
- Shadow color matches border
- Monospaced uppercase placeholder
- Full-width expandable on focus

### 4. **Grid Background Overlay**
```jsx
<div
  style={{
    backgroundImage: `
      linear-gradient(0deg, transparent 24%, rgba(204,255,0,0.03) 25%, ...),
      linear-gradient(90deg, transparent 24%, rgba(204,255,0,0.03) 25%, ...)
    `,
    backgroundSize: '50px 50px',
    backgroundColor: '#0a0a0a'
  }}
/>
```

**Features:**
- 50px x 50px grid cells (adjustable)
- Very low opacity (0.02-0.1)
- Uses neon color for grid lines
- Applied to container, not individual elements

### 5. **Asymmetrical Overlapping Blocks (Experimental)**
```jsx
<div
  style={{
    borderLeft: `6px solid ${accent1}`,
    borderTop: `6px solid ${accent1}`,
    borderRight: `2px solid ${accent2}`,
    borderBottom: `2px solid ${accent2}`,
    boxShadow: `12px 12px 0px ${accent1}55, -4px -4px 0px ${accent2}33`,
  }}
/>
```

**Features:**
- Unequal border widths create visual tension
- Multiple shadows in different colors
- Slight perspective transforms optional
- Grid texture overlay applies on hover

---

## Implementation Guidelines

### Dashboard Variants

#### **Variant 1: Brutalist Dashboard Premium**
- **Audience:** Users who prefer clean, organized, functional interfaces
- **Layout:** Grid-based, symmetrical
- **Background:** Subtle orthogonal grid pattern
- **Cards:** Uniform sizing, organized in 2-column grid on large screens
- **Focus:** Clarity and accessibility
- **Feature:** Level badge, XP progress, search bar, 4 main menu buttons

#### **Variant 2: Brutalist Dashboard Experimental**
- **Audience:** Users who enjoy experimental, asymmetrical designs
- **Layout:** Overlapping asymmetrical blocks
- **Background:** Diagonal grid pattern, higher texture visibility
- **Cards:** Varying sizes, overlapped positioning
- **Focus:** Visual interest and experimentation
- **Feature:** Asymmetrical level/XP block, experimental search, floating menu cards

### Applying to Other Components

When extending the brutalist aesthetic to other UI elements:

1. **Establish Base Darkness:** All backgrounds should be `#0a0a0a` or `#050505`
2. **Add Neon Accent:** Pick 1-2 neon colors from the palette
3. **Apply Thick Border:** Minimum 3px, prefer 4px
4. **Add Hard Shadow:** Use `box-shadow` with 6-10px offset
5. **Use Monospaced Typography:** Titles and labels should use `font-mono`
6. **Remove Gradients:** Stick to flat colors
7. **Increase Padding:** 6-8 units internal padding for spacious feel
8. **Add Grid Optional:** Subtle grid background for technical feel

### Theme Configuration (Tailwind)

```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        brutalist: {
          'dark-primary': '#0a0a0a',
          'dark-secondary': '#050505',
          'neon-cyan': '#00f0ff',
          'neon-orange': '#ff5500',
          'neon-lime': '#ccff00',
          'neon-green': '#00d084',
        }
      },
      fontFamily: {
        terminal: ['Courier New', 'Courier', 'monospace'],
      }
    }
  }
};
```

---

## Best Practices

1. **Consistency Over Innovation:** Use established color/shadow patterns
2. **Accessibility First:** Always maintain 7:1+ contrast for text
3. **Test on Dark Rooms:** Neons should "glow" subtly on screens in dark environments
4. **No Soft Shadows:** Every shadow must have clear x/y offsets
5. **Monospaced by Default:** Prefer `font-mono` for headers/labels
6. **Blocky Hierarchy:** Use size, weight, and borders—not color alone
7. **Grid Everything:** Encourage mental model of underlying grid structure
8. **Motion with Purpose:** Animations should emphasize interaction, not distract

---

## Evolution & Variants

The three dashboard variants demonstrate how the brutalist aesthetic can adapt:

| Vision | Premium | Experimental |
|--------|---------|--------------|
| **Philosophy** | Form + Function | Form as Function |
| **Grid** | Orthogonal, subtle | Diagonal, visible |
| **Borders** | Uniform thickness | Varied thickness |
| **Layout** | Symmetrical, grid | Asymmetrical, overlapping |
| **Colors** | 1 accent per card | 2 accents per card |
| **Shadows** | Single, clean | Multiple, layered |
| **Target User** | Productivity-focused | Experimenters |

---

## Future Considerations

- **Animation:** Define standard motion curves (easing, duration) for consistency
- **Responsive:** Ensure all components scale proportionally on mobile
- **Dark/Light Modes:** Currently dark-only; light mode would invert logic
- **Accessibility:** Add ARIA labels, focus states, keyboard navigation
- **Component Library:** Standardize reusable card, button, input components
- **Design Tokens:** Migrate to CSS variables for theme switching

---

## Resources

- **Tailwind CSS:** https://tailwindcss.com/
- **Framer Motion:** https://www.framer.com/motion/
- **CSS Grid Generators:** https://grainy-gradients.vercel.app/
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Typography Resources:** https://fonts.google.com/
