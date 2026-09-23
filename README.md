# 🎓 StudyMate AI — Your Intelligent AI Study Partner

> **Learn smarter. Understand faster. Study better.**  
> A complete, modern, responsive full-stack web application designed for college students to master complex coursework with AI.

---

## 🌟 Key Features

1. **ChatGPT-Style AI Tutor (`/tutor`)**:
   - Multi-turn study conversations with persistent database history.
   - Separate session threads (Operating Systems, Algorithms, Calculus, Chemistry).
   - Topic starters and live difficulty level selector (**Beginner**, **Intermediate**, **Advanced**).
   - One-click copy, regenerate, and Markdown rendering.

2. **AI Topic Explanations (`/explain`)**:
   - Generates structured **8-part pedagogical breakdowns**:
     1. Simple definition
     2. Core concept
     3. How it works
     4. Practical example
     5. Real-world analogy
     6. Important exam points
     7. Common student pitfalls
     8. Quick recap
   - Adaptable based on student's existing knowledge and difficulty setting.
   - Save directly to notes library or export.

3. **Smart Notes Generator & Library (`/notes`)**:
   - Produces exam-friendly notes categorized by length (*Short*, *Medium*, *Detailed*).
   - Structured sections: Overview, definitions, examples, formulas, and revision cheat-sheets.
   - Full note library management: Search, filter by difficulty, inline editor, and save to PostgreSQL.
   - Export to **PDF** (print-styled) and **TXT**.

4. **Interactive Quiz Engine (`/quizzes`)**:
   - Generates 5, 10, 15, or 20 questions in **MCQ** (4 options) or **True/False** format.
   - **Delayed Answer Reveal**: Answers and explanations remain hidden while taking the quiz to maximize active recall.
   - Automatic grading: Score displays (e.g. `8 / 10`), percentage score, and detailed question-by-question breakdown.
   - Export quizzes with questions and optional answer key to PDF & TXT.

5. **Personalized Study Plans (`/study-plans`)**:
   - Generates day-by-day study roadmaps based on available daily study time, course difficulty, and duration.
   - Each day details: Learning activity, practice activity, revision activity, and quiz/review.
   - Interactive day completion checkboxes that update visual progress bars in real-time.
   - Export structured schedules to PDF & TXT.

6. **Document Learning & PDF/TXT Q&A (`/documents`)**:
   - Upload course syllabi, lecture slides, or reading materials (`.pdf`, `.txt`, `.md`).
   - Server-side text extraction using `pdf-parse` with automatic summaries.
   - Context-grounded Q&A with smart text chunking so questions are answered strictly from your lecture notes.
   - Pre-built query chips: *"Summarize this PDF"*, *"What are the most important exam topics?"*, *"Create 10 MCQs from this document"*.

7. **Student Dashboard (`/dashboard`)**:
   - Personalized greeting: *"Good evening, [Student Name] 👋"*.
   - Live metrics: Topics studied, notes created, quizzes completed, and study sessions.
   - Quick action shortcuts to all 5 study tools and recent activity feed.

8. **Chronological Activity Timeline (`/history`)**:
   - Unified chronological log of all interactions, past quiz scores, saved notes, and active study plans.

9. **Security, Privacy & Theming**:
   - Dark mode & Light mode toggle with persistent preferences.
   - Email/password authentication with bcrypt hashing and JWT sessions.
   - Strict data isolation: students can only access their own records.
   - API keys loaded exclusively on the backend server.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, React Router v6 |
| **Backend** | Node.js, Express.js, TypeScript, REST API |
| **Database** | PostgreSQL 16, Prisma ORM |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password hashing |
| **AI Integration** | Google Gemini API (or OpenAI-compatible) with server-side hybrid educational fallback engine |
| **File Processing** | Multer, `pdf-parse` |
| **Containerization** | Docker, Docker Compose |

---

## 📁 Project Structure

```
studymate-ai/
├── docker-compose.yml          # PostgreSQL 16 container definition
├── package.json                # Root project helper scripts
├── .env.example                # Root environment template
├── .gitignore
├── README.md                   # Complete documentation
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma schema (User, Conversation, Note, Quiz, Plan, etc.)
│   │   └── seed.ts             # Demo student data and pre-populated study materials
│   ├── src/
│   │   ├── config/             # Environment and Prisma configuration
│   │   ├── controllers/        # Auth, Chat, Explain, Notes, Quizzes, StudyPlans, Documents, Dashboard
│   │   ├── middleware/         # JWT auth, Zod validation, error handler, Multer upload
│   │   ├── prompts/            # Reusable prompt engineering templates
│   │   ├── routes/             # Express REST router definitions
│   │   ├── services/           # AI service, PDF text extraction service
│   │   ├── types/              # TypeScript interfaces and Zod schemas
│   │   ├── utils/              # Token utils, password hashing, text chunker
│   │   └── index.ts            # Server entrypoint
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/         # Sidebar, Header, MarkdownRenderer, DifficultySelector
    │   ├── context/            # AuthContext, ThemeContext, ToastContext
    │   ├── layouts/            # DashboardLayout
    │   ├── pages/              # LandingPage, LoginPage, RegisterPage, DashboardPage,
    │   │                       # TutorPage, ExplainPage, NotesPage, QuizzesPage,
    │   │                       # StudyPlansPage, DocumentsPage, HistoryPage, SettingsPage
    │   │── services/           # Typed API client with JWT interceptors
    │   ├── types/              # Frontend data models
    │   ├── utils/              # PDF and TXT exporters
    │   ├── App.tsx             # Route configuration
    │   ├── main.tsx
    │   └── index.css           # Tailwind directives and print stylesheets
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.ts
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+ or v10+)
- **Docker Desktop** (for running local PostgreSQL container)

### 2. Start PostgreSQL Database
From the root directory:
```bash
docker compose up -d
```
*(This starts a PostgreSQL 16 container named `studymate-postgres` on port `5432`)*

### 3. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Push Prisma schema to PostgreSQL database
npx prisma db push

# Seed demo student account and materials
npx tsx prisma/seed.ts

# Build and start backend server
npm run build
npm start
```
The backend will start on **`http://localhost:5001`**. Verify at `http://localhost:5001/health`.

