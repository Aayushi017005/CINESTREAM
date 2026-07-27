import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { type TMDBMovie, getImageUrl, genreMap } from "@/lib/movieData";

interface MovieDetailDialogProps {
  movie: TMDBMovie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReview: (movie: TMDBMovie) => void;
}

const MovieDetailDialog = ({ movie, open, onOpenChange, onReview }: MovieDetailDialogProps) => {
  if (!movie) return null;
  const backdrop = getImageUrl(movie.backdrop_path, "w780");
  const poster = getImageUrl(movie.poster_path, "w500");
  const genres = movie.genre_ids?.map((id) => genreMap[id]).filter(Boolean).join(", ") || "Movie";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border p-0 overflow-hidden">
        {backdrop && (
          <div className="relative h-48 w-full">
            <img src={backdrop} alt={movie.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          </div>
        )}
        <div className="p-6 pt-2">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl text-foreground">{movie.title}</DialogTitle>
            <DialogDescription className="sr-only">Details for {movie.title}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 mt-2 mb-4">
            <div className="flex items-center gap-1 text-accent">
              <Star className="w-4 h-4 fill-accent" />
              <span className="font-body font-semibold text-sm">{movie.vote_average.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground font-body text-sm">{movie.release_date?.slice(0, 4)}</span>
            <span className="text-muted-foreground font-body text-sm">{genres}</span>
          </div>
          <p className="text-secondary-foreground font-body text-sm leading-relaxed mb-4">{movie.overview}</p>
          <div className="flex gap-3">
            {poster && <img src={poster} alt={movie.title} className="w-24 rounded-lg" />}
            <button
              onClick={() => { onOpenChange(false); onReview(movie); }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold px-6 py-2 rounded-lg transition-colors h-fit"
            >
              Write a Review
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailDialog;
