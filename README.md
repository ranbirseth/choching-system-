# Coaching Center Management System

A comprehensive MERN stack application for managing coaching centers, featuring student admissions, attendance tracking, assignment management, and more.

## 🚀 Deployment

### Backend (Render)
1. **Root Directory**: Leave empty (or `.`)
2. **Build Command**: `npm run install-all && npm run build`
3. **Start Command**: `npm start`
4. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGO_URI`: `mongodb+srv://...` (Your Atlas URI with actual password)
   - `ACCESS_TOKEN_SECRET`: `your_secret_here`
   - `ACCESS_TOKEN_EXPIRY`: `15m`

### Frontend (Vercel)
1. **Root Directory**: `client`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Framework Preset**: `Vite`

## 🛠️ Initial Setup

### 1. Database Seeding
After deploying or setting up locally, you must seed the database to create the initial admin user.
```bash
npm run seed
```
**Default Admin Credentials:**
- **Email**: `admin@example.com`
- **Password**: `password123`

### 2. Local Development
```bash
# Install dependencies for all modules
npm run install-all

# Run server and client concurrently
npm run dev
```

## 🛡️ CORS Configuration
The backend is configured to allow requests from:
- `https://choching-system.vercel.app`
- `https://choching-system.onrender.com`
- `http://localhost:5173` (and common Vite ports)

## 📁 Project Structure
- `client/`: React + Vite frontend
- `server/`: Node.js + Express backend
- `package.json`: Universal scripts for monorepo management
