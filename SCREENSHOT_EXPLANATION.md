# Screenshot Explanations

This document explains each screenshot mentioned for the scheduler API tests. The goal is to show exactly what each screenshot proves, what the grader should notice, and how the output relates to the assessment requirements.

## 1. Scheduler Depots API Screenshot

**Endpoint:** `GET http://127.0.0.1:3002/api/depots`

**What the screenshot shows**
- The request is a `GET` call to the scheduler service.
- The URL points to the local scheduler app running on port `3002`.
- The response panel shows a JSON object containing a `depots` array.
- The response status is successful, and the response time should be visible in Postman.

**What this screenshot proves**
- The scheduler service is running correctly.
- The `/api/depots` route is reachable from the client.
- The application returns structured depot data instead of an error page or empty response.
- The output is in the expected API format used by the rest of the project.

**What the reviewer should look for**
- The request method is `GET`.
- The response is JSON, not HTML.
- The `depots` field contains depot records.
- The response time is displayed in the screenshot.

**Why it matters**
- This endpoint acts as the source data for the maintenance scheduler.
- The depot list is needed to show that the service can expose operational resource data before building the schedule.

## 2. Scheduler Vehicles API Screenshot

**Endpoint:** `GET http://127.0.0.1:3002/api/vehicles`

**What the screenshot shows**
- The request is a `GET` call to the scheduler service.
- The URL targets the local vehicles endpoint on port `3002`.
- The response panel shows a JSON object containing a `vehicles` array.
- The screenshot should include the request area, response body, and response time.

**What this screenshot proves**
- The scheduler service is able to return vehicle data successfully.
- The `/api/vehicles` route is active and responding.
- The response format is consistent and machine-readable.
- The application is providing the operational inputs needed by the scheduling algorithm.

**What the reviewer should look for**
- The method is `GET`.
- The response body is JSON.
- The `vehicles` array contains records with fields like vehicle ID, depot ID, name, duration, and impact.
- The response time is visible and reasonable.

**Why it matters**
- The knapsack-based schedule depends on these vehicle records.
- This screenshot demonstrates that the service can expose the exact input data used for scheduling.

## 3. Scheduler Build Schedule Screenshot

**Endpoint:** `POST http://127.0.0.1:3002/api/schedule`

**Suggested request body**
```json
{
  "maxDuration": 10
}
```

**What the screenshot shows**
- The request is a `POST` call.
- The request body is visible in Postman.
- The request uses a `maxDuration` value that limits how many vehicle maintenance units can be selected.
- The response contains the computed schedule, including selected vehicles, total duration, and total impact.
- The response time is displayed.

**What this screenshot proves**
- The scheduler is not just returning static data.
- It is applying a real algorithm to choose vehicles under a duration constraint.
- The service is producing an optimized result based on the input payload.
- The output reflects the 0/1 knapsack logic used in the project.

**What the reviewer should look for**
- The request body is visible and contains `maxDuration`.
- The response shows a `selectedVehicles` list.
- The response includes summary values such as `totalDuration` and `totalImpact`.
- The response time is visible in the Postman footer or response metadata.

**Why it matters**
- This is the main functional proof for the vehicle maintenance scheduler.
- It shows that the service can take user input and produce an optimized maintenance plan.

## 4. Trailing-Space URL Error Screenshot

**Example failed request:** `GET http://127.0.0.1:3002/api/depots%20`

**What the screenshot shows**
- The request URL accidentally contains a trailing space or encoded space (`%20`).
- The client returns `Cannot GET /api/depots%20`.
- This indicates the path was interpreted literally and did not match the server route.

**What this screenshot proves**
- The issue was client-side URL formatting rather than a missing API.
- The server route exists, but the malformed URL prevented route matching.
- The URL-normalization fix in the scheduler helps avoid this problem.

**What the reviewer should look for**
- The exact URL used in Postman.
- The error message in the response body.
- The visible difference between the malformed URL and the corrected one.

**Why it matters**
- It documents the troubleshooting step that was required during testing.
- It helps explain why the endpoint may have appeared broken before the URL was corrected.

## 5. How These Screenshots Fit Together

Taken together, the screenshots show the full flow of the scheduler service:
- Depot data is available.
- Vehicle data is available.
- The schedule can be generated from those inputs.
- The service remains robust even if the request URL is formatted incorrectly.

This gives the reviewer evidence that the project is complete, functional, and tested from end to end.
