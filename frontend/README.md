# ClearPath frontend

The ClearPath frontend is a React application for the student clearance tracker and administrator review workspace.

## Local development

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

For local backend development, set `VITE_API_URL=/api`; the Vite proxy forwards requests to `http://localhost:5000`. The checked-in `.env.example` is set to the production API, `https://final-project-733w.onrender.com/api`.

## Production

The frontend is deployed at `https://smart-campus-clearance.vercel.app`; its backend API is `https://final-project-733w.onrender.com/api`. Set `VITE_API_URL` to the backend API URL in the Vercel project's environment variables and redeploy after changing it. The backend's Render service must allow the frontend origin with `CLIENT_URL=https://smart-campus-clearance.vercel.app`.

The frontend redirects the former `https://smart-campus-clearance.netlify.app` API setting to the Render API, but the Vercel production environment variable should still be updated to the Render URL.

The local `frontend/.env` and `backend/.env` files are not uploaded automatically. Configure database, JWT, admin, and Cloudinary credentials in the Render service environment. PDF files and profile images are stored in Cloudinary, not on the backend's local disk.

## Scripts

- `npm run dev` — start the Vite development server
- `npm run lint` — run ESLint
- `npm run build` — create the production bundle
- `npm run preview` — preview the production bundle locally
