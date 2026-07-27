import { motion } from "framer-motion";
import type { OMDbData } from "@/lib/movieData";

interface ExternalRatingsProps {
  omdbData: OMDbData | null;
}

const ExternalRatings = ({ omdbData }: ExternalRatingsProps) => {
  if (!omdbData) return null;

  const imdbRating = omdbData.imdbRating !== "N/A" ? omdbData.imdbRating : null;
  const imdbVotes = omdbData.imdbVotes !== "N/A" ? omdbData.imdbVotes : null;
  const metascore = omdbData.Metascore !== "N/A" ? omdbData.Metascore : null;
  const rtRating = omdbData.Ratings?.find(r => r.Source === "Rotten Tomatoes");

  if (!imdbRating && !metascore && !rtRating) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-12"
    >
      <h2 className="font-display text-xl text-foreground mb-4">EXTERNAL RATINGS</h2>
      <div className="flex flex-wrap gap-4">
        {/* IMDb */}
        {imdbRating && (
          <div className="glass-card rounded-xl px-6 py-4 flex flex-col items-center gap-1 min-w-[140px]">
            <span className="font-display text-sm text-accent tracking-wider">IMDb</span>
            <span className="font-display text-3xl text-foreground">{imdbRating}</span>
            <span className="font-body text-xs text-muted-foreground">/10</span>
            {imdbVotes && (
              <span className="font-body text-xs text-muted-foreground mt-1">{imdbVotes} votes</span>
            )}
          </div>
        )}

        {/* Rotten Tomatoes */}
        {rtRating && (
          <div className="glass-card rounded-xl px-6 py-4 flex flex-col items-center gap-1 min-w-[140px]">
            <span className="font-display text-sm text-destructive tracking-wider">🍅 Rotten Tomatoes</span>
            <span className="font-display text-3xl text-foreground">{rtRating.Value}</span>
          </div>
        )}

        {/* Metascore */}
        {metascore && (
          <div className="glass-card rounded-xl px-6 py-4 flex flex-col items-center gap-1 min-w-[140px]">
            <span className="font-display text-sm text-primary tracking-wider">Metascore</span>
            <span className="font-display text-3xl text-foreground">{metascore}</span>
            <span className="font-body text-xs text-muted-foreground">/100</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ExternalRatings;
