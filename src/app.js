import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

// IMPORTS.
import userRoutes from "./routes/user.routes.js";
import destinationRoutes from "./routes/destination.routes.js";
import hotelRoutes from "./routes/hotel.routes.js";
import restaurantRoutes from "./routes/resturant.routes.js";
import itineraryRoutes from "./routes/itinearary.routes.js";
import generateRoutes from "./routes/generateplan.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import authRoutes from "./routes/auth.routes.js";

// EXPRESS APP.
const app = express();

// CONFIG.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// ROUTES.
//eg. http://localhost:8000/api/v1/auth
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/destinations", destinationRoutes);
app.use("/api/v1/hotels", hotelRoutes);
app.use("/api/v1/restaurants", restaurantRoutes);
app.use("/api/v1/itineraries", itineraryRoutes);
app.use("/api/v1/generate", generateRoutes);
app.use("/api/v1/reviews", reviewRoutes);

export { app };
