"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui";
import { ChevronDown, Send, Loader2, Database, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface NotionPage {
  id: string;
  title: string;
}

export const ExportModule = () => {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
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
      toast.error("讀取 Notion 清單失敗: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!selectedPageId) return;
    
    setSyncing(true);
    try {
      // Phase 2 & 3 will implement this API
      const res = await fetch("/api/export-to-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: selectedPageId }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success("✅ 成功匯出純淨史料至 Google 雲端硬碟，請至 NotebookLM 點擊同步");
    } catch (err: any) {
      toast.error("同步失敗: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 font-calligraphy">NotebookLM 橋接模組</h1>
        <p className="text-stone-500 text-lg">
          精準抓取 Notion 的【Step 1：基礎背景介紹】，一鍵覆寫至 Google Docs。
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-stone-200 shadow-2xl p-10 space-y-10">
        {/* Selector Section */}
        <div className="space-y-4">
          <label className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] ml-1">
            選擇要同步的 Notion 主題
          </label>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-stone-400">
              <Database size={20} />
            </div>
            <select
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              disabled={loading || syncing}
              className="w-full text-xl pl-16 pr-12 py-5 rounded-2xl border-2 border-stone-100 bg-white/50 focus:bg-white focus:border-stone-900 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
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

        {/* Action Section */}
        <div className="pt-4">
          <Button
            onClick={handleSync}
            disabled={!selectedPageId || loading || syncing}
            className="w-full py-8 text-2xl rounded-2xl shadow-xl shadow-stone-900/10 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 disabled:shadow-none transition-all"
          >
            {syncing ? (
              <>
                <Loader2 size={28} className="animate-spin mr-2" />
                正在同步至 Google Docs...
              </>
            ) : (
              <>
                <Send size={24} className="mr-2" />
                一鍵同步至 Google Docs
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Helper Info */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 flex gap-4 items-start">
        <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-400">
          <AlertCircle size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-stone-900 text-sm">操作提示</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            系統將會清空指定的 Google 文件內容，並直接填入該主題在 Notion 中的「Step 1：基礎背景介紹」段落。同步完成後，您可以直接在 NotebookLM 中獲取最新資訊。
          </p>
        </div>
      </div>
    </div>
  );
};
