import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Trash2, Star, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { getWatchlist, removeFromWatchlist, type WatchlistItem } from "@/lib/watchlistData";
import { getImageUrl, genreMap, type TMDBMovie } from "@/lib/movieData";
import { useToast } from "@/hooks/use-toast";

const WatchlistPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    getWatchlist()
      .then(setItems)
      .catch(() => toast({ title: "Error", description: "Failed to load watchlist.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleRemove = async (movieId: number) => {
    try {
      await removeFromWatchlist(movieId);
      setItems(prev => prev.filter(i => i.movie_id !== movieId));
      toast({ title: "Removed", description: "Movie removed from watchlist." });
    } catch {
      toast({ title: "Error", description: "Failed to remove.", variant: "destructive" });
    }
  };

  const handleSelectMovie = (m: TMDBMovie) => navigate(`/movie/${m.id}`);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearchClick={() => setSearchOpen(true)} />
      <div className="pt-24 max-w-7xl mx-auto px-6 md:px-16">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-7 h-7 text-primary fill-primary" />
          <h1 className="font-display text-3xl md:text-4xl text-foreground">MY WATCHLIST</h1>
        </div>

        {loading ? (
          <p className="text-muted-foreground font-body animate-pulse">Loading watchlist...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-body text-lg">Your watchlist is empty</p>
            <p className="text-muted-foreground/60 font-body text-sm mt-1">Browse movies and click the bookmark icon to save them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            <AnimatePresence>
              {items.map(item => {
                const poster = getImageUrl(item.poster_path, "w500");
                const genre = item.genre_ids?.[0] ? genreMap[item.genre_ids[0]] : null;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="group relative rounded-xl overflow-hidden bg-card border border-border cursor-pointer"
                    onClick={() => navigate(`/movie/${item.movie_id}`)}
                  >
                    <div className="aspect-[2/3] bg-muted">
                      {poster ? (
                        <img src={poster} alt={item.movie_title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body text-xs">No poster</div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                      <p className="font-body text-sm font-semibold text-white truncate">{item.movie_title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-accent text-accent" />
                          <span className="text-white/80 font-body text-xs">{Number(item.vote_average).toFixed(1)}</span>
                        </div>
                        {genre && <span className="text-primary font-body text-xs">{genre}</span>}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(item.movie_id); }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                      aria-label="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {searchOpen && <SearchBar onSelectMovie={handleSelectMovie} onClose={() => setSearchOpen(false)} />}

      <footer className="border-t border-border py-8 px-6 text-center mt-12">
        <p className="text-muted-foreground font-body text-sm">© 2025 CineBook. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WatchlistPage;
