"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import {
  Palmtree,
  Wind,
  Building2,
  Mountain,
  Waves,
  Compass,
  Fish,
  Snowflake,
  Castle,
  Tent,
  SunMedium,
  Warehouse,
  Gem,
  Home,
  Hotel,
  Sparkles,
} from "lucide-react";
import { useCallback } from "react";

export const CATEGORIES_LIST = [
  {
    label: "Apartments",
    icon: Building2,
    description: "Modern, fully equipped private apartments.",
  },
  {
    label: "Shortlets",
    icon: Sparkles,
    description: "Premium daily & weekly serviced stays.",
  },
  {
    label: "Mansions",
    icon: Castle,
    description: "Stately luxury estates and expansive residences.",
  },
  {
    label: "Beachfront",
    icon: Palmtree,
    description: "Properties with direct coastal access and sea breeze.",
  },
  {
    label: "Villas",
    icon: Home,
    description: "Private detached vacation houses with gardens.",
  },
  {
    label: "Penthouse",
    icon: Gem,
    description: "Top-floor suites with panoramic city skyline views.",
  },
  {
    label: "Duplex",
    icon: Warehouse,
    description: "Spacious two-storey living spaces for groups and families.",
  },
  {
    label: "Serviced Rooms",
    icon: Hotel,
    description: "Fully furnished private rooms with daily housekeeping.",
  },
  {
    label: "City Centers",
    icon: Compass,
    description: "Heart-of-the-city stays close to business & nightlife.",
  },
  {
    label: "Pools",
    icon: Waves,
    description: "Stays featuring magnificent private or shared pools.",
  },
];

export const Categories = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams?.get("category") || searchParams?.get("propertyType");

  const isMainPage = pathname === "/" || pathname === "/search" || pathname.startsWith("/search");

  const handleClick = useCallback(
    (label: string) => {
      const current = new URLSearchParams(searchParams ? searchParams.toString() : "");

      if (selectedCategory?.toLowerCase() === label.toLowerCase()) {
        current.delete("category");
        current.delete("propertyType");
      } else {
        current.set("category", label);
      }

      router.push(`/?${current.toString()}`);
    },
    [selectedCategory, router, searchParams]
  );

  if (!isMainPage) {
    return null;
  }

  return (
    <div className="border-b border-neutral-200 bg-white shadow-2xs">
      <Container>
        <div className="pt-4 pb-2 flex flex-row items-center justify-between overflow-x-auto no-scrollbar gap-6 sm:gap-8">
          {CATEGORIES_LIST.map((item) => {
            const isSelected = selectedCategory?.toLowerCase() === item.label.toLowerCase();
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleClick(item.label)}
                className={`
                  flex 
                  flex-col 
                  items-center 
                  justify-center 
                  gap-2 
                  pb-2.5 
                  border-b-2 
                  hover:text-neutral-800 
                  transition 
                  cursor-pointer 
                  whitespace-nowrap 
                  shrink-0
                  ${
                    isSelected
                      ? "border-neutral-800 text-neutral-800 font-semibold"
                      : "border-transparent text-neutral-500 font-medium hover:border-neutral-300"
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${isSelected ? "text-neutral-800" : "text-neutral-500"}`} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </Container>
    </div>
  );
};

export default Categories;
