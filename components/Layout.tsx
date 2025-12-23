import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.12),_transparent_55%),_linear-gradient(180deg,_#fef2f2,_#fff)] text-slate-800">
      <div className="layout-shell mx-auto flex w-full max-w-screen-xl flex-col gap-16 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
        {children}
      </div>
    </div>
  );
}
