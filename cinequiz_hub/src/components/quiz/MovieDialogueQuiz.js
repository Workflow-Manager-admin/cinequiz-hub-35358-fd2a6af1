import React, { useEffect, useState } from "react";
import "../../components/QuizBase.css";
import { getRandomMovie, fetchMovieDetails } from "../../tmdbService";

// PUBLIC_INTERFACE
/**
 * Movie Dialogue Quiz – guess the movie from a famous dialogue (overview or tagline).
 */
export default function MovieDialogueQuiz({ industry }) {
  const [quizNum, setQuizNum] = useState(1);
  const totalQuiz = 6; // normally 18 for full; reduced for demo
  const [score, setScore] = useState(0);
  const [game, setGame] = useState({
    movie: null,
    dialogue: "",
    answerShown: false,
    userGuess: "",
    feedback: "",
  });

  const fetchDialogueQuiz = async () => {
    let candidate = null, details = null;
    // Get a movie with a tagline or overview (as "dialogue")
    for (let i = 0; i < 6; ++i) {
      candidate = await getRandomMovie(industry);
      details = await fetchMovieDetails(candidate.id, industry === "kollywood" ? "ta-IN" : "en-US");
      if (details.tagline && details.tagline.length > 10) break;
      if (details.overview && details.overview.length > 20) break;
    }
    let dialogue = (details && details.tagline && details.tagline.length > 10) ?
      details.tagline : (details && details.overview ? details.overview : "");
    if (!dialogue) dialogue = "No dialogue or description available.";
    setGame({
      movie: candidate,
      dialogue,
      answerShown: false,
      userGuess: "",
      feedback: "",
    });
  };

  useEffect(() => {
    fetchDialogueQuiz();
    // eslint-disable-next-line
  }, [quizNum, industry]);

  const checkGuess = () => {
    if (!game.userGuess.trim()) return;
    const guess = game.userGuess.trim().toLowerCase();
    const answer = (game.movie.title || game.movie.original_title || "").toLowerCase();
    if (game.answerShown) {
      setGame((g) => ({ ...g, feedback: "Answer revealed. No points awarded." }));
    } else if (guess === answer) {
      setGame((g) => ({ ...g, feedback: "Correct! 🎉" }));
      setScore((sc) => sc + 1);
    } else {
      setGame((g) => ({ ...g, feedback: "Incorrect." }));
    }
  };

  const revealAnswer = () => {
    setGame((g) => ({ ...g, answerShown: true, feedback: `The answer is: ${g.movie.title}` }));
  };

  const handleInput = (e) => {
    setGame((g) => ({ ...g, userGuess: e.target.value }));
  };

  const nextQuiz = () => {
    setQuizNum((q) => q + 1);
    setTimeout(() => fetchDialogueQuiz(), 120);
  };

  if (!game.movie) return <div style={{ padding: 24 }}>Loading quiz...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h3>Movie Dialogue Quiz <span style={{ fontSize: "1rem", fontWeight: 400 }}>{quizNum}/{totalQuiz}</span></h3>
      <div style={{
        margin: "24px auto 0 auto",
        padding: "18px 24px",
        background: "#faf4ff",
        borderLeft: "5px solid #cf5df8",
        fontSize: "1.08rem",
        color: "#46326b",
        borderRadius: 7,
        maxWidth: 560,
        minHeight: 66,
        fontStyle: "italic"
      }}>
        “{game.dialogue}”
      </div>
      <form
        onSubmit={e => { e.preventDefault(); checkGuess(); }}
        style={{ marginTop: 27, display: "flex", alignItems: "center", gap: 16 }}
      >
        <input
          type="text"
          placeholder="Movie title"
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
              Restart Dialogue Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
