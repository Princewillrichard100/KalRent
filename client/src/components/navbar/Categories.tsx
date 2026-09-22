"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import {
  Building,
  Building2,
  Crown,
  Footprints,
  Home,
  Hotel,
  MapPin,
  Sparkles,
  Zap,
} from "lucide-react";
import { useCallback } from "react";

export const CATEGORIES_LIST = [
  {
    label: "Self-Contained",
    icon: Home,
    description: "Private room with private bathroom and kitchen.",
  },
  {
    label: "Single Room",
    icon: Building,
    description: "Classic student single room.",
  },
  {
    label: "Flat / Apartment",
    icon: Building2,
    description: "Multi-room flat for roommate groups.",
  },
  {
    label: "Shared Hostel",
    icon: Hotel,
    description: "Affordable shared student hostel rooms.",
  },
  {
    label: "Studio",
    icon: Sparkles,
    description: "Modern open-concept student studio.",
  },
  {
    label: "Executive Hall",
    icon: Crown,
    description: "Serviced luxury hostel near campus gate.",
  },
  {
    label: "Walking Distance",
    icon: Footprints,
    description: "Less than 10 mins walk to lecture theatres.",
  },
  {
    label: "Constant Power",
    icon: Zap,
    description: "Hostels with solar/inverter or dedicated transformer.",
  },
  {
    label: "Tanke Central",
    icon: MapPin,
    description: "Heart of student life and campus transit hub.",
  },
];

export const Categories = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams?.get("category") || searchParams?.get("propertyType");

  const isMainPage = pathname === "/" || pathname === "/search";

  const handleClick = useCallback(
    (label: string) => {
      const current = new URLSearchParams(searchParams ? searchParams.toString() : "");

      if (selectedCategory === label) {
        current.delete("category");
        current.delete("propertyType");
      } else {
        current.set("category", label);
      }

      router.push(`/search?${current.toString()}`);
    },
    [selectedCategory, router, searchParams]
  );

  if (!isMainPage) {
    return null;
  }

  return (
    <div className="border-b border-slate-100 bg-white shadow-2xs">
      <Container>
        <div className="pt-3 pb-1 flex flex-row items-center justify-between overflow-x-auto no-scrollbar gap-5 sm:gap-8">
          {CATEGORIES_LIST.map((item) => {
            const isSelected = selectedCategory === item.label;
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
                  gap-1.5 
                  pb-2.5 
                  border-b-2 
                  hover:text-slate-900 
                  transition 
                  cursor-pointer 
                  whitespace-nowrap 
                  shrink-0
                  ${
                    isSelected
                      ? "border-slate-900 text-slate-900 font-bold"
                      : "border-transparent text-slate-500 font-medium"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isSelected ? "text-rose-500" : "text-slate-500"}`} />
                <span className="text-[11px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </Container>
    </div>
  );
};

export default Categories;
