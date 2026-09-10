import express from "express";
import cors from "cors";
import { festivalsRouter } from "./routes/festivals.js";
import { forumRouter } from "./routes/forum.js";
import { contactRouter } from "./routes/contact.js";
import { quizRouter } from "./routes/quiz.js";
import { travelRouter } from "./routes/travel.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/festivals", festivalsRouter);
  app.use("/api/forum", forumRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/quiz", quizRouter);
  app.use("/api/travel", travelRouter);

  app.use(errorHandler);

  return app;
}
