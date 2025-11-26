# Painting Contractor (Frontend + Backend)

This repository contains a React frontend and a FastAPI backend for managing painting contractor projects (sites, materials, labour, daily logs, overheads, and reports).

## Quick Start (Windows cmd.exe)

### 1. Backend (Python)

Create/activate a Python 3.10/3.11 virtualenv (3.11 recommended for installing all deps):

```cmd
cd /d "c:\Users\santo\OneDrive\Desktop\paint\backend"
python -m venv .venv
.venv\Scripts\activate
```

Install required packages (I installed a minimal compatible set in the session; to install everything use Python 3.11+):

```cmd
python -m pip install -r requirements.txt
```

Start the backend (ensure MongoDB is running locally or set `MONGO_URL` accordingly):

```cmd
set "MONGO_URL=mongodb://localhost:27017"
python server.py
```

Health endpoint: `http://127.0.0.1:8001/api/health`

### 2. Frontend (Node + Yarn)

The project uses Yarn v1 in the lockfile. Two options:

**Option A: Use npx to run Yarn without global install** (what I used):

```cmd
cd /d "c:\Users\santo\OneDrive\Desktop\paint\frontend"
npx --yes yarn@1.22.22 install --non-interactive
npx --yes yarn@1.22.22 start
```

**Option B: Install Yarn globally (or enable Corepack) then run:**

```cmd
cd /d "c:\Users\santo\OneDrive\Desktop\paint\frontend"
yarn install
yarn start
```

Dev server: `http://127.0.0.1:3000`

## Notes & Troubleshooting

### Python version
The `requirements.txt` includes packages (e.g., numpy 2.3.x) that require Python >= 3.11. If you hit installation errors on Python 3.10:
- Either upgrade to Python 3.11+, or
- Install a minimal set: `fastapi`, `motor`, `pydantic`, `openpyxl`, `uvicorn`, `pymongo`

### MongoDB
For full functionality start a local MongoDB instance or set `MONGO_URL` to a reachable Mongo connection string.

### Node & Yarn
The frontend's dependency tree has older peer deps. Using `npx --yes yarn@1.22.22` or `yarn install --legacy-peer-deps` can help. If you see `ajv` or `ajv-keywords` errors, prefer Yarn v1 or use Node 18.x for best compatibility.

### Case-sensitive imports
On some systems CRA can be strict about file casing. If you see `Cannot find module '@/App'` or similar, ensure `src/App.js` exists and imports are resolved. I added a canonical `src/App.js` and adjusted `src/index.js` to use relative imports to avoid alias issues.

## Smoke Tests Performed

- Started backend and frontend dev servers.
- Created a sample site, material, labour and site daily log via API.
- Verified inventory and site report endpoints returned updated values.

## API Endpoints

**Sites:** `GET/POST/PUT/DELETE /api/sites`
**Materials:** `GET/POST/PUT/DELETE /api/materials`
**Labours:** `GET/POST/PUT/DELETE /api/labours`
**Daily Logs:** `GET/POST/PUT/DELETE /api/site-logs`
**Overheads:** `GET/POST/PUT/DELETE /api/overheads`
**Reports:** `GET /api/reports/site/{site_id}`, `GET /api/reports/inventory`, `GET /api/reports/daily`
**Exports:** `GET /api/export/site/{site_id}`, `GET /api/export/inventory`
**Health:** `GET /api/health`

## Next Recommended Steps

- (Optional) Remove the compatibility re-export `src/app.js` and keep only `src/App.js` once you're comfortable with the change.
- Add a small automated smoke-test script.
- Set up Docker Compose for local MongoDB and containerized deployment.

---

For more details about specific API responses or features, refer to `backend/server.py` for the FastAPI route definitions and `frontend/src/App.js` for the UI components.
