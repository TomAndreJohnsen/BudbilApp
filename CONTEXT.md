# CONTEXT.md - BudbilAppV2

## Session: 2025-11-25

### Summary
Migrering fra Flask til Next.js - UI-styling oppdatert for aa matche gammelt design.

### Changes Made

**UI Overhaul - Match Flask Design:**
- Endret bottom navigation til fixed position med gradient bakgrunn
- Alle knapper: `2rem` / `3vh` font, `80px` hoyde, hvit tekst
- Gap mellom knapper: `2vw`, padding: `3vw`

**Full-screen Modaler:**
- PIN-modal: Fullskjerm, sentrert innhold
- Legg til firma-modal: Fullskjerm
- Ordre-detalj modal: Fullskjerm med header badges

**Font Sizes - Minimum 2vh:**
- Home: Tittel `clamp(8vh, 14vh, 18vh)`, knapp `30vh` diameter
- Carriers: Logo `14vh`, navn `clamp(2.4vh, 3vh, 3.8vh)`
- Orders: Korttekst `3.5vh`, modal info `3vh`
- Signature: Labels `3vh`, inputs `2.5vh`, knapper `3vh`

**Layout Fixes:**
- Orders grid: 2x3 (var 3x2)
- Carriers grid: 4x2 med `gap-[4vh]`, `px-[5vw]`
- Viewport-baserte enheter (vh/vw) overalt

### Files Modified
- `/src/app/page.tsx` - Home page
- `/src/app/carriers/page.tsx` - Carriers + modaler
- `/src/app/orders/page.tsx` - Orders + modal
- `/src/app/orders/signature/page.tsx` - Signature page

### Current State
- Dev server: `npm run dev` pa port 3000
- Database: Azure SQL (IP whitelisted)
- All tekst er naa touch-vennlig for 11" nettbrett
