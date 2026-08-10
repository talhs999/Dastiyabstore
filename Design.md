# Design & Aesthetics Guidelines

## Color Palette
The Dastiyab Store UI is built around a modern, high-contrast, premium aesthetic.
- **Primary Brand Color**: `var(--red)` (`#E63946`) - Used for primary Call-To-Action (CTA) buttons, important highlights, and accents.
- **Secondary Accent**: `var(--yellow)` (`#FFB703`) - Used for secondary highlights (like the "Store" part of the logo) and warning/info states.
- **Backgrounds**: `var(--white)` (`#FFFFFF`) and `var(--gray-50)` (`#F9FAFB`) - Used to keep the interface clean and breathable.
- **Text & Typography**: `var(--gray-900)` (`#111827`) for strong headings, and `var(--gray-500)` (`#6B7280`) for subtle text/descriptions.

## Typography
- **Primary Font**: `Inter` (Sans-serif) - Used for UI elements, buttons, and body text.
- **Secondary Font**: `Poppins` (Sans-serif) - Used for prominent, bold headings to give a modern, premium feel.
*(Fonts are optimized and loaded via `next/font/google`)*

## CSS Architecture
- **Vanilla CSS (`globals.css`)**: Contains global CSS variables (design tokens), utility classes for standard layouts (`.btn-red`, `.input`, `.label`), and custom animations (e.g., `.animate-marquee`).
- **Tailwind CSS**: Used alongside Vanilla CSS for rapid layout structuring (flex, grid, spacing, responsive utilities).

## Component Guidelines
- **Buttons**: Must have a distinct hover state (e.g., darkening the background, slight upward translation, or drop shadow) to feel responsive.
- **Inputs**: Forms must feature rounded borders (`var(--radius-lg)`), soft shadows on focus, and clear labels.
- **Images**: Ensure all product images maintain a consistent aspect ratio (typically square or 4:3) using `object-fit: cover` or `contain`.
- **Micro-animations**: Use subtle transitions (`transition: all 0.3s ease`) on interactive elements. Ensure carousel elements or marquees use hardware-accelerated animations.

## Accessibility
- Color contrast ratios must pass WCAG AA standards. 
- Ensure all SVG icons and interactive buttons possess an `aria-label`.
