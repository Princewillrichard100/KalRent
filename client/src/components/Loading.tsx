import { Loader2 } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex flex-col gap-3 items-center justify-center bg-slate-900/20 backdrop-blur-xs z-50">
      <div className="p-4 bg-white/95 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="text-sm font-semibold text-slate-800 tracking-tight">
          Loading KalRent...
        </span>
      </div>
    </div>
  );
};

export default Loading;
