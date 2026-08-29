# ClearPath

ClearPath is a MERN smart campus clearance and approval system. Students submit one immutable clearance request; Library, Hostel, Accounts, and Department staff decisions are tracked independently by an administrator.

## Features

- JWT authentication with bcrypt password hashing and student/admin roles.
- A student dashboard that creates one request and shows a live department-by-department tracker.
- An admin workspace with request search, pending/completed/rejected filters, expandable request details, and individual item approvals/rejections with optional remarks.
- Automatic overall status: `completed` when all items are approved, `rejected` when any item is rejected, otherwise `pending`.
- Responsive React/Tailwind UI, loading states, validation, centralized API errors, and toast notifications.

## Structure

```
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
```

## Setup

1. Install MongoDB locally or create a MongoDB Atlas database.
2. Copy `backend/.env.example` to `backend/.env` and set a real `MONGO_URI` and long `JWT_SECRET`.
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
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@clearpath.edu
ADMIN_PASSWORD=change_this_before_running_in_production
```

Frontend (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
```

## Create the admin account

After configuring the backend environment, run:

```powershell
cd backend
npm run seed
```

This creates the configured `ADMIN_EMAIL` account if it does not already exist. `npm run seed:reset` deletes all users and new clearance requests before recreating that account; use it only for local development.

## API

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register a student and receive JWT |
| POST | `/api/auth/login` | Public | Log in and receive JWT |
| POST | `/api/clearance` | Student | Create the four default clearance items |
| GET | `/api/clearance/my` | Student | Get the student’s request, or `null` |
| GET | `/api/clearance?status=pending` | Admin | List requests, optionally filtered |
| PATCH | `/api/clearance/:requestId/item/:itemId` | Admin | Update an item with `approved` or `rejected` and optional remarks |

## Validation

```powershell
cd frontend
npm run lint
npm run build
```
