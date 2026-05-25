"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export const ChannelStats = () => {
  const [ytStats, setYtStats] = useState({ subscribers: "---", videos: "---", views: "---" });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/youtube", { cache: "no-store" });
        const data = await res.json();
        if (!data.error) {
          setYtStats({
            subscribers: data.subscribers,
            videos: data.videos,
            views: data.views
          });
        }
      } catch (err) {
        console.error("Failed to fetch YT stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-white/60 backdrop-blur-md border border-stone-200 rounded-xl px-8 py-3 flex items-center justify-between shadow-sm w-full">
      <div className="flex items-center gap-4">
        <div className="bg-cinnabar p-1 rounded shadow-sm">
          <Sparkles size={12} className="text-white" />
        </div>
        <span className="text-xs font-bold text-stone-800 uppercase tracking-widest">頻道即時現況</span>
      </div>
      
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">訂閱人數</span>
          <span className="text-2xl font-calligraphy text-stone-900">{ytStats.subscribers}</span>
        </div>
        <div className="w-px h-6 bg-stone-200" />
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">影片總數</span>
          <span className="text-2xl font-calligraphy text-stone-900">{ytStats.videos}</span>
        </div>
        <div className="w-px h-6 bg-stone-200" />
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">總觀看數</span>
          <span className="text-2xl font-calligraphy text-stone-900">{ytStats.views}</span>
        </div>
      </div>

      <div className="hidden lg:block text-[10px] text-stone-500 italic font-medium">
        「解碼台灣神佛傳奇，銘印於心的文化傳承。」
      </div>
    </div>
  );
};
