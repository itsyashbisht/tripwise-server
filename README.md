# tripwise-server

A backend REST API for the TripWise travel planning application. The server is built with Node.js, Express, and MongoDB and provides endpoints for user authentication, destination management, itinerary generation, hotels, restaurants, reviews, and saved plans.

## ⚙️ Features

- JWT-based user authentication (signup/login)
- CRUD operations for destinations, hotels, restaurants, and itineraries
- Automated itinerary generation using GPT-powered services
- Review system with ratings for attractions and services
- Saving and retrieving personalized travel plans
- Middleware for error handling and authentication

## 🛠️ Tech Stack

- Node.js & Express
- MongoDB & Mongoose
- Cloudinary for media uploads
- OpenAI / GPT integration for itinerary generation

## 🚀 Getting Started

### Prerequisites

- Node.js (>=14)
- MongoDB instance (local or Atlas)

### Installation

```bash
git clone https://github.com/yourusername/tripwise-server.git
cd tripwise-server
npm install
```

### Configuration

Copy `.env.example` to `.env` and fill in the required values:

```
PORT=5000
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
OPENAI_API_KEY=<key>
```

### Running the server

```bash
npm run dev      # starts nodemon for development
npm start         # production mode
```

## 📁 Project Structure

```
src/
  app.js             - Express app setup
  index.js           - Server entry point
  configs/           - Configuration helpers
  controllers/       - Request handlers
  db/                - MongoDB connection
  middlewares/       - Custom middleware
  models/            - Mongoose schemas
  routes/            - Express routers
  services/          - Business logic & external APIs
  utils/             - Utility helpers
```

## 🧩 API Overview

See the route files under `src/routes` for available endpoints. Some key routes include:

- `POST /api/v1/auth/signup` & `/login`
- `GET/POST/PUT/DELETE /api/v1/destinations`
- `POST /api/v1/generate` - generate itineraries
- `GET/POST /api/v1/hotels`, `/restaurants`, `/reviews`
- Protected routes require an `Authorization: Bearer <token>` header.

Detailed API documentation is a work in progress.

## 📝 Scripts

- `npm run dev` - start development server
- `npm start` - start production server
- `npm run seed` - seed database with sample data (see `scripts/seed.js`)

## 🤝 Contributing

Contributions are welcome! Please open issues or pull requests.

## 📄 License

This project is licensed under the MIT License.
