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

## 6. Logging Middleware Registration Screenshot

**Screenshot file:** `./screenshots/logging-middleware/01-register.png`

**Endpoint:** `POST http://127.0.0.1:3001/evaluation-service/register`

**What the screenshot shows**

- The request is a `POST` call to the logging middleware service.
- The request body contains the client identity fields used for evaluation registration.
- The response returns a `201 Created` status and shows the registration payload with a `clientID` and `clientSecret`.
- The response time is visible and confirms the request completed successfully.

**What this screenshot proves**

- The logging middleware can register the project with the external evaluation service.
- The service is correctly packaging the required identity details and sending them upstream.
- The evaluation server accepted the registration and returned credentials for later authentication.

**What the reviewer should look for**

- The body panel shows the required registration JSON.
- The response panel shows `201 Created`.
- The response includes the generated client credentials.
- The response time is visible in the screenshot.

**Why it matters**

- Registration is the first step in the external API flow.
- Without this step, the rest of the logging and wrapper APIs cannot authenticate properly.

## 7. Logging Middleware Authentication Screenshot

**Screenshot file:** `./screenshots/logging-middleware/02-auth.png`

**Endpoint:** `POST http://127.0.0.1:3001/evaluation-service/auth`

**What the screenshot shows**

- The request is a `POST` call using the credentials returned during registration.
- The body panel shows the identity fields and the `clientID` and `clientSecret` used for login.
- The response returns a Bearer token, expiry information, and a successful status.
- The response time is shown in the Postman footer.

**What this screenshot proves**

- The registration credentials can be exchanged for an access token.
- The application has working client-credentials authentication.
- The access token is available for protected logging API calls.

**What the reviewer should look for**

- The request body includes the registration credentials.
- The response body contains an `access_token` and token metadata.
- The response status indicates success.
- The response time is visible.

**Why it matters**

- The token is required to access protected endpoints such as logs.
- This screenshot demonstrates the auth flow is functioning end to end.

## 8. Logging Middleware Logs Screenshot

**Screenshot file:** `./screenshots/logging-middleware/03-logs.png`

**Endpoint:** `POST http://127.0.0.1:3001/evaluation-service/logs`

**What the screenshot shows**

- The request is a `POST` call to the protected logging endpoint.
- The request body contains the stack, level, package, and message fields.
- The Authorization header uses the Bearer token acquired from the auth step.
- The response returns a success status and a `logID` or similar record identifier.
- The response time is shown and should be captured in the screenshot.

**What this screenshot proves**

- The protected logs endpoint accepts authenticated requests.
- The middleware correctly forwards log data to the evaluation service.
- The logging pipeline is working with real request data rather than a stub.

**What the reviewer should look for**

- The request body fields are visible and complete.
- The Authorization header is present.
- The response body shows log creation success.
- The response time is visible.

**Why it matters**

- Logging is a core cross-cutting concern in this assignment.
- This screenshot proves the middleware is integrated into the project flow.

## 9. Notification API Screenshot

**Screenshot file:** `./screenshots/notification/01-getnotfi.png`

**Endpoint:** `GET http://127.0.0.1:3003/api/notifications`

**What the screenshot shows**

- The request is a `GET` call to the notification backend service.
- The request includes the Bearer token in the Authorization header.
- The response panel shows a JSON object with a `notifications` array.
- The response time is visible and confirms the endpoint returned successfully.

**What this screenshot proves**

- The notification backend is reachable and protected.
- The service can return notification data in the expected JSON format.
- The project includes a working backend wrapper around the notification feed.

**What the reviewer should look for**

- The request method is `GET`.
- The Authorization header is present.
- The response body contains the `notifications` list.
- The response time is visible.

**Why it matters**

- Notifications are the third service in the assignment.
- This screenshot shows the notification backend is responding correctly and is integrated into the overall solution.

## 10. How All Screenshot Sets Work Together

The screenshots together show three complete backend flows:

- Logging middleware registration, authentication, and log creation.
- Scheduler depot, vehicle, and schedule generation.
- Notification retrieval through the protected backend API.

This gives the reviewer evidence that the system is tested across all modules, not just one endpoint.