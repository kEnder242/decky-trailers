import { Focusable } from "@decky/ui";
import { FaPlay, FaTimes, FaSpinner } from "react-icons/fa";
import * as React from "react";
import { useState, useEffect, useRef } from "react";

const logger = {
    info: (...args: any[]) => console.log("%c [Trailers] %c Info %c", "background: #16a085; color: black;", "background: #1abc9c; color: black;", "background: transparent;", ...args),
};

const TrailerPlayer = ({ trailer, onClose }: { trailer: any, onClose: () => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => { setTimeout(() => containerRef.current?.focus(), 100); }, []);
    
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#000', zIndex: 30000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Focusable style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onCancel={onClose} 
            // @ts-ignore
            ref={containerRef}>
                <video autoPlay controls poster={trailer.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
                    <source src={`https://cdn.akamai.steamstatic.com/steam/apps/${trailer.id}/movie_max.webm`} type="video/webm" />
                    <source src={`https://cdn.akamai.steamstatic.com/steam/apps/${trailer.id}/movie_max.mp4`} type="video/mp4" />
                </video>
                <Focusable className="GamepadButton" style={{ position: 'absolute', top: '40px', right: '40px', zIndex: 30001, backgroundColor: 'rgba(0,0,0,0.6)', padding: '15px', borderRadius: '50%', color: 'white' }} onActivate={onClose} onClick={onClose}><FaTimes size={35} /></Focusable>
            </Focusable>
        </div>
    );
};

export const GameTrailer = ({ appId }: { appId: number }) => {
  const [trailer, setTrailer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [bgReady, setBgReady] = useState<boolean>(false);

  const fetchTrailer = async () => {
      try {
          const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
          const json = await res.json();
          if (json && json[appId]?.success) {
              const movies = json[appId].data.movies;
              if (movies?.length > 0) {
                  const selected = movies.find((m: any) => m.highlight) || movies[0];
                  setTrailer(selected);
                  return selected;
              }
          }
      } catch (e) {}
      return null;
  };

  useEffect(() => { fetchTrailer(); }, [appId]);

  const playVideo = () => {
      logger.info(`👉 ACTION: Play Trailer ${appId}`);
      if (trailer) setIsPlaying(true);
      else {
          setIsLoading(true);
          fetchTrailer().then(t => {
              setIsLoading(false);
              if (t) setIsPlaying(true);
          });
      }
  };

  if (isPlaying && trailer) return <TrailerPlayer trailer={trailer} onClose={() => setIsPlaying(false)} />;

  return (
    <div style={{ height: 0, position: 'relative', zIndex: 10000 }}>
        {/* Background Video (Only one instance now) */}
        {trailer && !isPlaying && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none', opacity: bgReady ? 0.35 : 0, transition: 'opacity 1.5s ease-in-out' }}>
                <video autoPlay muted loop playsInline onCanPlay={() => setBgReady(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(15px) brightness(0.8)', opacity: 0.999 }}>
                    <source src={`https://cdn.akamai.steamstatic.com/steam/apps/${trailer.id}/movie_max.webm`} type="video/webm" />
                    <source src={`https://cdn.akamai.steamstatic.com/steam/apps/${trailer.id}/movie_max.mp4`} type="video/mp4" />
                </video>
            </div>
        )}

        {/* The Polished Button (Anchored precisely) */}
        <Focusable
            className="GamepadButton Focusable"
            onActivate={playVideo}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', 
                padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', 
                fontWeight: 'bold', color: 'white',
                backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
                border: isFocused ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                transform: isFocused ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.1s',
                position: 'absolute', bottom: '20px', left: '40px', // Floating just above the baseline
                minWidth: '150px', justifyContent: 'center'
            }}
        >
            {isLoading ? <FaSpinner className="fa-spin" /> : <FaPlay size={12} color="#fff" />}
            <span style={{ textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>Watch Trailer</span>
        </Focusable>
    </div>
  );
};