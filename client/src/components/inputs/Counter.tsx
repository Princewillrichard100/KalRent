"use client";

import { useCallback } from "react";
import { Minus, Plus } from "lucide-react";

interface CounterProps {
  title: string;
  subtitle: string;
  value: number;
  onChange: (value: number) => void;
}

export const Counter: React.FC<CounterProps> = ({
  title,
  subtitle,
  value,
  onChange,
}) => {
  const onAdd = useCallback(() => {
    onChange(value + 1);
  }, [onChange, value]);

  const onReduce = useCallback(() => {
    if (value === 1) {
      return;
    }
    onChange(value - 1);
  }, [onChange, value]);

  return (
    <div className="flex flex-row items-center justify-between py-3">
      <div className="flex flex-col">
        <div className="font-semibold text-sm text-slate-900">{title}</div>
        <div className="font-light text-xs text-slate-500">{subtitle}</div>
      </div>
      <div className="flex flex-row items-center gap-4">
        <button
          type="button"
          onClick={onReduce}
          disabled={value <= 1}
          className={`
            w-9 
            h-9 
            rounded-full 
            border 
            border-slate-300 
            flex 
            items-center 
            justify-center 
            text-slate-600 
            transition 
            ${
              value <= 1
                ? "opacity-40 cursor-not-allowed border-slate-200"
                : "cursor-pointer hover:border-slate-800 hover:text-slate-900"
            }
          `}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="font-semibold text-sm text-slate-700 min-w-[20px] text-center">
          {value}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="
            w-9 
            h-9 
            rounded-full 
            border 
            border-slate-300 
            flex 
            items-center 
            justify-center 
            text-slate-600 
            cursor-pointer 
            hover:border-slate-800 
            hover:text-slate-900 
            transition
          "
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Counter;
