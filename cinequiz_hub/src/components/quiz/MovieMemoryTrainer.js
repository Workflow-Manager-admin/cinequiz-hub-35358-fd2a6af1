import React, { useEffect, useState } from "react";
import "../../components/QuizBase.css";
import { getRandomMovie, fetchMovieDetails } from "../../tmdbService";

// PUBLIC_INTERFACE
/**
 * Movie Memory Trainer – see a movie image briefly, then recall details.
 */
export default function MovieMemoryTrainer({ industry }) {
  const [stage, setStage] = useState("show-image"); // show-image | recall | score-summary
  const [current, setCurrent] = useState(1);
  const totalQuiz = 6; // test, usually 18
  const [score, setScore] = useState(0);
  const [movie, setMovie] = useState(null);
  const [details, setDetails] = useState(null);
  const [answers, setAnswers] = useState({ director: "", year: "", genre: "" });
  const [feedback, setFeedback] = useState({ director: "", year: "", genre: "" });

  // Helper: get a movie with a poster
  const fetchQuizMovie = async () => {
    let mov = null, det = null;
    for (let i = 0; i < 5; ++i) {
      mov = await getRandomMovie(industry);
      det = await fetchMovieDetails(mov.id, industry === "kollywood" ? "ta-IN" : "en-US");
      if (mov.poster_path && det) break;
    }
    setMovie(mov);
    setDetails(det);
  };

  useEffect(() => {
    fetchQuizMovie();
    setStage("show-image");
    setAnswers({ director: "", year: "", genre: "" });
    setFeedback({ director: "", year: "", genre: "" });
    // eslint-disable-next-line
  }, [current, industry]);

  // After 6 seconds, hide image and show recall
  useEffect(() => {
    if (stage === "show-image") {
      const t = setTimeout(() => setStage("recall"), 3000);
      return () => clearTimeout(t);
    }
  }, [stage]);

  // Regular expression for Tamil script detection
  const isTamilScript = (text) =>
    /[஀-௿]/.test(text);

  const handleInput = (e) => {
    setAnswers((a) => ({ ...a, [e.target.name]: e.target.value }));
  };

  const checkAnswers = () => {
    // Validate all fields for Tamil script
    if (
      isTamilScript(answers.director) ||
      isTamilScript(answers.year) ||
      isTamilScript(answers.genre)
    ) {
      setFeedback({
        director: "",
        year: "",
        genre: ""
      });
      setStage("recall");
      alert(
        "All answers must be in English (romanized). Do not use Tamil script for any field."
      );
      return;
    }
    let fdbk = {};
    let sc = 0;
    // Director
    const director = details && details.credits
      ? (details.credits.crew.find((c) => (c.job === "Director"))?.name || "")
      : "";
    fdbk.director = answers.director.trim().toLowerCase() === director.toLowerCase()
      ? "✅" : `❌ [${director}]`;
    if (fdbk.director.startsWith("✅")) sc += 1;

    // Year
    const year = (movie.release_date || "").slice(0, 4);
    fdbk.year = answers.year.trim() === year ? "✅" : `❌ [${year}]`;
    if (fdbk.year.startsWith("✅")) sc += 1;

    // Genre
    const genre = details && details.genres && details.genres.length > 0 ? details.genres[0].name : "";
    fdbk.genre = answers.genre.trim().toLowerCase() === genre.toLowerCase()
      ? "✅" : `❌ [${genre}]`;
    if (fdbk.genre.startsWith("✅")) sc += 1;
    setFeedback(fdbk);
    setScore((old) => old + sc);
    setStage("recall-feedback");
  };

  const nextRound = () => {
    if (current < totalQuiz) {
      setCurrent((c) => c + 1);
      setStage("show-image");
      setAnswers({ director: "", year: "", genre: "" });
      setFeedback({ director: "", year: "", genre: "" });
    } else {
      setStage("score-summary");
    }
  };

  // Load credits in details (need for director)
  useEffect(() => {
    async function fetchCredits() {
      if (!movie) return;
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=5bc67d3b06aecbd18121a3cbbc16eb59`
        );
        const data = await res.json();
        setDetails((d) => ({ ...d, credits: data }));
      } catch {
        setDetails((d) => ({ ...d, credits: { crew: [] } }));
      }
    }
    if (movie && details && !details.credits) {
      fetchCredits();
    }
    // eslint-disable-next-line
  }, [movie, details]);

  if (!movie || !details) return <div style={{ padding: 30 }}>Loading...</div>;

  return (
    <div style={{ padding: 22 }}>
      <h3>
        Movie Memory Trainer{" "}
        <span style={{ fontSize: "1rem", fontWeight: 400 }}>
          {current}/{totalQuiz}
        </span>
      </h3>
      {stage === "show-image" && (
        <div style={{ margin: "24px auto", textAlign: "center" }}>
          <div style={{ color: "#665595", fontWeight: 500, marginBottom: 10 }}>
            Memorize this movie poster!
          </div>
          <img
            src={`https://image.tmdb.org/t/p/w342/${movie.poster_path}`}
            alt="memory-movie"
            style={{
              borderRadius: 12,
              boxShadow: "0 3px 18px #cf5df890",
              width: 230
            }}
          />
          <div style={{ marginTop: 15, color: "#8856b4" }}>You have 3 seconds...</div>
        </div>
      )}
      {stage === "recall" && (
        <form
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 16,
            minWidth: 260
          }}
          onSubmit={(e) => {
            e.preventDefault();
            checkAnswers();
          }}
        >
          <div style={{ marginBottom: 12, color: "#654899" }}>
            <b>Recall details:</b>
          </div>
          <div style={{
            fontSize: "1.01rem",
            color: "#b90058",
            background: "#fff8e8",
            padding: "7px 10px",
            borderRadius: 5,
            border: "1px solid #faecbe",
            marginBottom: 7,
            maxWidth: 320
          }}>
            <b>Note:</b> Write all answers in <b>English (romanized)</b>. Do not use Tamil script.
          </div>
          <label>
            Director:
            <input
              type="text"
              name="director"
              placeholder="Director's name"
              value={answers.director}
              onChange={handleInput}
              style={{
                border: "1.5px solid #cf5df8",
                borderRadius: 5,
                padding: 8,
                fontSize: "1em",
                width: 240
              }}
              autoComplete="off"
            />
          </label>
          <label>
            Release Year:
            <input
              type="text"
              name="year"
              value={answers.year}
              onChange={handleInput}
              placeholder="YYYY"
              style={{
                border: "1.5px solid #cf5df8",
                borderRadius: 5,
                padding: 8,
                fontSize: "1em",
                width: 120
              }}
              autoComplete="off"
            />
          </label>
          <label>
            Genre (any one):
            <input
              type="text"
              name="genre"
              placeholder="e.g. Action"
              value={answers.genre}
              onChange={handleInput}
              style={{
                border: "1.5px solid #cf5df8",
                borderRadius: 5,
                padding: 8,
                fontSize: "1em",
                width: 200
              }}
              autoComplete="off"
            />
          </label>
          <button className="btn" type="submit">
            Submit Answers
          </button>
        </form>
      )}
      {stage === "recall-feedback" && (
        <div style={{ marginTop: 22 }}>
          <div>
            <b>Director:</b> <span>{feedback.director}</span>
          </div>
          <div>
            <b>Year:</b> <span>{feedback.year}</span>
          </div>
          <div>
            <b>Genre:</b> <span>{feedback.genre}</span>
          </div>
          <button className="btn" style={{ marginTop: 15 }} onClick={nextRound}>
            {current < totalQuiz ? "Next Question →" : "View Score"}
          </button>
        </div>
      )}
      {stage === "score-summary" && (
        <div style={{ marginTop: 33, fontSize: "1.15rem" }}>
          Game Over! <br />
          Total Score: <b>{score}</b>
          <div style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => window.location.reload()}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
