# Budbil.app v2.0

Enterprise delivery management application - rebuilt in Next.js.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma + Azure SQL Server
- **Deployment**: Vercel

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

```env
DATABASE_URL="sqlserver://HOST:PORT;database=DB_NAME;user=USER;password=PASSWORD;encrypt=true;trustServerCertificate=true"
PINCODE="2026"
```

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

## Features

- Carrier selection with logo grid
- Order list with filtering
- Multi-order pickup with signature capture
- PWA support for tablet use
- Health check endpoint at `/api/health`

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with main button |
| `/carriers` | Carrier selection grid |
| `/orders` | Order list (filterable by carrier) |
| `/orders/signature` | Signature capture page |
| `/api/health` | Health check endpoint |
