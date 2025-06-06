//
// TheMovieDB API Service for CineQuiz Hub
//
// Provides utility functions for fetching Hollywood (English, US) and Kollywood (Tamil, IN) movie data
// for quiz-related features. Powered by TheMovieDB API.
//
// Documentation: https://developer.themoviedb.org/reference/intro
//

// PUBLIC_INTERFACE
/**
 * Utility methods for fetching movies from TheMovieDB.
 * @module tmdbService
 */

const API_KEY = "5bc67d3b06aecbd18121a3cbbc16eb59";
const BASE_URL = "https://api.themoviedb.org/3";

// Helper for fetching from TMDB API
async function fetchFromTMDB(endpoint, params = {}) {
  // Assemble params including API Key
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", API_KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.append(k, v);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

// PUBLIC_INTERFACE
/**
 * Fetches popular Hollywood (English/US) movies.
 * @param {number} [page=1] - Pagination page.
 * @returns {Promise<object>} Movies page data.
 */
export async function fetchPopularHollywoodMovies(page = 1) {
  // Hollywood: language=en, region=US
  return fetchFromTMDB("/discover/movie", {
    language: "en-US",
    region: "US",
    with_original_language: "en",
    sort_by: "popularity.desc",
    include_adult: false,
    page,
  });
}

// PUBLIC_INTERFACE
/**
 * Fetches popular Kollywood (Tamil/IN) movies.
 * @param {number} [page=1] - Pagination page.
 * @returns {Promise<object>} Movies page data.
 */
export async function fetchPopularKollywoodMovies(page = 1) {
  // Kollywood: language=ta (Tamil), region=IN
  return fetchFromTMDB("/discover/movie", {
    language: "ta-IN",
    region: "IN",
    with_original_language: "ta",
    sort_by: "popularity.desc",
    include_adult: false,
    page,
  });
}

// PUBLIC_INTERFACE
/**
 * Fetches details for a specific movie by its TMDB ID.
 * @param {number|string} movieId - The MovieDB movie ID.
 * @param {string} [language] - Optional language code.
 * @returns {Promise<object>} Movie details.
 */
export async function fetchMovieDetails(movieId, language) {
  if (!movieId) throw new Error("movieId parameter is required.");
  return fetchFromTMDB(`/movie/${movieId}`, language ? { language } : {});
}

// PUBLIC_INTERFACE
/**
 * Searches for movies by query and language/region.
 * @param {string} query - Search term.
 * @param {"hollywood"|"kollywood"} industry - Which industry to target.
 * @param {number} [page=1] - Pagination page.
 * @returns {Promise<object>} Search results.
 */
export async function searchMovies(query, industry = "hollywood", page = 1) {
  let params = { query, include_adult: false, page };
  if (industry === "hollywood") {
    params.language = "en-US";
    params.region = "US";
  } else if (industry === "kollywood") {
    params.language = "ta-IN";
    params.region = "IN";
  }
  return fetchFromTMDB("/search/movie", params);
}

// PUBLIC_INTERFACE
/**
 * Fetches credits (cast/crew) for a movie.
 * @param {number|string} movieId - TMDB movie ID.
 * @returns {Promise<object>} Movie credits.
 */
export async function fetchMovieCredits(movieId) {
  if (!movieId) throw new Error("movieId parameter is required.");
  return fetchFromTMDB(`/movie/${movieId}/credits`);
}

// PUBLIC_INTERFACE
/**
 * Discover movies with two specific actors (for Actor Combo Finder).
 * @param {Array<number|string>} actorIds - TMDB person IDs (must be length 2).
 * @param {"hollywood"|"kollywood"} industry
 * @param {number} [page=1]
 * @returns {Promise<object>}
 */
export async function findMoviesByActorCombo(actorIds, industry = "hollywood", page = 1) {
  if (!Array.isArray(actorIds) || actorIds.length !== 2) throw new Error("actorIds must be an array of 2 TMDB person IDs.");
  let params = {
    with_cast: actorIds.join(","),
    page,
    sort_by: "popularity.desc",
    include_adult: false
  };
  if (industry === "hollywood") {
    params.language = "en-US";
    params.region = "US";
    params.with_original_language = "en";
  } else if (industry === "kollywood") {
    params.language = "ta-IN";
    params.region = "IN";
    params.with_original_language = "ta";
  }
  return fetchFromTMDB("/discover/movie", params);
}

// PUBLIC_INTERFACE
/**
 * Get a random popular movie for a given industry.
 * @param {"hollywood"|"kollywood"} industry
 * @returns {Promise<object>} Movie object.
 */
export async function getRandomMovie(industry = "hollywood") {
  // To ensure randomness, we'll fetch a random page from 1-10 (popular movies)
  const page = Math.floor(Math.random() * 10) + 1;
  let moviesPage =
    industry === "kollywood"
      ? await fetchPopularKollywoodMovies(page)
      : await fetchPopularHollywoodMovies(page);

  if (moviesPage && moviesPage.results && moviesPage.results.length > 0) {
    return moviesPage.results[Math.floor(Math.random() * moviesPage.results.length)];
  }
  throw new Error("No movies found.");
}
