import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ContactForm } from "../components/ContactForm";
import { FestivalCard } from "../components/FestivalCard";
import { FestivalMap } from "../components/FestivalMap";
import { QuizWidget } from "../components/QuizWidget";
import { Testimonials } from "../components/Testimonials";
import { TriviaBox } from "../components/TriviaBox";
import type { Festival } from "../types";
import "./HomePage.css";

export function HomePage() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [featured, setFeatured] = useState<Festival[]>([]);
  const [allFestivals, setAllFestivals] = useState<Festival[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    Promise.all([api.getFeaturedFestivals(), api.getFestivals()])
      .then(([featuredList, all]) => {
        setFeatured(featuredList);
        setAllFestivals(all);
      })
      .catch(() => setLoadError(true));
  }, []);

  return (
    <>
      {!showQuiz && (
        <section className="hero">
          <div className="container">
            <h2>Discover the best festivals in Europe</h2>
            <p className="intro-desc">
              FESTI is your digital guide to discovering music festivals across Europe — matched to your taste.
            </p>
            <button className="btn btn-primary" onClick={() => setShowQuiz(true)}>
              Start the quiz
            </button>
            <small>Less than a minute to find out what suits you!</small>
          </div>
        </section>
      )}

      {showQuiz && (
        <div className="container quiz-wrap">
          <QuizWidget onClose={() => setShowQuiz(false)} />
        </div>
      )}

      <section className="top-festivals">
        <h3 className="section-title">Top festivals in Europe</h3>
        {loadError && <p className="load-error">Could not load festivals from the API. Is the backend running?</p>}
        <div className="festival-grid container">
          {featured.map((festival) => (
            <FestivalCard key={festival.id} festival={festival} />
          ))}
        </div>
      </section>

      <section className="map-testimonials container">
        <div className="map-column">
          <h2>Where do the festivals take place?</h2>
          <p>Explore the map to see where Europe's best-loved festivals happen. Click a marker to visit the official site.</p>
          <FestivalMap festivals={allFestivals} />
        </div>
        <Testimonials />
      </section>

      <TriviaBox />
      <ContactForm />
    </>
  );
}
