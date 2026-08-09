Here is a comprehensive **`README.md`** file for your project:

```markdown
# 🎓 PIT Faculty Evaluation System (PIT-FES)

> **Palompon Institute of Technology** — Official Full-Stack Web Application for Student & Supervisor Faculty Evaluations, CHED CMO 19 (s. 2025) Compliance Reporting, and Institutional Analytics.

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-v19-61dafb?logo=react)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21-000000?logo=express)](https://expressjs.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-v0.40-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16%2B-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)

---

## 📌 Executive Overview

The **PIT Faculty Evaluation System (PIT-FES)** is an enterprise academic evaluation platform designed for the **Palompon Institute of Technology (PIT)**. It automates student evaluations of teaching (SET), supervisor evaluations of faculty (SEF), real-time analytics, and formal reporting.

The system is engineered in strict compliance with **CHED Memorandum Order (CMO) No. 19, Series of 2025**, which standardizes the **Individual Faculty Evaluation Report (IFER — Annex C)** and the **Faculty Evaluation and Development Acknowledgment Form (FEDAF — Annex D)** across Philippine Higher Education Institutions (HEIs).

---

## 🌟 Key Functional Highlights

### 1. 📜 CHED CMO 19 (s. 2025) Compliance Engine
* **Weighted Score Consolidation**: Consolidates **Student Evaluation of Teaching (SET - 60%)** and **Supervisor Evaluation of Faculty (SEF - 40%)** scores.
* **IFER Report Generation (Annex C)**: Automated class-level and course-level score aggregation with customizable score bounds (Percentage 0–100% or GPA 1.0–5.0 scale).
* **FEDAF Action Plan & Acknowledgment (Annex D)**: Collaborative development planning (Areas for Improvement, L&D Activities, Action Plan) with digital faculty sign-off.
* **Direct PDF Engine**: Generates pixel-perfect, printable PDF documents directly matching CHED official document specifications.

### 2. 🤖 Multilingual Sentiment Analysis Engine
* **Context-Aware NLP**: Evaluates qualitative student and supervisor comments using an expanded AFINN-165 vocabulary engine tuned for academic feedback.
* **Multilingual Lexicon**: Built-in support for **English**, **Tagalog / Taglish**, and local **Bisaya / Cebuano / Waray-Waray** teaching feedback terminology (*"maayo kaayo"*, *"dili tapulan"*, *"sobrang helpful"*).
* **Advanced Linguistics**: Handles multi-word N-gram phrase matching, contrastive clause weighting (`but`, `pero`, `apan`), intensifiers, diminutives, and negation scope flipping.
* **Aspect Breakdown**: Categorizes feedback sentiment into **Pedagogy**, **Punctuality**, **Grading**, **Attitude**, and **Workload**.

### 3. ⚡ Real-Time Monitoring & WebSockets
* **Live Evaluation Feed**: Emits real-time anonymous submission events over Socket.io to administrative dashboards during active evaluation windows.
* **Live System Log Stream**: Real-time Server-Sent Events (SSE) terminal streaming backend `combined.txt` and `error.txt` log outputs directly to the System Admin console.

### 4. 📂 Batch Processing & CSV Bulk Imports
* **Drag-and-Drop CSV Importer**: Batch-imports **Colleges**, **Programs**, **Classes**, **Courses**, and **User Accounts** with real-time row validation and failure callouts.

### 5. 🔐 Robust Security & Auth Flow
* **Two-Factor Authentication (2FA)**: Email-based 8-character OTP verification for logins, password changes, and email confirmation.
* **JWT Token Rotation**: 15-minute Access Tokens with HttpOnly Refresh Token rotation.
* **Role-Based Access Control (RBAC)**: Fine-grained permission matrix across 5 system roles (`SYS_ADMIN`, `ADMIN`, `SUPERVISOR`, `FACULTY`, `STUDENT`).
* **Smart Rate Limiting**: User-ID and IP-aware rate limiters prevent campus Wi-Fi / computer lab IP throttling.

---

## 👥 Role & User Capabilities

| Role | Scope & Permissions |
| :--- | :--- |
| **`SYS_ADMIN`** | System-wide console access, server log streams, global analytics, system-wide CRUD, rate limit overrides, and superadmin account seeding. |
| **`ADMIN`** | Institution setup (Colleges, Programs, Courses, Curriculum), User account management, Academic Semesters, SET/SEF Form Builders, Evaluation Schedules, and Batch IFER/FEDAF generation. |
| **`SUPERVISOR`**<br>*(Deans & Chairs)* | Scoped jurisdiction coverage, Supervisor Evaluation of Faculty (SEF) execution with MOVs (Means of Verification), scoped department analytics, and FEDAF development planning. |
| **`FACULTY`** | Personal teaching class workload view, SET/SEF evaluation report inspection, PDF downloads, and formal digital report acknowledgment. |
| **`STUDENT`** | Enrolled class subject rosters and active Student Evaluation of Teaching (SET) submission portal. |

---

## 🛠️ System Architecture & Tech Stack

```

