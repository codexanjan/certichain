import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "./config";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { socketManager } from "./sockets/socket.manager";

export function createApp() {
  const app = express();
  const server = http.createServer(app);

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  const allowedOrigins = config.CORS_ORIGINS.split(",").map((s) => s.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost")) {
          callback(null, true);
        } else {
          callback(new Error(`CORS origin ${origin} not allowed`));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  // Body Parsing & Cookies
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // Mount API Router
  app.use("/api/v1", routes);

  // 404 Route Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: "ROUTE_NOT_FOUND",
        message: `Endpoint ${req.method} ${req.path} not found on this server`,
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  // Initialize Socket.IO
  socketManager.initialize(server);

  return { app, server };
}
