"use client";

import { useCallback } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";

interface CounterProps {
  title: string;
  subtitle: string;
  value: number;
  onChange: (value: number) => void;
}

const Counter: React.FC<CounterProps> = ({
  title,
  subtitle,
  value,
  onChange
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
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-col">
        <div className="font-medium">{title}</div>
        <div className="font-light text-gray-600">
          {subtitle}
        </div>
      </div>
      <div className="flex flex-row items-center gap-4">
        <button
          type="button"
          onClick={onReduce}
          disabled={value <= 1}
          aria-label={`Decrease ${title.toLowerCase()}`}
          className="
            w-10
            h-10
            rounded-full
            border-[1px]
            border-neutral-400
            flex
            items-center
            justify-center
            text-neutral-600
            transition
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-neutral-800
            disabled:opacity-30
            disabled:cursor-not-allowed
            enabled:cursor-pointer
            enabled:hover:border-neutral-800
            enabled:hover:text-neutral-800
          "
        >
          <AiOutlineMinus />
        </button>
        <div 
          className="
            font-light 
            text-xl 
            text-neutral-600
            w-6
            text-center
          "
        >
          {value}
        </div>
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Increase ${title.toLowerCase()}`}
          className="
            w-10
            h-10
            rounded-full
            border-[1px]
            border-neutral-400
            flex
            items-center
            justify-center
            text-neutral-600
            cursor-pointer
            transition
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-neutral-800
            hover:border-neutral-800
            hover:text-neutral-800
          "
        >
          <AiOutlinePlus />
        </button>
      </div>
    </div>
   );
}
 
export default Counter;
