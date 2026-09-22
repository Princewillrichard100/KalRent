"use client";

import { LucideIcon } from "lucide-react";

interface CategoryInputProps {
  icon: LucideIcon;
  label: string;
  selected?: boolean;
  onClick: (value: string) => void;
}

export const CategoryInput: React.FC<CategoryInputProps> = ({
  icon: Icon,
  label,
  selected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className={`
        rounded-xl
        p-4
        flex
        flex-col
        gap-3
        hover:border-slate-800
        transition
        cursor-pointer
        text-left
        w-full
        ${selected ? "border-2 border-slate-900 bg-slate-50/80 shadow-xs" : "border border-slate-200 bg-white"}
      `}
    >
      <Icon className={`w-6 h-6 ${selected ? "text-rose-500" : "text-slate-600"}`} />
      <div className="font-semibold text-xs text-slate-800">{label}</div>
    </button>
  );
};

export default CategoryInput;
