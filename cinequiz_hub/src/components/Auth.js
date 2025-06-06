import React, { useState } from "react";
import "./Auth.css";

// PUBLIC_INTERFACE
/**
 * Auth component handles login and signup forms.
 */
export default function Auth({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Simulated authentication (localStorage). SECURE for DEMO only!
  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    setTimeout(() => {
      if (isSignUp) {
        if (
          (!form.username || form.username.length < 3) ||
          (!form.password || form.password.length < 4)
        ) {
          setAuthError("Username (min 3 chars) and password (min 4 chars) required.");
          setLoading(false);
          return;
        }
        if (form.password !== form.confirmPassword) {
          setAuthError("Passwords do not match.");
          setLoading(false);
          return;
        }
        localStorage.setItem(
          "cinequiz_user_" + form.username,
          JSON.stringify({ username: form.username, password: form.password })
        );
        localStorage.setItem("cinequiz_logged_in", "1");
        localStorage.setItem("cinequiz_user", form.username);
        onAuthSuccess(form.username);
      } else {
        const user = localStorage.getItem("cinequiz_user_" + form.username);
        if (!user) {
          setAuthError("No account found for this username.");
          setLoading(false);
          return;
        }
        const parsed = JSON.parse(user);
        if (parsed.password !== form.password) {
          setAuthError("Incorrect password.");
          setLoading(false);
          return;
        }
        localStorage.setItem("cinequiz_logged_in", "1");
        localStorage.setItem("cinequiz_user", form.username);
        onAuthSuccess(form.username);
      }
      setLoading(false);
    }, 650);
  };

  const handleSwitch = () => {
    setIsSignUp((s) => !s);
    setAuthError("");
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  return (
    <div className="auth-container">
      <div className="auth-panel">
        <h2>{isSignUp ? "Sign Up" : "Log In"}</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={form.username}
              autoComplete="username"
              onChange={handleChange}
              required
              minLength={3}
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={form.password}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              onChange={handleChange}
              required
              minLength={4}
            />
          </label>
          {isSignUp && (
            <label>
              Confirm Password:
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                autoComplete="new-password"
                onChange={handleChange}
                required
                minLength={4}
              />
            </label>
          )}
          {authError && <div className="auth-error">{authError}</div>}
          <button type="submit" className="btn btn-large" disabled={loading}>
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>
        <div className="switch-link">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button className="btn-link" type="button" onClick={handleSwitch}>Log In</button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button className="btn-link" type="button" onClick={handleSwitch}>Sign Up</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
