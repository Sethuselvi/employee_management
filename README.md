
## Usage

1. Register a new user or login with existing credentials.
2. Admin users can manage employees and users.
3. Regular users can view and update their profile.

---
## Backend

- **Tech Stack:** Node.js, Express, MongoDB (Mongoose)
- **Features:**
  - User authentication (JWT)
  - Role-based access control (admin, user)
  - Employee CRUD operations
  - User management

### Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your MongoDB connection in `config/db.js`.
4. Start the server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5000` by default.

---

## Frontend

- **Tech Stack:** Vue.js, TypeScript, Vite
- **Features:**
  - User registration, login, password reset
  - Employee list and management UI
  - Profile management
  - Navigation bar with role-based links

### Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` by default.

---

## Folder Overview

- `backend/models/` - Mongoose models for User and Employee
- `backend/routes/` - Express route handlers for authentication, users, and employees
- `backend/middleware/` - Auth and role-based middleware
- `frontend/src/components/` - Vue components for forms, lists, auth, and navigation
- `frontend/src/auth.ts` - Frontend authentication logic


