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
    label: "Self-Con",
    icon: Home,
    description: "Private self-contained student room with private kitchen & bath.",
  },
  {
    label: "Shared Hostel",
    icon: Hotel,
    description: "Budget-friendly student rooms with shared spaces.",
  },
  {
    label: "Modern",
    icon: Building2,
    description: "Sleek and newly built student complexes.",
  },
  {
    label: "Countryside",
    icon: Mountain,
    description: "Quiet and serene locations near university borders.",
  },
  {
    label: "Pools",
    icon: Waves,
    description: "Hostels with recreational pool amenities.",
  },
  {
    label: "Islands",
    icon: Compass,
    description: "Secluded hostel clusters with 24/7 power.",
  },
  {
    label: "Lake",
    icon: Fish,
    description: "Properties close to waterfront or scenic campus lakes.",
  },
  {
    label: "Windmills",
    icon: Wind,
    description: "Naturally ventilated, cool student accommodations.",
  },
  {
    label: "Beach",
    icon: Palmtree,
    description: "Relaxed campus living near relaxation spots.",
  },
  {
    label: "Castles",
    icon: Castle,
    description: "Grand multi-storey gated student halls.",
  },
  {
    label: "Camping",
    icon: Tent,
    description: "Budget backpacker and short-stay rooms.",
  },
  {
    label: "Arctic",
    icon: Snowflake,
    description: "Fully air-conditioned premium student suites.",
  },
  {
    label: "Desert",
    icon: SunMedium,
    description: "Warm, sunny chalets with private balconies.",
  },
  {
    label: "Barns",
    icon: Warehouse,
    description: "Rustic, spacious loft-style student apartments.",
  },
  {
    label: "Lux",
    icon: Gem,
    description: "Top-tier luxury student hostels with VIP concierge.",
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
