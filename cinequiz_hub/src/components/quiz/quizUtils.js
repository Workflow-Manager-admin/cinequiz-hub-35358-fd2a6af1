export function shuffleArray(arr) {
  // Fisher-Yates shuffle
  const arrCopy = [...arr];
  for (let i = arrCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]];
  }
  return arrCopy;
}

export function pickN(arr, n) {
  // Pick N unique random elements from arr
  return shuffleArray(arr).slice(0, n);
}

export function maskMovieTitle(title) {
  // Replaces inner letters with underscores, keeps first/last letters (if > 3 chars)
  if (!title || title.length <= 3) return title || "";
  return (
    title[0] +
    title
      .slice(1, -1)
      .replace(/[a-zA-Z]/g, "_") +
    title.slice(-1)
  );
}

export function blurPosterUrl(url, blur = 10) {
  // Use CSS filter in img, but this constructs style object
  return { filter: `blur(${blur}px)`, WebkitFilter: `blur(${blur}px)` };
}
