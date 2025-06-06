import React, { useEffect, useState } from "react";
import "./Dashboard.css";

const QUIZZES = [
  {
    key: "actor-combo-finder",
    name: "Actor Combo Finder",
    desc: "Find all movies two actors worked together.",
  },
  {
    key: "film-detective",
    name: "Film Detective",
    desc: "Guess the movie from a blurred poster, use clues, reveal answer.",
  },
  {
    key: "movie-dialogue-quiz",
    name: "Movie Dialogue Quiz",
    desc: "Guess the movie from its famous lines.",
  },
  {
    key: "movie-memory-trainer",
    name: "Movie Memory Trainer",
    desc: "Recall movie details after seeing a movie image.",
  },
  {
    key: "movie-iq-challenge",
    name: "Movie IQ Challenge",
    desc: "Guess the movie given director & year.",
  },
  {
    key: "object-based-movie-guess",
    name: "Object-Based Movie Guess",
    desc: "Guess movie from props/objects.",
  }
];

// PUBLIC_INTERFACE
/**
 * Dashboard – two columns (Hollywood / Kollywood), launches games.
 */
export default function Dashboard({ currentUser, onSelectQuiz, onLogout }) {
  const [user, setUser] = useState(currentUser || "");

  useEffect(() => {
    if (currentUser) setUser(currentUser);
    else if (localStorage.getItem("cinequiz_user")) {
      setUser(localStorage.getItem("cinequiz_user"));
    }
  }, [currentUser]);

  return (
    <div className="dashboard-bg">
      <div className="dashboard-navbar">
        <div className="dashboard-title">
          <span style={{ color: "#cf5df8", fontWeight: 700 }}>
            CineQuiz Hub
          </span>{" "}
          &nbsp; <span style={{ fontWeight: 500, color: "#6a44a7" }}>| Movie Quizzes</span>
        </div>
        <div className="dashboard-user-controls">
          {user && (
            <span className="username-badge">
              <i className="fa fa-user" />
              {user}
            </span>
          )}
          <button className="btn-small logout-btn" onClick={() => {
            localStorage.removeItem("cinequiz_logged_in");
            localStorage.removeItem("cinequiz_user");
            onLogout();
          }}>Logout</button>
        </div>
      </div>
      <div className="dashboard-main">
        <div className="industry-col hollywood-col">
          <h2>Hollywood</h2>
          <div className="quiz-list">
            {QUIZZES.map(q =>
              <QuizCard key={q.key}
                quiz={q}
                industry={"hollywood"}
                onSelect={onSelectQuiz}
              />
            )}
          </div>
        </div>
        <div className="industry-col kollywood-col">
          <h2>Kollywood</h2>
          <div className="quiz-list">
            {QUIZZES.map(q =>
              <QuizCard key={q.key}
                quiz={q}
                industry={"kollywood"}
                onSelect={onSelectQuiz}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizCard({ quiz, industry, onSelect }) {
  return (
    <div className="quiz-card">
      <div className="quiz-card-content">
        <div className="quiz-name">{quiz.name}</div>
        <div className="quiz-desc">{quiz.desc}</div>
        <button
          className={
            industry === "hollywood"
              ? "btn quiz-btn"
              : "btn quiz-btn kolly"
          }
          onClick={() => onSelect(quiz.key, industry)}
        >
          Start {industry === "hollywood" ? "Hollywood" : "Kollywood"}
        </button>
      </div>
    </div>
  );
}
