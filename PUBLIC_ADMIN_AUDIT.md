# NPC Rwanda public website ↔ admin audit

Last reviewed: 2026-11-07

## Scope and safety

This audit checks whether public-facing records have an administrative source of truth and whether the public API exposes only records intended for publication. It does not authorize production data changes. The homepage was not redesigned or rewritten.

## Managed public data map

| Public content | Public API / data source | Admin management area |
|---|---|---|
| Athletes | `/api/athletes`, public bundle | Website Pages → Athletes |
| Sports disciplines | `/api/sports`, public bundle | Website Pages → Sports |
| News and announcements | `/api/news`, public bundle | Website Pages → News / Announcements |
| Events and results | `/api/events`, competition results API | Website Pages → Events; Community for registrations |
| Careers and vacancies | `/api/careers` | Website Pages → Careers |
| Leadership | `/api/leaders` | Website Pages → Leadership |
| Governance documents and policies | `/api/governance-docs`, `/api/governance-policies` | Website Pages → Governance |
| Partners | `/api/partners` | Website Pages → Partners |
| Associations, clubs, federations, DPSCO contacts | `/api/npc-associations`, `/api/npc-clubs`, `/api/npc-federations`, `/api/dpsco-contacts` | Members management |
| Contact details and social links | `/api/contact-info`, `/api/social-links` | Contact / footer and page content management |
| Site editorial content | `/api/site-content`, public bundle | Website Pages editor (Home, About, NPC Background, Leadership) |
| Training programmes | `/api/training-programs` | Community → Programmes |
| Athlete scouting enquiries | `/api/athlete-enquiries` | Community → Athlete Enquiries |
| Event registrations | `/api/event-registrations` | Community → Event Registrations |
| Partnership enquiries | `/api/sponsor-enquiries` | Community → Partnership Enquiries |
| Volunteer, contact, job and donation enquiries | `/api/volunteers`, `/api/contacts`, `/api/job-applications`, `/api/donations` | Inbox / Applications |
| Donation payments | `/api/donations/payments` and payment provider callbacks | Donations & Contributions |
| Newsletter subscribers | `/api/subscribers` | Newsletter Subscribers |
| Gallery/media | `/api/gallery`, `/api/media` | Media / content management |

The public bundle filters inactive or unpublished records for the public scope. Admin bundle access requires a valid session and content permission. Private system settings are allowlisted out of the public bundle; system settings and database backup are Super Administrator only.

## Additional content management changes in this follow-up

- About page heading and introduction are now stored in `SiteContent`.
- About page milestone timeline and affiliations are stored as editable line-based content in `SiteContent` and exposed in the About page editor.
- Strategic objective descriptions and outcome text now read managed content instead of being fixed in the public page.
- Dashboard notification previews now use one permission-checked summary endpoint rather than downloading three full inbox lists. Donation previews are included only for roles with `donations.view`, and each notification links to its corresponding inbox tab.

## Editorial copy still requiring a product decision / follow-up

These are currently part of the designed page presentation rather than independently managed records. Decide whether each needs a CMS field or should remain stable interface copy:

- NPC Background hero title/introduction and the four core-pillar labels.
- Sports Development pathway stage titles, descriptions and bullet points.
- About page section labels and explanatory supporting copy around the managed vision/mission.
- Public page metadata (titles, descriptions, social preview text) where the organization wants editors to control SEO copy.

Donation purpose choices and form labels are transaction/form taxonomy, not ordinary editorial content; they should be changed only with a coordinated payment and reporting review.

## Production diagnostics still required (read-only)

The repository contains committed Prisma migrations, including two migration directories with the same timestamp prefix (`20261031070000`). Their SQL creates separate tables and indexes, but repository inspection cannot prove the production database has the matching migration history or schema.

Before enabling `RUN_PRISMA_MIGRATIONS=true`, run these commands on the production host and preserve the output:

```bash
cd /var/www/NPCRwanda
npx prisma migrate status
```

Then inspect migration history with a read-only database query:

```sql
SELECT migration_name, started_at, finished_at, rolled_back_at, logs
FROM "_prisma_migrations"
ORDER BY started_at, migration_name;
```

To investigate records that reportedly return after deletion, compare counts and identifiers immediately after a deletion and again after the next deployment/restart. Run read-only `SELECT COUNT(*)` queries for the affected tables (for example `ContactMessage`, `VolunteerApplication`, `DonationInquiry`, and the relevant content tables), and correlate the timestamps with deployment logs, scheduled jobs, backup/restore activity, and any manual seed invocation. Do not run `seed`, `db push`, `migrate reset`, or any destructive migration as part of this investigation.

No production database or VPS session was available during this code review, so the reported record resurrection and production migration baseline remain unverified.

## Browser and runtime verification still required

- Check desktop and mobile navigation, page editor save/reload, community CRUD, inbox notifications, and role-specific access in a real browser.
- Confirm public counts and published records against the production admin database. The live website snapshot reviewed on 2026-11-07 showed zero districts and empty news/event states; client-rendered pages also displayed loading placeholders in the text-only browser view. This is a warning to verify live data/API behavior, not proof that the database is empty.
- Run typecheck, lint, production build and CRUD/RBAC tests in an environment with the repository dependencies. This follow-up deliberately does not change or troubleshoot the GitHub Actions workflow.

## Deployment status

These follow-up changes are isolated on `audit/admin-performance-and-content-gaps`. They have not been merged or deployed. Do not enable production migrations until the read-only baseline review is complete.
