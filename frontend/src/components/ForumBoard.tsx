import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api/client";
import type { ForumMessage } from "../types";
import "./ForumBoard.css";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function ForumBoard() {
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getForumMessages()
      .then(setMessages)
      .catch(() => setError("Could not load forum messages."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setError(null);
    try {
      const created = await api.postForumMessage(name.trim(), message.trim());
      setMessages((current) => [created, ...current]);
      setName("");
      setMessage("");
    } catch {
      setError("Could not post your message. Please try again.");
    }
  }

  return (
    <div className="forum-container">
      <div className="messages">
        {loading && <p>Loading messages…</p>}
        {!loading && messages.length === 0 && <p>No messages yet — be the first to post!</p>}
        {messages.map((msg) => (
          <div className="message" key={msg.id}>
            <div className="avatar">{initials(msg.name)}</div>
            <div className="bubble">
              <div className="meta">
                {msg.name} &middot; {formatDate(msg.createdAt)}
              </div>
              <div>{msg.message}</div>
            </div>
          </div>
        ))}
      </div>

      <form className="input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          required
        />
        <textarea
          rows={3}
          placeholder="Your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          required
        />
        <button type="submit" className="btn btn-primary">
          📨 Post message
        </button>
        {error && <p className="forum-error">{error}</p>}
      </form>
    </div>
  );
}
