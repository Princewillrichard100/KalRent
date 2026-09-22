"use client";

export const Loader = () => {
  return (
    <div className="h-[70vh] flex flex-col justify-center items-center">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-neutral-100 border-t-rose-500 animate-spin"></div>
      </div>
    </div>
  );
};

export default Loader;
