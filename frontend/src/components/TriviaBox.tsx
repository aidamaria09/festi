import { useState } from "react";
import { triviaFacts } from "../data/content";
import "./TriviaBox.css";

function randomFact(exclude?: string): string {
  if (triviaFacts.length <= 1) return triviaFacts[0];
  let fact = triviaFacts[Math.floor(Math.random() * triviaFacts.length)];
  while (fact === exclude) {
    fact = triviaFacts[Math.floor(Math.random() * triviaFacts.length)];
  }
  return fact;
}

export function TriviaBox() {
  const [fact, setFact] = useState(() => randomFact());

  return (
    <section className="trivia-section">
      <h3>🧠 Did you know…?</h3>
      <p className="trivia-fact">{fact}</p>
      <button className="btn btn-primary" onClick={() => setFact((current) => randomFact(current))}>
        🔄 Tell me another
      </button>
    </section>
  );
}
