# Saud Project Memory

## Project Overview
Single-HTML Arabic business dashboard (`saud-work/index_business.html`, ~7500 lines, 295KB).
Node.js/Express backend with PostgreSQL database.

## Stack
- Frontend: Vanilla JS, Canvas.js charts, Arabic RTL
- Backend: Node.js + Express (`server.js`)
- DB: PostgreSQL (8 tables)
- Language: Arabic (RTL)

## File Structure
```
saud-work/
├── index_business.html   ← entire frontend app
├── server.js             ← Express server
├── package.json
├── .env.example
├── db/
│   ├── index.js          ← pg Pool
│   └── schema.sql        ← 8 tables
└── routes/
    ├── snapshots.js      ← daily metrics/wheel/health
    ├── projects.js
    ├── sections.js       ← task sections with nested tasks
    ├── tasks.js
    ├── completions.js    ← per-date task completion
    ├── strategic-focus.js
    ├── goals.js
    └── knowledge.js      ← quotes, books, notes
```

## DB Schema (8 tables)
- `daily_snapshots` (DATE PK) — metrics, wheel (7 dims), health, satisfaction score
- `task_completions` (DATE+UUID composite PK) — per-date task completion
- `task_sections` (UUID PK) — section templates
- `tasks` (UUID PK, section_id FK) — task templates (core/bonus, weekday/weekend flags)
- `projects` (UUID PK)
- `strategic_focus_items` (UUID PK)
- `goals` (UUID PK) — goal_type: 'legacy' | 'objectives2026'
- `knowledge_items` (UUID PK) — type: 'quote' | 'book' | 'note'

## API Endpoints
- GET/PUT `/api/snapshots/:date` — daily data (metrics + wheel + health)
- GET `/api/snapshots` — list all snapshot dates (for calendar)
- GET `/api/completions/:date` — task completions for date
- PUT `/api/completions/:date/:taskId` — upsert completion
- GET `/api/completions/week/:date` — week completions
- CRUD `/api/sections` — task sections (GET includes nested tasks)
- CRUD `/api/tasks` — tasks (POST needs section_id in body)
- CRUD `/api/projects`
- CRUD `/api/strategic-focus`
- CRUD `/api/goals` (query: ?type=legacy|objectives2026)
- CRUD `/api/knowledge` (query: ?type=quote|book|note)

## Frontend Pattern
- `dashboardData` is in-memory state (JS object)
- Each item has numeric `id` (in-memory) + UUID `api_id` (DB)
- `loadData()` fetches all APIs in parallel, maps to dashboardData
- `saveData()` saves daily snapshot to /api/snapshots/:date
- Individual CRUD operations call API + update dashboardData in-memory
- localStorage kept as fallback cache

## How to Run
1. Copy `.env.example` to `.env`, set DB credentials
2. Run `psql -d saud_dashboard -f db/schema.sql` to create tables
3. `npm start` → http://localhost:3000
4. Password: `12saud`
