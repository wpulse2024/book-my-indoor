# BookMyIndoor — Project Plan & Claude Instructions

## Project Overview

BookMyIndoor is a multi-tenant SaaS platform for discovering, managing, and booking indoor venues (sports turfs, badminton courts, futsal arenas, studios, etc.). It is **not** a WordPress plugin — it is a standalone web application with a REST API.

**Three roles:** Super Admin (platform owner) → Indoor Owner (tenant/venue operator) → End User (customer)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Vite + Tailwind CSS + Pinia |
| Backend | Node.js + Express (TypeScript) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (jsonwebtoken) + role middleware |
| Real-time | Socket.io (slot availability) |
| Notifications | Twilio SMS + WhatsApp Business API |
| Payments | SSLCommerz (primary) + Stripe (optional) |
| Storage | Cloudflare R2 (images, QR codes) |
| Queue | BullMQ + Redis |
| Deployment | Docker + Nginx |
| API Docs | OpenAPI 3.0 (Swagger UI via swagger-ui-express) |

---

## Repository Structure

```
book-my-indoor/
├── backend/                    # Node.js + Express API (TypeScript)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── superAdmin/
│   │   │   ├── owner/
│   │   │   └── user/
│   │   ├── middleware/
│   │   │   ├── tenant.middleware.ts
│   │   │   ├── auth.middleware.ts
│   │   │   └── role.middleware.ts
│   │   ├── routes/
│   │   │   ├── v1/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── superAdmin.routes.ts
│   │   │   │   ├── owner.routes.ts
│   │   │   │   └── user.routes.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── jobs/               # BullMQ job definitions
│   │   ├── utils/
│   │   ├── types/
│   │   └── app.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── tests/
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                   # Vue 3 SPA
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── super-admin/
│   │   │   ├── owner/
│   │   │   └── user/
│   │   ├── composables/
│   │   ├── layouts/
│   │   │   ├── SuperAdminLayout.vue
│   │   │   ├── OwnerLayout.vue
│   │   │   └── UserLayout.vue
│   │   ├── pages/
│   │   │   ├── super-admin/
│   │   │   ├── owner/
│   │   │   └── user/
│   │   ├── router/
│   │   │   └── index.ts        # Route guards per role
│   │   ├── stores/             # Pinia stores
│   │   └── services/           # API client (axios)
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── docker-compose.yml
└── CLAUDE.md
```

---

## Database Schema

### Core Tables

```
tenants                         # Indoor Owners (SaaS tenants)
  id, name, slug, email, phone, status, subscription_plan_id,
  trial_ends_at, created_at

venues                          # Physical locations
  id, tenant_id, name, slug, address, lat, lng, city, area,
  type (turf|court|studio|...), description, cover_image,
  is_active, created_at

venue_branches                  # Multi-branch support
  id, venue_id, name, address, lat, lng, phone, is_active

slots                           # Time-based booking slots
  id, venue_id, branch_id, name, start_time, end_time,
  duration_minutes, base_price, max_capacity, is_active

pricing_rules                   # Dynamic pricing
  id, slot_id, rule_type (peak|off_peak|weekend),
  price_override, days_of_week[], start_date, end_date

bookings
  id, user_id, slot_id, branch_id, booking_date, start_time,
  end_time, status (pending|confirmed|cancelled|completed),
  total_amount, payment_status, qr_token, notes, created_at

payments
  id, booking_id, user_id, method (wallet|sslcommerz|stripe),
  amount, gateway_ref, status, paid_at

users                           # End users
  id, name, email, phone, avatar, wallet_balance,
  auto_created (bool), created_at

wallet_transactions
  id, user_id, type (credit|debit), amount, reference,
  description, created_at

staff                           # Venue staff accounts
  id, tenant_id, user_id, role (manager|accountant|receptionist),
  permissions (json), is_active

subscription_plans
  id, name, max_venues, max_staff, features (json),
  price_monthly, price_yearly

tenant_subscriptions
  id, tenant_id, plan_id, status, starts_at, ends_at,
  payment_ref

reviews
  id, venue_id, user_id, booking_id, rating (1-5),
  comment, created_at
```

---

## API Structure

All routes are prefixed `/api/v1/`.

