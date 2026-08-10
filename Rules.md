# AI Rules and Boundaries

This document defines the strict rules that any AI interacting with this codebase must follow.

## 1. Libraries and Frameworks
- **DO NOT** introduce new CSS frameworks (e.g., Tailwind, Material UI, Bootstrap) if not already in use for a specific component. The site uses a mix of Tailwind and Vanilla CSS. Respect the existing `.css` files (`globals.css`, `index.css`).
- **DO NOT** introduce heavy third-party state management (like Redux) since `zustand` is already implemented and sufficient.
- **DO NOT** use default `fetch` in Client Components without proper `useEffect` hooks or state management.

## 2. API & Secrets Management
- **NEVER** expose API keys, Database URLs, or JWT secrets in client-side code.
- **NEVER** write real secrets into `.env.production` or commit them to source control.
- Use `process.env.VARIABLE_NAME` in Server Components and API routes only. For client-side exposure, the variable must be prefixed with `NEXT_PUBLIC_`.

## 3. Database Interactions
- All database operations MUST use the existing `prisma` instance (`import { prisma } from '@/lib/prisma'`).
- Always handle potential database connection errors gracefully using `try/catch` blocks in API routes, returning proper HTTP status codes (e.g., 500 for server errors).

## 4. UI/UX Rules
- Prioritize visual excellence. Use the defined red, black, and white color palette.
- Do not use generic alert boxes (`alert()`) for user interactions; utilize the existing `<Toast />` component system.
- Always include `aria-labels` on buttons (especially icon-only buttons) for accessibility.

## 5. File Structure
- Keep React Components in `/src/components`.
- Keep Database operations within `/src/app/api` or directly inside Next.js Server Components.

## 6. Execution & Verification
- AI must NOT implement major structural changes without proposing an implementation plan first.
- Always verify build integrity (`npm run build`) before declaring a task complete.