PIT-FES Monorepo
├── frontend/             # React 19 SPA (Vite + Tailwind CSS v4 + TanStack Query)
└── backend/              # Node.js + Express + Drizzle ORM + PostgreSQL

```

### **Frontend Stack**
* **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **State & Data Fetching**: [TanStack Query v5 (React Query)](https://tanstack.com/query) & [TanStack Form](https://tanstack.com/form)
* **Routing**: [React Router v7](https://reactrouter.com/)
* **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/)
* **Icons & Charts**: [Lucide React](https://lucide.dev/), [Recharts](https://recharts.org/)
* **Real-time**: [Socket.io Client](https://socket.io/)

### **Backend Stack**
* **Runtime**: [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/)
* **Database & ORM**: [PostgreSQL 16+](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/)
* **Authentication**: [Passport.js](https://www.passportjs.org/) (Local, Custom OTP, JWT strategies)
* **Validation**: [Zod](https://zod.dev/) + `drizzle-zod`
* **Real-time & Streaming**: [Socket.io](https://socket.io/), Server-Sent Events (SSE)
* **PDF Generation**: [PDFKit](https://pdfkit.org/)
* **Logging & Mail**: [Winston](https://github.com/winstonjs/winston) + [Nodemailer](https://nodemailer.com/) + [Resend API](https://resend.com/)

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v20.x` or higher
* **PostgreSQL**: `v16.x` or higher
* **npm**: `v10.x` or higher

---

### 1. Database Setup
Create a local or remote PostgreSQL database:

```sql
CREATE DATABASE pit_fes_db;
```

---

### 2. Backend Installation & Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Configure your `.env` file:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pit_fes_db

JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
REFRESH_SECRET=your_super_secret_refresh_key_at_least_32_characters_long

# Mail Credentials
GMAIL_APP_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
RESEND_API_KEY=re_123456789 # Optional Resend API Key
EMAIL_FROM=PIT-FES <no-reply@pit.edu.ph>
```

Run database migrations and initial seeders:

```bash
# Push schema to database
npm run db:push

# Run system role & superadmin seeders
npm run db:seed

# Start backend dev server
npm run dev
```

---

### 3. Frontend Installation & Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend will start at `http://localhost:5173`.

---

## 🔑 Default Credentials (Seeded Account)

After running `npm run db:seed`, the system automatically provisions the initial System Administrator account:

* **Email**: Value set in `GMAIL_APP_USER` (from `.env`)
* **Default Password**: `!SuperAdmin123`
* **Role**: `SYS_ADMIN`

> ⚠️ **Security Warning**: Log in immediately upon installation and change the default Superadmin password via **Account Settings**.

---

## 🧪 Testing & Code Quality

```bash
# Backend unit & integration tests
cd backend
npm run test

# Type checking
npm run typecheck
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Developed for <strong>Palompon Institute of Technology (PIT)</strong><br>
  <em>Empowering Quality Academic Instruction through Transparent & Data-Driven Evaluations.</em>
</p>
```