### Auth
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/otp/send
POST   /auth/otp/verify
```

### Super Admin (`/super-admin/`)
```
GET    /tenants
POST   /tenants
PUT    /tenants/{id}
DELETE /tenants/{id}
GET    /tenants/{id}/stats
GET    /regions
PUT    /regions/{id}/toggle
GET    /subscriptions/plans
POST   /subscriptions/plans
GET    /analytics/overview
GET    /analytics/bookings
GET    /analytics/revenue
```

### Owner (`/owner/`) — tenant-scoped
```
GET    /venues
POST   /venues
PUT    /venues/{id}
GET    /venues/{id}/slots
POST   /venues/{id}/slots
PUT    /slots/{id}
DELETE /slots/{id}
POST   /slots/{id}/pricing-rules
GET    /bookings
PUT    /bookings/{id}/status
GET    /staff
POST   /staff
PUT    /staff/{id}/permissions
GET    /branches
POST   /branches
GET    /reports/revenue
GET    /reports/bookings
GET    /settings
PUT    /settings
```

### User (`/user/`)
```
GET    /venues/nearby?lat=&lng=&radius=
GET    /venues?date=&time=&type=&area=
GET    /venues/{slug}
GET    /venues/{slug}/slots/available?date=
POST   /bookings
GET    /bookings
DELETE /bookings/{id}         # cancel
GET    /bookings/{id}/qr
GET    /wallet
POST   /wallet/topup
GET    /wallet/transactions
GET    /profile
PUT    /profile
POST   /reviews
```

---

## Role & Permission System

```
super_admin     → full platform access
owner           → tenant-scoped full access
manager         → bookings + slots + staff view
accountant      → reports + payments (read-only bookings)
receptionist    → bookings + QR check-in only
user            → discovery + booking + wallet
```

Staff permissions are stored as a JSON array on the `staff` table, allowing granular overrides beyond the base role.

---

## Multi-Tenancy Rules

- Every Owner-facing query is scoped by `tenantId` via `tenantMiddleware`
- `tenantMiddleware` resolves tenant from the authenticated user's `tenantId` in JWT payload
- No cross-tenant data leak is possible at the service layer — all repositories accept tenant context
- Prisma queries always include `where: { tenantId }` for owner-scoped resources
- Super Admin bypasses tenant scope via a separate route group

---

## Key Business Logic

### Slot Booking Flow
1. User selects venue → date → slot
2. System checks slot availability (no confirmed booking for that slot + date)
3. Pessimistic lock on slot + date combination during reservation
4. Payment processed (wallet deduct or gateway redirect)
5. On payment success → booking confirmed → QR token generated → SMS/WhatsApp sent
6. On payment failure → booking released after 10 minutes (queue job)

### Dynamic Pricing Resolution
Priority order (highest wins):
1. Date-specific override
2. Weekday/weekend rule
3. Peak/off-peak time rule
4. Base slot price

### Auto Account Creation
- On first booking, if phone/email not found → create user account
- Send OTP to verify → account activated
- All future bookings linked to the same account

### QR Check-in
- `qr_token` is a signed UUID stored per booking
- Staff scan QR → API validates token + checks booking date matches today
- Marks booking as `checked_in`

---

## Notification Events

| Event | Channel |
|---|---|
| Booking confirmed | SMS + WhatsApp |
| Booking cancelled | SMS |
| 24h before booking | WhatsApp reminder |
| 1h before booking | SMS reminder |
| Payment received | Email |
| Wallet topped up | Email + SMS |
| Owner: new booking | Email |
| Owner: daily summary | Email (7 AM) |

---

## Phased Development Plan

### Phase 1 — MVP (Weeks 1–10)

**Week 1–2: Foundation**
- [ ] Node.js + Express + TypeScript project setup, PostgreSQL, Prisma, Docker
- [ ] Vue 3 + Vite + Tailwind + Pinia scaffold
- [ ] Auth system (register, login, OTP, JWT, roles)
- [ ] Tenant middleware and role guards

**Week 3–4: Super Admin**
- [ ] Tenant CRUD
- [ ] Subscription plan management
- [ ] Region/area management
- [ ] Basic analytics dashboard

**Week 5–6: Indoor Owner**
- [ ] Venue CRUD with image upload
- [ ] Slot management (create, edit, toggle)
- [ ] Booking overview and status management
- [ ] Staff invite and role assignment

**Week 7–8: End User**
- [ ] Venue discovery with geo-search
- [ ] Filter UI (date, time, type, area)
- [ ] Slot availability view
- [ ] Booking flow + auto account creation

**Week 9–10: Payments & Notifications**
- [ ] SSLCommerz integration
- [ ] Booking confirmation emails/SMS
- [ ] QR token generation
- [ ] Polish + bug fixes + MVP deploy

---

### Phase 2 — Growth Features (Weeks 11–18)

**Week 11–12: Dynamic Pricing**
- [ ] Pricing rule engine
- [ ] Owner UI for pricing rules
- [ ] Price display logic on frontend

**Week 13–14: Wallet System**
- [ ] Wallet top-up flow
- [ ] Deduct wallet on booking
- [ ] Transaction history

**Week 15: QR Check-in**
- [ ] QR code generation (per booking)
- [ ] Staff check-in scanner page
- [ ] Validation API endpoint

**Week 16: WhatsApp Reminders**
- [ ] WhatsApp Business API integration
- [ ] Queue-based reminder jobs (24h, 1h)
- [ ] Owner daily summary job

**Week 17–18: Multi-Branch & Advanced Roles**
- [ ] Branch CRUD for owners
- [ ] Per-branch slot and booking management
- [ ] Granular staff permissions UI

---

### Phase 3 — API & Scale (Weeks 19–24)

**Week 19–20: Public REST API**
- [ ] OpenAPI 3.0 spec
- [ ] Swagger UI at `/api/docs`
- [ ] API key management for owners

**Week 21–22: Advanced Analytics**
- [ ] Peak hour heatmaps
- [ ] Cancellation rate tracking
- [ ] Per-branch revenue breakdown
- [ ] Export to CSV/PDF

**Week 23–24: Mobile App**
- [ ] Flutter or React Native scaffold
- [ ] User-facing flows (discovery, booking, wallet, QR)
- [ ] Push notification integration

---

## Coding Conventions

### Backend (Node.js + Express + TypeScript)
- Use Repository + Service pattern — controllers stay thin (only parse request, call service, return response)
- All responses via a shared `sendSuccess()` / `sendError()` helper in `utils/response.ts`
- Validation with `zod` schemas in a `validators/` folder — validate before reaching the service layer
- Use TypeScript enums or const objects for status fields (BookingStatus, PaymentStatus, StaffRole)
- All DB access via Prisma — no raw SQL except for complex geo queries
- BullMQ for background jobs (reminders, booking expiry)
- Feature tests with `vitest` + `supertest` for every route
- `npm test` must pass before any commit

### Frontend (Vue 3)
- Composition API only — no Options API
- One Pinia store per domain (authStore, venueStore, bookingStore, walletStore)
- API calls only in `src/services/` — never directly in components
- Route guards in `router/index.ts` check role from authStore
- Component naming: PascalCase files, kebab-case in templates
- Tailwind only — no custom CSS unless unavoidable

### Git
- Branch naming: `feature/`, `fix/`, `chore/`
- Commit format: `feat: add slot booking flow`, `fix: wallet deduction race condition`
- PRs require passing tests + review before merge to `main`

---

## Environment Variables

```env
# Backend
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://user:pass@localhost:5432/book_my_indoor
JWT_SECRET=
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASS=
SSLCOMMERZ_IS_LIVE=false
TWILIO_SID=
TWILIO_TOKEN=
TWILIO_FROM=
WHATSAPP_API_TOKEN=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_KEY=
CLOUDFLARE_R2_SECRET=
CLOUDFLARE_R2_ENDPOINT=

# Frontend
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000
VITE_MAPBOX_TOKEN=
```

---

## Getting Started (Dev)

```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev              # ts-node-dev / nodemon

# Frontend
cd frontend
npm install
npm run dev

# Or with Docker
docker-compose up --build
```

---

## Key Decisions & Rationale

| Decision | Reason |
|---|---|
| Node.js + Express over Laravel | Team preference; TypeScript gives type safety across the full stack |
| Prisma over raw pg/Knex | Type-safe queries, schema-as-code, easy migrations |
| PostgreSQL over MySQL | Better JSON support, row-level locking for slot reservation |
| BullMQ over simple cron | Reliable job retries and delay for booking expiry/reminders |
| Vue 3 + Pinia over React | Lighter, faster to build dashboards; team familiarity |
| Tenant ID scoping over separate DBs | Easier to manage, sufficient isolation at this scale |
| SSLCommerz first | Primary market is BD; Stripe added later for international |
| QR tokens as signed UUIDs | Simple, stateless validation without extra DB queries |
