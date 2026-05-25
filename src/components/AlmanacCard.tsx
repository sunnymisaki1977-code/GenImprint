"use client";

import React, { useState, useEffect } from "react";
import { Solar, SolarMonth } from "lunar-javascript";
import { useWorkflow } from "@/context/WorkflowContext";
import { ChevronDown, ChevronUp, Zap, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui";
import { getDeitiesForLunarDate } from "@/utils/taiwanDeities";
import { cnToTw } from "@/utils/opencc";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export const AlmanacCard = () => {
  const { setTheme, setCurrentStep } = useWorkflow();
  
  const [dateStr, setDateStr] = useState<string>("");
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(new Date().getMonth() + 1);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = new Date(today.getTime() - tzOffset).toISOString().split('T')[0];
    setDateStr(localISOTime);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth() + 1);
  }, []);

  if (!dateStr) return null;

  // Selected date logic
  const selectedSolar = Solar.fromDate(new Date(`${dateStr}T12:00:00`));
  const selectedLunar = selectedSolar.getLunar();

  const lunarYearFull = `${selectedLunar.getYearInGanZhi()}年 農曆${cnToTw(selectedLunar.getMonthInChinese())}月${cnToTw(selectedLunar.getDayInChinese())}`;
  const activeJieQi = cnToTw(selectedLunar.getPrevJieQi(true).getName());

  const taiwanDeities = getDeitiesForLunarDate(Math.abs(selectedLunar.getMonth()), selectedLunar.getDay());
  const lunarFestivals = [...selectedLunar.getFestivals(), ...selectedLunar.getOtherFestivals()].map(f => cnToTw(f)).filter(f => f.length > 0);
  const festivals = [...taiwanDeities, ...lunarFestivals];
  const uniqueFestivals = Array.from(new Set(festivals));

  const yi = selectedLunar.getDayYi().map(y => cnToTw(y)).join("、");
  const ji = selectedLunar.getDayJi().map(j => cnToTw(j)).join("、");
  const position = `財神：${cnToTw(selectedLunar.getPositionCaiDesc())} | 喜神：${cnToTw(selectedLunar.getPositionXiDesc())}`;

  const handleApplyTheme = () => {
    const festivalsText = uniqueFestivals.length > 0 ? uniqueFestivals.join("、") : "";
    const themeText = `【天時：${activeJieQi}】${festivalsText ? festivalsText : '日常策展'}`;
    setTheme(themeText);
    setCurrentStep(1);
  };

  // Calendar Grid Logic
  const monthDays = SolarMonth.fromYm(viewYear, viewMonth).getDays();
  const firstDayOfWeek = monthDays[0].getWeek(); // 0 is Sunday
  
  // Create padded array for empty cells before the 1st
  const prefixCells = Array(firstDayOfWeek).fill(null);
  
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleReturnToday = () => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = new Date(today.getTime() - tzOffset).toISOString().split('T')[0];
    setDateStr(localISOTime);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth() + 1);
  };

  // Get lunar year info for the middle of the view month to display at top
  const midMonthSolar = Solar.fromYmd(viewYear, viewMonth, 15);
  const midMonthLunar = midMonthSolar.getLunar();
  const viewLunarYear = midMonthLunar.getYearInGanZhi();
  const viewLunarShengXiao = midMonthLunar.getYearShengXiao();

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-stone-200/80 shadow-xl overflow-hidden shrink-0 flex flex-col font-sans relative group">
      
      {/* Calendar Top Header (Brown style like screenshot) */}
      <div className="bg-[#ba8759] text-white p-3 flex justify-between items-center relative shadow-sm">
        {/* Fake binder rings */}
        <div className="absolute -top-1.5 left-8 w-2 h-3 rounded-full bg-stone-100 shadow-sm border border-stone-300"></div>
        <div className="absolute -top-1.5 right-8 w-2 h-3 rounded-full bg-stone-100 shadow-sm border border-stone-300"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-widest">{viewLunarYear}</span>
          <div className="w-6 h-6 rounded-full bg-[#416892] flex items-center justify-center border border-white/20 shadow-inner">
            <span className="text-xs font-bold">{viewLunarShengXiao}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <select 
            value={viewYear} 
            onChange={(e) => setViewYear(Number(e.target.value))}
            className="bg-white text-stone-800 text-sm font-bold rounded py-1 pl-2 pr-6 outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M2%204l4%204%204-4%22%20stroke%3D%22%23ba8759%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:calc(100%-8px)_center] border border-stone-200"
          >
            {Array.from({length: 10}).map((_, i) => {
              const y = new Date().getFullYear() - 5 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>

          <select 
            value={viewMonth} 
            onChange={(e) => setViewMonth(Number(e.target.value))}
            className="bg-white text-stone-800 text-sm font-bold rounded py-1 pl-2 pr-6 outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M2%204l4%204%204-4%22%20stroke%3D%22%23ba8759%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:calc(100%-8px)_center] border border-stone-200"
          >
            {Array.from({length: 12}).map((_, i) => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Grid View */}
      <div className="p-4 border-b border-stone-100 bg-white">
        {/* Weekdays */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((day, idx) => (
            <div key={day} className={`text-center text-[11px] font-bold pb-2 ${idx === 0 || idx === 6 ? 'text-stone-400' : 'text-stone-400'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-3">
          {prefixCells.map((_, idx) => <div key={`empty-${idx}`} />)}
          
          {monthDays.map((solarDay) => {
            const y = solarDay.getYear();
            const m = String(solarDay.getMonth()).padStart(2, '0');
            const d = String(solarDay.getDay()).padStart(2, '0');
            const cellDateStr = `${y}-${m}-${d}`;
            
            const isSelected = dateStr === cellDateStr;
            const week = solarDay.getWeek();
            const isWeekend = week === 0 || week === 6;
            
            const lunarDay = solarDay.getLunar();
            // Display logic for small text: Priority JieQi -> Festival -> Lunar Day
            const jq = lunarDay.getJieQi();
            const festivalsArr = lunarDay.getFestivals();
            const dayText = jq ? cnToTw(jq) : (festivalsArr.length > 0 ? cnToTw(festivalsArr[0]) : cnToTw(lunarDay.getDayInChinese()));
            
            // Format first day of month specially
            const displaySubText = lunarDay.getDay() === 1 ? `${cnToTw(lunarDay.getMonthInChinese())}月` : dayText;

            return (
              <button
                key={cellDateStr}
                onClick={() => setDateStr(cellDateStr)}
                className={`flex flex-col items-center justify-center h-12 w-10 mx-auto rounded-full transition-all relative ${
                  isSelected ? 'bg-[#ba8759] text-white shadow-md' : 'hover:bg-stone-100'
                }`}
              >
                <span className={`text-xl font-bold leading-none ${
                  isSelected ? 'text-white' : (isWeekend ? 'text-red-600' : 'text-stone-800')
                }`}>
                  {solarDay.getDay()}
                </span>
                <span className={`text-[9px] mt-0.5 leading-none font-medium truncate w-full text-center ${
                  isSelected ? 'text-white/90' : (jq || festivalsArr.length > 0 ? 'text-[#ba8759]' : 'text-stone-500')
                }`}>
                  {displaySubText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Calendar Footer Controls */}
        <div className="flex justify-between items-center mt-5 px-2">
          <button onClick={handlePrevMonth} className="text-[#ba8759] hover:bg-stone-100 p-1 rounded-full transition-colors">
            <ChevronLeft size={20} className="fill-current" />
          </button>
          <button 
            onClick={handleReturnToday}
            className="text-[11px] font-bold text-white bg-[#ba8759] px-6 py-1.5 rounded-full hover:bg-[#a67446] transition-colors"
          >
            返回今日
          </button>
          <button onClick={handleNextMonth} className="text-[#ba8759] hover:bg-stone-100 p-1 rounded-full transition-colors">
            <ChevronRight size={20} className="fill-current" />
          </button>
        </div>
      </div>

      {/* Selected Day Details Section (Retained from original) */}
      <div className="p-4 bg-stone-50 space-y-3">
        <div className="flex flex-col min-w-0 border-b border-stone-200/60 pb-3">
          <div className="flex items-center gap-1.5 mb-1 text-[#ba8759]">
            <CalendarDays size={14} />
            <span className="text-[10px] font-black tracking-widest uppercase">選定日期資訊</span>
          </div>
          <h3 className="text-[13px] font-bold text-stone-800 font-serif tracking-widest truncate">
            {lunarYearFull} {activeJieQi}
          </h3>
          
          {uniqueFestivals.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {uniqueFestivals.map((festival, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-red-50 text-red-700 text-[10px] px-2 py-0.5 rounded-md border border-red-100/50 font-bold tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                  <span className="truncate" title={festival}>{festival}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-1.5 text-[10px] text-stone-400 tracking-wider">
              今日無特殊聖誕或節慶
            </div>
          )}
        </div>

        {/* Collapsible Do's and Don'ts */}
        <div className="bg-white rounded-lg border border-stone-200/60 overflow-hidden shadow-sm">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-stone-600 hover:bg-stone-50 transition-colors uppercase tracking-widest"
          >
            <span>宜忌與開運方位</span>
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          
          {isExpanded && (
            <div className="px-3 pb-3 pt-1 text-[10px] space-y-2">
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded bg-red-50 text-red-700 flex items-center justify-center font-bold shrink-0">宜</div>
                <div className="text-stone-600 leading-relaxed break-all line-clamp-2" title={yi}>{yi || "無"}</div>
              </div>
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded bg-stone-100 text-stone-600 flex items-center justify-center font-bold shrink-0">忌</div>
                <div className="text-stone-500 leading-relaxed break-all line-clamp-2" title={ji}>{ji || "無"}</div>
              </div>
              <div className="flex gap-2 pt-1.5 border-t border-stone-100">
                <div className="w-4 h-4 rounded bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">位</div>
                <div className="text-stone-600 font-bold">{position}</div>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleApplyTheme}
          className="w-full py-4 bg-stone-900 hover:bg-[#ba8759] text-white rounded-xl shadow-lg transition-all duration-300 group flex items-center justify-center gap-2"
        >
          <Zap size={14} className="text-amber-400 group-hover:animate-bounce" />
          <span className="text-[11px] font-bold tracking-widest uppercase">載入天時，開始產製</span>
        </Button>
      </div>
    </div>
  );
};
