# RA2311003020532 — Microservices Assessment

This workspace contains three microservices used for a coding assessment:

- `logging-middleware` — registration/auth + logs API
- `vehicle_maintenance_scheduler` — depot/vehicle APIs and knapsack schedule
- `notification_app_be` — notifications API

Quick fix applied

- Fixed an issue where Postman requests that included a trailing space produced `Cannot GET /api/depots%20`. I added URL-normalization middleware to `vehicle_maintenance_scheduler/index.js` that trims trailing spaces and `%20` from request paths so clients with accidental trailing spaces will still reach the intended route.

How to run (each service):

1. Open a terminal for each service folder.
2. From the service folder run:

```bash
# example: start scheduler
cd vehicle_maintenance_scheduler
node index.js
```

Endpoints to test (local):

- Scheduler depots: `GET http://127.0.0.1:3002/api/depots`
- Scheduler vehicles: `GET http://127.0.0.1:3002/api/vehicles`
- Scheduler schedule: `POST http://127.0.0.1:3002/api/schedule` with JSON `{ "maxDuration": 10 }`

Notes about screenshots

- The evaluation requires screenshots showing: request body, response JSON, and response time.
- For GET requests include the request URL and headers panel (Authorization header if used).
- For POST requests include the request body panel.

Suggested screenshot captions (what to include in your submission):

- "Scheduler — Depots (GET)" — show URL `http://127.0.0.1:3002/api/depots`, headers, and response body (JSON) plus response time.
- "Scheduler — Vehicles (GET)" — same for `/api/vehicles`.
- "Scheduler — Build schedule (POST)" — show request body (maxDuration), response body (selected vehicles) and response time.

Troubleshooting

- If you see `Cannot GET /api/depots%20` in Postman, remove trailing spaces from the URL or re-run the request.
- If you need the scheduler to fetch live upstream data from the evaluation server set `SCHEDULER_USE_UPSTREAM=true` and ensure the logging service is running locally so the scheduler can request a cached auth token.

If you want, I can:

- Run the scheduler with upstream enabled and capture screenshots for you.
- Commit these changes and push them to your repository (I can do the commit if you want).

---

Edited files

- `vehicle_maintenance_scheduler/index.js` (URL-normalize middleware)
- `README.md` (this file)
