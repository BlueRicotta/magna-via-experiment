# Magna Via Progress

## Environment

- Expo React Native app scaffolded at the repo root.
- Go backend scaffolded in `backend/` with `GET /healthz`.
- Design handoff remains untouched in `project/`.
- Runtime image assets are separated in `assets/images/` as WebP variants for Expo/mobile performance.
- Backend first API slice implemented with Fiber, GORM persistence, MySQL support, SQLite local fallback, RIASEC scoring, assessment submission, class catalog, dummy chat, and admin summary.
- Static admin dashboard scaffolded in `admin/` for Vercel/local checks.

## Screens

- [x] 01 Splash: first Expo implementation for calibration.
- [x] 02 Oracle Intro: first Expo implementation with 5 cinematic scenes.
- [x] 03 Biodata: hybrid registration form with expandable Grade/Gender selectors.
- [x] 04 Birth Star: elemental single-select screen using birth-star assets.
- [x] 05 Hobby Cards: collectible card selector using prototype English names.
- [x] 06 Quiz: 15-question Arcadia quiz using docx content and question assets.
- [x] 07 Result Reveal: cinematic Cenayang interstitial.
- [x] 08 Class Result: RIASEC-driven class result with radar and recommendations.
- [x] 09 Cenayang Chat: dummy consultation chat using result context.
