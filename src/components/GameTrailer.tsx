import { Focusable } from "@decky/ui";
import { FaPlay, FaTimes } from "react-icons/fa";
import * as React from "react";
import { useState, useEffect } from "react";

// @ts-ignore
const logger = {
    info: (...args: any[]) => console.log("%c Decky Trailers %c Info %c", "background: #16a085; color: black;", "background: #1abc9c; color: black;", "background: transparent;", ...args),
    error: (...args: any[]) => console.error("%c Decky Trailers %c Error %c", "background: #c0392b; color: white;", "background: #e74c3c; color: white;", "background: transparent;", ...args),
};

interface Movie {
  id: number;
  name: string;
  highlight: boolean;
  thumbnail: string;
}

const TrailerPlayer = ({ trailer, onClose }: { trailer: Movie, onClose: () => void }) => {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: '#000', zIndex: 20000, display: 'flex', justifyContent: 'center', alignItems: 'center',
            pointerEvents: 'auto'
        }}>
            <Focusable 
                className="GamepadButton"
                style={{
                    position: 'absolute', top: '40px', right: '40px', zIndex: 20001,
                    cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.6)', padding: '15px', borderRadius: '50%', color: 'white', display: 'flex',
                    border: '2px solid rgba(255,255,255,0.3)'
                }} 
                onActivate={onClose}
                onClick={onClose}
            >
                <FaTimes size={35} />
            </Focusable>
            <video 
                autoPlay 
                controls 
                poster={trailer.thumbnail} 
                style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    willChange: 'transform' 
                }}
            >
                <source src={`https://cdn.akamai.steamstatic.com/steam/apps/${trailer.id}/movie_max.webm`} type="video/webm" />
                <source src={`https://cdn.akamai.steamstatic.com/steam/apps/${trailer.id}/movie_max.mp4`} type="video/mp4" />
            </video>
        </div>
    );
};

export const GameTrailer = ({ appId, variant }: { appId: number, variant: 'A' | 'B' | 'C' }) => {
  const [trailer, setTrailer] = useState<Movie | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bgReady, setBgReady] = useState<boolean>(false);

  useEffect(() => {
    if (!appId) return;
    if (variant === 'A') logger.info(`GameTrailer mounted for appId: ${appId}`);
    setBgReady(false);
    setIsPlaying(false);
    
    fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`)
      .then(res => res.json())
      .then(json => {
        if (json && json[appId] && json[appId].success) {
          const movies = json[appId].data.movies;
          if (movies && movies.length > 0) {
            const selectedTrailer = movies.find((m: any) => m.highlight) || movies[0];
            if (variant === 'A') logger.info(`Found trailer for ${appId}: ${selectedTrailer.name}`);
            setTrailer(selectedTrailer);
          } else {
             setTrailer(null);
          }
        }
      }).catch(err => logger.info(`Fetch error: ${err}`));
  }, [appId]);

  if (!trailer) return null;

  // Styles based on variant
  let style: React.CSSProperties = {
      display: 'inline-flex', alignItems: 'center', gap: '8px', 
      padding: '10px 16px', 
      borderRadius: '4px', 
      cursor: 'pointer', 
      fontWeight: 'bold', color: 'white', 
      border: '1px solid rgba(255,255,255,0.3)',
      zIndex: 1000 + (variant.charCodeAt(0)),
  };

  let label = `Trailer ${variant}`;

  if (variant === 'A') {
      // Variant A: Row Sibling (Attempting to fix visibility)
      style = { 
          ...style, 
          position: 'relative', 
          backgroundColor: 'rgba(60, 60, 60, 0.8)', 
          color: '#00ccff', 
          marginLeft: '10px',
          // Force layout visibility
          display: 'inline-flex',
          minWidth: '100px',
          height: '40px',
          verticalAlign: 'middle'
      };
      label = "A: Row";
  } else if (variant === 'B') {
      // Variant B: Hero Overlay (Target Production Look)
      style = { 
          ...style, 
          position: 'fixed', 
          bottom: '250px', 
          left: '40px', 
          backgroundColor: 'rgba(0, 0, 0, 0.6)', 
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
      };
      label = "B: Hero";
  } else if (variant === 'C') {
      // Variant C: Top-Right Fallback
      style = { 
          ...style, 
          position: 'fixed', 
          top: '40px', 
          right: '40px', 
          backgroundColor: 'rgba(200, 0, 0, 0.8)' 
      };
      label = "C: Top";
  }

  const handleClick = () => {
      logger.info(`👉 USER CLICKED VARIANT [${variant}]`);
      setIsPlaying(true);
  };

  return (
    <>
        {/* Background Video - Only render from Variant A */}
        {variant === 'A' && !isPlaying && (
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                zIndex: 0, pointerEvents: 'none',
                opacity: bgReady ? 0.35 : 0, transition: 'opacity 1.5s ease-in-out'
            }}>
                <video 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    onCanPlay={() => setBgReady(true)}
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        filter: 'blur(15px) brightness(0.8)',
                        willChange: 'transform',
                        opacity: 0.999 
                    }}
                >
                    <source src={`https://cdn.akamai.steamstatic.com/steam/apps/${trailer.id}/movie_max.webm`} type="video/webm" />
                    <source src={`https://cdn.akamai.steamstatic.com/steam/apps/${trailer.id}/movie_max.mp4`} type="video/mp4" />
                </video>
            </div>
        )}

        {/* Full Screen Player */}
        {isPlaying && <TrailerPlayer trailer={trailer} onClose={() => setIsPlaying(false)} />}

        {/* Watch Button */}
        {!isPlaying && (
             <Focusable 
                className="GamepadButton Focusable"
                onActivate={handleClick}
                onClick={handleClick}
                style={style}
            >
                <FaPlay size={12} />
                <span style={{ textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>{label}</span>
            </Focusable>
        )}
    </>
  );
};
