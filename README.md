# Team Task Manager

A full-stack team task management app built for the "Team Task Manager" assignment. The app supports authentication, project workspaces, member management, role-based task access, and a dashboard with delivery analytics.

## Submission Checklist

Before submitting, fill in these two items with your real links:

- Live application URL: `ADD_YOUR_RAILWAY_URLS_HERE`
- Demo video URL: `ADD_YOUR_DEMO_VIDEO_LINK_HERE`

Repository URL is this GitHub repo.

## Assignment Coverage

### 1. User Authentication

- Sign up with name, email, and password
- Login and logout
- Secure auth using JWT stored in an HTTP-only cookie
- Session restore with `/api/v1/auth/me`

### 2. Project Management

- Create project
- Project creator becomes project admin automatically
- Admin can add and remove members by email
- Members can view projects they belong to

### 3. Task Management

- Create tasks with title, description, due date, priority, assignee, and status
- Assign tasks to project members only
- Update status across `To Do`, `In Progress`, and `Done`
- Admins can fully manage project tasks
- Members can update only the status of tasks assigned to them

### 4. Dashboard

- Total tasks
- Tasks by status
- Tasks per user
- Overdue tasks
- Completion rate
- Recent activity feed

### 5. Role-Based Access

- Project-level admin/member permissions are enforced through the project membership list
- Admins manage project details, members, and tasks
- Members can view their project/task data and update assigned task status

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Recharts
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Auth: JWT + HTTP-only cookies

## Project Structure

```text
backend/   Express API, MongoDB models, auth, RBAC, analytics
frontend/  React SPA, pages, components, client services
```

## Environment Variables

### Backend `backend/.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
COOKIE_NAME=ttm_token
```

`CLIENT_URL` can be a comma-separated list if you want to allow more than one frontend origin.

### Frontend `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Local Development

### 1. Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Configure environment files

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`
- Fill in your MongoDB connection string and JWT secret

### 3. Run the backend

```bash
cd backend
npm run dev
```

### 4. Run the frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173` and backend runs on `http://localhost:5000`.

## Production Commands

### Backend

```bash
cd backend
npm start
```

### Frontend

Build once, then serve the compiled app:

```bash
cd frontend
npm run build
npm start
```

The frontend `start` command serves `dist/` and supports SPA routing for direct links like `/projects/:projectId`.

## Railway Deployment

This repo is easiest to deploy as two Railway services from the same GitHub repository:

1. Create a backend service with root directory `backend`
2. Create a frontend service with root directory `frontend`
3. Generate public domains for both services
4. Set environment variables for each service
5. Rebuild the frontend after `VITE_API_URL` points to the backend public domain

### Backend Railway variables

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.up.railway.app
COOKIE_NAME=ttm_token
```

### Frontend Railway variables

```env
VITE_API_URL=https://your-backend-domain.up.railway.app/api/v1
```

### Railway notes

- The backend uses CORS with `CLIENT_URL`, so this must match your frontend public domain
- In production, cookies are sent with `Secure` and `SameSite=None`
- The frontend service expects a build before `npm start`

Official Railway references:

- React deploy guide: https://docs.railway.com/guides/react
- Static hosting guide: https://docs.railway.com/guides/static-hosting
- Variables reference: https://docs.railway.com/reference/variables
- Domains guide: https://docs.railway.com/networking/domains/working-with-domains

## Main API Routes

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Projects

- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/:projectId`
- `PATCH /api/v1/projects/:projectId`
- `DELETE /api/v1/projects/:projectId`
- `POST /api/v1/projects/:projectId/members`
- `DELETE /api/v1/projects/:projectId/members/:userId`

### Tasks

- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `GET /api/v1/tasks/:taskId`
- `PATCH /api/v1/tasks/:taskId`
- `PATCH /api/v1/tasks/:taskId/status`
- `DELETE /api/v1/tasks/:taskId`

### Dashboard

- `GET /api/v1/dashboard/overview`

## Validation and Error Handling

- Express Validator request validation
- MongoDB ObjectId validation middleware
- Centralized API error handling
- Auth and rate limiting middleware

## Quick Demo Flow

For your 2-5 minute assignment video, this is a good sequence:

1. Register a new user
2. Create a project
3. Add a member
4. Create and assign tasks
5. Show admin controls versus member task restrictions
6. Update task status
7. Open the dashboard and show analytics
