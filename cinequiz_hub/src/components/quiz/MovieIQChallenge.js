import React, { useEffect, useState } from "react";
import "../../components/QuizBase.css";
import { getRandomMovie, fetchMovieDetails } from "../../tmdbService";

// PUBLIC_INTERFACE
/**
 * Movie IQ Challenge – Guess the movie with director and year as clues.
 */
export default function MovieIQChallenge({ industry }) {
  const [quizNum, setQuizNum] = useState(1);
  const totalQuiz = 6; // set to 6 for demo (normally 18)
  const [score, setScore] = useState(0);
  const [game, setGame] = useState({
    movie: null,
    director: "",
    year: "",
    answerShown: false,
    userGuess: "",
    feedback: "",
  });

  async function fetchQuiz() {
    let candidate, details, director = "";
    for (let i = 0; i < 7; i++) {
      candidate = await getRandomMovie(industry);
      details = await fetchMovieDetails(candidate.id, industry === "kollywood" ? "ta-IN" : "en-US");
      // Fetch credits for director info
      let credits = null;
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${candidate.id}/credits?api_key=5bc67d3b06aecbd18121a3cbbc16eb59`
        );
        credits = await res.json();
      } catch { credits = null; }
      director = (credits && credits.crew && credits.crew.find((c) => c.job === "Director"))
        ? credits.crew.find((c) => c.job === "Director").name
        : "";
      if (director) break;
    }
    const year = (candidate.release_date || "").slice(0, 4);
    setGame({
      movie: candidate,
      director,
      year,
      answerShown: false,
      userGuess: "",
      feedback: "",
    });
  }

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line
  }, [quizNum, industry]);

  // Regular expression that matches Tamil Unicode range
  const isTamilScript = (text) =>
    /[஀-௿]/.test(text);

  const checkGuess = () => {
    if (!game.userGuess.trim()) return;
    const guess = game.userGuess.trim();
    if (isTamilScript(guess)) {
      setGame((g) => ({
        ...g,
        feedback:
          "Please enter your answer in English (romanized)! Do not use Tamil script."
      }));
      return;
    }
    const lowerGuess = guess.toLowerCase();
    const answer = (game.movie.title || game.movie.original_title || "").toLowerCase();
    if (game.answerShown) {
      setGame((g) => ({ ...g, feedback: "Answer revealed. No points awarded." }));
    } else if (lowerGuess === answer) {
      setGame((g) => ({ ...g, feedback: "Correct! 🎉" }));
      setScore((sc) => sc + 1);
    } else {
      setGame((g) => ({ ...g, feedback: "Incorrect." }));
    }
  };

  const revealAnswer = () => {
    setGame((g) => ({
      ...g,
      answerShown: true,
      feedback: `The answer is: ${g.movie.title}`,
    }));
  };

  const handleInput = (e) => {
    setGame((g) => ({ ...g, userGuess: e.target.value }));
  };

  const nextQuiz = () => {
    setQuizNum((q) => q + 1);
    setTimeout(() => fetchQuiz(), 120);
  };

  if (!game.movie)
    return (
      <div style={{ padding: 24 }}>
        <span>Loading quiz...</span>
      </div>
    );

  return (
    <div style={{ padding: 24 }}>
      <h3>
        Movie IQ Challenge{" "}
        <span style={{ fontSize: "1rem", fontWeight: 400 }}>
          {quizNum}/{totalQuiz}
        </span>
      </h3>
      <div style={{
        margin: "18px auto 0 auto",
        padding: "14px 20px",
        background: "#f8f7fc",
        borderLeft: "5px solid #cf5df8",
        fontSize: "1.08rem",
        color: "#46326b",
        borderRadius: 7,
        maxWidth: 530,
        minHeight: 40,
        fontStyle: "italic"
      }}>
        Director: <b>{game.director || "Unknown"}</b>
        <span style={{ marginLeft: 18 }}>Year: <b>{game.year || "?"}</b></span>
      </div>
      <div style={{
        marginTop: 20,
        marginBottom: 5,
        fontSize: "1.02rem",
        color: "#b90058",
        background: "#fff8e8",
        padding: "8px 12px",
        borderRadius: 5,
        border: "1px solid #faecbe",
        maxWidth: 500
      }}>
        <b>Note:</b> Answers must be entered in <b>English (romanized)</b> only. Do not use Tamil script for any answer.
      </div>
      <form
        onSubmit={e => { e.preventDefault(); checkGuess(); }}
        style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 16 }}
      >
        <input
          type="text"
          placeholder="Movie title (in English only)"
          value={game.userGuess}
          onChange={handleInput}
          autoComplete="off"
          disabled={game.answerShown}
          style={{
            fontSize: "1.09em",
            border: "2px solid #cf5df8",
            borderRadius: 5,
            padding: 8,
            width: 200
          }}
        />
        <button className="btn" type="submit" disabled={!game.userGuess.trim() || game.answerShown}>
          Submit
        </button>
        <button className="btn" type="button" onClick={revealAnswer} style={{ marginLeft: 6 }}>
          Reveal Answer
        </button>
      </form>
      {game.feedback &&
        <div style={{
          marginTop: 17,
          fontWeight: 700,
          fontSize: "1.04rem",
          color: game.feedback.includes("Correct") ? "#18813f" : "#c73d44"
        }}>{game.feedback}</div>
      }
      {(game.answerShown || game.feedback.includes("Correct")) && quizNum < totalQuiz && (
        <button className="btn" style={{ marginTop: 18 }} onClick={nextQuiz}>
          Next Quiz →
        </button>
      )}
      {(game.answerShown || game.feedback.includes("Correct")) && quizNum === totalQuiz && (
        <div style={{ marginTop: 28, fontSize: "1.15rem" }}>
          Finished! <br />
          Your Score: <b>{score}</b> / {totalQuiz}
          <div style={{ marginTop: 14 }}>
            <button className="btn" onClick={() => window.location.reload()}>
              Restart IQ Challenge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
