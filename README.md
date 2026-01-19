
# 🎓 NexEra Learn  
### A Campus Connect Platform

NexEra Learn is a modern, role-based **Campus Connect web application** designed to bridge communication and collaboration between **students**, **faculty**, and **administration** within an educational institution.

It provides **separate portals, personalized dashboards, and essential campus tools**, built with a scalable and production-ready architecture.

---

## 🚀 What is NexEra Learn?

NexEra Learn acts as a **digital campus hub**, enabling:
- Seamless communication
- Centralized academic information
- Secure role-based access
- A consistent, intuitive user experience

Each user role interacts with the platform through a **dedicated portal**, ensuring clarity, security, and relevance.

---

## 🔐 Role-Based Portals

### 👨‍🎓 Student Portal
- Personalized dashboard
- Chats and campus networking
- Wellness resources
- Profile management

### 👩‍🏫 Faculty Portal
- Dashboard overview
- Notices and announcements
- Chats
- Profile management

### 🛠 Admin Portal
- Central dashboard
- User management
- Academics (non-class logic)
- Announcements
- Reports and insights

> Each portal has its **own login and signup flow**, protected routes, and scoped access.

---

## 🧠 Architecture Highlights

- Role-based routing and access control
- Clean separation of UI, logic, and services
- Feature-flag driven architecture
- Secure backend with Row Level Security (RLS)
- UI consistency across all portals

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS**
- **Shadcn UI** (Radix-based component system)
- **Framer Motion** (Animations)
- **React Router DOM v6**
- **React Query (@tanstack/react-query)**
- **React Hook Form + Zod**
- **Lucide React** (Icons)

### Backend & Services
- **Supabase**
  - Authentication
  - PostgreSQL Database
  - Row Level Security (RLS)
- **Google Gemini API**
  - Used selectively (primarily student-focused features)

---

## 📁 Project Structure
src/ ├── components/         # Reusable UI components ├── config/             # Feature flags & navigation config ├── contexts/           # Global contexts (AuthContext) ├── data/               # Static & mock data ├── hooks/              # Custom React hooks ├── lib/                # Utilities & service configs (Supabase, Gemini) ├── pages/ │   ├── admin/          # Admin portal pages │   ├── faculty/        # Faculty portal pages │   ├── student/        # Student portal pages │   └── public/         # Public & landing pages ├── services/           # API & data access layers ├── App.tsx             # App routing & layout └── main.tsx            # Application entry point
Copy code

---

## 🎨 UI & UX Principles

- Clean white/light theme with strong contrast
- Card-based layouts for clarity
- Subtle hover and motion effects
- Consistent component behavior across portals
- Accessibility-focused design
- Responsive across devices

> UI changes are intentionally **decoupled from feature logic**.

---

## 🔐 Authentication & Security

- Supabase Auth for secure login & signup
- Separate authentication flows for each role
- Role-based access control
- Database-level Row Level Security (RLS)
- No sensitive credentials exposed to frontend

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
⚠️ Never commit .env files to version control.
🧑‍💻 Development Workflow
Prerequisites
Node.js v18+
npm or bun
Install Dependencies
Copy code
Bash
npm install
Start Development Server
Copy code
Bash
npm run dev
Build for Production
Copy code
Bash
npm run build
🚫 Design Decisions & Constraints
Landing page remains untouched
UI changes do not affect feature logic
AI features removed for Faculty & Admin to reduce server load
Backend powered entirely by Supabase
Classes feature intentionally excluded from backend scope
🧪 Current Status
Core UI and routing completed
Role-based portals functional
Backend integration in progress
White-theme UI audit completed
Feature flags in place for controlled scalability
📌 Future Enhancements
Controlled AI reintroduction via feature flags
Advanced analytics dashboards
Real-time notifications
Expanded wellness tools
Mobile-first adaptation
📄 License
This project is developed for academic, demonstration, and innovation purposes.
✨ Philosophy
Stability over hype
Clarity over complexity
Security over shortcuts
NexEra Learn is built to scale responsibly while delivering a polished and reliable campus experience.