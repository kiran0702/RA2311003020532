# Notification System Design

## Overview

The notification backend is organized as a modular Express application with separate controllers, routes, services, and models. The live notification feed is fetched from the protected evaluation API instead of being stored locally.

## Core Components

- `controllers` handle HTTP request and response flow.
- `routes` map endpoints to controllers.
- `services` contain notification business logic and orchestration.
- `models` maintain minimal in-memory state for local create/update operations.

## Security

All application APIs are protected with Bearer token authentication.

## Logging

The notification service can reuse the logging middleware utility to send structured logs to the logging service.

## Stage 1

The notification API surface is exposed through predictable REST endpoints for notification operations. The current implementation exposes a protected `GET /api/notifications` endpoint that proxies the external notification feed and returns a JSON payload shaped as `{ notifications: [...] }`.

## Stage 2

Notifications can be represented with a relational table or a document collection if persistence is needed later. A practical schema would include `id`, `studentId`, `type`, `message`, `isRead`, and `createdAt`, with indexes on `studentId`, `isRead`, and `createdAt`.

## Stage 3

The unread notification query should not rely on a blanket table scan when the dataset grows. A composite index on `(studentId, isRead, createdAt DESC)` is the likely fix because the query filters by `studentId`, filters on unread rows, and sorts by recency. Indexing every column is not the right default because write cost and storage overhead increase without matching the filter pattern.

## Stage 4

Fetching notifications on every page load can overwhelm the database or upstream API at scale. A better approach is to cache recent notification windows, use pagination, and add server-side filtering so only the active slice is retrieved for the current view.

## Stage 5

Bulk delivery should be redesigned as an asynchronous workflow rather than a single loop that sends email, writes to the database, and pushes in-app updates inline. A queue-based worker model is more reliable: persist the notification job first, enqueue delivery tasks, retry failed sends, and process email and in-app delivery independently so one failure does not block the rest.

## Stage 6

The priority inbox should rank unread notifications by a mix of weight, recency, and type. The current codebase can support this later by fetching the external notification feed, scoring items in-memory, and returning the top slice without storing the data locally.
