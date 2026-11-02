# ClearPath frontend

The ClearPath frontend is a React application for the student clearance tracker and administrator review workspace.

## Local development

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

The local Vite proxy forwards `/api` requests to `http://localhost:5000`. Production frontend: `https://smart-campus-clearance.vercel.app`. Production backend API: `https://smart-campus-clearance.netlify.app/api`.

In Vercel frontend project settings, set `VITE_API_URL=https://smart-campus-clearance.netlify.app/api`, then redeploy. The backend is deployed separately to Netlify from base directory `backend/`; configure `CLIENT_URL=https://smart-campus-clearance.vercel.app` and the database/JWT/admin environment variables in Netlify site settings. The local `frontend/.env` and `backend/.env` files are not uploaded automatically.

## Scripts

- `npm run dev` — start the Vite development server
- `npm run lint` — run ESLint
- `npm run build` — create the production bundle
- `npm run preview` — preview the production bundle locally
