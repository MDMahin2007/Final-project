# ClearPath

ClearPath digitizes campus clearance as a step-by-step workflow. Students submit one request; Library, Accounts, Department, and any active configured offices review it in order. Students can follow each decision and its audit timeline.

## Roles

- `student`: register, sign in with student ID or email, create requests, attach optional PDFs, view timelines, and cancel before review begins.
- `officeStaff`: sign in and review only the next actionable request assigned to their office. Rejections require a reason.
- `superAdmin`: configure offices and workflow order, create office staff accounts, monitor requests, and view reports.

The legacy `admin` role remains accepted for existing accounts. The seed script promotes the configured `ADMIN_EMAIL` to `superAdmin`.

## Workflow

1. The super-admin configures active offices and their order. The seed script creates Library, Accounts, and Department if they do not exist.
2. A student submits a purpose and optional PDF attachments. The API creates one `clearanceRequests` record and one pending `approvals` record for each active office.
3. Only the next office can decide. Each decision stores the staff member, remarks, and timestamp and appends an audit event.
4. Any rejection makes the overall request `REJECTED`; all approvals make it `CLEARED`; partial progress is `IN_PROGRESS`; no decisions is `PENDING`.
5. Students may cancel only before an office starts reviewing. A rejected or cleared request is terminal; a student may submit another request afterward.

## Stack And Structure

- Frontend: React, Vite, React Router, Axios, Tailwind CSS, React Icons, React Hot Toast.
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Helmet, express-rate-limit, Multer.
- `backend/models/`: users, offices, clearance requests, approvals, and audit events.
- `backend/controllers/`: authentication, student requests, office decisions, administration, and aggregation reports.
- `frontend/src/pages/`: public, student, office-staff, and super-admin workspaces.

## Configure

Use Node.js 20.19+ (or 22.12+) and MongoDB Atlas or a local MongoDB server. Copy the example environment files, then replace the placeholders:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Backend `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster-host>/
DATABASE_NAME=clearpath_campus_clearance
JWT_SECRET=<random-secret-at-least-32-characters>
JWT_EXPIRES_IN=1d
CLIENT_URL=https://smart-campus-clearance.vercel.app
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<private-password-at-least-8-characters>
```

If the MongoDB URI has no database name in its path, `DATABASE_NAME` is added automatically. If the URI already names a database, that explicit path is preserved. `MONGO_URI` remains accepted as a compatibility alias. For local MongoDB, set `MONGODB_URI=mongodb://127.0.0.1:27017/clearpath_campus_clearance`. Never commit `.env` or paste database credentials into source code.

Frontend `frontend/.env`:

```env
VITE_API_URL=/api
```

Vite proxies `/api` and `/uploads` to `http://localhost:5000` in development. In production, the frontend is `https://smart-campus-clearance.vercel.app` and the backend API is `https://smart-campus-clearance.netlify.app/api`. Vercel's frontend project must have `VITE_API_URL=https://smart-campus-clearance.netlify.app/api`; the Netlify backend project must have `CLIENT_URL=https://smart-campus-clearance.vercel.app`. These deployment URLs must not be swapped.

## Install And Run

Install dependencies from the repository root:

```powershell
npm --prefix backend install
npm --prefix frontend install
```

Seed the initial super-admin and default offices. This is safe to rerun and does not reset existing users or requests:

```powershell
npm --prefix backend run seed
```

Start the backend and frontend in separate terminals:

```powershell
npm --prefix backend run dev
```

```powershell
npm --prefix frontend run dev
```

Open `http://localhost:5173`. Sign in as super-admin with the private `ADMIN_EMAIL` and `ADMIN_PASSWORD` values from `backend/.env`. Register a student account, then use the super-admin workspace to create an office staff account for each office. There are no hard-coded demo passwords.

`npm --prefix backend run seed:reset` deletes all users, offices, requests, approvals, and audit events in the configured database before seeding again. Use it only on a disposable development database.

To add optional demo accounts and representative pending, in-progress, and rejected requests, set a private `DEMO_ACCOUNT_PASSWORD` of at least 12 characters in `backend/.env`, then run:

