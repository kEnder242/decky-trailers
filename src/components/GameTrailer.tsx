import { Focusable } from "@decky/ui";
import { FaPlay, FaTimes } from "react-icons/fa";
import * as React from "react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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
    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: '#000', zIndex: 20000, display: 'flex', justifyContent: 'center', alignItems: 'center',
            pointerEvents: 'auto'
        }}>
            <Focusable 
                style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                onCancel={onClose}
            >
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
            </Focusable>
        </div>,
        document.body
    );
};

export const GameTrailer = ({ appId }: { appId: number }) => {
  const [trailer, setTrailer] = useState<Movie | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bgReady, setBgReady] = useState<boolean>(false);

  useEffect(() => {
    if (!appId) return;
    logger.info(`GameTrailer mounted for appId: ${appId}`);
    setBgReady(false);
    setIsPlaying(false);
    
    fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`)
      .then(res => res.json())
      .then(json => {
        if (json && json[appId] && json[appId].success) {
          const movies = json[appId].data.movies;
          if (movies && movies.length > 0) {
            const selectedTrailer = movies.find((m: any) => m.highlight) || movies[0];
            logger.info(`Found trailer for ${appId}: ${selectedTrailer.name}`);
            setTrailer(selectedTrailer);
          } else {
             setTrailer(null);
          }
        }
      }).catch(err => logger.info(`Fetch error: ${err}`));
  }, [appId]);

  if (!trailer) return null;

  return (
    <>
        {/* Background Video */}
        {!isPlaying && (
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

        {/* Watch Button - Rendered via Portal */}
        {!isPlaying && createPortal(
             <Focusable 
                className="GamepadButton Focusable"
                onActivate={() => setIsPlaying(true)}
                onClick={() => setIsPlaying(true)}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px', 
                    padding: '10px 16px', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold', color: 'white', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    zIndex: 10000, 
                    position: 'fixed',
                    left: '40px',
                    top: '325px'
                }}
            >
                <FaPlay size={12} color="#fff" />
                <span style={{ textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>Trailer</span>
            </Focusable>,
            document.body
        )}
    </>
  );
};
