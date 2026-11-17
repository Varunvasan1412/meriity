# Meriity — Company Website

Monorepo with two apps:

| Folder      | Stack                                   | Port |
|-------------|-----------------------------------------|------|
| `frontend/` | Next.js (App Router, TS, Tailwind) + GSAP | 3002 |
| `backend/`  | Express 5 + MySQL (mysql2) + Zod          | 5000 |

## Setup

### 1. Database (MySQL 8)
Fill in DB credentials in `backend/.env` (copied from `.env.example`), then:
```bash
cd backend
npm install
npm run migrate   # creates the database + tables
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
`frontend/.env.local` holds `NEXT_PUBLIC_API_URL=http://localhost:5000/api`.

## API
| Method | Path              | Purpose                    |
|--------|-------------------|----------------------------|
| GET    | `/api/health`     | API + DB status            |
| POST   | `/api/contact`    | Save contact inquiry (lead)|
| POST   | `/api/newsletter` | Newsletter signup          |

## Roadmap: CRM / Admin panel
- `contact_inquiries.status` already tracks lead state (`new` / `in_progress` / `closed`).
- Add auth (`users` table + JWT/session) and mount protected routes at `/api/admin`
  (see placeholder in `backend/src/routes/index.js`).
- The admin UI can live in `frontend/src/app/admin` or as a separate app.
