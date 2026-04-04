# HouseHunt — Product Requirements Document & Technical Specification

**Version:** 1.0  
**Date:** March 2026  
**Market:** Nigeria (Phase 1) → Global (Phase 2)  
**Status:** Pre-development

---

## 1. Executive Summary

HouseHunt is a peer-to-peer rental marketplace that eliminates physical agents and in-person inspections from the house-hunting process. Landlords list verified properties with live-recorded videos that are converted into interactive 3D walkthroughs. Prospective tenants screen, inspect, and pay entirely online. Legal agreements, rent renewals, and dispute resolution are all handled in-platform.

The core trust problem in proptech — "how do I pay for a house I've never physically been inside?" — is solved through a combination of location-verified video capture, photogrammetry-based 3D reconstruction, landlord and property document verification, and a curated room-feature checklist that makes inspections structured and auditable.

---

## 2. Problem Statement

### For Renters
- Agent fees inflate rent by 5–15% with no value-add
- Properties on classifieds (Jiji, Facebook) are frequently fake, unavailable, or misrepresented
- In-person inspections require time off work, transport costs, and are geographically limiting
- No standard way to verify a landlord's legal right to rent

### For Landlords
- Dependence on agents means less control over tenant quality
- No digital lease management or renewal workflow
- Cash-based rent collection creates record-keeping gaps and defaults

### Market Opportunity
- Nigeria has a 28 million unit housing deficit (FMBN, 2023)
- Urban renters make 2–5 inspection trips per property on average
- Agent commissions nationally total an estimated ₦180B+ annually

---

## 3. User Personas

### Tenant (Primary)
- Age 22–45, urban, employed or self-employed
- Smartphone-native, WhatsApp-primary
- Relocating for work, upgrading, or first independent rental
- Needs: trust, speed, affordability, clear lease terms

### Landlord
- Owns 1–5 properties, may be absentee
- Wants reliable tenants, consistent payments, minimal hassle
- Needs: simple onboarding, tenant vetting, digital receipts

### Property Manager (Phase 2)
- Manages multiple landlord portfolios
- Needs bulk listing tools, tenant dashboard, payment reporting

---

## 4. Core Value Propositions

| Feature | Why it builds trust |
|---|---|
| Location-verified video | Video is recorded from GPS-confirmed coordinates, impossible to fake |
| 3D room reconstruction | Actual spatial dimensions, not staging photography |
| Room feature checklist | Structured inspection: every kitchen, bath, room has a defined item list |
| Document verification | NIN, CAC, title deeds, survey plans verified before listing goes live |
| Escrow payment | Funds held until tenant confirms move-in, protects both parties |
| Digital lease | Signed electronically, stored on-platform, enforceable |

---

## 5. Product Scope

### Phase 1 — MVP (Nigeria)
- Landlord onboarding with document verification
- Property listing with location-verified video capture
- 3D walkthrough generation from video
- Room feature checklist (kitchen, bathroom, bedroom, living room)
- Tenant onboarding with KYC and affordability check
- Search and filter (location, price, type, bedrooms)
- Booking flow with escrow payment
- Digital lease generation and e-signature
- Tenant dashboard (active lease, payment history, renewal)
- Landlord dashboard (properties, tenants, earnings)
- Rent renewal with grace period and appeals

### Phase 2 — Global Expansion
- Multi-currency support
- Property manager accounts
- AI-powered rent pricing suggestions
- Neighbourhood safety scores
- Mortgage-to-rent comparison tools
- Multi-language support

---

## 6. Feature Specifications

### 6.1 Landlord Onboarding & Verification

**Registration fields:**
- Full name, phone, email, NIN (National Identification Number)
- BVN (Bank Verification Number) for payment identity
- Selfie liveness check against NIN photo
- CAC certificate (for corporate landlords)

**Property verification documents:**
- Certificate of Occupancy (C of O) OR Deed of Assignment OR Governor's Consent
- Survey plan
- Utility bill for address confirmation
- Optional: Approved building plan

**Verification states:** Pending → Under Review → Verified → Rejected (with reason)

**Verification SLA:** 48 hours for document review (manual + automated cross-check)

---

