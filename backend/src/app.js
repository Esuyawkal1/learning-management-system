
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import routes from "./routes/index.js";
import paymentRoutes from "./routes/payment.routes.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { notFound } from "./middlewares/notFound.middleware.js";

const app = express();

/**
 *  CORS CONFIGURATION
 * Allows frontend to send cookies (authentication)
 */
app.use(
  cors({
    origin: 'https://frontend-deploy-hp0lvs92o-esuyawkal.vercel.app',
    credentials: true,
  })
);

/**
 * MIDDLEWARE 
 */

// Parse JSON request body
app.use(express.json());

// Parse cookies (REQUIRED for authentication)
app.use(cookieParser());

// Serve uploaded lesson assets through a public URL.
app.use("/uploads", express.static(path.resolve("uploads")));
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Backend is running successfully!"
  });
})

/**
 * API ROUTES 
 */

app.use("/api/payment", paymentRoutes);
app.use("/api/v1", routes);

/**
 *  ERROR HANDLING 
 */

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
