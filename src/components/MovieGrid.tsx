import { motion } from "framer-motion";
import MovieCard from "./MovieCard";
import { type TMDBMovie } from "@/lib/movieData";

interface MovieGridProps {
  title: string;
  movies: TMDBMovie[];
  onSelectMovie: (movie: TMDBMovie) => void;
  loading?: boolean;
}

const MovieGrid = ({ title, movies, onSelectMovie, loading }: MovieGridProps) => {
  return (
    <section className="px-6 md:px-16 py-8 max-w-7xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-4xl font-display text-foreground mb-8"
      >
        {title}
      </motion.h2>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie, i) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <MovieCard movie={movie} onSelect={onSelectMovie} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MovieGrid;
