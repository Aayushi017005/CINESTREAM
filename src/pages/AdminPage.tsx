import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, ArrowLeft, Building2, Monitor, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin, type Theater, type Screen, type Showtime } from "@/lib/bookingData";

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [showtimes, setShowtimes] = useState<(Showtime & { screens: { name: string; theaters: { name: string } } })[]>([]);

  // Theater form
  const [tName, setTName] = useState("");
  const [tCity, setTCity] = useState("");
  const [tAddress, setTAddress] = useState("");

  // Screen form
  const [sTheater, setSTheater] = useState("");
  const [sName, setSName] = useState("");
  const [sRows, setSRows] = useState("8");
  const [sSeats, setSSeats] = useState("10");

  // Showtime form
  const [stMovieId, setStMovieId] = useState("");
  const [stMovieTitle, setStMovieTitle] = useState("");
  const [stPoster, setStPoster] = useState("");
  const [stScreen, setStScreen] = useState("");
  const [stTime, setStTime] = useState("");
  const [stPrice, setStPrice] = useState("12.00");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setAuthorized(false);
      return;
    }
    isAdmin(user.id).then(setAuthorized);
  }, [user, authLoading]);

  const loadAll = async () => {
    const [t, s, st] = await Promise.all([
      supabase.from("theaters").select("*").order("name"),
      supabase.from("screens").select("*").order("name"),
      supabase
        .from("showtimes")
        .select("*, screens(name, theaters(name))")
        .order("start_time", { ascending: false }),
    ]);
    setTheaters((t.data || []) as Theater[]);
    setScreens((s.data || []) as Screen[]);
    setShowtimes((st.data || []) as never);
  };

  useEffect(() => {
    if (authorized) loadAll();
  }, [authorized]);

  const addTheater = async () => {
    if (!tName.trim() || !tCity.trim()) return;
    const { error } = await supabase.from("theaters").insert({ name: tName, city: tCity, address: tAddress || null });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setTName(""); setTCity(""); setTAddress("");
    toast({ title: "Theater added" });
    loadAll();
  };

  const addScreen = async () => {
    if (!sTheater || !sName.trim()) return;
    const totalRows = parseInt(sRows);
    const seatsPerRow = parseInt(sSeats);
    const { data, error } = await supabase
      .from("screens")
      .insert({ theater_id: sTheater, name: sName, total_rows: totalRows, seats_per_row: seatsPerRow })
      .select()
      .single();
    if (error || !data) {
      toast({ title: "Error", description: error?.message || "Failed", variant: "destructive" });
      return;
    }
    // auto-create default tiers
    const third = Math.max(1, Math.floor(totalRows / 3));
    const tierRows = [
      { screen_id: data.id, tier: "standard" as const, row_start: 1, row_end: third, price_multiplier: 1.0 },
      { screen_id: data.id, tier: "premium" as const, row_start: third + 1, row_end: third * 2, price_multiplier: 1.5 },
      { screen_id: data.id, tier: "vip" as const, row_start: third * 2 + 1, row_end: totalRows, price_multiplier: 2.0 },
    ];
    await supabase.from("seat_tiers").insert(tierRows);
    setSName(""); setSTheater("");
    toast({ title: "Screen added with default tiers" });
    loadAll();
  };

  const addShowtime = async () => {
    if (!stMovieId || !stMovieTitle.trim() || !stScreen || !stTime) return;
    const { error } = await supabase.from("showtimes").insert({
      movie_id: parseInt(stMovieId),
      movie_title: stMovieTitle,
      poster_path: stPoster || null,
      screen_id: stScreen,
      start_time: new Date(stTime).toISOString(),
      base_price: parseFloat(stPrice),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setStMovieId(""); setStMovieTitle(""); setStPoster(""); setStScreen(""); setStTime("");
    toast({ title: "Showtime added" });
    loadAll();
  };

  const deleteRow = async (table: "theaters" | "screens" | "showtimes", id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); loadAll(); }
  };

  if (authLoading || authorized === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center text-muted-foreground font-body">Loading...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 max-w-md mx-auto px-6 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">ADMIN ONLY</h1>
          <p className="text-muted-foreground font-body mb-6">
            You don't have permission to access this page. Ask an existing admin to grant you the admin role in the database.
          </p>
          <button onClick={() => navigate("/")} className="text-primary font-body hover:underline">
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 max-w-6xl mx-auto px-6 pb-12">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl text-foreground mb-8">ADMIN PANEL</h1>

          <Tabs defaultValue="theaters">
            <TabsList className="mb-6">
              <TabsTrigger value="theaters"><Building2 className="w-4 h-4" /> Theaters</TabsTrigger>
              <TabsTrigger value="screens"><Monitor className="w-4 h-4" /> Screens</TabsTrigger>
              <TabsTrigger value="showtimes"><Calendar className="w-4 h-4" /> Showtimes</TabsTrigger>
            </TabsList>

            <TabsContent value="theaters">
              <div className="glass-card rounded-2xl p-6 mb-6">
                <h2 className="font-display text-xl text-foreground mb-4">Add Theater</h2>
                <div className="grid md:grid-cols-3 gap-3 mb-3">
                  <div><Label>Name</Label><Input value={tName} onChange={(e) => setTName(e.target.value)} placeholder="CineBook IMAX" /></div>
                  <div><Label>City</Label><Input value={tCity} onChange={(e) => setTCity(e.target.value)} placeholder="New York" /></div>
                  <div><Label>Address</Label><Input value={tAddress} onChange={(e) => setTAddress(e.target.value)} placeholder="123 Main St" /></div>
                </div>
                <Button onClick={addTheater}><Plus className="w-4 h-4" /> Add</Button>
              </div>
              <div className="space-y-2">
                {theaters.map((t) => (
                  <div key={t.id} className="glass-card rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-body font-semibold text-foreground">{t.name}</p>
                      <p className="font-body text-sm text-muted-foreground">{t.city}{t.address ? ` · ${t.address}` : ""}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteRow("theaters", t.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {theaters.length === 0 && <p className="text-muted-foreground font-body text-sm">No theaters yet.</p>}
              </div>
            </TabsContent>

            <TabsContent value="screens">
              <div className="glass-card rounded-2xl p-6 mb-6">
                <h2 className="font-display text-xl text-foreground mb-4">Add Screen</h2>
                <div className="grid md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <Label>Theater</Label>
                    <Select value={sTheater} onValueChange={setSTheater}>
                      <SelectTrigger><SelectValue placeholder="Select theater" /></SelectTrigger>
                      <SelectContent>
                        {theaters.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Screen Name</Label><Input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Screen 1" /></div>
                  <div><Label>Rows</Label><Input type="number" min="1" max="20" value={sRows} onChange={(e) => setSRows(e.target.value)} /></div>
                  <div><Label>Seats per row</Label><Input type="number" min="1" max="20" value={sSeats} onChange={(e) => setSSeats(e.target.value)} /></div>
                </div>
                <p className="text-muted-foreground font-body text-xs mb-3">
                  Default tiers will be auto-created: bottom third = Standard, middle = Premium (1.5x), top = VIP (2x).
                </p>
                <Button onClick={addScreen}><Plus className="w-4 h-4" /> Add</Button>
              </div>
              <div className="space-y-2">
                {screens.map((s) => {
                  const theater = theaters.find((t) => t.id === s.theater_id);
                  return (
                    <div key={s.id} className="glass-card rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-body font-semibold text-foreground">{s.name}</p>
                        <p className="font-body text-sm text-muted-foreground">
                          {theater?.name || "—"} · {s.total_rows} rows × {s.seats_per_row} seats
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteRow("screens", s.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
                {screens.length === 0 && <p className="text-muted-foreground font-body text-sm">No screens yet.</p>}
              </div>
            </TabsContent>

            <TabsContent value="showtimes">
              <div className="glass-card rounded-2xl p-6 mb-6">
                <h2 className="font-display text-xl text-foreground mb-4">Add Showtime</h2>
                <div className="grid md:grid-cols-3 gap-3 mb-3">
                  <div><Label>TMDB Movie ID</Label><Input type="number" value={stMovieId} onChange={(e) => setStMovieId(e.target.value)} placeholder="1115544" /></div>
                  <div><Label>Movie Title</Label><Input value={stMovieTitle} onChange={(e) => setStMovieTitle(e.target.value)} placeholder="Movie Title" /></div>
                  <div><Label>Poster Path (optional)</Label><Input value={stPoster} onChange={(e) => setStPoster(e.target.value)} placeholder="/abc123.jpg" /></div>
                  <div>
                    <Label>Screen</Label>
                    <Select value={stScreen} onValueChange={setStScreen}>
                      <SelectTrigger><SelectValue placeholder="Select screen" /></SelectTrigger>
                      <SelectContent>
                        {screens.map((s) => {
                          const theater = theaters.find((t) => t.id === s.theater_id);
                          return <SelectItem key={s.id} value={s.id}>{theater?.name} · {s.name}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Date & Time</Label><Input type="datetime-local" value={stTime} onChange={(e) => setStTime(e.target.value)} /></div>
                  <div><Label>Base Price ($)</Label><Input type="number" step="0.01" value={stPrice} onChange={(e) => setStPrice(e.target.value)} /></div>
                </div>
                <Button onClick={addShowtime}><Plus className="w-4 h-4" /> Add</Button>
              </div>
              <div className="space-y-2">
                {showtimes.map((st) => (
                  <div key={st.id} className="glass-card rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-body font-semibold text-foreground">{st.movie_title}</p>
                      <p className="font-body text-sm text-muted-foreground">
                        {st.screens?.theaters?.name} · {st.screens?.name} · {new Date(st.start_time).toLocaleString()} · ${Number(st.base_price).toFixed(2)}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteRow("showtimes", st.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {showtimes.length === 0 && <p className="text-muted-foreground font-body text-sm">No showtimes yet.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;
