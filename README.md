# National Paralympic Committee of Rwanda (NPC Rwanda)

**Official Website & Digital Platform**

[![Live Website](https://img.shields.io/badge/Website-npcrwanda.org-blue?style=flat-square&logo=globe)](https://npcrwanda.org)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](./LICENSE)

---

## About NPC Rwanda

The **National Paralympic Committee of Rwanda (NPC Rwanda)** is the official body responsible for organizing and developing Paralympic sport in Rwanda. We represent Rwandan athletes with physical, visual, and intellectual impairments at national and international levels, including the Paralympic Games.

This repository contains the source code for the official NPC Rwanda digital platform — a full-stack web application providing public information, news, events, athlete profiles, and an internal content management system.

## Platform Goals

The platform is designed to help NPC Rwanda:

- **Share reliable information** about the committee, its activities, and Paralympic sport in Rwanda.
- **Highlight athletes and achievements** through athlete profiles, news, and event updates.
- **Make resources easier to find** by organizing governance documents, sports information, and opportunities.
- **Keep content current** through an internal admin dashboard for authorized staff.

---

## Platform Features

- **Athletes Directory** — Profiles and achievements of Rwandan Paralympic athletes
- **News & Announcements** — Latest news, updates, and official announcements
- **Events Calendar** — Upcoming national and international Paralympic events
- **Governance & Documents** — Organizational policies, leadership, and official documents
- **Sports Information** — Rwanda's Paralympic sports disciplines
- **Members & Partners** — Federations, Clubs, Associations, and DPSCO contacts
- **Careers** — Job and volunteer opportunities within NPC Rwanda
- **Admin Dashboard** — Internal CMS for managing website content (role-based access)
- **Online Donations** — Flutterwave-powered donations (MTN MoMo, Airtel Money, card)

## Content and Usability Guidelines

When maintaining the platform, aim to:

- Use clear, respectful language when writing about athletes and disability sport.
- Keep navigation and page layouts usable on both mobile devices and desktop screens.
- Provide descriptive titles and links so visitors can find information and resources easily.
- Manage public-facing content through the admin dashboard where that functionality is available.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| Database | PostgreSQL via Prisma ORM 5 |
| Auth | Custom JWT (jose / bcryptjs), cookie-based sessions |
| State | TanStack Query v5 + React Context |
| Styling | Bootstrap 5, CSS Modules |
| Payments | Flutterwave (MTN MoMo, Airtel Money, card) |
| Media | Cloudinary |
| Infrastructure | Docker, Docker Compose, PM2 |

---

## Project Structure

```
src/
├── app/                   # Next.js App Router — routes, pages, API handlers
│   ├── api/               # REST API route handlers (grouped by domain)
│   ├── dashboard/         # Admin dashboard pages (page, donations, community)
│   └── (public pages)     # Athletes, news, events, donate, sports, etc.
│
├── components/
│   ├── ui/                # Reusable UI primitives (Pagination, MarkdownRenderer, AccessibilityWidget)
│   ├── layout/            # Page shell components (PublicLayout)
│   ├── navigation/        # AppSidebar and navigation components
│   ├── shared/            # Cross-feature components (AccessRestricted, DashboardAnalytics)
│   └── (root)             # Public-site components (Header, Footer, HomeClient, …)
│
├── context/               # React contexts (DataContext, LanguageContext)
├── hooks/                 # Reusable custom React hooks
│   ├── useProfile.ts      # Fetch current admin session profile
│   ├── usePagination.ts   # Generic pagination state
│   └── useTableSort.ts    # Generic column sort state
│
├── lib/                   # Server & isomorphic utilities
│   ├── auth.ts            # JWT sign/verify — server only
│   ├── rbac.ts            # Permission matrix — client-safe, isomorphic
│   ├── rbac-server.ts     # authorizeRequest() guard — server only
│   ├── prisma.ts          # Prisma client singleton
│   └── (mailer, cloudinary, seo, flutterwave, slug, antiSpam, …)
│
├── services/              # Fetch API helpers
│   ├── auth.service.ts    # loginUser, logoutUser, fetchProfile
│   └── admin.service.ts   # apiGet, apiPost, apiPut, apiDelete helpers
│
├── types/                 # Shared TypeScript type barrels
│   ├── cms.ts             # Public entity types (Athlete, NewsArticle, Event, …)
│   ├── admin.ts           # Admin types (JWTPayload, AppRole, Permission, …)
│   └── index.ts           # Barrel re-export
│
├── data/                  # Static data & translations
└── middleware.ts          # Edge RBAC + session enforcement (runs before every request)

prisma/                    # Prisma schema + migrations
tests/
├── unit/                  # Unit tests (RBAC permission matrix — 23 test cases)
├── integration/           # Integration tests (future)
└── e2e/                   # End-to-end tests (future)
```

---

## Authorization Architecture

Security is enforced at three layers:

| Layer | Mechanism | Purpose |
|---|---|---|
| Edge | `src/middleware.ts` | Rejects unauthenticated/unauthorized requests before route handlers run |
| Server | `src/lib/rbac-server.ts` `authorizeRequest()` | Granular permission check per API endpoint |
| Client | `src/lib/rbac.ts` `hasPermission()` | Drives sidebar filtering and UI gating (never sole guard) |

**Roles** (high to low): `SUPER_ADMIN` → `ADMIN` → `MANAGER` → `EDITOR` → `STAFF`

**System Settings** are exclusively accessible to `SUPER_ADMIN` — enforced at middleware, API, and UI layers.

---

## Development

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# (edit .env with your DATABASE_URL, JWT_SECRET, Cloudinary, Flutterwave keys)

# Start dev server (Turbopack)
npm run dev

# Type check
npx tsc --noEmit

# Run unit tests (23 RBAC test cases)
npm test

# Production build
npm run build

# Start production server
npm start
```

---

## Contact

**National Paralympic Committee of Rwanda**
- Website: [npcrwanda.org](https://npcrwanda.org)
- Email: [info@npcrwanda.org](mailto:info@npcrwanda.org)
- Address: Amahoro National Stadium, BP 2684, Remera, Kigali, Rwanda

---

## License

© 2026 National Paralympic Committee of Rwanda. All rights reserved.
See [LICENSE](./LICENSE) for details.
