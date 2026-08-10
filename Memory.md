# Project Memory

*This document serves as the AI's long-term memory for the Dastiyab Store project. It should be updated as major features are completed to maintain context across sessions.*

## Completed Features
- **Project Foundation**: Built with Next.js (App Router), React 19, and Tailwind CSS.
- **Database**: PostgreSQL integrated using Prisma. `schema.prisma` holds schemas for Settings, Products, Categories, Orders, Customers, and Reviews.
- **State Management**: `zustand` is actively used for handling the shopping cart and wishlist (`cartStore`, `wishlistStore`).
- **Media Optimization**: Integrated Cloudinary for serving high-performance images.
- **Settings & Customization**: 
  - Admins can dynamically change the Top Announcement Banner (including its background CSS color) from the dashboard.
  - Footer links, contact info, and delivery thresholds are all manageable via DB-backed settings.
  - A customizable 14 August / Azaadi Sale banner is currently implemented.
- **AI Chatbot**: Integrated Gemini API (`gemini-1.5-pro`) to handle customer queries directly on the site.
- **Performance & Accessibility**: Addressed Lighthouse audit issues. Added `aria-label` attributes to UI elements (Navbar, Footer, ProductCards). Optimized `Poppins` font loading.

## Ongoing/Current Work
- **Security & Env Hardening**: Removing tracked `.env` files from GitHub and securing Next.js endpoints. Documenting the project architecture.

## Known Limitations / Quirks
- The `promo_banner_settings` in the DB was migrated from a simple `string[]` to an object `{ texts: string[], bgColor: string }`. The code gracefully handles both to maintain backward compatibility.
- Order processing is currently manual (Cash on Delivery). Payment gateways are not yet integrated.
- The `next.config.ts` has specific `remotePatterns` set for external image domains (Unsplash, Cloudinary, Placehold, Contentful).
