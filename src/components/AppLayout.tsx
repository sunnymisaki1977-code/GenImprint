"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Toaster } from "react-hot-toast";
import { ChangelogModal } from "./ChangelogModal";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden antialiased text-stone-900">
      <Toaster position="top-right" />
      <ChangelogModal />
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
        {children}
      </div>
    </div>
  );
};
