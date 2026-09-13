"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const ImagePreviews = ({ images }: ImagePreviewsProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const safeImages = images && images.length > 0 ? images : ["/placeholder.jpg"];

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? safeImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === safeImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="relative h-[360px] sm:h-[440px] w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-100">
      {safeImages.map((image, index) => (
        <div
          key={image + index}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image}
            alt={`Property Image ${index + 1}`}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 70vw"
          />
        </div>
      ))}

      {safeImages.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900/80 text-white p-2.5 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-md focus:outline-none"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900/80 text-white p-2.5 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-md focus:outline-none"
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 right-4 bg-slate-900/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs shadow-xs">
            {currentImageIndex + 1} / {safeImages.length}
          </div>
        </>
      )}
    </div>
  );
};

export default ImagePreviews;
