# ClearPath

## Smart Campus Clearance & Approval System
Paperless • Fast • Transparent

## Project Description
ClearPath is a university campus application for digitizing the student clearance process. Students can register, submit clearance requests, and track approval status while administrators can review, approve, or reject requests with remarks.

## Problem Statement
University students often need to visit multiple departments for clearance. ClearPath centralizes this workflow online so students can submit requests and receive timely status updates without paper forms.

## Solution
A MERN stack application with role-based access: students create and monitor requests while admins manage and review them through a secure dashboard.

## Features
- Student registration and login
- Admin login
- JWT authentication and role-based access
- Student dashboard with live statistics
- New clearance request form
- My Requests list and detail view
- Admin dashboard with overall statistics
- Manage requests with search and filter
- Review requests with approve/reject and remarks
- Responsive UI with Tailwind CSS
- Loading, error, and empty states

## Technology Stack
- Frontend: React, Vite, React Router DOM, Axios, Tailwind CSS, React Icons
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, dotenv, cors

## Project Structure
```
backend/
  config/db.js
  controllers/
  middleware/
  models/
  routes/
  server.js
frontend/
  src/
    assets/
    components/
    context/
    layouts/
    pages/
    services/
    App.jsx
    main.jsx
    index.css
  package.json
```

## Database Design
- `users` collection stores student/admin profiles and hashed passwords.
- `clearances` collection stores clearance request details, status, remarks, and student references.

## Authentication
- JWT is used for protected APIs.
- Passwords are hashed with bcrypt.
- Role-based middleware prevents unauthorized access.

## User Roles
- `student`: create requests, view own requests, view request details.
- `admin`: view all requests, search/filter, review and update request status.

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/clearance`
- `GET /api/clearance/my`
- `GET /api/clearance/:id`
- `GET /api/clearance`
- `PUT /api/clearance/:id`

## Installation
1. Clone the repository.
2. Install backend dependencies: `cd backend && npm install`
3. Install frontend dependencies: `cd ../frontend && npm install`

## Environment Variables
Create `backend/.env` with:
```
PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_SECRET_KEY
```
Create `frontend/.env` with:
```
VITE_API_URL=http://localhost:5000/api
```

## How to Run
- Start backend: `cd backend && npm run dev`
- Start frontend: `cd frontend && npm run dev`

## Future Improvements
- Add admin user management
- Add export or print request slip
- Add notifications and reminders
- Improve dashboard analytics

## Developer Information
Developer: [Your Name]
Department: [Your Department]
Session: [Your Session]
