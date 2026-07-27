import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, Calendar, Bookmark, BookmarkCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import ReviewSection from "@/components/ReviewSection";
import SearchBar from "@/components/SearchBar";
import { fetchMovieDetail, fetchMovieVideos, fetchOMDbData, type TMDBMovieDetail, type TMDBVideo, type TMDBMovie, type OMDbData, getImageUrl } from "@/lib/movieData";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "@/lib/watchlistData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ExternalRatings from "@/components/ExternalRatings";
import ShowtimesList from "@/components/ShowtimesList";

const MoviePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movie, setMovie] = useState<TMDBMovieDetail | null>(null);
  const [videos, setVideos] = useState<TMDBVideo[]>([]);
  const [omdbData, setOmdbData] = useState<OMDbData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;
    const movieId = parseInt(id);
    setLoading(true);
    setOmdbData(null);
    Promise.all([fetchMovieDetail(movieId), fetchMovieVideos(movieId)])
      .then(([detail, vids]) => {
        setMovie(detail);
        setVideos(vids);
        if (detail.imdb_id) {
          fetchOMDbData(detail.imdb_id).then(setOmdbData).catch(() => {});
        }
      })
      .catch(err => {
        console.error("Failed to fetch movie:", err);
        toast({ title: "Error", description: "Failed to load movie details.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
    isInWatchlist(parseInt(id)).then(setInWatchlist).catch(() => {});
  }, [id, toast]);

  const handleSelectMovie = (m: TMDBMovie) => navigate(`/movie/${m.id}`);

  const handleToggleWatchlist = async () => {
    if (!user || !movie) return;
    try {
      if (inWatchlist) {
        await removeFromWatchlist(movie.id);
        setInWatchlist(false);
        toast({ title: "Removed", description: "Removed from your watchlist." });
      } else {
        const movieData: TMDBMovie = {
          id: movie.id, title: movie.title, overview: movie.overview,
          poster_path: movie.poster_path, backdrop_path: movie.backdrop_path,
          release_date: movie.release_date, vote_average: movie.vote_average,
          genre_ids: movie.genres?.map(g => g.id) || [],
        };
        await addToWatchlist(user.id, movieData);
        setInWatchlist(true);
        toast({ title: "Added", description: "Added to your watchlist!" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update watchlist.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onSearchClick={() => setSearchOpen(true)} />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground font-body text-lg animate-pulse">Loading movie...</div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onSearchClick={() => setSearchOpen(true)} />
        <div className="pt-24 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-muted-foreground font-body text-lg">Movie not found</p>
          <button onClick={() => navigate("/")} className="text-primary font-body hover:underline">← Back to home</button>
        </div>
      </div>
    );
  }

  const backdrop = getImageUrl(movie.backdrop_path, "original");
  const poster = getImageUrl(movie.poster_path, "w500");
  const hours = Math.floor((movie.runtime || 0) / 60);
  const mins = (movie.runtime || 0) % 60;

  const movieForReview: TMDBMovie = {
    id: movie.id, title: movie.title, overview: movie.overview,
    poster_path: movie.poster_path, backdrop_path: movie.backdrop_path,
    release_date: movie.release_date, vote_average: movie.vote_average,
    genre_ids: movie.genres?.map(g => g.id) || [],
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearchClick={() => setSearchOpen(true)} />

      {backdrop && (
        <div className="relative h-[50vh] w-full overflow-hidden">
          <img src={backdrop} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
          <div className="absolute inset-0 bg-background/50" />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16" style={{ marginTop: backdrop ? "-12rem" : "5rem" }}>
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            {poster && (
              <img src={poster} alt={movie.title} className="w-48 md:w-56 rounded-xl shadow-2xl flex-shrink-0" />
            )}
            <div className="flex-1">
              <h1 className="font-display text-4xl md:text-6xl text-foreground mb-2 leading-none">{movie.title}</h1>
              {movie.tagline && <p className="text-primary font-body italic text-lg mb-4">"{movie.tagline}"</p>}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <button
                  onClick={handleToggleWatchlist}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm font-semibold transition-colors ${
                    inWatchlist
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-primary/20"
                  }`}
                >
                  {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </button>
                <div className="flex items-center gap-1 text-accent">
                  <Star className="w-5 h-5 fill-accent" />
                  <span className="font-body font-bold text-lg">{movie.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="font-body text-sm">{movie.release_date?.slice(0, 4)}</span>
                </div>
                {movie.runtime > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="font-body text-sm">{hours}h {mins}m</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres?.map(g => (
                  <span key={g.id} className="px-3 py-1 rounded-lg bg-primary/20 text-primary font-body text-xs font-semibold">
                    {g.name}
                  </span>
                ))}
              </div>
              <h2 className="font-display text-xl text-foreground mb-2">OVERVIEW</h2>
              <p className="text-secondary-foreground font-body text-sm leading-relaxed">{movie.overview}</p>
            </div>
          </div>

          {/* External Ratings */}
          <ExternalRatings omdbData={omdbData} />

          {/* Showtimes / Booking */}
          <ShowtimesList movieId={movie.id} />

          {/* Video player */}
          <div className="mb-12">
            <h2 className="font-display text-2xl text-foreground mb-4">WATCH TRAILER</h2>
            <VideoPlayer videos={videos} movieTitle={movie.title} />
          </div>

          {movie.production_companies?.length > 0 && (
            <div className="mb-12">
              <h2 className="font-display text-xl text-foreground mb-3">PRODUCTION</h2>
              <div className="flex flex-wrap gap-4">
                {movie.production_companies.map(c => (
                  <div key={c.id} className="glass-card rounded-lg px-4 py-2 flex items-center gap-2">
                    {c.logo_path && <img src={getImageUrl(c.logo_path, "w500")!} alt={c.name} className="h-6 object-contain" />}
                    <span className="font-body text-sm text-foreground">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ReviewSection selectedMovie={movieForReview} allMovies={[movieForReview]} />
        </motion.div>
      </div>

      {searchOpen && <SearchBar onSelectMovie={handleSelectMovie} onClose={() => setSearchOpen(false)} />}

      <footer className="border-t border-border py-8 px-6 text-center mt-12">
        <p className="text-muted-foreground font-body text-sm">© 2025 CineBook. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MoviePage;
