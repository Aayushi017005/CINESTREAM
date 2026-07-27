import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { type TMDBMovie, getImageUrl, genreMap } from "@/lib/movieData";

interface MovieCardProps {
  movie: TMDBMovie;
  onSelect?: (movie: TMDBMovie) => void;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const navigate = useNavigate();
  const posterUrl = getImageUrl(movie.poster_path);
  const genre = movie.genre_ids?.[0] ? genreMap[movie.genre_ids[0]] : "Movie";

  return (
    <button
      onClick={() => navigate(`/movie/${movie.id}`)}
      className="group relative rounded-lg overflow-hidden hover-lift cursor-pointer text-left w-full"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="aspect-[2/3] overflow-hidden bg-secondary">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body text-sm">
            No Image
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <h3 className="font-display text-xl text-foreground leading-tight">{movie.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <Star className="w-4 h-4 text-accent fill-accent" />
          <span className="text-accent font-body text-sm font-semibold">
            {movie.vote_average.toFixed(1)}
          </span>
          <span className="text-muted-foreground font-body text-sm">
            • {movie.release_date?.slice(0, 4)}
          </span>
        </div>
        <span className="inline-block mt-2 text-xs font-body font-semibold text-primary bg-primary/20 px-2 py-1 rounded">
          {genre}
        </span>
      </div>
    </button>
  );
};

export default MovieCard;
