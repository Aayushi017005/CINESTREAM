import { motion } from "framer-motion";
import { Play, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { type TMDBMovie, getImageUrl } from "@/lib/movieData";

interface HeroBannerProps {
  movie: TMDBMovie | null;
}

const HeroBanner = ({ movie }: HeroBannerProps) => {
  const navigate = useNavigate();
  const backdropUrl = movie
    ? getImageUrl(movie.backdrop_path, "original")
    : null;

  const goToMovie = () => {
    if (movie) navigate(`/movie/${movie.id}`);
  };

  return (
    <section id="home" className="relative h-[85vh] w-full overflow-hidden">
      {backdropUrl ? (
        <img
          src={backdropUrl}
          alt={movie?.title || "Featured movie"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-secondary" />
      )}

      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="absolute inset-0 bg-background/40" />

      <div className="relative z-10 h-full flex items-end pb-20 px-6 md:px-16">
        <motion.div
          key={movie?.id}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <h1 className="text-5xl md:text-7xl font-display text-foreground mb-4 leading-none">
            {movie?.title || "LOADING..."}
          </h1>

          <p className="text-muted-foreground font-body text-lg mb-6 leading-relaxed line-clamp-3">
            {movie?.overview || "Discovering the best movies for you..."}
          </p>

          <div className="flex gap-4">
            <Button
              onClick={goToMovie}
              disabled={!movie}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold px-8 py-6 text-base gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Now
            </Button>

            <Button
              onClick={goToMovie}
              disabled={!movie}
              variant="outline"
              className="border-foreground/20 text-foreground hover:bg-secondary font-body font-semibold px-8 py-6 text-base gap-2"
            >
              <Info className="w-5 h-5" />
              More Info
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;