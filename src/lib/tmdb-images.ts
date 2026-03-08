/**
 * Tamanhos de poster TMDB (image.tmdb.org).
 * Usar w185 para thumbnails pequenos, w300 para cards/listas, w500 para detalhe/destaque.
 */
export type TmdbPosterSize = "w185" | "w300" | "w500" | "original";

const SIZE_REGEX = /\/t\/p\/(w\d+|original)\//;

/**
 * Retorna a URL do poster TMDB no tamanho pedido.
 * Se a URL não for do TMDB, retorna inalterada (ex.: avatares).
 */
export function getTmdbPosterUrl(
  url: string | null | undefined,
  size: TmdbPosterSize = "w300"
): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (!trimmed.includes("image.tmdb.org")) return trimmed;
  return trimmed.replace(SIZE_REGEX, `/t/p/${size}/`);
}
