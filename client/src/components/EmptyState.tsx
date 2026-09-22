"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  showReset?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No exact matches",
  subtitle = "Try changing or removing some of your filters or searching another campus zone.",
  showReset,
}) => {
  const router = useRouter();

  return (
    <div className="h-[60vh] flex flex-col gap-2 justify-center items-center text-center px-4">
      <div className="text-xl font-bold text-neutral-800">{title}</div>
      <div className="text-sm font-light text-neutral-500 mt-1 max-w-md">{subtitle}</div>
      <div className="w-48 mt-5">
        {showReset && (
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full rounded-xl border-neutral-300 text-neutral-700 hover:bg-neutral-100 py-3 text-xs font-semibold cursor-pointer"
          >
            Reset all filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
