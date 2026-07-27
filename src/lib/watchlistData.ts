import { supabase } from "@/integrations/supabase/client";
import type { TMDBMovie } from "./movieData";

export interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: number;
  movie_title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  created_at: string;
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as WatchlistItem[]) || [];
}

export async function addToWatchlist(userId: string, movie: TMDBMovie): Promise<void> {
  const { error } = await supabase.from("watchlist").insert({
    user_id: userId,
    movie_id: movie.id,
    movie_title: movie.title,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
    genre_ids: movie.genre_ids || [],
  });
  if (error) throw error;
}

export async function removeFromWatchlist(movieId: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", user.id)
    .eq("movie_id", movieId);
  if (error) throw error;
}

export async function isInWatchlist(movieId: number): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from("watchlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("movie_id", movieId)
    .maybeSingle();
  if (error) return false;
  return !!data;
}
