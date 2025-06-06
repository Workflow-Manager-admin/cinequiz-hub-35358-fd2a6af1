import React, { useState, useCallback, useEffect } from "react";
import "./App.css";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import QuizLoader from "./components/QuizLoader";

function App() {
  // State: user (username), route (dashboard, or quiz), quiz info
  const [user, setUser] = useState("");
  const [stage, setStage] = useState("loading"); // loading | login | dashboard | quiz
  const [quiz, setQuiz] = useState({
    key: "",
    industry: "",
  });

  // On initial mount, check login
  useEffect(() => {
    if (localStorage.getItem("cinequiz_logged_in") === "1") {
      setUser(localStorage.getItem("cinequiz_user") || "");
      setStage("dashboard");
    } else {
      setStage("login");
    }
  }, []);

  // Handle authentication success (from Auth)
  const handleAuthSuccess = (username) => {
    setUser(username);
    setStage("dashboard");
  };

  // Select quiz to play (from Dashboard)
  const handleQuizSelect = (quizKey, industry) => {
    setQuiz({ key: quizKey, industry });
    setStage("quiz");
  };

  // Handle logout
  const handleLogout = useCallback(() => {
    setUser("");
    setStage("login");
  }, []);

  // Return to dashboard
  const goHome = useCallback(() => {
    setStage("dashboard");
    setQuiz({ key: "", industry: "" });
  }, []);

  // Render logic
  return (
    <div className="app">
      {stage === "login" && <Auth onAuthSuccess={handleAuthSuccess} />}
      {stage === "dashboard" && (
        <Dashboard
          currentUser={user}
          onSelectQuiz={handleQuizSelect}
          onLogout={handleLogout}
        />
      )}
      {stage === "quiz" && (
        <QuizLoader
          quizKey={quiz.key}
          industry={quiz.industry}
          onHome={goHome}
        />
      )}
      {stage === "loading" && (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div>Loading CineQuiz Hub...</div>
        </div>
      )}
    </div>
  );
}

export default App;