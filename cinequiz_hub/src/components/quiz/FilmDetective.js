import React, { useState, useEffect } from "react";
import "../../components/QuizBase.css";
import { getRandomMovie, fetchMovieDetails } from "../../tmdbService";

// PUBLIC_INTERFACE
/**
 * Film Detective: Guess the movie from a blurred poster, reveal clues, answer.
 */
export default function FilmDetective({ industry }) {
  const [game, setGame] = useState({
    movie: null,
    blurred: true,
    clue1: null,
    clue2: null,
    answerShown: false,
    userGuess: "",
    feedback: "",
    points: 0,
    quizNum: 1,
    totalQuiz: 6, // set to 6 for quick demo (normally 18)
    correctSoFar: 0,
  });

  // Initialize or next round
  const startNew = async () => {
    setGame((g) => ({ ...g, movie: null, blurred: true, answerShown: false, clue1: null, clue2: null, userGuess: "", feedback: "", quizNum: g.quizNum, correctSoFar: g.correctSoFar }));
    let movie;
    for (let i = 0; i < 6; ++i) { // try to get a movie with a poster
      movie = await getRandomMovie(industry);
      if (movie && movie.poster_path) break;
    }
    if (!movie.poster_path) {
      setGame((g) => ({ ...g, feedback: "Couldn't fetch a movie poster. Try Next." }));
      return;
    }
    setGame((g) => ({ ...g, movie, blurred: true, clue1: null, clue2: null, answerShown: false, userGuess: "", feedback: "" }));
  };

  useEffect(() => {
    // On mount and each new round
    startNew();
    // eslint-disable-next-line
  }, [game.quizNum]);

  const fetchClues = async (clueNum) => {
    setGame((g) => ({ ...g, feedback: "" }));
    if (!game.movie) return;
    let details;
    try {
      details = await fetchMovieDetails(game.movie.id, industry === "kollywood" ? "ta-IN" : "en-US");
    } catch {
      details = null;
    }
    if (clueNum === 1) {
      let clue = "";
      if (details && details.genres && details.genres.length) {
        clue = "Genre: " + details.genres.map((g) => g.name).join(", ");
      } else {
        clue = "Clue unavailable.";
      }
      setGame((g) => ({ ...g, clue1: clue }));
    } else if (clueNum === 2) {
      let clue = "";
      if (details && details.overview) {
        clue = "Plot: " + details.overview.substring(0, 100) + (details.overview.length > 100 ? "..." : "");
      } else {
        clue = "Plot overview unavailable.";
      }
      setGame((g) => ({ ...g, clue2: clue }));
    }
  };

  const checkGuess = () => {
    if (!game.userGuess.trim()) return;
    const guess = game.userGuess.trim().toLowerCase();
    const answer = (game.movie.title || game.movie.original_title || "").toLowerCase();
    if (game.answerShown) {
      setGame((g) => ({ ...g, feedback: "Answer revealed. No points awarded." }));
      return;
    }
    if (guess === answer) {
      setGame((g) => ({
        ...g,
        feedback: "Correct! 🎉",
        correctSoFar: g.correctSoFar + 1,
      }));
    } else {
      setGame((g) => ({
        ...g,
        feedback: "Incorrect.",
      }));
    }
  };

  const revealAnswer = () => {
    setGame((g) => ({ ...g, answerShown: true, feedback: `The answer is: ${g.movie.title}` }));
  };

  const handleInputChange = (e) => {
    setGame((g) => ({ ...g, userGuess: e.target.value }));
  };

  const nextQuiz = () => {
    if (game.quizNum < game.totalQuiz) {
      setGame((g) => ({ ...g, quizNum: g.quizNum + 1 }));
      setTimeout(() => startNew(), 180);
    }
  };

  if (!game.movie)
    return (
      <div style={{ padding: 24 }}>
        <span>Loading poster...</span>
      </div>
    );
  return (
    <div style={{ padding: 24 }}>
      <h3>Film Detective <span style={{ fontSize: "1rem", fontWeight: 400 }}>{game.quizNum}/{game.totalQuiz}</span></h3>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {game.movie.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w342/${game.movie.poster_path}`}
            alt="blurred-movie-poster"
            style={
              game.answerShown ? { borderRadius: 10, width: 230, margin: 15 } :
                { borderRadius: 10, width: 230, margin: 15, filter: "blur(12px)" }
            }
          />
        )}
        <div style={{ marginTop: 12, marginBottom: 10 }}>
          <button className="btn" onClick={() => fetchClues(1)} disabled={!!game.clue1}>
            Reveal Clue 1
          </button>
          <button className="btn" onClick={() => fetchClues(2)} disabled={!!game.clue2} style={{ marginLeft: 12 }}>
            Reveal Clue 2
          </button>
          <button className="btn" onClick={revealAnswer} style={{ marginLeft: 12 }}>
            Reveal Answer
          </button>
        </div>
        {game.clue1 && <div style={{ marginTop: 6, fontWeight: 600, color: "#654899" }}>{game.clue1}</div>}
        {game.clue2 && <div style={{ marginTop: 7, fontWeight: 500, color: "#7b5aa9" }}>{game.clue2}</div>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkGuess();
          }}
          style={{ display: "flex", marginTop: 18, alignItems: "center", gap: 12 }}
        >
          <input
            type="text"
            placeholder="Your guess for the movie"
            autoComplete="off"
            value={game.userGuess}
            onChange={handleInputChange}
            disabled={game.answerShown}
            style={{ fontSize: "1.09em", border: "2px solid #cf5df8", borderRadius: 5, padding: 8, width: 190 }}
          />
          <button className="btn" type="submit" disabled={!game.userGuess.trim() || game.answerShown}>
            Submit
          </button>
        </form>
        {game.feedback && (
          <div style={{ marginTop: 17, fontWeight: 700, fontSize: "1.04rem", color: game.feedback.includes("Correct") ? "#2A9347" : "#c73d44" }}>
            {game.feedback}
          </div>
        )}
        {(game.answerShown || game.feedback.includes("Correct")) && game.quizNum < game.totalQuiz && (
          <button className="btn" style={{ marginTop: 18 }} onClick={nextQuiz}>
            Next Poster →
          </button>
        )}
        {(game.answerShown || game.feedback.includes("Correct")) && game.quizNum === game.totalQuiz && (
          <div style={{ marginTop: 28, fontSize: "1.15rem" }}>
            Finished! <br />
            Your Score: <b>{game.correctSoFar}</b> / {game.totalQuiz}
            <div style={{ marginTop: 14 }}>
              <button className="btn" onClick={() => window.location.reload()}>
                Restart Film Detective
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
