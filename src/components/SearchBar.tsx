import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { searchTMDBMovies, type TMDBMovie, getImageUrl } from "@/lib/movieData";

interface SearchBarProps {
  onSelectMovie: (movie: TMDBMovie) => void;
  onClose: () => void;
}

const SearchBar = ({ onSelectMovie, onClose }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const movies = await searchTMDBMovies(query.trim());
        setResults(movies.slice(0, 8));
      } catch { setResults([]); }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-sm flex flex-col items-center pt-24 px-4">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 bg-secondary border border-border rounded-xl px-4 py-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies..."
            className="flex-1 bg-transparent font-body text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
        </div>
        {loading && <p className="text-muted-foreground font-body text-sm mt-4 text-center">Searching...</p>}
        {results.length > 0 && (
          <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {results.map((m) => (
              <button
                key={m.id}
                onClick={() => { onSelectMovie(m); onClose(); }}
                className="w-full flex items-center gap-4 p-3 rounded-lg bg-card hover:bg-secondary transition-colors text-left"
              >
                {getImageUrl(m.poster_path) ? (
                  <img src={getImageUrl(m.poster_path)!} alt={m.title} className="w-12 h-18 rounded object-cover" />
                ) : (
                  <div className="w-12 h-18 rounded bg-muted" />
                )}
                <div>
                  <p className="font-body font-semibold text-foreground text-sm">{m.title}</p>
                  <p className="text-muted-foreground font-body text-xs">{m.release_date?.slice(0, 4)} • ⭐ {m.vote_average.toFixed(1)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
