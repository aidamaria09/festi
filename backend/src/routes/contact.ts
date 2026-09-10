import { Router } from "express";
import { db } from "../db/index.js";

export const contactRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

contactRouter.post("/", (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (!name || !email || !message) {
    res.status(400).json({ error: "name, email and message are required" });
    return;
  }
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: "email is not valid" });
    return;
  }
  if (name.length > 60 || email.length > 120 || message.length > 1000) {
    res.status(400).json({ error: "one or more fields exceed the allowed length" });
    return;
  }

  db.prepare("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)").run(
    name,
    email,
    message
  );

  res.status(201).json({ success: true });
});
