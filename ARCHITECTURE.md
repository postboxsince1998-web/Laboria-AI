# Laboria AI Platform Architecture 🚀
> **Tagline:** "Stop searching. Start matching."

Laboria AI is an AI-powered career and job matching platform built around a single core workflow principle: **A job seeker should upload their resume once, create their profile once, and Laboria AI continuously leverages that context across career pathing, skill gap analysis, job opportunities, geo-location, and interview preparation.**

---

## 🏗️ 1. High-Level Application Architecture

Laboria AI employs a decoupled, modular service/repository architecture designed for maximum pluggability.

```
+-------------------------------------------------------------------------+
|                              REACT FRONTEND                             |
|           (Vite + React 18 + TypeScript + Tailwind CSS + Lucide)        |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
|                        REPOSITORY & SERVICE LAYER                       |
|                       (IPlatformDbContext Interface)                     |
+-------------------------------------------------------------------------+
            │                                             │
            ▼                                             ▼
+-----------------------+                     +-----------------------+
| Mock Local Data Repo  |                     |  Future Live Adapters |
| (Zero-Cost MVP Mode)  |                     | (Supabase, Postgres,  |
| - In-Memory Storage   |                     |  Permitted Job Feeds, |
| - LocalStorage Cache  |                     |  Google Gemini API)   |
+-----------------------+                     +-----------------------+
```

---

## 🗄️ 2. 12 Core Domain Data Models

| # | Entity Model | Description & Key Fields |
|---|---|---|
| 1 | **UserProfile** | Candidate base details, degree, specialization, graduation year, YOE, coordinates, target roles, preferred industries, salary expectations. Supports progressive completion. |
| 2 | **Resume** | Document raw text & parsed structure (`parsedProfile`). Features **Information Provenance Separation** (`resume` vs `user_input` vs `AI_recommendation`). |
| 3 | **Skill & UserSkill** | Skill catalog (`Programming`, `Data`, `Cloud`, `DevOps`, `Leadership`, etc.) & user proficiency evidence map with provenance source tracking. |
| 4 | **Career** | Career paths (Data Analyst, Data Scientist, AI/ML Engineer, Software Developer, Full Stack, Cloud Engineer, UI/UX Designer, etc.) with step-by-step milestone roadmaps. |
| 5 | **Job** | Job listings stored with source metadata (`DEMO DATA`, `Employer Submission`, `Permitted API Feed`). Work modes: `onsite`, `hybrid`, `remote`. Coordinates & salary ranges. |
| 6 | **JobMatch** | Transparent composite matching scores (`Profile 70%`, `Location 15%`, `Exp 10%`, `Pref 5%`), distance in km, matched/missing skills, positive/improvement suggestions, tier (`Strong`, `Good`, `Potential`, `Low`). |
| 7 | **ReadinessAssessment** | 7-dimension evaluation index (`Technical`, `Projects`, `Resume`, `Interview`, `Communication`, `Soft Skills`, `Career Alignment`), overall 0-100 score, top 3 highest-impact improvements. |
| 8 | **InterviewSession** | Practice questions generated for candidate roles (clearly labeled as practice questions). STAR method response evaluations. |
| 9 | **MentorConversation** | Context-aware chat messages bound to candidate profile context state. |
| 10 | **FutureSkill** | Emerging technology trends, demand level (`Surging`, `High Demand`), future potential score, and related careers. |
| 11 | **SkillGap** | Target career/job benchmark gap item, current vs required level, priority (`Critical`, `Recommended`, `Bonus`). |
| 12 | **LearningRoadmap** | Sequential progression pipeline (`Current Skill` -> `Missing Skill` -> `Activity` -> `Project` -> `Interview`). |

---

## 🎯 3. Deterministic Matching Logic & Primacy Rule

Laboria AI enforces a strict **Profile Relevance First** matching model.

$$\text{Final Priority Score} = 0.70(\text{PROFILE\_MATCH}) + 0.15(\text{LOCATION\_MATCH}) + 0.10(\text{EXPERIENCE\_MATCH}) + 0.05(\text{PREFERENCE\_MATCH})$$

### Strict Primacy Rule
Location must **NEVER** override a significantly better profile match.

- **Candidate A**: 95% Profile Match, 25 km away $\rightarrow$ **Final Score: 95% (Priority Rank #1)**
- **Candidate B**: 63% Profile Match, 5 km away $\rightarrow$ **Final Score: 73% (Priority Rank #2)**

*Candidate A strictly ranks higher.*

---

## 🔌 4. Service Layer & Future API Integration Architecture

All frontend components interact exclusively through repository interfaces (`IPlatformDbContext` defined in `client/src/db/repositoryInterfaces.ts`).

### Future Production Adapters:
1. **Database Backend**: Connect Supabase or PostgreSQL by implementing `IPlatformDbContext` without editing React page views.
2. **Job Ingestion Feeds**: Ingest jobs from permitted APIs and employer submissions via `IJobDataIngestionProvider`. Job source metadata is preserved for compliance.
3. **AI Services**: Toggle between free-tier Google Gemini API (`@google/genai`) and local development providers (`IAIService`) via environment variables (`VITE_GEMINI_API_KEY`).
4. **Resume Parsing**: Connect third-party resume OCR & NLP parsers via `IResumeParsingService`.

---

## 🔐 5. Security & Privacy Considerations

- **Privacy Protection**: Private contact information (phone, email, exact GPS coordinates) is encapsulated inside entity repositories.
- **Provenance Safety**: AI assumptions are strictly tagged as `AI_recommendation` and are never presented as confirmed user facts.
- **Zero Hardcoded Secrets**: All API endpoints and key credentials rely strictly on environment variables (`.env`).

---

## 💡 6. Zero-Cost MVP Strategy

- Operates out-of-the-box using TypeScript in-memory repositories with LocalStorage persistence.
- Zero paid Google Maps or third-party API dependencies (uses zero-cost OpenStreetMap technology).
- Pluggable Google Gemini API free-tier support.
