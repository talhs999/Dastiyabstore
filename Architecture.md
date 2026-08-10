# System Architecture

## Technical Stack
- **Frontend / Framework**: Next.js (App Router), React 19
- **Styling**: Tailwind CSS (PostCSS), Vanilla CSS (`globals.css` and `index.css`)
- **Database**: PostgreSQL (via Prisma ORM)
- **Media Storage**: Cloudinary
- **AI Integration**: Google Generative AI (Gemini) for the chatbot
- **State Management**: Zustand (Cart and Wishlist stores)
- **Icons**: Lucide React & React Icons

## Folder Structure
- `/src/app`: Contains the Next.js App Router structure.
  - `/admin`: All admin dashboard routes.
  - `/api`: Backend API routes (RESTful).
  - `/shop`, `/product`, `/cart`, `/checkout`: Frontend customer routes.
- `/src/components`: Reusable UI components (`Navbar`, `Footer`, `ProductCard`, `Chatbot`, Admin UI, etc.).
- `/src/lib`: Utility functions, Prisma client instantiation (`prisma.ts`), and helper functions.
- `/src/store`: Zustand state management stores (`cartStore.ts`, `wishlistStore.ts`).
- `/src/data`: Hardcoded or fallback data structures (if any).
- `/prisma`: Contains `schema.prisma` mapping out the database structure.

## Database Schema (High-Level)
- **StoreSetting**: Stores global JSON configuration (promo banners, stats, footer links).
- **Product & Category**: Product catalog.
- **Order & OrderItem**: Customer orders.
- **Customer**: Registered customer details.
- **Review**: Product and site-wide reviews.

## Architecture Flow
1. **Client-Side Rendering (CSR)**: Heavy interactive components like `Navbar` and `Chatbot` are client components.
2. **Server-Side Rendering (SSR) & Static Site Generation (SSG)**: Product pages and basic layouts fetch data directly using Prisma in server components for maximum SEO and performance.
3. **API Routes**: The Admin Panel communicates exclusively via `/api/admin/*` routes to manage state.
