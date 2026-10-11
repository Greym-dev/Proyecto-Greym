import { useEffect, useState } from 'react';
import './index.css';

function App() {
  const CAPI_WORKER_URL = '/api/track-conversion';

  const links = {
    spotify: {
      platform: 'Spotify',
      webUrl: 'https://open.spotify.com/track/1he33bE6pDPI9B292sFEFe?si=15013f95d4804a29',
      iosScheme: 'spotify:track:1he33bE6pDPI9B292sFEFe',
      androidIntent: 'intent://open.spotify.com/track/1he33bE6pDPI9B292sFEFe?si=15013f95d4804a29#Intent;package=com.spotify.music;scheme=https;S.browser_fallback_url=https%3A%2F%2Fopen.spotify.com%2Ftrack%2F1he33bE6pDPI9B292sFEFe%3Fsi%3D15013f95d4804a29;end'
    },
    amazonMusic: {
      platform: 'AmazonMusic',
      webUrl: 'https://music.amazon.in/albums/B0HL85CD82?marketplaceId=A21TJRUUN4KGV&musicTerritory=IN&ref=dm_sh_8HTdzEWbCmYCL4eVcwHLjBYIu',
      iosScheme: 'amznmp3://music.amazon.in/albums/B0HL85CD82',
      androidIntent: 'intent://music.amazon.in/albums/B0HL85CD82#Intent;package=com.amazon.mp3;scheme=https;S.browser_fallback_url=https%3A%2F%2Fmusic.amazon.in%2Falbums%2FB0HL85CD82%3FmarketplaceId%3DA21TJRUUN4KGV%26musicTerritory%3DIN%26ref%3Ddm_sh_8HTdzEWbCmYCL4eVcwHLjBYIu;end'
    },
    youtube: {
      platform: 'YouTube',
      webUrl: 'https://youtu.be/w12m2IsxZWo?si=YYUrHG2O_mEBMYmT',
      iosScheme: 'vnd.youtube://w12m2IsxZWo',
      androidIntent: 'intent://www.youtube.com/watch?v=w12m2IsxZWo#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=https%3A%2F%2Fyoutu.be%2Fw12m2IsxZWo;end'
    }
  };
  
  const [coverUrl, setCoverUrl] = useState('');

  useEffect(() => {
    fetch(`https://open.spotify.com/oembed?url=${links.spotify.webUrl}`)
      .then(res => res.json())
      .then(data => {
        if (data.thumbnail_url) {
          setCoverUrl(data.thumbnail_url);
        }
      })
      .catch(err => console.error("Error fetching cover:", err));
  }, []);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const trackConversion = (platform) => {
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', 'Lead', {
        content_name: 'Penumbra - Greym & DJ Josniel',
        content_category: 'Music Smartlink',
        destination: platform
      });
    }

    try {
      fetch(CAPI_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'Lead',
          eventUrl: window.location.href,
          destination: platform,
          fbp: getCookie('_fbp'),
          fbc: getCookie('_fbc'),
          userAgent: navigator.userAgent
        }),
        keepalive: true
      }).catch(err => console.warn('CAPI track error:', err));
    } catch (e) {}
  };

  const handleOpenLink = (e, config) => {
    trackConversion(config.platform);

    const ua = navigator.userAgent || '';
    const isAndroid = /android/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isAndroid) {
      if (e) e.preventDefault();
      window.location.href = config.androidIntent;
      return;
    }

    if (isIOS) {
      if (e) e.preventDefault();
      const start = Date.now();
      window.location.href = config.iosScheme;
      setTimeout(() => {
        if (!document.hidden && Date.now() - start < 2500) {
          window.location.href = config.webUrl;
        }
      }, 1500);
      return;
    }

    // En Desktop abre normalmente en nueva pestaña vía target="_blank"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-4 py-8 relative overflow-hidden font-sans">
      
      {/* Background glow (Responsive size) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] sm:w-[80vw] sm:h-[80vw] max-w-[700px] max-h-[700px] bg-spotify/15 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none"></div>

      {/* Main Card (Mobile First Responsive) */}
      <div className="relative z-10 w-full max-w-[340px] sm:max-w-[420px] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-[#111111]/90 backdrop-blur-3xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)] hover:border-white/10">
        
        {/* Album Cover */}
        <div className="w-full aspect-square rounded-2xl sm:rounded-3xl bg-[#080808] mb-6 sm:mb-8 overflow-hidden shadow-2xl shadow-black/90 border border-white/5 relative">
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt="Penumbra Cover" 
              className="w-full h-full object-cover opacity-95 hover:opacity-100 transition-all duration-700 hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-[3px] border-spotify border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
        </div>

        {/* Titles */}
        <div className="mb-8 sm:mb-10 w-full">
          <h1 className="text-[26px] sm:text-[34px] font-extrabold tracking-tight text-white mb-1 sm:mb-2 drop-shadow-lg transition-all">
            Penumbra
          </h1>
          <p className="text-gray-400 font-medium text-[14px] sm:text-[16px] transition-all">
            Greym & DJ Josniel
          </p>
          <p className="text-zinc-400 text-[11px] sm:text-[13px] mt-3 sm:mt-4 font-light leading-relaxed px-2 sm:px-6 opacity-80 transition-all">
            Productor musical y artista. Explorando nuevos sonidos y atmósferas.
          </p>
        </div>

        {/* Buttons (Responsive Padding and Fonts) */}
        <div className="w-full space-y-3 sm:space-y-4">
          <a 
            href={links.spotify.webUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleOpenLink(e, links.spotify)} 
            className="w-full relative overflow-hidden group flex items-center justify-center gap-3 sm:gap-4 bg-spotify hover:bg-[#1ed760] text-black font-bold py-3.5 sm:py-4 px-5 sm:px-8 rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-[0_0_20px_rgba(29,185,84,0.15)] hover:shadow-[0_0_25px_rgba(29,185,84,0.3)] cursor-pointer text-[14px] sm:text-[16px] no-underline"
          >
            <svg viewBox="0 0 24 24" className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] fill-current"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.021 10.56 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
            Escuchar en Spotify
          </a>

          <a 
            href={links.amazonMusic.webUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleOpenLink(e, links.amazonMusic)} 
            className="w-full relative overflow-hidden group flex items-center justify-center gap-3 sm:gap-4 bg-transparent hover:bg-white/5 text-white font-semibold py-3.5 sm:py-4 px-5 sm:px-8 rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-95 border border-white/10 hover:border-[#00A8E1]/40 shadow-lg cursor-pointer text-[14px] sm:text-[16px] no-underline"
          >
            <svg viewBox="0 0 24 24" className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] fill-current text-[#00A8E1]"><path d="M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0zm5.6 17.5a13.3 13.3 0 0 1-5.6 1.3 13.3 13.3 0 0 1-5.6-1.3c-1.3-.9-1.9-1.5-2.2-2a.4.4 0 0 1 0-.5l.6-.8a.4.4 0 0 1 .5 0c1.2.9 3.2 1.6 6.7 1.6s5.5-.7 6.7-1.6a.4.4 0 0 1 .5 0l.6.8c.2.2.1.4 0 .5-.3.5-1 1.1-2.2 2zm.9-2a.4.4 0 0 1-.5.1 11.2 11.2 0 0 0-2.6-.5c-1 0-2.4.2-3.8.7a.4.4 0 0 1-.5-.2l-.3-.7a.4.4 0 0 1 .2-.5c1.4-.6 3-.8 4.2-.8s2.8.2 3.8.8a.4.4 0 0 1 .1.5z"/></svg>
            Amazon Music
          </a>

          <a 
            href={links.youtube.webUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleOpenLink(e, links.youtube)} 
            className="w-full relative overflow-hidden group flex items-center justify-center gap-3 sm:gap-4 bg-transparent hover:bg-white/5 text-white font-semibold py-3.5 sm:py-4 px-5 sm:px-8 rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-95 border border-white/10 hover:border-white/20 shadow-lg cursor-pointer text-[14px] sm:text-[16px] no-underline"
          >
            <svg viewBox="0 0 24 24" className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] fill-current text-youtube"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            Ver Video
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
