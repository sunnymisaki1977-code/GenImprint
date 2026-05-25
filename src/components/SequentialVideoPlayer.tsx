"use client";

import React, { useState, useRef, useEffect } from "react";

import { Volume2, VolumeX } from "lucide-react";

const WORKFLOW_VIDEOS = [
  "/steps/Step 1：【儒・格物考據】.mp4",
  "/steps/Step 2：【釋・宣法渡人】.mp4",
  "/steps/Step 3：【儒・正名定分】.mp4",
  "/steps/Step 4：【釋・當頭棒喝】.mp4",
];

interface SequentialVideoPlayerProps {
  className?: string;
  style?: React.CSSProperties;
}

export const SequentialVideoPlayer: React.FC<SequentialVideoPlayerProps> = ({ className, style }) => {
  const [videoIndex, setVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnded = () => {
    setVideoIndex((prev) => (prev + 1) % WORKFLOW_VIDEOS.length);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Video auto-play prevented:", e));
    }
  }, [videoIndex]);

  return (
    <div className={`relative ${className}`} style={style}>
      <video
        ref={videoRef}
        key={WORKFLOW_VIDEOS[videoIndex]} // Force re-render/reload when src changes
        src={WORKFLOW_VIDEOS[videoIndex]}
        autoPlay
        muted={isMuted}
        playsInline
        onEnded={handleEnded}
        className="w-full h-full object-contain"
      />
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur transition-colors z-50"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
};
