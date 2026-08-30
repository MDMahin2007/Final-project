# ClearPath frontend

The ClearPath frontend is a React application for the student clearance tracker and administrator review workspace.

## Local development

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

The local Vite proxy forwards `/api` requests to `http://localhost:5000`. For a deployed frontend, set `VITE_API_URL` to the backend URL ending in `/api`.

## Scripts

- `npm run dev` — start the Vite development server
- `npm run lint` — run ESLint
- `npm run build` — create the production bundle
- `npm run preview` — preview the production bundle locally
