/** Gêneros de filme do TMDB em pt-BR (`/genre/movie/list?language=pt-BR`). */
export const TMDB_MOVIE_GENRES = [
  "Ação",
  "Aventura",
  "Animação",
  "Comédia",
  "Crime",
  "Documentário",
  "Drama",
  "Família",
  "Fantasia",
  "História",
  "Terror",
  "Música",
  "Mistério",
  "Romance",
  "Ficção científica",
  "Cinema TV",
  "Thriller",
  "Guerra",
  "Faroeste",
] as const;

export const ALL_GENRES_VALUE = "all";

/** Aliases pt-BR / en-US para filtros em dados legados. */
export const TMDB_GENRE_ALIASES: Record<string, string[]> = {
  Ação: ["Ação", "Action"],
  Aventura: ["Aventura", "Adventure"],
  Animação: ["Animação", "Animation"],
  Comédia: ["Comédia", "Comedy"],
  Crime: ["Crime"],
  Documentário: ["Documentário", "Documentary"],
  Drama: ["Drama"],
  Família: ["Família", "Family"],
  Fantasia: ["Fantasia", "Fantasy"],
  História: ["História", "History"],
  Terror: ["Terror", "Horror"],
  Música: ["Música", "Music"],
  Mistério: ["Mistério", "Mystery"],
  Romance: ["Romance"],
  "Ficção científica": ["Ficção científica", "Science Fiction"],
  "Cinema TV": ["Cinema TV", "TV Movie"],
  Thriller: ["Thriller"],
  Guerra: ["Guerra", "War"],
  Faroeste: ["Faroeste", "Western"],
};

export function resolveGenreFilterValues(genre: string): string[] {
  const normalized = genre.trim();
  if (!normalized) return [];
  return TMDB_GENRE_ALIASES[normalized] ?? [normalized];
}

export function movieMatchesGenre(movieGenres: string[] | undefined, genre: string): boolean {
  if (!genre.trim()) return true;
  const aliases = resolveGenreFilterValues(genre);
  return (movieGenres ?? []).some((g) => aliases.includes(g));
}
