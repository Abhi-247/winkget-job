# WinkGetJob — Full-Stack Freelance Job Portal

A modern, full-featured freelance marketplace built with **Next.js 15**, **Express**, and **MongoDB**. Connect skilled freelancers with employers through a seamless, role-based platform.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8) ![Express](https://img.shields.io/badge/Express-4.x-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **NextAuth v5** with JWT + Google OAuth
- Role-based access control (Job Seeker, Employer, Admin)
- Secure backend JWT validation
- Protected routes with automatic redirection

### 👤 Role-Based Dashboards

#### Job Seeker Portal
- Live application tracking
- Hire request management
- Earnings & wallet (Phase 2)
- Saved jobs & proposals
- Profile & settings management

#### Employer Portal
- Post & manage job listings
- Review applications with accept/reject
- Shortlist candidates
- Mock escrow summary (Phase 2 feature)
- Hire request sending

#### Admin Panel
- User management (activate/ban)
- Job moderation (open/close)
- Platform statistics
- Recent signups tracking

### 🌐 Public Features
- **Landing Page**: Hero, stats, categories, featured freelancers, why choose us
- **Browse Jobs**: Advanced filtering (search, category, location, salary)
- **Job Details**: Full job view with apply modal
- **Authentication Pages**: Split-screen design with role toggle

### 🎨 Design System
- **Tailwind CSS v4** with custom brand tokens
- Reusable UI components (Button, Input, Card, Badge, Modal, Tabs, Spinner, Skeleton, Toast)
- Responsive design (mobile-first, 375px/768px/1280px breakpoints)
- Dark sidebar layouts for dashboards

---

## 🏗️ Architecture

```
winkget-job/
├── backend/                    # Express + MongoDB API
│   ├── src/
│   │   ├── config/            # Database connection
│   │   ├── models/            # Mongoose schemas (User, Job, Application, HireRequest)
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # REST API endpoints
│   │   ├── middlewares/       # Auth & role checking
│   │   └── index.ts           # Server entry point
│   └── package.json
│
└── frontend/                   # Next.js 15 App Router
    ├── app/
    │   ├── (public)/          # Landing, sign-in, register, browse jobs
    │   ├── (jobseeker)/       # Job seeker dashboard & pages
    │   ├── (employer)/        # Employer dashboard & pages
    │   ├── (admin)/           # Admin panel
    │   ├── api/auth/          # NextAuth API routes
    │   ├── layout.tsx         # Root layout with providers
    │   ├── not-found.tsx      # 404 page
    │   └── error.tsx          # Error boundary
    ├── components/
    │   ├── ui/                # Reusable design system
    │   ├── layout/            # Navbar, Footer, Sidebars, Topbar
    │   ├── landing/           # Landing page sections
    │   ├── auth/              # Sign in/register forms
    │   ├── jobseeker/         # Job seeker components
    │   ├── employer/          # Employer components
    │   └── admin/             # Admin components
    ├── lib/                   # Utilities, API client, auth config
    ├── types/                 # TypeScript interfaces
    ├── hooks/                 # Custom React hooks
    └── middleware.ts          # Route protection & redirection
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB Atlas** account (or local MongoDB)
- **Google OAuth** credentials (optional for OAuth)

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd winkget-job

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

#### Backend (`.env` in `/backend`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/winkgetjob?retryWrites=true&w=majority
JWT_SECRET=your_strong_random_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_oauth_client_id
NODE_ENV=development
UPLOAD_DIR=uploads
```

#### Frontend (`.env.local` in `/frontend`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_strong_random_nextauth_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

### 3. Get Google OAuth Credentials (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env` files

### 4. Start Development Servers

```bash
# Terminal 1: Start backend (from /backend)
npm run dev
# Backend runs on http://localhost:5000

# Terminal 2: Start frontend (from /frontend)
npm run dev
# Frontend runs on http://localhost:3000
```

### 5. Create Admin User (Optional)

Use MongoDB Compass or mongosh to manually set a user's `role` to `"admin"`:

```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

---

## 📚 API Reference

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user (credentials) |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/google` | Login/register with Google ID token |
| GET | `/auth/me` | Get current user (requires JWT) |
| PATCH | `/auth/me` | Update profile |
| PATCH | `/auth/change-password` | Change password |

### Job Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/jobs` | Browse jobs (public) | No |
| GET | `/jobs/:id` | Job detail (public) | No |
| POST | `/jobs` | Create job | Employer |
| PATCH | `/jobs/:id` | Update job | Employer |
| DELETE | `/jobs/:id` | Delete job | Employer |
| GET | `/jobs/employer/my-jobs` | Employer's jobs | Employer |

### Application Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/applications` | Apply to job | Job Seeker |
| GET | `/applications/my` | My applications | Job Seeker |
| GET | `/applications/job/:jobId` | Job's applications | Employer |
| PATCH | `/applications/:id/status` | Accept/reject | Employer |

### Hire Request Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/hire-requests` | Send hire request | Employer |
| GET | `/hire-requests/my` | My hire requests | Job Seeker |
| GET | `/hire-requests/employer` | Sent requests | Employer |
| PATCH | `/hire-requests/:id/status` | Respond | Job Seeker |

### Admin Endpoints (All require admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Platform statistics |
| GET | `/admin/users` | List users |
| PATCH | `/admin/users/:id/toggle-status` | Ban/activate user |
| GET | `/admin/jobs` | List all jobs |
| PATCH | `/admin/jobs/:id/status` | Open/close job |
| GET | `/admin/recent-signups` | Recent users |

---

## 🧪 Demo Credentials

The sign-in page displays demo credentials for each role:

- **Job Seeker**: `demo.seeker@winkgetjob.com` / `demo1234`
- **Employer**: `demo.employer@winkgetjob.com` / `demo1234`
- **Admin**: `admin@winkgetjob.com` / `password123`

*(Create these users manually in MongoDB or via registration)*

---

## 🎨 Design Tokens

Brand colors (Tailwind CSS v4):

```css
--color-primary: #16a34a         /* Green 600 */
--color-primary-bg: #f0fdf4      /* Green 50 */
--color-sidebar: #111827          /* Gray 900 */
```

Typography:
- Font: Geist Sans (default), Geist Mono (code)
- Base size: 16px
- Scale: text-xs (12px) → text-5xl (48px)

---

## 📦 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth v5
- **Icons**: Lucide React
- **State**: React hooks + server components

### Backend
- **Framework**: Express 4.x
- **Language**: TypeScript
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **OAuth**: google-auth-library

---

## 🗂️ Database Schema

### User
```typescript
{
  name: string
  email: string (unique)
  password?: string (hashed, optional for Google users)
  role: "jobseeker" | "employer" | "admin"
  avatar?: string
  googleId?: string
  company?: string
  title?: string
  skills: string[]
  location?: string
  bio?: string
  plan: "free" | "basic" | "pro"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Job
```typescript
{
  title: string
  employer: ObjectId (ref: User)
  description: string
  skills: string[]
  category: JobCategory
  salary: number
  salaryType: "fixed" | "hourly" | "monthly"
  location: string
  status: "open" | "closed" | "draft"
  applicantCount: number
  createdAt: Date
  updatedAt: Date
}
```

### Application
```typescript
{
  job: ObjectId (ref: Job)
  applicant: ObjectId (ref: User)
  status: "pending" | "accepted" | "rejected"
  coverLetter: string
  createdAt: Date
  updatedAt: Date
}
```

### HireRequest
```typescript
{
  employer: ObjectId (ref: User)
  jobseeker: ObjectId (ref: User)
  job: ObjectId (ref: Job)
  status: "pending" | "accepted" | "rejected"
  salary: number
  message?: string
  createdAt: Date
  updatedAt: Date
}
```

---

## 🛠️ Development Scripts

### Backend
```bash
npm run dev       # Start dev server with hot reload
npm run build     # Compile TypeScript
npm start         # Run production build
```

### Frontend
```bash
npm run dev       # Start Next.js dev server
npm run build     # Production build
npm start         # Run production server
npm run lint      # Run ESLint
```

---

## 📋 Phase 1 Scope (Completed)

✅ Backend API with full CRUD operations  
✅ Authentication (JWT + Google OAuth)  
✅ Role-based dashboards (3 roles)  
✅ Job posting & application flow  
✅ Hire request system  
✅ Public landing page  
✅ Browse & detail pages  
✅ Settings & profile management  
✅ Messages placeholder  
✅ Mock escrow UI  
✅ Error handling & loading states  
✅ Responsive design (mobile/tablet/desktop)  

---

## 🚧 Phase 2 Roadmap

- [ ] Real-time messaging (WebSocket)
- [ ] Full escrow integration (Stripe/Razorpay)
- [ ] File upload system (AWS S3)
- [ ] Advanced search filters
- [ ] Freelancer portfolio pages
- [ ] Review & rating system
- [ ] Notification system
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Video call integration

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Abhishek Verma**

Built as part of the WinkGetJob internship project.

---

## 📞 Support

For issues or questions:
- Email: hello@winkgetjob.com
- Create an issue in this repository

---

**Happy Freelancing! 🚀**
