import { Film, Search, LogOut, User, Bookmark, Ticket, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAdmin } from "@/lib/bookingData";

interface NavbarProps {
  onSearchClick?: () => void;
}

const Navbar = ({ onSearchClick }: NavbarProps) => {
  const { displayName, signOut, user } = useAuth();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (user) isAdmin(user.id).then(setAdmin);
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <Film className="w-7 h-7 text-primary" />
          <span className="font-display text-2xl tracking-wider text-foreground">CineStream</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-body text-sm font-semibold text-muted-foreground">
          <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Home</button>
          <button onClick={() => navigate("/watchlist")} className="hover:text-foreground transition-colors">Watchlist</button>
          <button onClick={() => navigate("/my-bookings")} className="hover:text-foreground transition-colors">My Bookings</button>
          {admin && (
            <button onClick={() => navigate("/admin")} className="hover:text-foreground transition-colors flex items-center gap-1">
              <Shield className="w-4 h-4" /> Admin
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground font-body text-sm mr-2">
            <User className="w-4 h-4" />
            <span className="text-foreground font-semibold">{displayName || "User"}</span>
          </div>
          <button onClick={() => navigate("/my-bookings")} className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="My Bookings">
            <Ticket className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={() => navigate("/watchlist")} className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Watchlist">
            <Bookmark className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={onSearchClick} className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Search">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={signOut} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-primary" aria-label="Sign out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
