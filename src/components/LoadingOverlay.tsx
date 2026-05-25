"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SequentialVideoPlayer } from "./SequentialVideoPlayer";

interface LoadingOverlayProps {
  isVisible: boolean;
  stepId: number;
}

export const STEP_CONFIGS: Record<number, { text: string; image: string; animation: any; transition: any }> = {
  1: {
    text: "正在為您研磨歷史底蘊",
    image: "/steps/Step 1：【儒・格物考據】.png",
    animation: { rotate: [-5, 5, -5], scale: [0.95, 1.05, 0.95] },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  },
  2: {
    text: "轉譯史料，宣法渡人",
    image: "/steps/Step 2：【釋・宣法渡人】.png",
    animation: { rotateY: [0, 360] },
    transition: { duration: 3, repeat: Infinity, ease: "linear" }
  },
  3: {
    text: "青銅渾天儀校準中",
    image: "/steps/Step 3：【儒・正名定分】.png",
    animation: { rotate: [0, 360], scale: [1, 1.05, 1] },
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
  },
  4: {
    text: "震碎迷惘，當頭棒喝",
    image: "/steps/Step 4：【釋・當頭棒喝】.png",
    animation: { scale: [1, 1.15, 1] },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
  },
  5: {
    text: "車同軌，通達世間",
    image: "/steps/Step 5：【儒・經世通達】.png",
    animation: { rotate: [0, 360] },
    transition: { duration: 4, repeat: Infinity, ease: "linear" }
  },
  6: {
    text: "萬物抱陽，匯聚提煉",
    image: "/steps/Step 6：【道・聚炁成形】.png",
    animation: { rotate: [0, 360] },
    transition: { duration: 3, repeat: Infinity, ease: "linear" }
  },
  7: {
    text: "去蕪存菁，煉化核心",
    image: "/steps/Step 7：【道・見素抱樸】.png",
    animation: { y: [0, -15, 0] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  },
  8: {
    text: "虛實相生，大象無形",
    image: "/steps/Step 8：【道・大象無形】.png",
    animation: { opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] },
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
  },
  9: {
    text: "心靈純淨，頻率共鳴",
    image: "/steps/Step 9：釋・梵音引心.png",
    animation: { rotate: [0, 360], scale: [0.9, 1.1, 0.9] },
    transition: { rotate: { duration: 15, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }
  }
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, stepId }) => {
  const config = STEP_CONFIGS[stepId];

  return (
    <AnimatePresence>
      {isVisible && config && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <div className="relative flex flex-col items-center gap-8">
            <div className="w-64 h-64 flex items-center justify-center relative">
              <SequentialVideoPlayer 
                className="w-full h-full object-contain mix-blend-screen drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
              />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 text-lg font-bold tracking-widest bg-black/40 px-6 py-2 rounded-full border border-white/10 shadow-2xl backdrop-blur-md flex items-center gap-1"
            >
              {config.text}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ...
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
