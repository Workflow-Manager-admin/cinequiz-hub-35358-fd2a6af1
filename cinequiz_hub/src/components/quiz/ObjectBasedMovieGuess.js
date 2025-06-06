import React, { useEffect, useState } from "react";
import "../../components/QuizBase.css";
import { getRandomMovie, fetchMovieDetails } from "../../tmdbService";

// For demo: we use the movie poster with a small "object" region visible (e.g. top left).
// In a full app, props/objects database or image cropping would be required.

// PUBLIC_INTERFACE
/**
 * Object-Based Movie Guess – guess movie from showing a cropped/partial image as an "object".
 */
export default function ObjectBasedMovieGuess({ industry }) {
  const [quizNum, setQuizNum] = useState(1);
  const totalQuiz = 6; // for quick demo
  const [score, setScore] = useState(0);
  const [game, setGame] = useState({
    movie: null,
    answerShown: false,
    userGuess: "",
    feedback: "",
  });

  const fetchQuiz = async () => {
    let candidate, details;
    for (let i = 0; i < 7; ++i) {
      candidate = await getRandomMovie(industry);
      details = await fetchMovieDetails(candidate.id, industry === "kollywood" ? "ta-IN" : "en-US");
      if (candidate.poster_path) break;
    }
    setGame({
      movie: candidate,
      answerShown: false,
      userGuess: "",
      feedback: "",
      details: details || {}
    });
  };

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line
  }, [quizNum, industry]);

  // Regular expression for Tamil Unicode range
  const isTamilScript = (text) =>
    /[஀-௿]/.test(text);

  const checkGuess = () => {
    if (!game.userGuess.trim()) return;
    const guess = game.userGuess.trim();
    if (isTamilScript(guess)) {
      setGame((g) => ({
        ...g,
        feedback: "Please enter your answer in English (romanized)! Do not use Tamil script."
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
        Object-Based Movie Guess{" "}
        <span style={{ fontSize: "1rem", fontWeight: 400 }}>
          {quizNum}/{totalQuiz}
        </span>
      </h3>
      <div style={{
        margin: "20px auto 0 auto",
        padding: "12px 14px",
        background: "#f8f7fc",
        borderLeft: "5px solid #cf5df8",
        borderRadius: 8,
        color: "#69549a",
        fontWeight: 500,
        maxWidth: 360
      }}>
        Guess the movie from the object shown (a small part of a poster)!
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
        <b>Note:</b> Please write your answer in <b>English (romanized)</b> only, even for Tamil movies.
      </div>
      <div style={{ display: "flex", justifyContent: "center", margin: "30px auto" }}>
        {game.movie.poster_path && (
          // Show only the top-left quadrant of the poster as "the object"
          <div style={{
            width: 115,
            height: 115,
            overflow: "hidden",
            borderRadius: 7,
            border: "2px solid #cf5df8",
            boxShadow: "0 2px 8px #cf5df850"
          }}>
            <img
              src={`https://image.tmdb.org/t/p/w342/${game.movie.poster_path}`}
              alt="object-poster-piece"
              style={{
                width: 230,
                height: 230,
                objectFit: "cover",
                objectPosition: "top left",
                transform: "scale(1.1)",
                marginTop: 0,
                marginLeft: 0
              }}
            />
          </div>
        )}
      </div>
      <form
        onSubmit={e => { e.preventDefault(); checkGuess(); }}
        style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 16 }}
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
              Restart Object-Based Movie Guess
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
