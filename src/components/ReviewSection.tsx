import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchReviews, submitReview, type Review, type TMDBMovie } from "@/lib/movieData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ReviewSectionProps {
  selectedMovie: TMDBMovie | null;
  allMovies: TMDBMovie[];
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={!interactive}
        onClick={() => onRate?.(star)}
        className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
      >
        <Star className={`w-5 h-5 ${star <= rating ? "text-accent fill-accent" : "text-muted-foreground"}`} />
      </button>
    ))}
  </div>
);

const ReviewSection = ({ selectedMovie }: ReviewSectionProps) => {
  const { user, displayName } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const movieId = selectedMovie?.id || 0;

  useEffect(() => {
    if (!movieId) return;
    fetchReviews(movieId).then(setReviews).catch(() => setReviews([]));
  }, [movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || rating === 0 || !movieId || !user) return;
    setSubmitting(true);
    try {
      const newReview = await submitReview({
        movie_id: movieId,
        user_id: user.id,
        author: displayName || user.email || "Anonymous",
        rating,
        text: text.trim(),
      });
      setReviews((prev) => [newReview, ...prev]);
      setText("");
      setRating(0);
      toast({ title: "Review submitted!", description: "Your review has been posted." });
    } catch (err) {
      console.error("Review submit error:", err);
      toast({ title: "Error", description: "Failed to submit review. Please try again.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <section id="reviews" className="py-16">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-4xl font-display text-foreground mb-8"
      >
        REVIEWS
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="font-display text-2xl text-foreground mb-1">WRITE A REVIEW</h3>
          <p className="text-muted-foreground font-body text-sm mb-6">
            For: <span className="text-accent font-semibold">{selectedMovie?.title || "Select a movie"}</span>
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-body font-semibold text-muted-foreground mb-1">Rating</label>
              <StarRating rating={rating} onRate={setRating} interactive />
            </div>
            <div>
              <label className="block text-sm font-body font-semibold text-muted-foreground mb-1">Your Review</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Share your thoughts about this movie..."
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={!text.trim() || rating === 0 || submitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold py-6 gap-2 disabled:opacity-40"
            >
              <Send className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </motion.div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {reviews.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground font-body">
                No reviews yet. Be the first to review!
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-body font-semibold text-foreground text-sm">{review.author}</p>
                        <p className="text-xs text-muted-foreground font-body">
                          {new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-secondary-foreground font-body text-sm leading-relaxed">{review.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;