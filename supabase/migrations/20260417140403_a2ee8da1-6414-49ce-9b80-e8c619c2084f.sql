-- 1. User roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Theaters
CREATE TABLE public.theaters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.theaters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view theaters"
  ON public.theaters FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage theaters"
  ON public.theaters FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_theaters_updated_at
  BEFORE UPDATE ON public.theaters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Screens
CREATE TABLE public.screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theater_id UUID NOT NULL REFERENCES public.theaters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 8,
  seats_per_row INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.screens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view screens"
  ON public.screens FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage screens"
  ON public.screens FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_screens_updated_at
  BEFORE UPDATE ON public.screens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Seat tiers
CREATE TYPE public.seat_tier_name AS ENUM ('standard', 'premium', 'vip');

CREATE TABLE public.seat_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID NOT NULL REFERENCES public.screens(id) ON DELETE CASCADE,
  tier seat_tier_name NOT NULL,
  row_start INTEGER NOT NULL,
  row_end INTEGER NOT NULL,
  price_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seat_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view seat tiers"
  ON public.seat_tiers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage seat tiers"
  ON public.seat_tiers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Showtimes
CREATE TABLE public.showtimes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  poster_path TEXT,
  screen_id UUID NOT NULL REFERENCES public.screens(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  base_price NUMERIC NOT NULL DEFAULT 10.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_showtimes_movie_id ON public.showtimes(movie_id);
CREATE INDEX idx_showtimes_start_time ON public.showtimes(start_time);

ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view showtimes"
  ON public.showtimes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage showtimes"
  ON public.showtimes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_showtimes_updated_at
  BEFORE UPDATE ON public.showtimes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Bookings
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'failed');

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  showtime_id UUID NOT NULL REFERENCES public.showtimes(id) ON DELETE RESTRICT,
  status booking_status NOT NULL DEFAULT 'pending',
  total_amount NUMERIC NOT NULL,
  stripe_session_id TEXT,
  confirmation_code TEXT NOT NULL DEFAULT upper(substring(md5(random()::text) from 1 for 8)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_showtime_id ON public.bookings(showtime_id);
CREATE UNIQUE INDEX idx_bookings_confirmation_code ON public.bookings(confirmation_code);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own bookings"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Booking seats
CREATE TABLE public.booking_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  showtime_id UUID NOT NULL REFERENCES public.showtimes(id) ON DELETE RESTRICT,
  row_number INTEGER NOT NULL,
  seat_number INTEGER NOT NULL,
  tier seat_tier_name NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (showtime_id, row_number, seat_number)
);

CREATE INDEX idx_booking_seats_booking_id ON public.booking_seats(booking_id);
CREATE INDEX idx_booking_seats_showtime_id ON public.booking_seats(showtime_id);

ALTER TABLE public.booking_seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view booked seats"
  ON public.booking_seats FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create seats for their own bookings"
  ON public.booking_seats FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_seats.booking_id
        AND bookings.user_id = auth.uid()
    )
  );

-- Enable realtime for booking_seats so seat selection updates live
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_seats;
ALTER TABLE public.booking_seats REPLICA IDENTITY FULL;