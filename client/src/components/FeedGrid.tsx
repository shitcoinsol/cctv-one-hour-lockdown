import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useUtcCountdown } from '../hooks/useUtcCountdown';
import { pad2 } from '../utils/time';

interface CCTVTileProps {
  feedNumber: number;
  index: number;
  displayValue?: string;
  phaseColors?: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
}

function CCTVTile({ feedNumber, index, displayValue, phaseColors }: CCTVTileProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isGlitching, setIsGlitching] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => 
    new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: 'UTC' 
    })
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 200;

    // Create static noise effect
    const createNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;     // Red
        data[i + 1] = noise; // Green  
        data[i + 2] = noise; // Blue
        data[i + 3] = Math.random() * 100 + 50; // Alpha
      }

      ctx.putImageData(imageData, 0, 0);
    };

    // Add scan lines
    const addScanlines = () => {
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
      ctx.lineWidth = 1;
      
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    // Random glitch bars
    const addGlitchBars = () => {
      if (Math.random() < 0.7) return;
      
      const barHeight = Math.random() * 20 + 5;
      const barY = Math.random() * (canvas.height - barHeight);
      
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.fillRect(0, barY, canvas.width, barHeight);
    };

    const animate = () => {
      // Clear with dark background
      ctx.fillStyle = 'rgba(0, 20, 0, 0.9)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add noise
      createNoise();
      
      // Add scan lines
      addScanlines();
      
      // Occasionally add glitch bars
      addGlitchBars();
      
      // Random color distortion
      if (Math.random() < 0.1) {
        ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 255}, ${Math.random() * 100}, 0.1)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Random glitch intervals
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 100 + Math.random() * 200);
    }, 2000 + Math.random() * 3000);

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(glitchInterval);
    };
  }, []);

  // Real-time clock update
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          timeZone: 'UTC' 
        })
      );
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isGlitching ? [1, 1.02, 0.98, 1] : 1,
        x: isGlitching ? [0, -2, 2, 0] : 0
      }}
      transition={{ 
        duration: 0.6, 
        delay: 0.1 + (index * 0.05),
        ease: [0.2, 0.65, 0.1, 1]
      }}
      className="relative aspect-video rounded-lg overflow-hidden bg-black border-2 border-green-900/50"
      data-testid={`feed-tile-${feedNumber}`}
      style={{
        boxShadow: 'inset 0 0 20px rgba(0, 255, 0, 0.1), 0 0 20px rgba(0, 255, 0, 0.1)'
      }}
    >
      {/* Static Noise Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        style={{ 
          filter: isGlitching ? 'hue-rotate(90deg) saturate(1.5)' : 'none',
          mixBlendMode: 'screen'
        }}
      />
      
      {/* CRT Effect Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,255,0,0.1) 2px,
              rgba(0,255,0,0.1) 3px
            ),
            radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.8) 100%)
          `
        }}
      />
      
      {/* Countdown Number Display */}
      {displayValue && (
        <div className="absolute inset-0 flex items-center justify-center z-15">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.9, 1, 0.9]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              filter: isGlitching ? 'blur(2px) brightness(1.5)' : 'none'
            }}
          >
            <span
              className="font-mono text-8xl md:text-9xl font-bold select-none"
              style={{
                color: phaseColors?.primary || '#00FF41',
                textShadow: `
                  0 0 20px ${phaseColors?.glow || 'rgba(0, 255, 65, 0.8)'},
                  0 0 40px ${phaseColors?.glow || 'rgba(0, 255, 65, 0.6)'},
                  0 0 60px ${phaseColors?.glow || 'rgba(0, 255, 65, 0.4)'}
                `,
                filter: isGlitching ? 'contrast(1.3) saturate(1.5)' : 'none',
                WebkitTextStroke: `1px ${phaseColors?.secondary || '#39FF14'}`,
                letterSpacing: '0.1em'
              }}
              data-testid={`countdown-${feedNumber === 4 ? 'hours' : feedNumber === 5 ? 'minutes' : 'seconds'}`}
            >
              {displayValue}
            </span>
          </motion.div>
        </div>
      )}
      
      {/* Feed Info */}
      <div className="absolute top-2 left-2 z-20">
        <span 
          className="font-mono text-xs text-green-400 font-bold"
          style={{ 
            textShadow: '0 0 10px rgba(0, 255, 0, 0.8)',
            filter: isGlitching ? 'blur(1px)' : 'none'
          }}
        >
          FEED {feedNumber.toString().padStart(2, '0')}
        </span>
      </div>
      
      {/* Status Indicator */}
      <div className="absolute top-2 right-2 z-20">
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.2
          }}
          className="w-2 h-2 bg-red-500 rounded-full"
          style={{
            boxShadow: '0 0 10px rgba(255, 0, 0, 0.8)'
          }}
        />
      </div>
      
      {/* Bottom Info */}
      <div className="absolute bottom-2 left-2 right-2 z-20 flex justify-between">
        <span 
          className="font-mono text-xs text-green-300/80"
          style={{ 
            textShadow: '0 0 5px rgba(0, 255, 0, 0.5)',
            filter: isGlitching ? 'blur(0.5px)' : 'none'
          }}
        >
          LIVE
        </span>
        <span 
          className="font-mono text-xs text-green-300/80"
          style={{ 
            textShadow: '0 0 5px rgba(0, 255, 0, 0.5)',
            filter: isGlitching ? 'blur(0.5px)' : 'none'
          }}
        >
          {currentTime}
        </span>
      </div>
      
      {/* Random Glitch Overlay */}
      {isGlitching && (
        <div
          className="absolute inset-0 z-10"
          style={{
            background: `linear-gradient(${Math.random() * 360}deg, 
              rgba(255,0,0,0.2) 0%, 
              rgba(0,255,0,0.2) 50%, 
              rgba(0,0,255,0.2) 100%)`,
            mixBlendMode: 'difference'
          }}
        />
      )}
    </motion.div>
  );
}

export function FeedGrid() {
  const feedTiles = Array.from({ length: 9 }, (_, i) => i + 1); // 3x3 grid
  const countdown = useUtcCountdown();

  const getDisplayValue = (feedNumber: number): string | undefined => {
    switch (feedNumber) {
      case 4:
        return pad2(countdown.h);
      case 5:
        return pad2(countdown.m);
      case 6:
        return pad2(countdown.s);
      default:
        return undefined;
    }
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-black/50">
      <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-6xl mx-auto">
        {feedTiles.map((feedNumber, index) => (
          <CCTVTile
            key={feedNumber}
            feedNumber={feedNumber}
            index={index}
            displayValue={getDisplayValue(feedNumber)}
            phaseColors={feedNumber >= 4 && feedNumber <= 6 ? countdown.phaseInfo.colors : undefined}
          />
        ))}
      </div>
      
      {/* CCTV System Status */}
      <div className="fixed top-4 left-4 z-20">
        <div className="bg-black/80 border border-green-500/50 rounded p-2">
          <div className="text-green-400 font-mono text-xs mb-1" style={{ textShadow: '0 0 5px rgba(0, 255, 0, 0.5)' }}>
            CCTV SYSTEM
          </div>
          <div className="text-green-300 font-mono text-xs">
            STATUS: <span className="text-red-400">LOCKED</span>
          </div>
        </div>
      </div>
    </div>
  );
}