```powershell
npm --prefix backend run seed:demo
```

The demo users are `demo.pending@clearpath.edu`, `demo.progress@clearpath.edu`, `demo.rejected@clearpath.edu`, `demo.library@clearpath.edu`, `demo.accounts@clearpath.edu`, and `demo.department@clearpath.edu`. They all use the configured `DEMO_ACCOUNT_PASSWORD`. This is opt-in so normal seeding never creates sample accounts in a shared database.

## API

All endpoints are under `/api`.

| Method      | Endpoint                               | Access                             | Purpose                                                      |
| ----------- | -------------------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| POST        | `/auth/register-student`               | Public                             | Create a student account                                     |
| POST        | `/auth/login`                          | Public                             | Sign in with `identifier` (student ID or email) and password |
| GET / PATCH | `/auth/me`                             | Authenticated / student            | Read session or update profile                               |
| POST        | `/requests`                            | Student                            | Create a clearance request and office approvals              |
| GET         | `/requests/my`                         | Student                            | List own requests with approval timelines                    |
| GET         | `/requests/:id`                        | Owner, assigned staff, super-admin | Read request details and audit history                       |
| PATCH       | `/requests/:id/cancel`                 | Student owner                      | Cancel before review begins                                  |
| POST        | `/requests/:id/documents`              | Student owner                      | Upload up to six optional PDF files                          |
| GET         | `/staff/requests?status=PENDING`       | Office staff                       | View requests assigned to the staff member's office          |
| PATCH       | `/staff/approvals/:approvalId/approve` | Assigned office staff              | Approve the current office step                              |
| PATCH       | `/staff/approvals/:approvalId/reject`  | Assigned office staff              | Reject with a required reason                                |
| GET / POST  | `/admin/offices`                       | Super-admin                        | List or create offices                                       |
| PATCH       | `/admin/offices/:id`                   | Super-admin                        | Change office order or active state                          |
| GET / POST  | `/admin/staff`                         | Super-admin                        | List or create assigned office staff                         |
| GET         | `/admin/requests`                      | Super-admin                        | Filter requests by status, office, and date                  |
| GET         | `/admin/reports/summary`               | Super-admin                        | Aggregated counts, backlog, and average decision time        |

## Checks

```powershell
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

Backend tests cover request status calculation, sequential approval readiness, and MongoDB URI database-name behavior.

## Viva Notes

- Authentication verifies credentials and returns a signed JWT; authorization checks the role and, for office staff, the assigned office.
- Each approval is a separate document with a unique `(requestId, officeId)` index. `stepOrder` defines the sequential review path.
- The overall status is derived from all office decisions: any rejection wins, all approvals clear the request, partial approvals mean in progress.
- Cancellation is guarded on the server and only allowed while the request is still pending and no office has decided.
- Reports use MongoDB aggregation with `$lookup`, `$group`, and `$avg` for office workload and decision duration.
- Audit events record who created, approved, rejected, or cancelled a request and when.

## Deployment Notes

Deploy `frontend/` to Vercel with build command `npm run build`, output directory `dist`, and environment variable `VITE_API_URL=https://smart-campus-clearance.netlify.app/api`. Deploy `backend/` as a separate Netlify site with base directory `backend`; `backend/netlify.toml` configures the Functions directory, API rewrites, and Node 22 runtime. In Netlify site settings, configure `MONGODB_URI`, `DATABASE_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `CLIENT_URL=https://smart-campus-clearance.vercel.app`. `backend/.env` is local-only and is not uploaded automatically. `FRONTEND_URL=http://localhost:5173` can remain for local development.

Verify the backend at `https://smart-campus-clearance.netlify.app/api/health`. Uploaded PDFs and avatars currently use local disk under `backend/uploads/`; Netlify Functions have ephemeral storage, so production uploads require persistent object storage. The existing `backend/vercel.json` is only for an alternate Vercel backend deployment and is not used by Netlify. Keep MongoDB network access restricted and rotate any credential that has been exposed.
