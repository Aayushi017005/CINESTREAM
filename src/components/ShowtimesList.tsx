import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchShowtimesForMovie, type ShowtimeWithDetails } from "@/lib/bookingData";

interface Props {
  movieId: number;
}

const ShowtimesList = ({ movieId }: Props) => {
  const [showtimes, setShowtimes] = useState<ShowtimeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShowtimesForMovie(movieId)
      .then(setShowtimes)
      .catch(() => setShowtimes([]))
      .finally(() => setLoading(false));
  }, [movieId]);

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="font-display text-2xl text-foreground mb-4">BOOK TICKETS</h2>
        <p className="text-muted-foreground font-body text-sm animate-pulse">Loading showtimes...</p>
      </div>
    );
  }

  if (showtimes.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="font-display text-2xl text-foreground mb-4">BOOK TICKETS</h2>
        <div className="glass-card rounded-xl p-6 text-center">
          <Ticket className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground font-body text-sm">
            No showtimes scheduled for this movie yet.
          </p>
        </div>
      </div>
    );
  }

  // Group by theater
  const grouped = showtimes.reduce<Record<string, ShowtimeWithDetails[]>>((acc, st) => {
    const key = `${st.screens.theaters.id}::${st.screens.theaters.name}::${st.screens.theaters.city}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(st);
    return acc;
  }, {});

  return (
    <div className="mb-12">
      <h2 className="font-display text-2xl text-foreground mb-4">BOOK TICKETS</h2>
      <div className="space-y-4">
        {Object.entries(grouped).map(([key, sts]) => {
          const [, name, city] = key.split("::");
          return (
            <div key={key} className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-body font-semibold text-foreground">{name}</span>
                <span className="font-body text-sm text-muted-foreground">· {city}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sts.map((st) => {
                  const d = new Date(st.start_time);
                  return (
                    <Button
                      key={st.id}
                      variant="outline"
                      onClick={() => navigate(`/book/${st.id}`)}
                      className="border-border hover:border-primary hover:bg-primary/10 font-body"
                    >
                      <Calendar className="w-3 h-3" />
                      {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      <Clock className="w-3 h-3 ml-1" />
                      {d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      <span className="ml-2 text-accent">${Number(st.base_price).toFixed(2)}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShowtimesList;
