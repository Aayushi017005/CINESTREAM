
-- Create reviews table to store movie reviews in the database
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  movie_id INTEGER NOT NULL,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read all reviews
CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own reviews
CREATE POLICY "Users can insert their own reviews"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON public.reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
