import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Maximize, Minimize, Settings, Volume2, VolumeX, X } from "lucide-react";
import { type TMDBVideo } from "@/lib/movieData";

interface VideoPlayerProps {
  videos: TMDBVideo[];
  movieTitle: string;
}

const VideoPlayer = ({ videos, movieTitle }: VideoPlayerProps) => {
  const [playing, setPlaying] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<TMDBVideo | null>(null);
  const [quality, setQuality] = useState("Auto");
  const [muted, setMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const trailer = videos.find(v => v.type === "Trailer" && v.official) || videos.find(v => v.type === "Trailer") || videos[0];

  useEffect(() => {
    if (trailer && !selectedVideo) setSelectedVideo(trailer);
  }, [trailer, selectedVideo]);

  const handlePlay = useCallback(() => {
    setShowTrailer(true);
    setPlaying(true);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const postMessage = (action: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: action, args: [] }),
      "*"
    );
  };

  const seekBack = () => postMessage("seekTo");
  const seekForward = () => postMessage("seekTo");

  if (!selectedVideo) {
    return (
      <div className="aspect-video bg-secondary rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground font-body">No trailer available</p>
      </div>
    );
  }

  const youtubeUrl = `https://www.youtube.com/embed/${selectedVideo.key}?autoplay=${playing ? 1 : 0}&enablejsapi=1&modestbranding=1&rel=0&mute=${muted ? 1 : 0}`;

  return (
    <div ref={containerRef} className="relative group rounded-xl overflow-hidden bg-black">
      {!showTrailer ? (
        <div className="relative aspect-video cursor-pointer" onClick={handlePlay}>
          <img
            src={`https://img.youtube.com/vi/${selectedVideo.key}/maxresdefault.jpg`}
            alt={movieTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${selectedVideo.key}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity group-hover:bg-black/50">
            <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors hover:scale-110 transform duration-200">
              <Play className="w-10 h-10 text-primary-foreground ml-1" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-foreground font-display text-lg">{selectedVideo.name}</p>
            <p className="text-muted-foreground font-body text-sm">{selectedVideo.type} • YouTube</p>
          </div>
        </div>
      ) : (
        <div className="relative aspect-video">
          <iframe
            ref={iframeRef}
            src={youtubeUrl}
            title={selectedVideo.name}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
          {/* Control bar overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setPlaying(!playing)} className="text-foreground hover:text-primary transition-colors">
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button onClick={seekBack} className="text-foreground hover:text-primary transition-colors" title="10s back">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button onClick={seekForward} className="text-foreground hover:text-primary transition-colors" title="10s forward">
                  <SkipForward className="w-5 h-5" />
                </button>
                <button onClick={() => setMuted(!muted)} className="text-foreground hover:text-primary transition-colors">
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button onClick={() => setShowSettings(!showSettings)} className="text-foreground hover:text-primary transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                  {showSettings && (
                    <div className="absolute bottom-8 right-0 bg-card border border-border rounded-lg p-3 min-w-[200px] shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-body text-sm font-semibold text-foreground">Settings</span>
                        <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-body text-muted-foreground mb-1">Quality</p>
                          <div className="flex flex-wrap gap-1">
                            {["Auto", "1080p", "720p", "480p"].map(q => (
                              <button
                                key={q}
                                onClick={() => setQuality(q)}
                                className={`px-2 py-1 rounded text-xs font-body transition-colors ${quality === q ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-body text-muted-foreground mb-1">Audio</p>
                          <p className="text-xs font-body text-foreground">Default (YouTube)</p>
                        </div>
                        <div>
                          <p className="text-xs font-body text-muted-foreground mb-1">Captions</p>
                          <p className="text-xs font-body text-foreground">Use CC button on player</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={toggleFullscreen} className="text-foreground hover:text-primary transition-colors">
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video selector if multiple */}
      {videos.length > 1 && (
        <div className="bg-card/80 border-t border-border px-4 py-2 flex gap-2 overflow-x-auto">
          {videos.slice(0, 5).map(v => (
            <button
              key={v.id}
              onClick={() => { setSelectedVideo(v); setShowTrailer(false); setPlaying(false); }}
              className={`whitespace-nowrap px-3 py-1 rounded-lg font-body text-xs transition-colors ${selectedVideo?.id === v.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
            >
              {v.type}: {v.name.length > 30 ? v.name.slice(0, 30) + "…" : v.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;