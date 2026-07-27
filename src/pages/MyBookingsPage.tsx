import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Ticket, MapPin, Calendar, Clock, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { fetchMyBookings } from "@/lib/bookingData";

type BookingRow = {
  id: string;
  status: string;
  total_amount: number;
  confirmation_code: string;
  created_at: string;
  showtimes: {
    movie_id: number;
    movie_title: string;
    poster_path: string | null;
    start_time: string;
    screens: { name: string; theaters: { name: string; city: string } };
  };
  booking_seats: { row_number: number; seat_number: number; tier: string; price: number }[];
};

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings()
      .then((data) => setBookings(data as unknown as BookingRow[]))
      .catch(() => toast({ title: "Error", description: "Failed to load bookings.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 max-w-5xl mx-auto px-6 pb-12">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <h1 className="font-display text-4xl text-foreground mb-8">MY BOOKINGS</h1>

        {loading ? (
          <p className="text-muted-foreground font-body animate-pulse">Loading...</p>
        ) : bookings.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-body text-muted-foreground mb-4">No bookings yet</p>
            <button onClick={() => navigate("/")} className="text-primary font-body hover:underline">
              Browse movies →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, i) => {
              const start = new Date(b.showtimes.start_time);
              const seatLabels = b.booking_seats
                .sort((a, b2) => a.row_number - b2.row_number || a.seat_number - b2.seat_number)
                .map((s) => `${String.fromCharCode(64 + s.row_number)}${s.seat_number}`)
                .join(", ");
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {b.showtimes.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${b.showtimes.poster_path}`}
                        alt={b.showtimes.movie_title}
                        className="w-24 rounded-lg flex-shrink-0 cursor-pointer"
                        onClick={() => navigate(`/movie/${b.showtimes.movie_id}`)}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-display text-2xl text-foreground">{b.showtimes.movie_title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-body font-semibold ${
                            b.status === "confirmed"
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-muted-foreground font-body text-sm mb-3">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {b.showtimes.screens.theaters.name} · {b.showtimes.screens.theaters.city}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="font-body text-sm text-foreground mb-1">
                        <span className="text-muted-foreground">Seats:</span> {seatLabels}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <div>
                          <p className="font-body text-xs text-muted-foreground">Confirmation</p>
                          <p className="font-display text-lg text-accent tracking-wider">
                            {b.confirmation_code}
                          </p>
                        </div>
                        <p className="font-display text-2xl text-foreground">
                          ${Number(b.total_amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
