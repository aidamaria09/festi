import { testimonials } from "../data/content";
import "./Testimonials.css";

export function Testimonials() {
  return (
    <div className="testimonials">
      <h3>What festival-goers say</h3>
      {testimonials.map((quote) => (
        <blockquote key={quote}>&ldquo;{quote}&rdquo;</blockquote>
      ))}
    </div>
  );
}
