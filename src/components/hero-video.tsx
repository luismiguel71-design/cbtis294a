'use client';

import { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface HeroVideoProps {
  src: string;
  title?: string;
  description?: string;
}

export function HeroVideo({ src, title, description }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl bg-black/50 group">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
          <button
            onClick={togglePlay}
            className="bg-white/90 hover:bg-white rounded-full p-4 transition-all duration-200 transform hover:scale-110 shadow-xl"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-blue-600" fill="currentColor" />
            ) : (
              <Play className="w-8 h-8 text-blue-600" fill="currentColor" />
            )}
          </button>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-white text-sm">
            {title && <p className="font-semibold">{title}</p>}
          </div>
          <button
            onClick={toggleMute}
            className="text-white hover:text-white/80 transition-colors"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {description && (
        <p className="mt-4 text-sm md:text-base text-white/80 text-center">
          {description}
        </p>
      )}
    </div>
  );
}
