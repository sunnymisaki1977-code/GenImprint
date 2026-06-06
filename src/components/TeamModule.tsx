"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Database, PenTool, CheckCircle2, Edit2, Save, Users } from "lucide-react";
import { toast } from "react-hot-toast";

type RoleType = "frontend" | "backend" | "uiux";

export const TeamModule = () => {
  const [owners, setOwners] = useState<Record<RoleType, string>>({
    frontend: "",
    backend: "",
    uiux: ""
  });
  const [editingRole, setEditingRole] = useState<RoleType | null>(null);
  const [tempInput, setTempInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("team_accountability_owners");
    if (saved) {
      setOwners(JSON.parse(saved));
    }
  }, []);

  const handleEdit = (role: RoleType) => {
    setTempInput(owners[role]);
    setEditingRole(role);
  };

  const handleSave = (role: RoleType) => {
    const newOwners = { ...owners, [role]: tempInput };
    setOwners(newOwners);
    localStorage.setItem("team_accountability_owners", JSON.stringify(newOwners));
    setEditingRole(null);
    toast.success("已更新當責人員！");
  };

  const roles = [
    {
      id: "frontend" as RoleType,
      title: "前端工程師 (Frontend)",
      icon: <Terminal size={24} className="text-blue-400" />,
      quota: "徵求 1 名",
      battlefield: "實作高互動性的 SaaS Dashboard、複雜的九步驟 Stepper、以及跨專案的全域狀態管理。",
      techStack: [
        { label: "React / Next.js", bg: "bg-blue-900/40 text-blue-300" },
        { label: "Tailwind CSS", bg: "bg-cyan-900/40 text-cyan-300" },
        { label: "Zustand", bg: "bg-amber-900/40 text-amber-300" }
      ],
      plusPoints: ["微互動 (Micro-interactions)", "防抖 (Debounce) 儲存機制"]
    },
    {
      id: "backend" as RoleType,
      title: "後端工程師 (Backend)",
      icon: <Database size={24} className="text-emerald-400" />,
      quota: "徵求 1 名",
      battlefield: "設計穩定的 RESTful API、串接第三方 AI 服務 (Gemini/Notion)、處理會員認證與資料庫設計。",
      techStack: [
        { label: "Node.js / Python", bg: "bg-emerald-900/40 text-emerald-300" },
        { label: "SQL / NoSQL", bg: "bg-slate-700/50 text-slate-300" },
        { label: "JWT", bg: "bg-slate-700/50 text-slate-300" }
      ],
      plusPoints: ["高併發 API 處理經驗", "非同步隊列 (Queue) 架構"]
    },
    {
      id: "uiux" as RoleType,
      title: "UI/UX 設計師",
      icon: <PenTool size={24} className="text-pink-400" />,
      quota: "徵求 1 名",
      battlefield: "將 PM 的 Wireframe 轉化為高保真 Prototype，制定 Design System（色彩、字體、元件庫）。",
      techStack: [
        { label: "Figma", bg: "bg-pink-900/40 text-pink-300" },
        { label: "Design System", bg: "bg-slate-700/50 text-slate-300" }
      ],
      plusPoints: ["SaaS 產品設計思維", "深/淺色模式設計規範"]
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#040814] text-stone-300 p-8 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-4">
            <Users className="text-indigo-400" />
            團隊編制與當責 (Team Accountability)
          </h2>
          <p className="text-stone-400 text-lg">定義各角色的戰場、技術棧，並指派當責負責人以確保專案順利推進。</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="bg-[#0b1120] border border-[#1e293b] rounded-2xl p-6 flex flex-col relative overflow-hidden group hover:border-indigo-500/50 transition-colors shadow-xl">
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#1e293b] flex items-center justify-center shadow-inner">
                  {role.icon}
                </div>
                <div className="bg-[#1e293b] text-stone-300 text-xs font-bold px-3 py-1.5 rounded-full">
                  {role.quota}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">{role.title}</h3>
              
              <div className="mb-6">
                <p className="text-stone-400 leading-relaxed text-sm">
                  <span className="text-stone-500 font-bold mr-2">你的戰場：</span>
                  {role.battlefield}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-stone-500 text-xs font-bold mb-3 tracking-widest">技術棧</h4>
                <div className="flex flex-wrap gap-2">
                  {role.techStack.map((tech, idx) => (
                    <span key={idx} className={`px-3 py-1 rounded-md text-xs font-bold ${tech.bg}`}>
                      {tech.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-8 flex-1">
                <h4 className="text-stone-500 text-xs font-bold mb-3 tracking-widest">加分項</h4>
                <ul className="space-y-2">
                  {role.plusPoints.map((point, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-stone-300">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Accountability Section */}
              <div className="mt-auto pt-4 border-t border-[#1e293b]">
                <h4 className="text-indigo-400 text-sm font-bold mb-3 flex items-center gap-2">
                  <span>當責負責人 (Owner)</span>
                </h4>
                
                {editingRole === role.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempInput}
                      onChange={(e) => setTempInput(e.target.value)}
                      placeholder="輸入負責人名稱"
                      className="flex-1 bg-[#1e293b] border border-indigo-500/50 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(role.id);
                        if (e.key === 'Escape') setEditingRole(null);
                      }}
                    />
                    <button
                      onClick={() => handleSave(role.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-indigo-900/20"
                    >
                      <Save size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group/owner bg-[#1e293b]/50 p-3 rounded-lg border border-transparent hover:border-[#1e293b] transition-colors">
                    <span className={`text-sm ${owners[role.id] ? 'text-white font-bold' : 'text-stone-500 italic'}`}>
                      {owners[role.id] || "尚無指派負責人"}
                    </span>
                    <button
                      onClick={() => handleEdit(role.id)}
                      className="text-stone-500 hover:text-indigo-400 transition-colors p-1 opacity-0 group-hover/owner:opacity-100 focus:opacity-100"
                      title="編輯當責負責人"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
