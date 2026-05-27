# Blood Link System

A real-time blood donation and emergency blood request management platform connecting hospitals, blood donors, and administrators.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui (base-ui)
- **Charts:** Recharts
- **ORM:** Prisma v7 with MariaDB/MySQL adapter
- **Auth:** NextAuth.js v5 (JWT, role-based)
- **Validation:** Zod v4

## Getting Started

### 1. Configure Database

Edit `.env` with your MySQL/MariaDB connection string:

```env
DATABASE_URL="mysql://root:password@localhost:3306/blood_link_db"
AUTH_SECRET="your-secret-key-at-least-32-characters"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Push Database Schema

```bash
npm run db:push
```

### 3. Seed the Database

```bash
npm run db:seed
```

This creates:
- **Admin:** `admin@bloodlink.com` / `admin123`
- **Hospital:** `nairobi@bloodlink.com` / `hospital123`
- **Donor:** `james@bloodlink.com` / `donor123`

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

### Public
| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, stats, blood drives preview |
| `/login` | Sign in (select role: Donor / Hospital / Admin) |
| `/register/donor` | Donor registration form |
| `/register/hospital` | Hospital registration form |

### Donor Portal (`/donor/*`)
| Route | Description |
|-------|-------------|
| `/donor/dashboard` | Overview: blood group, appointments, requests, drives |
| `/donor/requests` | Browse + filter all pending blood requests |
| `/donor/drives` | Upcoming blood drives + schedule appointment |
| `/donor/appointments` | My appointments with cancel action |
| `/donor/notifications` | Notifications with mark-as-read |
| `/donor/profile` | Edit profile, availability status |

### Hospital Portal (`/hospital/*`)
| Route | Description |
|-------|-------------|
| `/hospital/dashboard` | Stats: requests, inventory, alerts |
| `/hospital/post-request` | Post blood request (auto-checks inventory) |
| `/hospital/requests` | All requests with status filter tabs |
| `/hospital/inventory` | Inventory per blood group (update stock) |
| `/hospital/reports` | Recharts: trends, blood group breakdown |
| `/hospital/profile` | Edit hospital info |

### Admin Portal (`/admin/*`)
| Route | Description |
|-------|-------------|
| `/admin/dashboard` | System-wide stats + recent activity |
| `/admin/donors` | Manage donors: search, activate, delete |
| `/admin/hospitals` | Approve/disable hospitals |
| `/admin/inventory` | System-wide inventory management |
| `/admin/drives` | Create/publish/cancel blood drives |
| `/admin/notifications` | Broadcast to donors or hospitals |
| `/admin/reports` | System-wide Recharts analytics |
| `/admin/settings` | Admin profile + password change |

## Architecture

```
blood-link-system/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── login/             # Auth pages
│   ├── register/          # Registration pages
│   ├── donor/             # Donor dashboard
│   ├── hospital/          # Hospital dashboard
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Sidebars + TopNav
│   ├── dashboard/         # StatCard, BloodRequestCard
│   └── forms/             # Form components
├── core/
│   └── use-cases/         # Server actions (business logic)
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Helpers + color utilities
└── prisma/
    ├── schema.prisma      # Database models
    └── seed.ts            # Seed script
```

## Blood Request Workflow

```
Hospital posts request
       ↓
System checks inventory
       ↓
Enough stock → APPROVED (deduct from inventory)
Partial stock → PARTIAL  (deduct available, notify donors)
No stock     → PENDING   (notify matching donors by blood group)
```

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:push      # Push schema to database
npm run db:seed      # Seed with test data
npm run db:studio    # Prisma Studio (GUI)
```
