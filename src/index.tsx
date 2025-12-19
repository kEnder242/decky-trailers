import { definePlugin, routerHook } from "@decky/api";
import { FaPlay, FaVideo, FaTimes } from "react-icons/fa";
import { Focusable } from "@decky/ui";
import * as React from "react";
import { useState, useEffect } from "react";

interface Movie {
  id: number;
  name: string;
  highlight: boolean;
}

const TrailerOverlay = () => {
  const [appId, setAppId] = useState<string | null>(null);
  const [trailer, setTrailer] = useState<Movie | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const checkUrl = () => {
      const match = window.location.pathname.match(/\/library\/app\/(\d+)/);
      const newAppId = match ? match[1] : null;
      if (newAppId !== appId) {
        setAppId(newAppId);
        setIsPlaying(false); // Stop playing if we navigate away
      }
    };
    checkUrl();
    const interval = setInterval(checkUrl, 500);
    return () => clearInterval(interval);
  }, [appId]);

  useEffect(() => {
    if (!appId) {
      setTrailer(null);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
        const json = await res.json();
        if (json && json[appId] && json[appId].success) {
          const movies = json[appId].data.movies;
          if (movies && movies.length > 0) {
            const best = movies.find((m: any) => m.highlight) || movies[0];
            setTrailer(best);
          } else {
            setTrailer(null);
          }
        }
      } catch (e) {
        console.error("[DeckyTrailers] Fetch failed:", e);
      }
    };
    fetchData();
  }, [appId]);

  if (!appId || !trailer) return null;

  // Render the full-screen player if active
  if (isPlaying) {
    const webmUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${trailer.id}/movie_max.webm`;
    const mp4Url = `https://cdn.akamai.steamstatic.com/steam/apps/${trailer.id}/movie_max.mp4`;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000',
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Focusable style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 10001,
                cursor: 'pointer',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '10px',
                borderRadius: '50%',
                color: 'white',
                display: 'flex'
            }} onClick={() => setIsPlaying(false)}>
                <FaTimes size={30} />
            </Focusable>
            
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 10001,
                color: 'white',
                fontSize: '1.5em',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}>
                {trailer.name}
            </div>

            <video 
                autoPlay 
                controls 
                poster={(trailer as any).thumbnail}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'opacity(0.999)',
                    willChange: 'transform'
                }}
            >
                <source src={webmUrl} type="video/webm" />
                <source src={mp4Url} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
  }

  // Render the floating button
  return (
    <Focusable style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: '#1a1f2c',
        padding: '12px 20px',
        borderRadius: '4px',
        color: '#fff',
        border: '1px solid #3e465a',
        boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    }}
    onClick={() => setIsPlaying(true)}
    >
        <FaPlay color="#21beec" />
        <span>Watch Trailer</span>
    </Focusable>
  );
};

export default definePlugin(() => {
  routerHook.addGlobalComponent("DeckyTrailersOverlay", TrailerOverlay);

  return {
    name: "Decky Trailers",
    title: <div>Decky Trailers</div>,
    content: <div>Overlay active</div>,
    icon: <FaVideo />,
    onDismount() {
        routerHook.removeGlobalComponent("DeckyTrailersOverlay");
    },
  };
});