### 6.2 Location-Verified Video Capture

**How it works:**
1. Landlord opens the in-app camera
2. App requests GPS lock; recording is blocked until accuracy < 50m
3. GPS coordinates are embedded in video metadata and signed with a server-issued nonce
4. Landlord records room-by-room with audio guidance prompts ("Now move to the kitchen…")
5. Video is uploaded with signed metadata; server verifies coordinates match property address ± 200m
6. Any attempt to upload a pre-recorded video fails the nonce validation

**Technical implementation:**
- React Native (future mobile app) or a progressive web app with `navigator.geolocation` + `MediaRecorder API`
- Nonce issued by backend per recording session, expires in 30 minutes
- Video metadata signed using HMAC-SHA256 with nonce + coordinates + timestamp
- Server rejects uploads where signature doesn't match or coordinates are > 200m from registered address

---

### 6.3 3D Room Reconstruction

**Pipeline:**
1. Video frames extracted at 2fps using FFmpeg
2. Frames fed into a photogrammetry/NeRF pipeline (PolyCam API or self-hosted Open3D)
3. 3D mesh generated with room dimension overlays
4. Served as a WebGL scene using Three.js or model-viewer

**Room annotations:**
- Each room type has a fixed annotation schema
- Dimensions are computed from the mesh and displayed as overlays
- Users can rotate, pan, and zoom the scene
- Hotspot markers for each feature item (see 6.4)

**Fallback (Phase 1):** If 3D generation fails or device is low-powered, fall back to 360° photo stitching from video frames using Pannellum.js

---

### 6.4 Room Feature Checklist

A structured inspection protocol. For each room type, a predefined list of features is presented. The landlord selects which items are present. These selections appear as hotspot markers in the 3D view.

**Kitchen items:**
Gas cooker / Electric cooker, Extractor fan, Kitchen sink with running water, Cabinet storage, Refrigerator space, Tiled walls, Drainage, Power outlets ≥ 2

**Bathroom/Toilet items:**
WC (Western) / Squat toilet, Shower / Bathtub, Running water, Hot water heater / Solar heater, Mirror, Exhaust fan, Tiled walls and floor, Towel rack, Drainage

**Bedroom items:**
Built-in wardrobe, AC unit (window / split), Ceiling fan, Power outlets ≥ 3, Mosquito-proofed windows, Tiled / Parquet / Marble floor, Internet/Ethernet point

**Living Room items:**
AC unit, Ceiling fan, Power outlets ≥ 4, Television point, Internet/Ethernet point, Balcony access, Security door

**During tenant inspection:**
- Features are displayed as a checklist alongside the 3D view
- Tenant can mark items they want to confirm during a live video call with the landlord (Phase 1.5 feature)

---

### 6.5 Tenant Onboarding & Eligibility

**KYC fields:**
- Full name, phone, email, NIN
- BVN (for affordability check via Okra/Mono)
- Employment status + employer name / business name
- Monthly income (verified via bank statement analysis or Open Banking API)

**Affordability rule:**
- Rent must not exceed 33% of verified monthly income
- Or annual rent must not exceed 4× monthly income (i.e. can save up in 4 months)
- Tenants below threshold are shown a "Consider" band of cheaper properties

