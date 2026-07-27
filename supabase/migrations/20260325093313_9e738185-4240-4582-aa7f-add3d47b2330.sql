
CREATE TABLE public.watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  movie_id integer NOT NULL,
  movie_title text NOT NULL,
  poster_path text,
  vote_average numeric DEFAULT 0,
  release_date text,
  genre_ids integer[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watchlist"
  ON public.watchlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own watchlist"
  ON public.watchlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own watchlist"
  ON public.watchlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
