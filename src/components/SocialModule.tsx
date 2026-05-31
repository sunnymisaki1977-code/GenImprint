"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui";
import { ChevronDown, Database, AlertCircle, MessageSquareShare, Sparkles, Copy, ExternalLink, BotMessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";

interface NotionPage {
  id: string;
  title: string;
}

const extractSocialOptions = (text: string) => {
  if (!text) return { fb: "", line: "" };
  
  const blocks = text.split(/(?=###\s*(?:FB|LINE))/i);
  let fb = "";
  let line = "";
  
  for (const block of blocks) {
    if (block.match(/###\s*FB社群/i)) {
      fb = block.trim();
    } else if (block.match(/###\s*LINE官方帳號/i)) {
      line = block.trim();
    }
  }
  
  if (!fb && !line) {
     const cleanBlocks = text.split(/(?=###)/).filter(b => b.trim().length > 10);
     fb = cleanBlocks[0] || text;
     line = cleanBlocks[1] || "";
  }
  
  return { fb, line };
};

const SocialSubCard = ({
  title,
  content
}: {
  title: string;
  content: string;
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(content);

  useEffect(() => {
    setText(content);
  }, [content]);

  const getSelectedText = () => {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd, value } = textareaRef.current;
      if (selectionStart !== selectionEnd) {
        return value.substring(selectionStart, selectionEnd);
      }
    }
    return text;
  };

  const handleCopyOnly = () => {
    const selected = getSelectedText();
    if (!selected.trim()) {
      toast.error("無可複製的內容");
      return;
    }
    navigator.clipboard.writeText(selected)
      .then(() => {
        toast.success(`已複製！`);
      })
      .catch(() => {
        toast.error("複製失敗，請手動複製");
      });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col gap-4 group hover:border-amber-500/30 transition-colors">
      <div className="flex items-center gap-2">
        <BotMessageSquare size={16} className="text-amber-500" />
        <span className="text-stone-700 font-bold text-sm tracking-wider">
          {title}
        </span>
      </div>

      <div className="relative flex-1">
        <textarea 
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-48 bg-stone-50 rounded-xl p-4 text-sm text-stone-600 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-stone-200 leading-relaxed shadow-inner"
          spellCheck={false}
        />
      </div>
      
      <div className="flex items-center justify-end mt-2">
        <Button 
          onClick={handleCopyOnly} 
          className="bg-stone-700 hover:bg-stone-600 text-stone-200 h-10 px-6 rounded-xl text-xs font-bold transition-all flex shrink-0"
        >
          <Copy className="w-3.5 h-3.5 mr-2"/> 複製框選文字
        </Button>
      </div>
    </div>
  );
};

const SocialCard = ({
  options,
}: {
  options: { fb: string; line: string };
}) => {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-stone-200 shadow-xl overflow-hidden flex flex-col lg:flex-row w-full min-h-[400px]">
      {/* Left Panel */}
      <div className="bg-stone-900 w-full lg:w-72 p-6 md:p-8 flex flex-col shrink-0">
        <div className="sticky top-8">
          <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">社群平台發布</div>
          <h3 className="text-white text-2xl font-bold tracking-wider mb-6">跨平台社群貼文</h3>
          <p className="text-stone-400 text-sm leading-relaxed">
            分為 Facebook 與 LINE 官方帳號兩種格式。<br/><br/>
            請在右側文字框中反白框選您需要的段落，然後點擊小卡下方的按鈕進行複製。<br/><br/>未框選則預設複製該小卡的全部內容。
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6 md:p-8 bg-stone-50/50 flex flex-col gap-6 relative">
         <div className="absolute top-10 right-10 text-stone-300 pointer-events-none z-0">
            <MessageSquareShare size={24}/>
         </div>
         
         <div className="relative z-10 flex flex-col gap-6">
           {options.fb || options.line ? (
             <>
               <SocialSubCard title="Facebook 深度長文" content={options.fb} />
               <SocialSubCard title="LINE 官方帳號早安問候" content={options.line} />
             </>
           ) : (
             <div className="w-full flex-1 min-h-[300px] bg-white rounded-2xl p-6 text-sm text-stone-400 font-mono flex items-center justify-center border border-stone-200 shadow-inner">
               尚未載入 Prompt...
             </div>
           )}
         </div>
      </div>
    </div>
  );
};

export const SocialModule = () => {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [loadingPages, setLoadingPages] = useState(false);
  const [fetchingPrompts, setFetchingPrompts] = useState(false);
  const [prompts, setPrompts] = useState({ step10: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPageId) {
      fetchPrompts(selectedPageId);
    }
  }, [selectedPageId]);

  const fetchPages = async () => {
    setLoadingPages(true);
    setError(null);
    try {
      const res = await fetch("/api/notion/list-pages");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPages(data.pages || []);
      if (data.pages?.length > 0) {
        setSelectedPageId(data.pages[0].id);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error("讀取 Notion 清單失敗");
    } finally {
      setLoadingPages(false);
    }
  };

  const fetchPrompts = async (pageId: string) => {
    setFetchingPrompts(true);
    setPrompts({ step10: "" });
    try {
      const res = await fetch("/api/notion/get-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setPrompts(data.prompts);
      toast.success("成功載入 社群貼文");
    } catch (err: any) {
      toast.error("抓取 Prompt 失敗: " + err.message);
    } finally {
      setFetchingPrompts(false);
    }
  };

  const extractedOptions = extractSocialOptions(prompts.step10);

  return (
    <div className="max-w-7xl mx-auto p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 font-calligraphy flex items-center gap-4">
          <Sparkles className="text-amber-500" size={36} />
          社群推播發控中心
        </h1>
        <p className="text-stone-500 text-lg">
          全自動社群圖文閉環。自 Notion 資料庫提取對應主題，直接輸出適用於不同平台的推播文案。
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-stone-200 shadow-2xl p-10 space-y-8">
        <div className="space-y-4">
          <label className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] ml-1">
            選擇歸檔主題
          </label>
          
          <div className="relative group max-w-2xl">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-stone-400">
              <Database size={20} />
            </div>
            <select
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              disabled={loadingPages}
              className="w-full text-xl pl-16 pr-12 py-5 rounded-2xl border-2 border-stone-100 bg-white/50 focus:bg-white focus:border-stone-900 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loadingPages ? (
                <option>載入中...</option>
              ) : pages.length > 0 ? (
                pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title}
                  </option>
                ))
              ) : (
                <option value="">(無可用主題)</option>
              )}
            </select>
            <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-stone-400">
              <ChevronDown size={20} />
            </div>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-2 ml-1">
              <AlertCircle size={14} />
              <span>{error}</span>
              <button onClick={fetchPages} className="underline ml-2 hover:text-red-700">重試</button>
            </div>
          )}
        </div>

        {fetchingPrompts ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-stone-500">
            <Sparkles size={32} className="animate-spin text-amber-500" />
            <p className="font-medium tracking-widest uppercase">解析脈絡中...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <SocialCard options={extractedOptions} />
          </div>
        )}
      </div>
    </div>
  );
};