**Document uploads:**
- Government-issued ID (NIN slip, international passport, driver's licence)
- 3 months bank statement (or Open Banking connection)
- Letter of employment / Business registration

**Screening score (0–100):**
- Payment history (via credit bureaus — CRC, FirstCentral): 40 points
- Income-to-rent ratio: 30 points
- Identity verification: 20 points
- Profile completeness: 10 points

Landlords see screening score band (Excellent / Good / Fair / Review) not the raw score.

---

### 6.6 Search & Discovery

**Filters:**
- Location (state, LGA, area, landmark)
- Property type (self-con, 1-bed, 2-bed, 3-bed, duplex, bungalow, flat)
- Price range (monthly or annually)
- Furnishing (furnished, semi-furnished, unfurnished)
- Floor level
- Features (AC, security, generator, parking, elevator, swimming pool)
- Available from date

**Sort options:**
- Newest first
- Price: low to high / high to low
- Closest to a searched landmark
- Highest-rated landlord
- 3D tour available

**Landing page:**
- Hero search bar (location + property type + price range)
- Featured cities
- Recently listed
- Verified landlords spotlight
- How it works (3 steps)
- Trust indicators (number of verified properties, active tenants, total transactions)

---

### 6.7 Booking & Payment Flow

**Steps:**
1. Tenant selects property and views 3D tour
2. Tenant submits interest (application)
3. Landlord reviews tenant's screening score and accepts/declines
4. If accepted: Tenant receives lease preview
5. Tenant pays: caution deposit + first rent into escrow (Paystack/Flutterwave escrow or platform-managed virtual account)
6. Both parties e-sign the lease (DocuSign API or platform-native)
7. Landlord receives move-in code; tenant uses code to access the property
8. Tenant confirms move-in within 72 hours
9. Funds released to landlord minus platform fee (8% of first rent + ₦10,000 caution admin fee)

**Payment failure handling:**
- 3 retry attempts on card
- Alternative: bank transfer via virtual account
- Lease offer expires after 48 hours if unpaid

---

### 6.8 Legal Framework

**Lease generation:**
- Template engine generates a standard Tenancy Agreement compliant with the Tenancy Law of Lagos State (and equivalent state laws)
- Variables: names, address, rent amount, lease term, renewal clause, penalty clauses
- Stored as PDF on platform, referenced by a unique hash

**Legal actions:**
- If tenant defaults on rent: automated notice at day 1, formal notice letter at day 7, dispute ticket at day 14
- Tenant can appeal with evidence (bank issue, emergency)
- Platform provides a mediation window (7 days) before escalation
- Escalation: referral to a vetted legal partner for eviction proceedings (charged to defaulting party)

**Platform liability:**
- HouseHunt is a marketplace, not a landlord
- Properties are verified but not guaranteed; disputes trigger escrow hold
- Force majeure and property damage are governed by the lease terms

---

### 6.9 Rent Renewal

**Renewal timeline:**
- 60-day notice to tenant: "Your lease expires on [date]"
- Tenant has 30 days to respond (renew / vacate notice)
- If renewing: new rent terms presented, tenant accepts or negotiates
- Grace period: 14 days after lease end before formal default

**Appeals process:**
- Tenant can appeal a rent increase above 15% annually
- Appeal triggers a 7-day window for landlord response
- If unresolved: platform mediator reviews and recommends (non-binding)

---

## 7. Technical Architecture

### 7.1 Monorepo Structure

```
househunt/
├── package.json                # root — workspace orchestrator
├── .env.example
├── .gitignore
├── turbo.json                  # Turborepo pipeline
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts            # entry — Express app bootstrap
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── db.ts           # Postgres via Prisma
│   │   │   └── redis.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── landlords/
│   │   │   ├── properties/
│   │   │   ├── verification/
│   │   │   ├── video/
│   │   │   ├── threed/
│   │   │   ├── tenants/
│   │   │   ├── bookings/
│   │   │   ├── leases/
│   │   │   ├── payments/
│   │   │   ├── renewals/
│   │   │   └── notifications/
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── upload.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── errorHandler.ts
│   │   ├── lib/
│   │   │   ├── prisma.ts
│   │   │   ├── s3.ts
│   │   │   ├── paystack.ts
│   │   │   ├── sendgrid.ts
│   │   │   └── queue.ts        # BullMQ job queues
│   │   └── types/
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── router/
        ├── components/
        │   ├── ui/             # shadcn/ui components
        │   └── shared/
        ├── modules/
        │   ├── landing/
        │   ├── auth/
        │   ├── search/
        │   ├── property/
        │   ├── landlord/
        │   ├── tenant/
        │   ├── booking/
        │   └── lease/
        ├── lib/
        │   ├── api.ts          # axios instance
        │   ├── hooks/
        │   └── utils.ts
        └── store/              # Zustand stores
```

---

### 7.2 Backend Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| Runtime | Node.js 20 LTS | Team familiarity, ecosystem |
| Framework | Express.js + TypeScript | Lightweight, modulable |
| ORM | Prisma | Type-safe, migration-friendly |
| Database | PostgreSQL 15 | Relational, PostGIS for geo queries |
| Cache | Redis 7 | Sessions, job queues, rate limiting |
| Job queue | BullMQ | Video processing, email, verification jobs |
| File storage | AWS S3 / Cloudflare R2 | Videos, documents, 3D assets |
| Auth | JWT (access + refresh tokens) | Stateless, scalable |
| Payments | Paystack | Nigeria-first, escrow support |
| Email | SendGrid | Transactional email |
| SMS | Termii | Nigeria-optimised, OTP delivery |
| Open Banking | Mono / Okra | Bank statement analysis |
| Video processing | FFmpeg (self-hosted worker) | Frame extraction for 3D pipeline |
| 3D reconstruction | PolyCam API (Phase 1), Open3D (Phase 2) | Managed vs self-hosted tradeoff |

---

### 7.3 Frontend Tech Stack

| Concern | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v3 |
| Component library | shadcn/ui |
| State management | Zustand |
| Data fetching | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Routing | React Router v6 |
| 3D viewer | Three.js / model-viewer |
| 360° fallback | Pannellum.js |
| Maps | Mapbox GL JS |
| Charts | Recharts |
| File uploads | react-dropzone |
| Animation | Framer Motion |

---

### 7.4 Database Schema (Core Tables)

```sql
-- Users (base identity)
users: id, email, phone, password_hash, role (LANDLORD|TENANT|ADMIN), 
       nin, bvn, verified_at, created_at

-- Landlord profiles
landlords: id, user_id, business_name, cac_number, verification_status,
           verification_docs (jsonb), bank_account (jsonb), rating, created_at

-- Properties
properties: id, landlord_id, title, description, type, address, 
            lga, state, lat, lng, price_monthly, price_annually,
            caution_deposit, available_from, status (DRAFT|PENDING|ACTIVE|RENTED),
            verification_status, created_at

-- Property media
property_media: id, property_id, type (VIDEO|PHOTO|MODEL_3D), url, 
                gps_lat, gps_lng, recorded_at, nonce_verified, created_at

-- Room feature selections
property_rooms: id, property_id, room_type (KITCHEN|BATHROOM|BEDROOM|LIVING_ROOM|OTHER),
                features (jsonb), floor_level, area_sqm, created_at

-- Tenant profiles
tenants: id, user_id, employment_status, employer, monthly_income,
         screening_score, screening_band, kyc_status, docs (jsonb), created_at

-- Bookings/Applications
bookings: id, property_id, tenant_id, status (APPLIED|ACCEPTED|DECLINED|PAID|ACTIVE|ENDED),
          rent_start, rent_end, applied_at, accepted_at, paid_at

-- Leases
leases: id, booking_id, property_id, landlord_id, tenant_id, 
        terms (jsonb), pdf_url, pdf_hash, signed_landlord_at, signed_tenant_at,
        status (DRAFT|PENDING_SIGNATURE|ACTIVE|EXPIRED|DISPUTED)

-- Payments
payments: id, booking_id, amount, currency, type (CAUTION|RENT|RENEWAL|FEE),
          paystack_reference, status, paid_at, released_at

-- Renewals
renewals: id, lease_id, proposed_price, status (PENDING|ACCEPTED|APPEALED|DECLINED),
          appeal_reason, grace_period_end, created_at

-- Notifications
notifications: id, user_id, type, title, body, read_at, created_at
```

---

### 7.5 API Design

All endpoints are prefixed `/api/v1/`. Authentication via `Authorization: Bearer <token>`.

**Auth module:**
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/verify-otp
POST   /auth/forgot-password
POST   /auth/reset-password
```

**Landlord module:**
```
GET    /landlords/me
PUT    /landlords/me
POST   /landlords/me/documents
GET    /landlords/me/properties
GET    /landlords/me/tenants
GET    /landlords/me/earnings
```

**Property module:**
```
GET    /properties                  # public: search & filter
GET    /properties/:id              # public: detail
POST   /properties                  # landlord: create draft
PUT    /properties/:id
DELETE /properties/:id
POST   /properties/:id/publish
POST   /properties/:id/rooms        # add room with features
GET    /properties/:id/rooms
POST   /properties/:id/video        # initiate recording session (returns nonce)
POST   /properties/:id/video/upload # upload signed video
GET    /properties/:id/tour         # 3D/360 model URL
```

**Tenant module:**
```
GET    /tenants/me
PUT    /tenants/me
POST   /tenants/me/documents
POST   /tenants/me/connect-bank     # Mono/Okra link
GET    /tenants/me/screening-score
GET    /tenants/me/bookings
GET    /tenants/me/leases
```

**Booking module:**
```
POST   /bookings                    # tenant: apply
GET    /bookings/:id
PUT    /bookings/:id/accept         # landlord
PUT    /bookings/:id/decline        # landlord
POST   /bookings/:id/pay            # tenant: trigger payment
PUT    /bookings/:id/confirm-move-in # tenant: confirm arrival
```

**Lease module:**
```
GET    /leases/:id
POST   /leases/:id/sign             # landlord or tenant e-sign
GET    /leases/:id/pdf
```

**Payment module:**
```
POST   /payments/initiate
GET    /payments/verify/:reference  # Paystack webhook target
GET    /payments/history
```

**Renewal module:**
```
POST   /renewals                    # landlord: propose renewal
PUT    /renewals/:id/accept         # tenant
PUT    /renewals/:id/appeal         # tenant: with reason
PUT    /renewals/:id/resolve        # landlord or mediator
```

---

### 7.6 Module Structure Convention (Backend)

Each module follows:
```
modules/properties/
├── property.routes.ts
├── property.controller.ts
├── property.service.ts
├── property.validator.ts    # Zod schemas
└── property.types.ts
```

---

### 7.7 Module Structure Convention (Frontend)

Each module follows:
```
modules/property/
├── components/
│   ├── PropertyCard.tsx
│   ├── PropertyDetail.tsx
│   ├── PropertyTour3D.tsx
│   └── RoomChecklist.tsx
├── hooks/
│   ├── useProperties.ts
│   └── usePropertyDetail.ts
├── pages/
│   ├── SearchPage.tsx
│   └── PropertyPage.tsx
├── store/
│   └── propertyStore.ts
└── types.ts
```

---

### 7.8 Video Verification Flow

```
Client                     Server                      Worker
  |                           |                           |
  |-- POST /video (nonce req)->|                           |
  |<-- { nonce, session_id } --|                           |
  |                           |                           |
  | [GPS lock, record video]  |                           |
  |                           |                           |
  |-- POST /video/upload ----->|                           |
  |   { video, coords, sig }  |                           |
  |                           |-- verify HMAC sig         |
  |                           |-- validate GPS ± 200m     |
  |                           |-- store to S3             |
  |                           |-- enqueue job ------------>|
  |<-- { job_id, status: processing }                     |
  |                           |                [FFmpeg extract frames]
  |                           |                [PolyCam API → 3D mesh]
  |                           |                [store model to S3]
  |                           |<-- job complete -----------|
  |                           |-- update property_media   |
  |<-- webhook / SSE: ready --|                           |
```

---

### 7.9 Security Considerations

- All uploads scanned with ClamAV before storage
- Rate limiting: 100 req/15min (API), 5 req/min (auth endpoints)
- PII encrypted at rest (AES-256), BVN/NIN not stored raw — SHA-256 hash + external verification
- HTTPS enforced; HSTS headers
- File uploads: type validation, magic byte check, max 500MB video / 10MB docs
- CSP, CORS whitelist configured
- Audit log for all payment and lease state transitions
- GDPR-ready data deletion endpoint (Phase 2 for global)

---

### 7.10 Infrastructure

```
Phase 1 (Nigeria MVP):
- Hosting: Railway.app (backend) + Vercel (frontend)
- DB: Railway Postgres
- Cache: Upstash Redis
- Storage: Cloudflare R2 (cheaper egress than S3 for Africa)
- CDN: Cloudflare
- Video worker: Fly.io (dedicated machine for FFmpeg)

Phase 2 (Scale):
- AWS ECS / EKS
- RDS Postgres Multi-AZ
- ElastiCache
- CloudFront
- S3 + MediaConvert
- SQS → Lambda for processing
```

---

## 8. UX / Page Map

### Public (unauthenticated)
- `/` — Landing: hero search, featured listings, how it works, trust stats
- `/search` — Search results with map view + list view
- `/property/:id` — Property detail: photos, 3D tour, room features, landlord card
- `/register` — Unified registration (choose: Landlord / Tenant)
- `/login`

### Tenant (authenticated)
- `/dashboard` — Active lease, upcoming payments, recent activity
- `/applications` — Booking history and statuses
- `/lease/:id` — Lease detail, payment history, renewal CTA
- `/profile` — KYC documents, bank connection, screening score
- `/search` — (same as public, with saved searches)

### Landlord (authenticated)
- `/landlord/dashboard` — Properties, earnings overview, tenant alerts
- `/landlord/properties` — Listing manager
- `/landlord/properties/new` — Multi-step listing wizard (details → rooms → video → publish)
- `/landlord/properties/:id` — Property management (applicants, active tenant, media)
- `/landlord/tenants` — Tenant list with screening scores
- `/landlord/earnings` — Payment history, escrow status

### Admin (internal)
- `/admin/verifications` — Document review queue
- `/admin/disputes` — Active disputes
- `/admin/properties` — All listings, moderation
- `/admin/users` — User management

---

## 9. Monetisation

| Revenue stream | Model | Amount |
|---|---|---|
| Platform fee | 8% of first month's rent | Charged on booking |
| Caution admin fee | Flat ₦10,000 | Per booking |
| Listing boost | ₦5,000–₦20,000 | Featured placement |
| Verification fast-track | ₦3,000 | 12hr vs 48hr SLA |
| Legal service referral | Revenue share 20% | Per referred case |
| Tenant screening report | ₦1,500 | Per landlord-initiated pull |

---

## 10. Success Metrics (Phase 1 KPIs)

| Metric | 3-month target | 12-month target |
|---|---|---|
| Verified landlords | 500 | 5,000 |
| Active listings | 800 | 10,000 |
| Monthly bookings | 50 | 1,000 |
| Completion rate (applied → paid) | 30% | 45% |
| Fake property report rate | < 1% | < 0.5% |
| NPS (tenant) | > 40 | > 60 |
| GMV (monthly) | ₦25M | ₦500M |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Landlords resist digital-only | High | WhatsApp onboarding support, field agents for first 6 months |
| 3D reconstruction quality poor | Medium | Staged rollout: 360° fallback, manual QA per listing |
| Payment fraud | Medium | Escrow, velocity limits, BVN verification |
| Low supply in early cities | High | Commission landlord scouts in Lagos, Abuja, PH first |
| Regulatory: FinTech licensing | Medium | Partner with licensed payment processor (Paystack), seek FCCPC guidance |
| Data breach | Low | Encryption at rest/transit, penetration testing, bug bounty |

---

## 12. Roadmap

### Month 1–2 (Foundation)
- Monorepo setup, CI/CD pipeline
- Auth, user, landlord, tenant modules
- Property listing CRUD
- Document upload and verification queue (manual review)
- Basic search with filter

### Month 3–4 (Core Trust Features)
- Location-verified video capture (PWA)
- Room feature checklist
- 360° fallback viewer
- Screening score calculation
- Booking flow (apply → accept → pay)

### Month 5–6 (Transactions)
- Paystack escrow integration
- Lease generation and e-signature
- Tenant and landlord dashboards
- Rent renewal workflow
- Notification system (email + SMS)

### Month 7–8 (3D & Refinement)
- 3D mesh generation pipeline
- Three.js viewer with hotspots
- Admin verification dashboard
- Dispute resolution module
- Performance optimisation

### Month 9–10 (Growth)
- Mobile PWA polish
- Referral programme
- Listing boost / promoted placement
- Analytics dashboard for landlords
- Public API for property manager integrations

### Month 11–12 (Global Prep)
- Multi-currency (GHS, KES, ZAR)
- i18n infrastructure
- GDPR compliance
- International payment rails (Stripe)

---

*Document prepared for HouseHunt v1.0 — March 2026*
