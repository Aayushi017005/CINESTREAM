import { useMemo } from "react";
import { motion } from "framer-motion";
import type { SeatTier, BookedSeat, SelectedSeat } from "@/lib/bookingData";
import { getTierForRow, calculateSeatPrice, TIER_LABELS } from "@/lib/bookingData";

interface SeatGridProps {
  totalRows: number;
  seatsPerRow: number;
  tiers: SeatTier[];
  bookedSeats: BookedSeat[];
  selectedSeats: SelectedSeat[];
  basePrice: number;
  onToggleSeat: (seat: SelectedSeat) => void;
}

const TIER_COLORS: Record<string, string> = {
  standard: "bg-secondary border-border hover:border-primary text-foreground",
  premium: "bg-primary/15 border-primary/40 hover:border-primary text-foreground",
  vip: "bg-accent/15 border-accent/40 hover:border-accent text-foreground",
};

const TIER_LEGEND_COLORS: Record<string, string> = {
  standard: "bg-secondary border-border",
  premium: "bg-primary/15 border-primary/40",
  vip: "bg-accent/15 border-accent/40",
};

const SeatGrid = ({
  totalRows,
  seatsPerRow,
  tiers,
  bookedSeats,
  selectedSeats,
  basePrice,
  onToggleSeat,
}: SeatGridProps) => {
  const bookedSet = useMemo(
    () => new Set(bookedSeats.map((s) => `${s.row_number}-${s.seat_number}`)),
    [bookedSeats]
  );
  const selectedSet = useMemo(
    () => new Set(selectedSeats.map((s) => `${s.row}-${s.seat}`)),
    [selectedSeats]
  );

  const rows = Array.from({ length: totalRows }, (_, i) => i + 1);
  const seatNums = Array.from({ length: seatsPerRow }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="text-center">
        <div className="mx-auto w-3/4 h-2 rounded-t-full bg-gradient-to-b from-primary/60 to-transparent shadow-[0_0_30px_hsl(var(--primary)/0.5)]" />
        <p className="text-muted-foreground font-body text-xs tracking-widest mt-2">SCREEN</p>
      </div>

      {/* Seats */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-2 min-w-full justify-center mx-auto">
          {rows.map((row) => {
            const tier = getTierForRow(row, tiers);
            const tierName = tier?.tier || "standard";
            return (
              <div key={row} className="flex items-center gap-2 justify-center">
                <span className="font-body text-xs text-muted-foreground w-5 text-center font-semibold">
                  {String.fromCharCode(64 + row)}
                </span>
                <div className="flex gap-1.5">
                  {seatNums.map((seat) => {
                    const key = `${row}-${seat}`;
                    const isBooked = bookedSet.has(key);
                    const isSelected = selectedSet.has(key);
                    const price = calculateSeatPrice(basePrice, tier?.price_multiplier || 1);

                    return (
                      <motion.button
                        key={seat}
                        whileTap={{ scale: 0.9 }}
                        disabled={isBooked}
                        onClick={() =>
                          onToggleSeat({ row, seat, tier: tierName, price })
                        }
                        aria-label={`Seat ${String.fromCharCode(64 + row)}${seat} ${isBooked ? "booked" : isSelected ? "selected" : "available"}`}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md border text-[10px] font-semibold transition-all ${
                          isBooked
                            ? "bg-muted/30 border-muted/40 text-muted-foreground/40 cursor-not-allowed"
                            : isSelected
                            ? "bg-primary border-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.6)]"
                            : TIER_COLORS[tierName]
                        }`}
                      >
                        {seat}
                      </motion.button>
                    );
                  })}
                </div>
                <span className="font-body text-xs text-muted-foreground w-5 text-center font-semibold">
                  {String.fromCharCode(64 + row)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-border">
        {(["standard", "premium", "vip"] as const).map((t) => {
          const tier = tiers.find((x) => x.tier === t);
          const price = tier ? calculateSeatPrice(basePrice, tier.price_multiplier) : 0;
          return (
            <div key={t} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded border ${TIER_LEGEND_COLORS[t]}`} />
              <span className="font-body text-xs text-muted-foreground">
                {TIER_LABELS[t]} {tier && `· $${price.toFixed(2)}`}
              </span>
            </div>
          );
        })}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary border border-primary" />
          <span className="font-body text-xs text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted/30 border border-muted/40" />
          <span className="font-body text-xs text-muted-foreground">Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
