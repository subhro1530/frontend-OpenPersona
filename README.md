# OpenPersona Frontend

Futuristic AI-native identity studio built with Next.js (App Router) and Tailwind CSS. This UI orchestrates every OpenPersona capability: cinematic landing, multi-surface workspace, portfolio builder, resume intelligence, support AI suite, Vultr-backed media, dashboards, billing, and admin oversight.

## Quick start

```bash
npm install
npm run dev
```

Create `./.env.local` (see `.env.local.example`) before running so API traffic points at the backend.

## Tech stack

- **Next.js App Router** — streaming layouts, route groups, metadata
- **Tailwind CSS + custom tokens** — neon gradients & glassmorphism with accessibility baked in
- **Framer Motion** — cinematic hero moments & micro-interactions
- **Zustand** — global auth, plan, drafts, and UI state
- **SWR** — resilient data fetching with optimistic updates & cache invalidation

## Feature highlights

- Landing + auth flow with immersive hero, login/register, plan CTA
- Authenticated workspace shell with persistent nav, plan badge, identity summary
- Portfolio builder (blueprint, AI drafts, manual composer, enhancer modal, preview)
- Resume intelligence viewer + Gemini analysis + push-to-builder CTA
- Support AI suite (highlights, job match, identity copilot)
- Agent flows (profile insights, dashboard designer, suggestions)
- Vultr file manager with drag-upload, categories, signed URL preview
- Dashboard catalog + editor + plan-aware guardrails
- Templates carousel with live previews and public profile simulator
- Billing plans + upgrade flows + admin console for plan/block actions

## Development scripts

| Script          | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start Next.js dev server        |
| `npm run build` | Production build                |
| `npm run start` | Serve production build          |
| `npm run lint`  | ESLint via `eslint-config-next` |

## Deployment

Optimized for Vercel. Add the required environment variables (see below) within the project settings.
