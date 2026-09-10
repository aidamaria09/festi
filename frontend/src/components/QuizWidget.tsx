import { useState } from "react";
import { api } from "../api/client";
import { genreOptions, sizeOptions, vibeOptions } from "../data/content";
import type { Festival } from "../types";
import { FestivalCard } from "./FestivalCard";
import "./QuizWidget.css";

type Step = "genre" | "vibe" | "size" | "result";

interface Answers {
  genre?: string;
  vibe?: string;
  size?: string;
}

const STEP_ORDER: Step[] = ["genre", "vibe", "size", "result"];

const STEP_CONFIG: Record<Exclude<Step, "result">, { question: string; options: readonly string[] }> = {
  genre: { question: "What music genre do you prefer?", options: genreOptions },
  vibe: { question: "What vibe are you after?", options: vibeOptions },
  size: { question: "How big should the festival be?", options: sizeOptions },
};

export function QuizWidget({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("genre");
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function selectOption(key: Exclude<Step, "result">, value: string) {
    const nextAnswers = { ...answers, [key]: value };
    setAnswers(nextAnswers);

    const nextIndex = STEP_ORDER.indexOf(step) + 1;
    const nextStep = STEP_ORDER[nextIndex];

    if (nextStep !== "result") {
      setStep(nextStep);
      return;
    }

    setStep("result");
    setLoading(true);
    setError(null);
    try {
      const { match } = await api.matchQuiz({
        genre: nextAnswers.genre!,
        vibe: nextAnswers.vibe!,
        size: nextAnswers.size!,
      });
      setResult(match);
    } catch {
      setError("Could not reach the recommendation service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAnswers({});
    setResult(null);
    setError(null);
    setStep("genre");
  }

  return (
    <section className="quiz-section">
      <div className="quiz-container">
        {step !== "result" && (
          <div>
            <h2 className="quiz-question">{STEP_CONFIG[step].question}</h2>
            <div className="quiz-options">
              {STEP_CONFIG[step].options.map((option) => (
                <button key={option} className="btn btn-primary" onClick={() => selectOption(step, option)}>
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="quiz-result">
            <h2 className="quiz-question">🎉 Recommended festival</h2>
            {loading && <p>Finding your perfect match…</p>}
            {error && <p className="quiz-error">{error}</p>}
            {result && <FestivalCard festival={result} />}
            <div className="quiz-result-actions">
              <button className="btn btn-outline" onClick={reset}>
                🔄 Retake the quiz
              </button>
              <button className="btn btn-outline" onClick={onClose}>
                Back to start
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
