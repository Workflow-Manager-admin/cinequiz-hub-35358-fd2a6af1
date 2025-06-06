import React from "react";
import ActorComboFinder from "./quiz/ActorComboFinder";
import FilmDetective from "./quiz/FilmDetective";
import MovieDialogueQuiz from "./quiz/MovieDialogueQuiz";
import MovieMemoryTrainer from "./quiz/MovieMemoryTrainer";
import MovieIQChallenge from "./quiz/MovieIQChallenge";
import ObjectBasedMovieGuess from "./quiz/ObjectBasedMovieGuess";

// PUBLIC_INTERFACE
/**
 * Loads and displays the correct quiz game component, given key and industry.
 */
export default function QuizLoader({ quizKey, industry, onHome }) {
  let QuizComp = null, quizTitle = "";

  switch (quizKey) {
    case "actor-combo-finder":
      QuizComp = ActorComboFinder;
      quizTitle = "Actor Combo Finder";
      break;
    case "film-detective":
      QuizComp = FilmDetective;
      quizTitle = "Film Detective";
      break;
    case "movie-dialogue-quiz":
      QuizComp = MovieDialogueQuiz;
      quizTitle = "Movie Dialogue Quiz";
      break;
    case "movie-memory-trainer":
      QuizComp = MovieMemoryTrainer;
      quizTitle = "Movie Memory Trainer";
      break;
    case "movie-iq-challenge":
      QuizComp = MovieIQChallenge;
      quizTitle = "Movie IQ Challenge";
      break;
    case "object-based-movie-guess":
      QuizComp = ObjectBasedMovieGuess;
      quizTitle = "Object-Based Movie Guess";
      break;
    default:
      QuizComp = null;
  }

  return (
    <div className="quiz-game-bg">
      <div className="quiz-game-navbar">
        <button className="btn" onClick={onHome} style={{marginRight: 24}}>
          ← Back to Dashboard
        </button>
        <div className="quiz-game-title">
          <span style={{ color: "#cf5df8", fontWeight: 700 }}>{quizTitle}</span>
          <span style={{fontWeight: 500, color: "#6a44a7", marginLeft: 15 }}>
            [{industry === "hollywood" ? "Hollywood" : "Kollywood"}]
          </span>
        </div>
      </div>
      <div className="quiz-game-body">
        {QuizComp && <QuizComp industry={industry} />}
      </div>
    </div>
  );
}
