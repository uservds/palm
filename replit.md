# Running Palmis AI on Replit

This import retains its existing React/Vite frontend in `frontend/` and
Express backend in `backend/`. The empty root `src/` scaffold is not the app.
The Next.js rebuild described in `docs/` has not been performed.

## Workflows

- **Palmis AI**: `npm run dev` — frontend on `0.0.0.0:5000`, shown in Preview.
- **Palmis API**: `npm --prefix backend start` — backend on port 3001.

Both workflows need to be running for photo uploads. Vite proxies `/api` and
`/health` to the backend; browser requests use relative URLs.

Dependencies are installed separately from the existing lockfiles in
`frontend/` and `backend/`. Run `npm run build` for a frontend production build
and `npm run typecheck` for the frontend TypeScript check.

## AI mode

The backend currently defaults to its existing **mock provider**. No AI key
or external service is needed to test uploading a photo and viewing a sample
report. Mock reports are predefined and do not analyze the submitted image.

Real AI analysis is not configured. Supported providers and configuration
names are documented in `backend/.env.example` and
`backend/src/config/env.js`. Configure any future credentials through Replit
Secrets, never in committed files.

## Known imported issues

- The dependency installation reports security advisories, including the
  legacy Multer upload package. Review and resolve these before public use.
- Some backend error messages contain pre-existing garbled Russian text.
- This setup is for the development Preview, not a production deployment.
