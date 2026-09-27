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
        <div className="font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {subtitle}
        </div>
      </div>
      <div className="flex flex-row items-center gap-4">
        <div
          onClick={onReduce}
          className="
            w-10
            h-10
            rounded-full
            border
            border-border
            flex
            items-center
            justify-center
            text-foreground
            cursor-pointer
            hover:bg-muted
            transition
          "
        >
          <AiOutlineMinus />
        </div>
        <div 
          className="
            font-medium 
            text-lg 
            text-foreground
          "
        >
          {value}
        </div>
        <div
          onClick={onAdd}
          className="
            w-10
            h-10
            rounded-full
            border
            border-border
            flex
            items-center
            justify-center
            text-foreground
            cursor-pointer
            hover:bg-muted
            transition
          "
        >
          <AiOutlinePlus />
        </div>
      </div>
    </div>
   );
}
 
export default Counter;
