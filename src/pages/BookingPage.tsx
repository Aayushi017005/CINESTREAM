import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Clock, Ticket } from "lucide-react";
import Navbar from "@/components/Navbar";
import SeatGrid from "@/components/SeatGrid";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchShowtime,
  fetchSeatTiers,
  fetchBookedSeats,
  createBooking,
  type ShowtimeWithDetails,
  type SeatTier,
  type BookedSeat,
  type SelectedSeat,
} from "@/lib/bookingData";

const BookingPage = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [showtime, setShowtime] = useState<ShowtimeWithDetails | null>(null);
  const [tiers, setTiers] = useState<SeatTier[]>([]);
  const [booked, setBooked] = useState<BookedSeat[]>([]);
  const [selected, setSelected] = useState<SelectedSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!showtimeId) return;
    setLoading(true);
    fetchShowtime(showtimeId)
      .then(async (st) => {
        if (!st) {
          setLoading(false);
          return;
        }
        setShowtime(st);
        const [tierList, seatList] = await Promise.all([
          fetchSeatTiers(st.screen_id),
          fetchBookedSeats(st.id),
        ]);
        setTiers(tierList);
        setBooked(seatList);
      })
      .catch(() =>
        toast({ title: "Error", description: "Failed to load showtime.", variant: "destructive" })
      )
      .finally(() => setLoading(false));
  }, [showtimeId, toast]);

  // Realtime updates for booked seats
  useEffect(() => {
    if (!showtimeId) return;
    const channel = supabase
      .channel(`booking_seats:${showtimeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "booking_seats", filter: `showtime_id=eq.${showtimeId}` },
        (payload) => {
          const row = payload.new as { row_number: number; seat_number: number };
          setBooked((prev) => [...prev, { row_number: row.row_number, seat_number: row.seat_number }]);
          // Remove from selection if someone else booked it
          setSelected((prev) =>
            prev.filter((s) => !(s.row === row.row_number && s.seat === row.seat_number))
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [showtimeId]);

  const toggleSeat = (seat: SelectedSeat) => {
    setSelected((prev) => {
      const exists = prev.find((s) => s.row === seat.row && s.seat === seat.seat);
      if (exists) return prev.filter((s) => !(s.row === seat.row && s.seat === seat.seat));
      if (prev.length >= 10) {
        toast({ title: "Limit reached", description: "Max 10 seats per booking." });
        return prev;
      }
      return [...prev, seat];
    });
  };

  const handleConfirm = async () => {
    if (!user || !showtime || selected.length === 0) return;
    setSubmitting(true);
    try {
      const booking = await createBooking({ userId: user.id, showtime, seats: selected });
      toast({
        title: "Booking confirmed!",
        description: `Confirmation code: ${booking.confirmation_code}`,
      });
      navigate("/my-bookings");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Booking failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const total = selected.reduce((sum, s) => sum + s.price, 0);
  const startDate = showtime ? new Date(showtime.start_time) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground font-body animate-pulse">Loading showtime...</div>
        </div>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-muted-foreground font-body">Showtime not found</p>
          <button onClick={() => navigate("/")} className="text-primary font-body hover:underline">
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 max-w-5xl mx-auto px-6 pb-12">
        <button
          onClick={() => navigate(`/movie/${showtime.movie_id}`)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to movie
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h1 className="font-display text-3xl text-foreground mb-2">{showtime.movie_title}</h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground font-body text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {showtime.screens.theaters.name} · {showtime.screens.theaters.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {startDate?.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {startDate?.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span>Screen: {showtime.screens.name}</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="font-display text-xl text-foreground mb-4 text-center">SELECT YOUR SEATS</h2>
            <SeatGrid
              totalRows={showtime.screens.total_rows}
              seatsPerRow={showtime.screens.seats_per_row}
              tiers={tiers}
              bookedSeats={booked}
              selectedSeats={selected}
              basePrice={Number(showtime.base_price)}
              onToggleSeat={toggleSeat}
            />
          </div>

          {/* Summary */}
          <div className="glass-card rounded-2xl p-6 sticky bottom-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-body text-sm text-muted-foreground">
                  {selected.length} seat{selected.length === 1 ? "" : "s"} selected
                </p>
                <p className="font-display text-2xl text-foreground">${total.toFixed(2)}</p>
                {selected.length > 0 && (
                  <p className="font-body text-xs text-muted-foreground mt-1">
                    {selected
                      .sort((a, b) => a.row - b.row || a.seat - b.seat)
                      .map((s) => `${String.fromCharCode(64 + s.row)}${s.seat}`)
                      .join(", ")}
                  </p>
                )}
              </div>
              <Button
                onClick={handleConfirm}
                disabled={selected.length === 0 || submitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold px-8 py-6 text-base"
              >
                <Ticket className="w-4 h-4" />
                {submitting ? "Confirming..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingPage;