### 4. Setup Frontend
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend will start on **`http://localhost:5173`**.

---

## 🔑 Demo Student Credentials

A demo student account is pre-seeded for immediate testing:
- **Email**: `alex@college.edu`
- **Password**: `password123`

You can also create a new account anytime on the **Register** page (`/register`).

---

## ⚙️ Environment Variables

Create `backend/.env` containing:
```env
# Database configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/studymatedb?schema=public"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server Port
PORT=5001

# Client URL (for CORS)
FRONTEND_URL="http://localhost:5173"

# Optional LLM API Key (Google Gemini or OpenAI)
# Leave empty to use the built-in high-quality educational generative fallback engine!
LLM_API_KEY=""
LLM_PROVIDER="gemini"
LLM_MODEL="gemini-1.5-flash"
```

> [!NOTE]
> **Zero-Breakage Educational Fallback Engine**:
> If `LLM_API_KEY` is not provided or quota is exceeded, StudyMate AI automatically activates a high-quality pedagogical fallback generator that creates structured 8-part explanations, notes, quizzes, and study plans tailored to the student's topic and level. When you add your API key, it seamlessly switches to live AI model inference.

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Create a new student account
- `POST /api/auth/login` — Sign in and receive JWT token
- `POST /api/auth/logout` — End user session
- `GET /api/auth/me` — Get authenticated student profile

### AI Tutor & Chat
- `GET /api/conversations` — List student's conversations
- `POST /api/conversations` — Create a new study session
- `GET /api/conversations/:id` — Get conversation message history
- `DELETE /api/conversations/:id` — Delete a conversation
- `POST /api/chat` — Send a message to AI Tutor

### Topic Explanations
- `POST /api/explain` — Generate structured 8-part explanation

### Notes
- `POST /api/notes/generate` — Generate structured study notes
- `GET /api/notes` — List saved notes (with search and difficulty filter)
- `POST /api/notes` — Save note to library
- `GET /api/notes/:id` — Fetch single note
- `PUT /api/notes/:id` — Update note title/content
- `DELETE /api/notes/:id` — Delete note

### Quizzes
- `POST /api/quizzes/generate` — Generate MCQ or True/False quiz (answers hidden during test)
- `GET /api/quizzes` — List user's quizzes and past attempt scores
- `GET /api/quizzes/:id` — Get quiz questions
- `POST /api/quizzes/:id/submit` — Grade quiz submission, record attempt, return explanations

### Study Plans
- `POST /api/study-plans/generate` — Generate day-by-day study roadmap
- `GET /api/study-plans` — List user's study plans
- `GET /api/study-plans/:id` — Get plan with day schedules
- `PATCH /api/study-plans/:id/days/:dayId` — Toggle day completion status
- `DELETE /api/study-plans/:id` — Delete study plan

### Documents & PDF Learning
- `POST /api/documents/upload` — Upload PDF or TXT file and extract text
- `GET /api/documents` — List uploaded documents
- `DELETE /api/documents/:id` — Delete document
- `POST /api/documents/:id/ask` — Ask question grounded in document context

### Dashboard
- `GET /api/dashboard/stats` — Aggregated study metrics and recent activities

---

## 🔒 Security Architecture

1. **Server-Side API Key Isolation**: All LLM calls occur strictly through the Node.js Express backend. The client never interacts directly with LLM providers.
2. **Strict Multi-Tenant Isolation**: Every database query is scoped to `req.user.id`, ensuring students cannot view, modify, or delete another student's conversations, notes, quizzes, or files.
3. **Password Security**: Passwords are salted and hashed using `bcryptjs` (cost factor 10) before storage.
4. **Input Validation**: All incoming request payloads are strictly validated using `Zod` schemas.
5. **Secure File Uploads**: File uploads are restricted to `.pdf`, `.txt`, `.md`, and `.csv` up to 15MB, with disk storage and cleanup on deletion.
6. **HTTP Headers & CORS**: `Helmet` sets secure HTTP headers, and `CORS` is restricted to authorized frontend origins.

---

## 📄 License
MIT License. Built for students, educators, and lifelong learners.
