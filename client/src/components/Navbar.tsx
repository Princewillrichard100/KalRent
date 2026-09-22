"use client";

import Link from "next/link";
import React from "react";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";
import Container from "./Container";
import SearchPill from "./navbar/SearchPill";
import UserMenu from "./navbar/UserMenu";
import { SidebarTrigger } from "./ui/sidebar";

export const Navbar = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const pathname = usePathname();

  const isDashboardPage =
    pathname.includes("/managers") || pathname.includes("/tenants");

  return (
    <div className="fixed top-0 left-0 w-full z-40 bg-white shadow-2xs">
      <div className="py-3.5 border-b border-slate-200/80">
        <Container>
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
            {/* Left: Brand Logo & Dashboard Trigger */}
            <div className="flex items-center gap-3">
              {isDashboardPage && (
                <div className="md:hidden">
                  <SidebarTrigger />
                </div>
              )}
              <Link href="/" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-600 flex items-center justify-center shadow-xs">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-lg font-black tracking-tight text-slate-900 flex items-center">
                    KAL<span className="text-rose-500">RENT</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Center: Floating Search Pill */}
            {!isDashboardPage && (
              <div className="hidden md:block">
                <SearchPill />
              </div>
            )}

            {/* Right: User Menu */}
            <UserMenu currentUser={authUser} />
          </div>

          {/* Mobile Search Pill on search/landing */}
          {!isDashboardPage && (
            <div className="md:hidden mt-2.5">
              <SearchPill />
            </div>
          )}
        </Container>
    </div>
  );
};

export default Navbar;
