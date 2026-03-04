<div align="center">

# 🧭 TripSage — Backend API

**REST API powering AI-driven India travel planning**

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-F55036?style=flat-square)](https://console.groq.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

[API Reference](#-api-reference) · [Quick Start](#-quick-start) · [Environment Variables](#-environment-variables) · [Architecture](#-architecture) · [Deployment](#-deployment)

</div>

---

## 📖 Overview

TripSage's backend is a **Node.js / Express REST API** backed by **MongoDB** and driven by two AI providers:

| Provider | Used for |
|---|---|
| **Groq** (LLaMA 3.3 70B) | Destination search, hotel generation, restaurant generation, Full day-by-day itinerary generation  |

The server handles authentication, all CRUD operations across 8 resource types, AI generation with rate limiting, transactional email via Nodemailer, and real-time share-link generation.

---

## ✨ Features

- 🔐 **JWT Authentication** — HTTP-only cookie + Bearer token, bcrypt password hashing
- 🤖 **Dual AI Integration** — Groq for fast data generation, and for deep itinerary planning
- 📧 **Transactional Email** — Nodemailer welcome emails on registration (Gmail / Resend / Brevo)
- 🛡️ **Security** — Helmet headers, CORS, global + per-route rate limiting
- 🗄️ **MongoDB / Mongoose** — Full schema validation, indexes, and lean queries
- 🌱 **Database Seeding** — One-command seed for 40+ curated India destinations
- 🩺 **Health endpoint** — `/api/health` for uptime monitors
- 📝 **Request logging** — Morgan dev logger in development

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18.x (22.x recommended) |
| npm | ≥ 9.x |
| MongoDB | Local 7.x **or** MongoDB Atlas (free tier works) |

### 1 — Clone & install

```bash
git clone https://github.com/your-username/tripsage-backend.git
cd tripsage-backend
npm install
```

### 2 — Configure environment

```bash
cp .env.example .env
```

Edit `.env` — at minimum you need `MONGO_URI`, `JWT_SECRET`, and one AI key. See the full [Environment Variables](#-environment-variables) table below.

### 3 — Seed the database *(optional but recommended)*

```bash
npm run seed
```

This populates MongoDB with 40+ curated Indian destinations, sample hotels, restaurants and attractions so the app works out of the box.

### 4 — Start the development server

```bash
npm run dev
```

The API will be available at **`http://localhost:5000`**.

```
🚀  TripSage API running → http://localhost:5000
📊  Environment: development
🌐  Frontend:    http://localhost:5173
🩺  Health:      http://localhost:5000/api/health
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in each value.

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | ✅ | `development` | `development` or `production` |
| `PORT` | ✅ | `5000` | HTTP server port |
| `MONGO_URI` | ✅ | — | MongoDB connection string |
| `JWT_SECRET` | ✅ | — | Long random string for signing tokens |
| `JWT_EXPIRES_IN` | — | `7d` | Token expiry (e.g. `7d`, `24h`) |
| `GROQ_API_KEY` | ✅ | — | Get free at [console.groq.com](https://console.groq.com/keys) |
| `ANTHROPIC_API_KEY` | ✅ | — | Get at [console.anthropic.com](https://console.anthropic.com) |
| `FRONTEND_URL` | ✅ | `http://localhost:5173` | Allowed CORS origin |
| `COOKIE_SECRET` | ✅ | — | Secret for signing cookies |
| `SMTP_HOST` | — | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | — | `587` | SMTP port (587 = STARTTLS) |
| `SMTP_SECURE` | — | `false` | `true` for port 465 (SSL) |
| `SMTP_USER` | — | — | Your email address |
| `SMTP_PASS` | — | — | App Password (Gmail) or API key (Resend) |

> **Email is optional.** If `SMTP_USER` / `SMTP_PASS` are not set, emails are silently skipped — registration still works normally.

### Generating secrets

```bash
# JWT_SECRET — generate a strong random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# COOKIE_SECRET — same method
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📁 Project Structure

```
src/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # register / login / logout / me
│   ├── destinationController.js
│   ├── hotelController.js
│   ├── restaurantController.js
│   ├── itineraryController.js
│   ├── generateController.js  # AI generation entrypoint
│   ├── reviewController.js
│   └── userController.js
├── middleware/
│   ├── auth.js                # requireAuth / optionalAuth guards
│   └── errorHandler.js        # global error handler
├── models/
│   ├── User.js
│   ├── Destination.js
│   ├── Hotel.js
│   ├── Restaurant.js
│   ├── Attraction.js
│   ├── Itinerary.js
│   ├── Review.js
│   ├── SavedPlan.js
│   └── Share.js
├── routes/
│   ├── auth.js
│   ├── destinations.js
│   ├── hotels.js
│   ├── restaurants.js
│   ├── itineraries.js
│   ├── generate.js
│   ├── users.js
│   └── reviews.js
├── services/
│   ├── groqService.js         # Groq LLaMA — hotels, restaurants, destination search
│   ├── aiService.js           # Anthropic Claude — itinerary generation
│   ├── emailService.js        # Nodemailer transactional emails
│   └── promptService.js       # Prompt templates
├── utils/
│   └── jwt.js                 # Token sign / verify helpers
├── seed/
│   └── seed.js                # Database seeder
└── index.js                   # App entry point
```

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Authenticated routes require either:
- `Authorization: Bearer <token>` header, **or**
- `token` HTTP-only cookie (set automatically on login)

### Auth — `/api/auth`

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | — | `{ name, email, password }` | Create account + sends welcome email |
| `POST` | `/auth/login` | — | `{ email, password }` | Login, sets cookie + returns token |
| `POST` | `/auth/logout` | — | — | Clears auth cookie |
| `GET` | `/auth/me` | ✅ Required | — | Get current user profile |

**Register response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Arjun Sharma",
    "email": "arjun@example.com",
    "role": "user",
    "createdAt": "2026-03-01T10:00:00Z"
  },
  "message": "User created successfully."
}
```

---

### Destinations — `/api/destinations`

| Method | Endpoint | Auth | Query / Body | Description |
|---|---|---|---|---|
| `GET` | `/destinations` | — | `?category=&search=&limit=&offset=` | List all destinations |
| `POST` | `/destinations/search` | — | `{ query: "beach trip in winter" }` | **Groq AI natural-language search** |
| `GET` | `/destinations/:slug` | — | — | Single destination + hotels, restaurants, attractions |
| `GET` | `/destinations/:slug/hotels` | — | `?tier=economy\|standard\|luxury` | Hotels for a destination (Groq-generated if empty) |
| `GET` | `/destinations/:slug/restaurants` | — | `?isVeg=true&priceRange=budget` | Restaurants (Groq-generated if empty) |
| `GET` | `/destinations/:slug/attractions` | — | `?category=` | Attractions list |

**AI Search example:**
```bash
curl -X POST http://localhost:5000/api/destinations/search \
  -H "Content-Type: application/json" \
  -d '{ "query": "hill station weekend trip from Delhi" }'
```

```json
{
  "destinations": [
    {
      "_id": "ai_1709123456_0",
      "name": "Shimla",
      "state": "Himachal Pradesh",
      "category": "Hills",
      "description": "The colonial summer capital...",
      "bestSeason": "Mar–Jun & Dec–Jan",
      "avgDurationDays": 3,
      "minPrice": 2500,
      "highlights": ["The Mall", "Jakhu Temple", "Kufri", "Christ Church"],
      "heroImageUrl": "https://images.unsplash.com/...",
      "isAiGenerated": true
    }
  ],
  "query": "hill station weekend trip from Delhi",
  "total": 6
}
```

---

### Hotels — `/api/hotels`

| Method | Endpoint | Auth | Query | Description |
|---|---|---|---|---|
| `GET` | `/hotels` | — | `?destinationId=&tier=&minPrice=&maxPrice=` | List hotels |
| `GET` | `/hotels/:hotelId` | — | — | Single hotel detail |

---

### Restaurants — `/api/restaurants`

| Method | Endpoint | Auth | Query | Description |
|---|---|---|---|---|
| `GET` | `/restaurants` | — | `?destinationId=&isVeg=&priceRange=` | List restaurants |
| `GET` | `/restaurants/:restaurantId` | — | — | Single restaurant detail |

---

### Generate (AI) — `/api/generate`

> ⚠️ Rate limited to **5 requests / minute** per IP. Each AI call uses Claude.

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| `POST` | `/generate` | Optional | See below | Generate full AI itinerary |
| `GET` | `/generate/packages` | — | `?days=&adults=&children=&dailyBudget=` | Instant price packages (no AI) |

**Generate body:**
```json
{
  "destination": "Jaipur, Rajasthan",
  "originCity": "Delhi",
  "days": 4,
  "adults": 2,
  "children": 0,
  "budget": "standard",
  "tripStyle": ["Heritage", "Food"],
  "accommodation": "hotel"
}
```

---

### Itineraries — `/api/itineraries`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/itineraries` | ✅ Required | List user's own itineraries |
| `GET` | `/itineraries/user/saved` | ✅ Required | List saved (bookmarked) itineraries |
| `GET` | `/itineraries/shared/:token` | — | Public share link lookup |
| `GET` | `/itineraries/:id` | Optional | Get single itinerary |
| `DELETE` | `/itineraries/:id` | ✅ Required | Delete an itinerary |
| `POST` | `/itineraries/:id/save` | ✅ Required | Bookmark an itinerary |
| `DELETE` | `/itineraries/:id/save` | ✅ Required | Remove bookmark |
| `POST` | `/itineraries/:id/share` | Optional | Generate shareable link |

---

### Users — `/api/users/me`

> All user routes require authentication.

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `GET` | `/users/me` | — | Get full profile |
| `PATCH` | `/users/me` | `{ name, username }` | Update profile details |
| `PATCH` | `/users/me/password` | `{ currentPassword, newPassword }` | Change password |
| `GET` | `/users/me/saved` | — | Get saved plans |
| `DELETE` | `/users/me/saved/:itineraryId` | — | Remove a saved plan |

---

### Reviews — `/api/reviews`

| Method | Endpoint | Auth | Body / Query | Description |
|---|---|---|---|---|
| `GET` | `/reviews` | — | `?destinationId=` | List reviews for a destination |
| `POST` | `/reviews` | ✅ Required | `{ destinationId, rating, comment, tripDate }` | Add review |
| `DELETE` | `/reviews/:id` | ✅ Required | — | Delete own review |

---

### Health Check

```bash
GET /api/health
```

```json
{
  "status": "ok",
  "timestamp": "2026-03-01T10:00:00.000Z",
  "service": "tripsage-api",
  "env": "production"
}
```

---

## 🤖 AI Services

### Groq — Fast Generation

Used for **destination search**, **hotel generation**, and **restaurant generation**. Falls back to generating and caching data in MongoDB when a collection is empty for a given destination.

```
Model:       llama-3.3-70b-versatile
Temperature: 0.4  (low for factual structured data)
Max tokens:  1 400 (search) / 2 048 (hotels, restaurants)
```

### Anthropic Claude — Itinerary Generation

Used for **full itinerary planning**. Each call generates a complete multi-day trip with day-by-day activities, hotel recommendations, food suggestions, budgets and travel tips.

```
Model:       claude-sonnet-4-5-20251001 (or latest)
Max tokens:  4 096
```

### Rate Limiting Strategy

| Endpoint | Limit | Window |
|---|---|---|
| All routes (global) | 300 req | 15 min |
| `POST /generate` | 5 req | 1 min |

---

## 📧 Email Service

Transactional emails are sent via Nodemailer. The service is **fire-and-forget** — email failures are logged but never crash a request.

**Currently implemented:**
- ✅ Welcome email on registration

**Supported providers:**

| Provider | Free tier | Setup |
|---|---|---|
| **Gmail** | ~500/day | 2FA → App Password |
| **Resend** | 3 000/month | Swap `SMTP_HOST=smtp.resend.com` |
| **Brevo** | 300/day | Swap SMTP creds |
| **SendGrid** | 100/day | Swap SMTP creds |

To disable emails entirely, leave `SMTP_USER` and `SMTP_PASS` blank in `.env`.

---

## 🗄️ Database

### Models

| Model | Key fields |
|---|---|
| `User` | name, email, passwordHash, role, savedPlans |
| `Destination` | name, slug, state, category, heroImageUrl, pricing[], isActive |
| `Hotel` | destination (ref), name, tier, starRating, pricePerNight, amenities[] |
| `Restaurant` | destination (ref), name, cuisine[], priceRange, isVeg, rating |
| `Attraction` | destination (ref), name, category, entryFee, visitDurationMins |
| `Itinerary` | user (ref), destination (ref), days[], budget, generatedBy, shareToken |
| `Review` | user (ref), destination (ref), rating, comment, tripDate |
| `SavedPlan` | user (ref), itinerary (ref), note |
| `Share` | itinerary (ref), token (unique), viewCount |

### Seeding

```bash
npm run seed
```

Populates 40+ destinations with hotels, restaurants and attractions. Safe to re-run — uses upsert logic.

---

## 🚢 Deployment

### Option A — Railway / Render (easiest)

1. Push your code to GitHub
2. Connect repository in Railway or Render dashboard
3. Set all environment variables in the dashboard
4. Deploy — both platforms auto-detect Node.js

### Option B — VPS (DigitalOcean / Hetzner)

```bash
# On your server
git clone https://github.com/your-username/tripsage-backend.git
cd tripsage-backend
npm install --production

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start src/index.js --name tripsage-api
pm2 save
pm2 startup

# Nginx reverse proxy (port 80 → 5000)
# Add to /etc/nginx/sites-available/tripsage:
# location /api { proxy_pass http://localhost:5000; }
```

### Option C — Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 5000
CMD ["node", "src/index.js"]
```

```bash
docker build -t tripsage-api .
docker run -p 5000:5000 --env-file .env tripsage-api
```

### Production checklist

- [ ] `NODE_ENV=production` is set
- [ ] `JWT_SECRET` is a strong random string (64+ chars)
- [ ] `COOKIE_SECRET` is set
- [ ] `FRONTEND_URL` is your real domain
- [ ] MongoDB Atlas cluster is used (not localhost)
- [ ] Rate limits are tuned for expected traffic
- [ ] HTTPS is enforced at the reverse proxy level
- [ ] `SMTP_USER` / `SMTP_PASS` are configured
- [ ] Health check endpoint is monitored (`/api/health`)

---

## 🛠️ Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (nodemon) |
| `npm run start` | Start production server |
| `npm run seed` | Seed the database with destinations and sample data |

---

## 🔒 Security Notes

- Passwords are hashed with **bcryptjs** (10 salt rounds) — plaintext passwords are never stored
- JWT tokens are signed with `HS256` — rotate `JWT_SECRET` to invalidate all existing sessions
- HTTP-only cookies prevent XSS token theft
- Helmet sets secure response headers on all routes
- CORS is restricted to `FRONTEND_URL` only
- The `SMTP_PASS` in `.env` must be a **Gmail App Password**, not your account password

---

## 📄 License

MIT © 2026 TripSage
