# Project Context: Campus Connect

## Overview
Campus Connect is a comprehensive web application designed to bridge the gap between students, faculty, and administration in an educational institution. It provides tailored dashboards and features for each user role, facilitating communication, academic management, and campus life engagement.

## Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** 
  - Tailwind CSS (Utility-first CSS framework)
  - Shadcn UI (Component library based on Radix UI)
  - Framer Motion (Animations)
- **Routing:** React Router DOM (v6)
- **State Management:** 
  - React Query (@tanstack/react-query) for server state
  - React Context API for global app state (e.g., AuthContext)
- **Forms:** React Hook Form with Zod validation
- **Icons:** Lucide React

### Backend / Services
- **Database & Auth:** Supabase
- **AI Integration:** Google Gemini API (`@google/generative-ai`)

## Project Structure

```
src/
├── components/         # Reusable UI components (Shadcn UI, custom components)
├── config/            # Configuration files (features flags, navigation)
├── contexts/          # React Context providers (AuthContext)
├── data/              # Mock data and static content
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and library configurations (utils, gemini, supabase)
├── pages/             # Application pages (routed components)
│   ├── admin/         # Admin-specific pages
│   ├── faculty/       # Faculty-specific pages
│   ├── student/       # Student-specific pages
│   └── ...            # Public pages (Index, About, Contact, etc.)
├── services/          # API service layers
├── App.tsx            # Main application component with Routing setup
└── main.tsx           # Application entry point
```

## Key Features & Roles

### 1. Authentication & Roles
The application supports three distinct roles, each with its own login portal and protected routes:
- **Student:** Access to classes, chats, network, wellness, and profile.
- **Faculty:** Access to classes, chats, notices, and profile.
- **Admin:** Access to dashboard, user management, academics, announcements, and reports.

### 2. Feature Flags (`src/config/features.ts`)
- **Gemini Chat:** Enabled for Student, Faculty, and Admin.
- **Notifications:** Enabled for all roles.
- **Premium Badge:** Currently enabled only for Students.

### 3. Navigation
- **Public:** Landing page, Portals selection, About, Team, Contact, Legal pages.
- **Student:** Home, Classes, Chats, Network, Wellness, Profile.
- **Faculty:** Home, Classes, Chats, Notices, Profile.
- **Admin:** Dashboard, Users, Academics, Announcements, Reports.

## Development Workflow

### Prerequisites
- Node.js (v18+ recommended)
- npm or bun

### Setup & Run
1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Start Development Server:**
    ```bash
    npm run dev
    ```
3.  **Build for Production:**
    ```bash
    npm run build
    ```

## Current State & Next Steps
The application foundation is built with a robust routing system and role-based access control. The UI is polished using Shadcn UI and Framer Motion.

**Potential Next Steps for AI Assistant:**
- **Feature Implementation:** Flesh out specific page functionalities (e.g., connecting `StudentClasses` to real data, enhancing the `Wellness` page with AI features).
- **Backend Integration:** Ensure all components are correctly fetching data from Supabase instead of mock data.
- **AI Enhancements:** Further integrate Gemini AI into the "Wellness" or "Chat" features to provide intelligent assistance.
- **Testing:** Add unit and integration tests for critical flows.

## Environment Variables
Ensure `.env` is configured with necessary keys:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY` (if applicable)
