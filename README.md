# Student Internship Portal

A full-stack MERN application for browsing internship opportunities, viewing role details, and submitting student applications. The frontend uses React, Vite, and React Router; the REST API uses Node.js, Express, and Mongoose.

## Run locally

1. Install Node.js 20 or newer and have a MongoDB instance available.
2. Copy `.env.example` to `.env` and set `MONGO_DB_URI` to your own MongoDB connection string. Keep `.env` private.
3. Install dependencies with `npm run setup`.
4. Start the API and frontend with `npm run dev`.
5. Open `http://localhost:5173`.

The Vite development server proxies `/api` requests to `http://127.0.0.1:5000`. The API listens on `PORT` (5000 by default) and binds to `0.0.0.0`.

## API

- `GET /api/health` — health response (available after the API connects to MongoDB).
- `GET /api/internships` — list internships; accepts optional `search` and `category` query parameters.
- `GET /api/internships/:id` — internship details.
- `POST /api/applications` — create an application. Required JSON fields: `studentName`, `email`, `rollNumber`, and `internshipId`.

The internship catalogue is seeded in the API route source. Applications are validated and stored in MongoDB.

## GitHub Pages deployment

GitHub Pages hosts the Vite frontend only; it does not run Express or MongoDB. The `Deploy Student Internship Portal` workflow builds the frontend for `/student-internship-portal/`, publishes `client/dist`, and includes a `404.html` SPA fallback for refreshed nested routes. It runs for pushes to `rollno_v1` and `main`, and can also be started manually.

Before the workflow can build a production frontend, add a GitHub repository variable named `VITE_API_URL` with the verified public API base URL, ending in `/api` (for example, `https://your-service.example/api`). The deployed API must allow browser requests from `https://dinakardinakar165-debug.github.io`.

## Docker

Build from the repository root and provide `MONGO_DB_URI` and (optionally) `PORT` through the container environment. The image builds and serves the frontend from Express in production mode.

```sh
docker build -t student-internship-portal .
docker run --rm -p 5000:5000 -e PORT=5000 -e MONGO_DB_URI='mongodb://host.docker.internal:27017/student-internship-portal' student-internship-portal
```

Never commit `.env` files or put credentials in `VITE_*` variables; Vite embeds those values in public browser assets.
