import { supabase } from "@/integrations/supabase/client";

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TMDBMovieDetail extends TMDBMovie {
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  imdb_id: string | null;
  production_companies: { id: number; name: string; logo_path: string | null }[];
}

export interface OMDbRating {
  Source: string;
  Value: string;
}

export interface OMDbData {
  imdbRating: string;
  imdbVotes: string;
  Metascore: string;
  Ratings: OMDbRating[];
  Response: string;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Review {
  id: string;
  movie_id: number;
  user_id: string;
  author: string;
  rating: number;
  text: string;
  created_at: string;
}

const TMDB_IMG_BASE = "https://image.tmdb.org/t/p";

export const getImageUrl = (path: string | null, size: "w500" | "w780" | "original" = "w500") =>
  path ? `${TMDB_IMG_BASE}/${size}${path}` : null;

export const genreMap: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

export async function fetchTMDBMovies(endpoint: string): Promise<TMDBMovie[]> {
  const { data, error } = await supabase.functions.invoke("tmdb", {
    body: { endpoint },
  });
  if (error) throw error;
  return data.results || [];
}

export async function fetchMovieDetail(movieId: number): Promise<TMDBMovieDetail> {
  const { data, error } = await supabase.functions.invoke("tmdb", {
    body: { endpoint: `/movie/${movieId}?language=en-US` },
  });
  if (error) throw error;
  return data;
}

export async function fetchMovieVideos(movieId: number): Promise<TMDBVideo[]> {
  const { data, error } = await supabase.functions.invoke("tmdb", {
    body: { endpoint: `/movie/${movieId}/videos?language=en-US` },
  });
  if (error) throw error;
  return (data.results || []).filter((v: TMDBVideo) => v.site === "YouTube");
}

export async function searchTMDBMovies(query: string): Promise<TMDBMovie[]> {
  return fetchTMDBMovies(`/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`);
}

export async function fetchOMDbData(imdbId: string): Promise<OMDbData | null> {
  const { data, error } = await supabase.functions.invoke("tmdb", {
    body: { action: "omdb", imdb_id: imdbId },
  });
  if (error) throw error;
  if (data?.Response === "False") return null;
  return data as OMDbData;
}

export async function fetchReviews(movieId: number): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("movie_id", movieId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as Review[]) || [];
}

export async function submitReview(review: { movie_id: number; user_id: string; author: string; rating: number; text: string }): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert(review)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Review;
}
