import React, { useState } from "react";
import "../../components/QuizBase.css";
import { findMoviesByActorCombo, searchMovies } from "../../tmdbService";

// PUBLIC_INTERFACE
/**
 * Find all movies two actors worked in together (by name, search TMDB).
 */
export default function ActorComboFinder({ industry }) {
  const [actor1, setActor1] = useState("");
  const [actor2, setActor2] = useState("");
  const [movies, setMovies] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Helper to get TMDB person ID from a name
  const getActorIdFromName = async (name) => {
    if (!name.trim()) throw new Error("No actor name.");
    const resp = await fetch(
      `https://api.themoviedb.org/3/search/person?api_key=5bc67d3b06aecbd18121a3cbbc16eb59&query=${encodeURIComponent(
        name
      )}${industry === "kollywood" ? "&language=ta-IN" : "&language=en-US"}`
    );
    if (!resp.ok) throw new Error("Failed to fetch actor: " + name);
    const data = await resp.json();
    if (!data.results || data.results.length === 0) throw new Error("Actor not found: " + name);
    return data.results[0].id;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError("");
    setLoading(true);
    setMovies([]);
    setSearched(false);
    try {
      const id1 = await getActorIdFromName(actor1);
      const id2 = await getActorIdFromName(actor2);
      const resp = await findMoviesByActorCombo([id1, id2], industry, 1);
      setMovies(resp.results || []);
      setSearched(true);
    } catch (error) {
      setSearchError(error.message || "Failed to search for actor combination.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 12 }}>
      <h3>Actor Combo Finder</h3>
      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: 11, alignItems: "center", marginBottom: 18 }}
      >
        <input
          name="actor1"
          value={actor1}
          onChange={(e) => setActor1(e.target.value)}
          placeholder="First Actor Name"
          autoComplete="off"
          style={{ width: 150, fontSize: "1em", borderRadius: 4, padding: "8px 7px", border: "1.5px solid #cf5df8" }}
        />
        <span style={{ fontWeight: 700 }}>+</span>
        <input
          name="actor2"
          value={actor2}
          onChange={(e) => setActor2(e.target.value)}
          placeholder="Second Actor Name"
          autoComplete="off"
          style={{ width: 150, fontSize: "1em", borderRadius: 4, padding: "8px 7px", border: "1.5px solid #cf5df8" }}
        />
        <button className="btn" type="submit" disabled={loading || !actor1.trim() || !actor2.trim()}>
          Find Movies
        </button>
      </form>
      {searchError && <div style={{ color: "#b91c1c" }}>{searchError}</div>}
      {loading && <div style={{ fontSize: "1rem" }}>Searching...</div>}
      <div style={{ marginTop: 18 }}>
        {searched && (movies.length === 0 ? <div>No movies found for this actor pair.</div> :
          <ul style={{ padding: 0, margin: 0 }}>
            {movies.map(m => (
              <li key={m.id} style={{ marginBottom: 10, listStyle: "none", padding: "0 0 6px 0" }}>
                <b>{m.title || m.original_title}</b>
                {m.release_date && <span> &nbsp;({m.release_date.slice(0, 4)})</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
