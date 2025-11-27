# Budbil.app v2.0 - Project Context

## Project Overview
Enterprise delivery management application for tablet (Lenovo IdeaPad 1280x800). Rebuilt in Next.js from Flask.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Prisma ORM with Azure SQL Server
- **Signature:** react-signature-canvas

## Design System

### Colors
- Primary background: `#073F4B` (dark teal)
- Accent/buttons: `#9CBD93` (sage green)
- Text on dark: `#FFFFFF`
- Text on light: `#1a3a3a` (dark teal)
- Highlight badge: `#E8C547` (muted gold)

### Layout Constants
- Bottom nav: `height: 80px`, `bottom: 20px`, `left/right: 40px`, `gap: 16px`
- Content area: `top: 20-40px`, `left/right: 40px`, `bottom: 120px`
- Border radius: `rounded-xl` (12px)

### Typography
- Navigation buttons: `fontSize: 2rem`, `font-extrabold uppercase`
- Modal headings: `6vh`
- Body text (tablet): `5vh`
- Carrier names: `18px`, `fontWeight: 600`

### Button Styles
- Dark buttons: `bg-[#073F4B] text-white border-[3px] border-[#9CBD93]`
- Accent buttons: `bg-[#9CBD93] text-[#073F4B]`

## Pages
- `/` - Landing page with breathing "TRYKK HER" button
- `/carriers` - 4x2 grid of carrier selection
- `/orders` - 2x3 grid of orders, detail modal
- `/orders/signature` - Driver signature capture

## Current Session Notes
See NEXT_SESSION.md for continuation context.
