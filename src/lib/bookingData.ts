import { supabase } from "@/integrations/supabase/client";

export type Theater = {
  id: string;
  name: string;
  city: string;
  address: string | null;
};

export type Screen = {
  id: string;
  theater_id: string;
  name: string;
  total_rows: number;
  seats_per_row: number;
};

export type SeatTier = {
  id: string;
  screen_id: string;
  tier: "standard" | "premium" | "vip";
  row_start: number;
  row_end: number;
  price_multiplier: number;
};

export type Showtime = {
  id: string;
  movie_id: number;
  movie_title: string;
  poster_path: string | null;
  screen_id: string;
  start_time: string;
  base_price: number;
};

export type ShowtimeWithDetails = Showtime & {
  screens: Screen & { theaters: Theater };
};

export type BookedSeat = {
  row_number: number;
  seat_number: number;
};

export type SelectedSeat = {
  row: number;
  seat: number;
  tier: "standard" | "premium" | "vip";
  price: number;
};

export const TIER_LABELS: Record<string, string> = {
  standard: "Standard",
  premium: "Premium",
  vip: "VIP",
};

export const fetchShowtimesForMovie = async (movieId: number): Promise<ShowtimeWithDetails[]> => {
  const { data, error } = await supabase
    .from("showtimes")
    .select("*, screens(*, theaters(*))")
    .eq("movie_id", movieId)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });
  if (error) throw error;
  return (data || []) as ShowtimeWithDetails[];
};

export const fetchShowtime = async (id: string): Promise<ShowtimeWithDetails | null> => {
  const { data, error } = await supabase
    .from("showtimes")
    .select("*, screens(*, theaters(*))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as ShowtimeWithDetails | null;
};

export const fetchSeatTiers = async (screenId: string): Promise<SeatTier[]> => {
  const { data, error } = await supabase
    .from("seat_tiers")
    .select("*")
    .eq("screen_id", screenId)
    .order("row_start", { ascending: true });
  if (error) throw error;
  return (data || []) as SeatTier[];
};

export const fetchBookedSeats = async (showtimeId: string): Promise<BookedSeat[]> => {
  const { data, error } = await supabase
    .from("booking_seats")
    .select("row_number, seat_number")
    .eq("showtime_id", showtimeId);
  if (error) throw error;
  return (data || []) as BookedSeat[];
};

export const getTierForRow = (row: number, tiers: SeatTier[]): SeatTier | null => {
  return tiers.find((t) => row >= t.row_start && row <= t.row_end) || null;
};

export const calculateSeatPrice = (basePrice: number, multiplier: number) => {
  return Math.round(basePrice * multiplier * 100) / 100;
};

export const createBooking = async (params: {
  userId: string;
  showtime: ShowtimeWithDetails;
  seats: SelectedSeat[];
}) => {
  const totalAmount = params.seats.reduce((sum, s) => sum + s.price, 0);

  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .insert({
      user_id: params.userId,
      showtime_id: params.showtime.id,
      total_amount: totalAmount,
      status: "confirmed",
    })
    .select()
    .single();
  if (bookingErr) throw bookingErr;

  const seatRows = params.seats.map((s) => ({
    booking_id: booking.id,
    showtime_id: params.showtime.id,
    row_number: s.row,
    seat_number: s.seat,
    tier: s.tier,
    price: s.price,
  }));

  const { error: seatsErr } = await supabase.from("booking_seats").insert(seatRows);
  if (seatsErr) {
    // attempt rollback
    await supabase.from("bookings").delete().eq("id", booking.id);
    throw seatsErr;
  }

  return booking;
};

export const fetchMyBookings = async () => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, showtimes(*, screens(*, theaters(*))), booking_seats(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const isAdmin = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return !!data;
};
