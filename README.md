# ClearPath

ClearPath is a MERN smart campus clearance and approval system. Students submit one immutable clearance request; Library, Hostel, Accounts, and Department staff decisions are tracked independently by an administrator.

## Features

- JWT authentication with bcrypt password hashing and student/admin roles. Sessions are revalidated through `/api/auth/me` after a refresh.
- A student dashboard that creates one request and shows a live department-by-department tracker.
- An admin workspace with request search, pending/completed/rejected filters, expandable request details, and individual item approvals/rejections with optional remarks.
- Automatic overall status: `completed` when all items are approved, `rejected` when any item is rejected, otherwise `pending`.
- Students can resubmit only the rejected departments; already approved items stay approved.
- A printable clearance certificate is available after every department has approved the request.
- Responsive React/Tailwind UI, loading states, validation, centralized API errors, and toast notifications.

## Structure

backend/
  config/             MongoDB connection
  controllers/        Authentication and clearance business logic
  middleware/         JWT/role protection and error responses
  models/             User and ClearanceRequest schemas
  routes/             REST API routes
  seed.js             Initial admin account seed script
frontend/
  src/components/     Reusable UI pieces and clearance tracker
  src/context/        Persisted authentication context
  src/pages/          Public, student, and admin pages
  src/services/       Axios client and JWT attachment

## Setup

1. Install MongoDB locally or create a MongoDB Atlas database.
2. Copy `backend/.env.example` to `backend/.env` and set a real `MONGO_URI` and long `JWT_SECRET` (at least 32 characters). If using separate MongoDB values, set `MONGO_USER`, `MONGO_PASSWORD`, `MONGO_HOST`, `DB_NAME`, and optionally `MONGO_AUTH_SOURCE` instead.
3. Copy `frontend/.env.example` to `frontend/.env`.
4. Install dependencies and start each app in separate terminals:

```powershell
cd backend
npm install
npm run dev
```

```powershell
cd frontend
npm install
npm run dev
```

The API runs on `http://localhost:5000`; Vite normally runs on `http://localhost:5173`.

## Environment variables

Backend (`backend/.env`):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/clearpath
# Or use component-based values; passwords are URI-encoded by the backend.
# MONGO_USER=
# MONGO_PASSWORD=
# MONGO_HOST=127.0.0.1:27017
# DB_NAME=clearpath
# MONGO_AUTH_SOURCE=admin
JWT_SECRET=replace_with_a_random_secret_at_least_32_characters_long
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_secure_password
```

Frontend (`frontend/.env`):

```env
VITE_API_URL=/api
```

Local development uses Vite's `/api` proxy to `http://localhost:5000`. For production, set `VITE_API_URL` to the deployed backend URL ending in `/api`.

## Create the admin account

After configuring the backend environment, including `ADMIN_EMAIL` and `ADMIN_PASSWORD`, run:

```powershell
cd backend
npm run seed
```

This creates the configured `ADMIN_EMAIL` account if it does not already exist. For local development the example values are `admin@example.com` / `AdminPass123`. `npm run seed:reset` deletes all users and clearance requests before recreating that account; use it only for local development.

## API

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register a student and receive JWT |
| POST | `/api/auth/register-admin` | Admin | Register another administrator without replacing the current session |
| POST | `/api/auth/login` | Public | Log in and receive JWT |
| GET | `/api/auth/me` | Authenticated | Restore and validate the current session |
| POST | `/api/clearance` | Student | Create the four default clearance items |
| GET | `/api/clearance/my` | Student | Get the student’s request, or `null` |
| POST | `/api/clearance/my/resubmit` | Student | Reset rejected items to pending |
| GET | `/api/health` | Public | Confirm the API is running |
| GET | `/api/clearance?status=pending` | Admin | List requests, optionally filtered |
| PATCH | `/api/clearance/:requestId/item/:itemId` | Admin | Update an item with `approved` or `rejected` and optional remarks |

`/api/login` and `/api/auth/status` are also available as compatibility aliases for clients using the older authentication paths.

The first administrator must be created with `npm run seed`. After signing in, an administrator can create additional administrator accounts at `/admin/register`.

## Available checks

```powershell
cd frontend
npm run lint
npm run build
```

The backend has no test framework configured. Its production startup validates `JWT_SECRET`, connects to MongoDB before listening, and exits with a safe error if either requirement fails. Use `npm start` for a startup check or `npm run dev` during development.

## Deployment notes

- Deploy `frontend` as a Vite site on Vercel and set `VITE_API_URL` to the deployed backend URL ending in `/api`.
- Deploy `backend` as a Node service on Render (or another Node host), using `npm start` and setting `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the host environment.
- Use a MongoDB Atlas connection string for `MONGO_URI`, restrict Atlas network access appropriately, and rotate any secret that was previously committed.
- `frontend/vercel.json` provides the SPA fallback needed for direct navigation to React routes.
