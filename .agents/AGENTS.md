# Dastiyabstore - Project Guidelines

## Technology Stack
- **Framework:** Next.js (App Router)
- **Database & Auth:** Supabase
- **State Management:** Zustand (`src/store/cartStore.tsx`, `src/store/wishlistStore.tsx`)
- **Styling:** Custom CSS + Tailwind CSS

## Styling Conventions (CRITICAL)
Always prioritize using the project's existing custom CSS classes defined in `src/app/globals.css` rather than writing new inline styles or raw Tailwind utilities.

**Colors:**
- Primary Brand: `var(--red)`, `var(--yellow)`, `var(--black)`, `var(--white)`
- Neutrals: `var(--gray-50)` through `var(--gray-900)`

**Buttons:**
- Primary Action: `btn-red`
- Secondary Action: `btn-yellow`
- Outline: `btn-outline-red`
- Subtle: `btn-ghost`

**Forms & UI:**
- Inputs: `input`
- Labels: `label`
- Cards: `card`
- Badges: `badge-red`, `badge-yellow`, `badge-gray`, `badge-green`

## Supabase Architecture
When interacting with the database, these are the core tables:
- `categories`, `products`, `store_settings`, `newsletter_subscribers`, `coupons`, `customers`, `delivery_areas`, `product_reviews`, `product_qna`, `orders`, `order_items`

## Behavior Rule
When creating new components or pages, you MUST adhere strictly to the visual theme defined in `globals.css`. Ensure components have consistent padding, use the standard `btn-*` classes, and never deviate to basic unstyled HTML elements.
