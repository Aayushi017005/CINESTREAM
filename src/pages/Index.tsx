import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import MovieGrid from "@/components/MovieGrid";
import SearchBar from "@/components/SearchBar";
import { fetchTMDBMovies, type TMDBMovie } from "@/lib/movieData";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { title: "POPULAR NOW", endpoint: "/movie/popular?language=en-US&page=1" },
  { title: "TOP RATED", endpoint: "/movie/top_rated?language=en-US&page=1" },
  { title: "HORROR", endpoint: "/discover/movie?with_genres=27&language=en-US&page=1" },
  { title: "ACTION", endpoint: "/discover/movie?with_genres=28&language=en-US&page=1" },
  { title: "COMEDY", endpoint: "/discover/movie?with_genres=35&language=en-US&page=1" },
  { title: "SCI-FI", endpoint: "/discover/movie?with_genres=878&language=en-US&page=1" },
];

const Index = () => {
  const [categories, setCategories] = useState<Record<string, TMDBMovie[]>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const results = await Promise.all(CATEGORIES.map((c) => fetchTMDBMovies(c.endpoint)));
        const map: Record<string, TMDBMovie[]> = {};
        CATEGORIES.forEach((c, i) => { map[c.title] = results[i].slice(0, 12); });
        setCategories(map);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
        toast({ title: "Error", description: "Failed to load movies from TMDB.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, [toast]);

  const heroMovie = categories["POPULAR NOW"]?.[0] || null;

  const handleSelectMovie = (movie: TMDBMovie) => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearchClick={() => setSearchOpen(true)} />
      <HeroBanner movie={heroMovie} />
      <div id="movies">
        {CATEGORIES.map((c) => (
          <MovieGrid key={c.title} title={c.title} movies={categories[c.title] || []} onSelectMovie={handleSelectMovie} loading={loading} />
        ))}
      </div>
      {searchOpen && <SearchBar onSelectMovie={handleSelectMovie} onClose={() => setSearchOpen(false)} />}
      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-muted-foreground font-body text-sm">© 2025 CineBook. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
