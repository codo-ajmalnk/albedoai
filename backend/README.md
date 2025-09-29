# Albedo Support Backend (FastAPI + MySQL)

## Environment

Create `.env` (optional) or export env vars:

- `DATABASE_URL` (e.g. `mysql://root:password@localhost:3306/albedo_support`)
- `CORS_ORIGIN` (frontend origin, default `http://localhost:8080`)

## Install

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 3001
```

## Seed Data

```bash
python -m backend.seed
```

## Endpoint

- POST `/api/search/articles` body `{ "query": "...", "limit": 5 }`
