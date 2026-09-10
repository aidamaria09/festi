import { useState, type FormEvent } from "react";
import { api } from "../api/client";
import "./ContactForm.css";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [sentTo, setSentTo] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      await api.sendContactMessage(name, email, message);
      setSentTo(name);
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="contact-section">
      <h2>📬 Get in touch</h2>
      <p>Have questions, suggestions, or want to collaborate? Send us a message.</p>
      <form onSubmit={handleSubmit} className="contact-form">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <textarea
          placeholder="Your message..."
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "📨 Send"}
        </button>
        {status === "sent" && <p className="contact-status success">Thanks, {sentTo || "friend"}! Your message was sent.</p>}
        {status === "error" && <p className="contact-status error">Something went wrong. Please try again.</p>}
      </form>
    </section>
  );
}
