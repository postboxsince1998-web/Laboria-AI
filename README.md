# Laboria AI 🚀
> **Tagline:** "Stop searching. Start matching."

Laboria AI is a modern AI-powered career and job matching platform designed to reduce the stress, repetitive workload, and time wasted by job seekers. 

Unlike traditional job portals that rank positions by geographic proximity or sponsored listings, Laboria AI enforces a strict **Profile Relevance First** matching model.

---

## 🌟 Core Matching Principle

1. **Candidate Profile/Resume Match** — **PRIMARY (60% Weight)**
2. **Location / Distance** — **SECONDARY (20% Weight)**
3. **Experience & Eligibility** — **Additional (10% Weight)**
4. **User Preferences** — **Additional (10% Weight)**

> **Rule Enforced:** A job that is 1,000 km away with a 95% profile fit will **always rank higher** than a job 5 km away with a 50% profile fit.

---

## 📱 10 Primary Platform Modules

| # | Module | Description |
|---|---|---|
| 1 | **Dashboard** | Candidate overview, Job Readiness gauge, top matched opportunities feed across India hubs. |
| 2 | **AI Career Navigator** | Visual career trajectories (e.g. Full Stack -> Solutions Architect), milestone roadmaps, salary bump estimates. |
| 3 | **AI Skill Gap Analyzer** | Target role benchmark matrix, matched vs missing skills, priority levels (Critical / Recommended), and learning hours. |
| 4 | **AI Job Readiness Score** | Multi-dimensional index (Resume ATS 30%, Skill Fit 35%, Experience 20%, Soft Skills 15%). |
| 5 | **Personal AI Mentor** | Conversational AI career mentor supporting custom questions & pre-built quick replies. |
| 6 | **Future Skills Radar** | Market trends in Bengaluru, Hyderabad, NCR, Pune & Remote with YoY growth rate & demand index. |
| 7 | **Resume → Opportunity** | Drag-and-drop resume parse simulator with instant match re-indexing against live jobs. |
| 8 | **Location Recommendations** | Geo-aware matching demonstrating distance decay penalties while respecting profile match primacy. |
| 9 | **AI Interview Prep** | Role-specific technical & behavioral question generator with STAR method guide & answer evaluator. |
| 10 | **Soft Skills Coach** | Recruiter outreach tone analyzer, clarity scoring, and actionable phrasing polisher. |

---

## 🛠️ Architecture & Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router DOM
- **Backend**: Node.js, Express, TypeScript, CORS, REST API
- **AI Architecture**: `IAIService` clean interface pattern with zero-cost **Development Mock Provider** default. Automatically activates **Google Gemini API** when `VITE_GEMINI_API_KEY` is present.

```
laboria-ai/
├── package.json
├── client/
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── types/          # Domain TypeScript interfaces
│       ├── services/       # Job matching engine & AI providers
│       ├── components/     # Reusable glassmorphism UI & Layout
│       └── pages/          # 10 Module views
└── server/
    ├── package.json
    └── src/
        ├── index.ts        # Express server entry point
        ├── routes/         # REST API endpoints
        └── services/       # Server matching engine
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

From the project root:

```bash
# Install root, client, and server dependencies
cd client && npm install
cd ../server && npm install
```

### 2. Environment Variables

Create `.env` in `client/` or `server/`:

```env
PORT=5000
VITE_GEMINI_API_KEY=your_optional_free_gemini_api_key
```

### 3. Run Development Servers

Run frontend and backend concurrently:

```bash
# Terminal 1: Client (http://localhost:5173)
npm run dev:client

# Terminal 2: Server (http://localhost:5000)
npm run dev:server
```

---

## 🔒 Zero-Cost MVP Guarantee

- No hardcoded API keys.
- No paid third-party dependencies required to test full functionality.
- Clean development provider ready for seamless production deployment.
