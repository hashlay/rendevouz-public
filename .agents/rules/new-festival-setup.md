---
description: Critical rules and procedure for connecting a new MongoDB database, bypassing the 16MB document limit, and deploying to new Git & Vercel projects for a new festival.
globs: "**/*"
---

# New Festival Setup & 16MB MongoDB Architecture Rule

When setting up a new festival, connecting to a new MongoDB database, or configuring new Git & Vercel projects, you MUST follow these architectural rules:

## 1. 16MB Document Limit Partitioning
MongoDB Atlas has a strict 16MB limit on single BSON documents. NEVER store all festival state into a single monolithic document or field.
Always maintain the 17 partitioned collections configured in `server/db.ts`:
- `users`, `units`, `categories`, `competitions`, `participants`, `teams`, `results`, `registrations`, `chestNumbers`, `counters`, `greenRoomAssignments`, `judgmentSheets`, `judgeScores`, `gallery`, `videoHighlights`, `dragBlocks`, `heroMedia`.
- Settings are saved as individual documents inside `settings`: `eventSettings`, `cmsSettings`, `posterTemplateConfig`, `certificateTemplateConfig`, `state_version`.
- `global_state` in `app_state` has a 12MB ceiling guard; if exceeded, it automatically skips writing to `global_state` and relies completely on the 17 individual collections.

## 2. New Database Connection
- Set `MONGODB_URI` to `mongodb+srv://.../<NEW_DB_NAME>?retryWrites=true&w=majority`.
- The database name is automatically detected from the URI path.
- If migrating from existing data or JSON, run `npx tsx server/migrateToCollections.ts`.
- If starting fresh, `ensureDbExists()` in `server/db.ts` automatically seeds the initial super admin and default units/categories.

## 3. Dual App Deployment
- **Admin App**: `ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/`
- **Public App**: Workspace Root `./`
- Both apps connect to the same `MONGODB_URI`.
- In Admin Settings, set `publicPortalUrl` to the live public Vercel domain for QR code generation.

Refer to `NEW_FESTIVAL_SETUP_GUIDE.md` in the root workspace for full step-by-step instructions.
