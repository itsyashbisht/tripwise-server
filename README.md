# tripsage-server

Backend REST API for **Tripsage**, an AI-powered travel planner.

This service handles authentication, destinations, hotels, restaurants, reviews, itinerary creation, and AI-assisted trip planning.

## Features

- JWT auth with access and refresh tokens
- CRUD support for travel entities (destinations, hotels, restaurants, itineraries, reviews)
- AI-generated itinerary workflows
- Shareable trip links
- Cloudinary integration for media handling
- Email utility support for notification/verification flows

## Tech Stack

- Node.js (ESM)
- Express
- MongoDB + Mongoose
- Groq SDK (AI generation)
- Cloudinary
- Nodemailer

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)

### Install

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=8000
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>

ACCESS_TOKEN_SECRET=replace_me
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=replace_me
REFRESH_TOKEN_EXPIRY=7d

GROQ_API_KEY=replace_me

CLOUDINARY_CLOUD_NAME=replace_me
CLOUDINARY_API_KEY=replace_me
CLOUDINARY_API_SECRET=replace_me

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=replace_me
SMTP_PASS=replace_me
```

Notes:
- The database connection currently appends `/tripSage` in code when connecting.
- `FRONTEND_URL` is used when building share links and email URLs.

### Run

```bash
npm run dev
```

Production:

```bash
npm start
```

## Scripts

- `npm run dev` - Start dev server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed data using `scripts/seed.js`
- `npm run build` - Placeholder build script

## API Base URL

`http://localhost:8000/api/v1`

## Route Groups

- `/auth`
- `/users`
- `/destinations`
- `/hotels`
- `/restaurants`
- `/itineraries`
- `/generate`
- `/reviews`

Protected endpoints require:

`Authorization: Bearer <access_token>`

## Project Structure

```text
src/
  app.js            # Express app + middleware + routes
  index.js          # Server bootstrap
  configs/          # External service config (Cloudinary, etc.)
  controllers/      # Route handlers
  db/               # MongoDB connection
  middlewares/      # Auth and common middleware
  models/           # Mongoose models
  routes/           # API route modules
  services/         # AI/email and other services
  utils/            # Shared helpers
scripts/
  seed.js           # Seed script
```

## Status

This README now reflects the current **tripsage** backend setup. If you want, I can also add endpoint-level API docs (request/response examples) in a follow-up.
