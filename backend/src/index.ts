import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import jwt from "jsonwebtoken";
import connectDB from "./config/db";
import { initIO } from "./socket";

// Routes
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import hireRequestRoutes from "./routes/hireRequestRoutes";
import adminRoutes from "./routes/adminRoutes";
import messageRoutes from "./routes/messageRoutes";
import taskRoutes from "./routes/taskRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import workUpdateRoutes from "./routes/workUpdateRoutes";
import escrowRoutes from "./routes/escrowRoutes";

// Required environment variables validation
const REQUIRED_ENV_VARS = ["MONGODB_URI", "JWT_SECRET"];
const missingEnvVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// ── Socket.IO setup ───────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "https://winkget-job.vercel.app",
].filter(Boolean) as string[];

export const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
  transports: ["websocket", "polling"],
});

// Register the singleton so controllers can use getIO()
initIO(io);

// JWT auth middleware for Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) return next(new Error("Unauthorized"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    socket.data.userId = decoded.id;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;
  socket.join(`user:${userId}`);
  console.log(`[Socket.IO] user:${userId} connected (${socket.id})`);

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] user:${userId} disconnected`);
  });
});

// ── Express setup ─────────────────────────────────────────────────────────────
connectDB();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Middleware to intercept JSON responses, log error objects to server console, and strip them from clients in production
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body: any) {
    if (body && typeof body === "object" && "error" in body) {
      if (body.error) {
        console.error(`[API Error] ${req.method} ${req.url}:`, body.error);
      }
      if (process.env.NODE_ENV === "production") {
        delete body.error;
      }
    }
    return originalJson.call(this, body);
  };
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/hire-requests", hireRequestRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/work-updates", workUpdateRoutes);
app.use("/api/v1/escrow", escrowRoutes);

import contactRoutes from "./routes/contactRoutes";
app.use("/api/v1/contact", contactRoutes);

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack || err);
  const response: Record<string, unknown> = { success: false, message: "Internal server error" };
  if (process.env.NODE_ENV !== "production") {
    response.error = err.message || String(err);
    response.stack = err.stack;
  }
  res.status(500).json(response);
});

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`Socket.IO attached`);
});

export default app;
