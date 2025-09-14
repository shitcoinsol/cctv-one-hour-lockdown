import { useState } from 'react';
import { getValidatedAppConfig } from '../config/env';

export function TwitterButton() {
  const [showHandshake, setShowHandshake] = useState(false);

  const handleClick = () => {
    setShowHandshake(true);
    
    setTimeout(() => {
      const appConfig = getValidatedAppConfig();
      window.open(appConfig.twitterUrl, '_blank', 'noopener,noreferrer');
      setShowHandshake(false);
    }, 1000);
  };

  return (
    <div className="fixed top-6 right-6 z-30">
      <button
        onClick={handleClick}
        className="w-12 h-12 border border-gold/30 rounded-lg flex items-center justify-center hover:border-gold/60 hover:bg-gold/5 transition-all duration-300 focus-ring"
        aria-label="Open Twitter profile"
        data-testid="button-twitter"
      >
        <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </button>
      
      {showHandshake && (
        <div className="absolute top-full right-0 mt-2 px-3 py-1 bg-gold text-black text-xs font-sans-thin font-light rounded-md whitespace-nowrap animate-in slide-in-from-top-2 duration-300">
          External handshake initiated…
        </div>
      )}
    </div>
  );
}
