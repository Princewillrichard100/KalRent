"use client";

import { NAVBAR_HEIGHT } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import {
  Bell,
  Building2,
  Compass,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { SidebarTrigger } from "./ui/sidebar";

const Navbar = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname();

  const isDashboardPage =
    pathname.includes("/managers") || pathname.includes("/tenants");

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="flex justify-between items-center w-full h-full px-4 sm:px-8 text-white">
        <div className="flex items-center gap-4 md:gap-6">
          {isDashboardPage && (
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
          )}
          <Link
            href="/"
            className="cursor-pointer transition-opacity hover:opacity-90"
            scroll={false}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xs">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="text-xl font-black tracking-tight text-white flex items-center">
                KAL<span className="text-emerald-400">RENT</span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 rounded-md hidden sm:inline-block">
                  Campus
                </span>
              </div>
            </div>
          </Link>

          {!isDashboardPage && (
            <nav className="hidden lg:flex items-center gap-1 ml-4 text-xs font-medium text-slate-300">
              <Link
                href="/search"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                Find Hostels
              </Link>
              <Link
                href="/search?sortBy=distance"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                Campus Proximity
              </Link>
              <div className="px-3 py-1.5 text-slate-400 flex items-center gap-1.5 select-none">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>BaaS Escrow Protected</span>
              </div>
            </nav>
          )}

          {isDashboardPage && authUser && (
            <Button
              variant="secondary"
              className="md:ml-4 bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white transition-all text-xs font-semibold rounded-xl"
              onClick={() =>
                router.push(
                  authUser.userRole?.toLowerCase() === "manager"
                    ? "/managers/newproperty"
                    : "/search"
                )
              }
            >
              {authUser.userRole?.toLowerCase() === "manager" ? (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden md:block ml-1.5">Add Property Listing</span>
                </>
              ) : (
                <>
                  <Search className="h-3.5 w-3.5" />
                  <span className="hidden md:block ml-1.5">Search Hostels</span>
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {authUser ? (
            <>
              <div className="relative hidden md:block">
                <button
                  aria-label="Messages"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="relative hidden md:block">
                <button
                  aria-label="Notifications"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
                </button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2.5 focus:outline-none cursor-pointer p-1 rounded-xl hover:bg-slate-800 transition-colors">
                  <Avatar className="w-8 h-8 border border-slate-700">
                    <AvatarImage src={authUser.userInfo?.image} />
                    <AvatarFallback className="bg-emerald-700 text-white text-xs font-bold">
                      {authUser.userRole?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start text-left">
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                      {authUser.userInfo?.name || "My Account"}
                    </span>
                    <span className="text-[10px] text-emerald-400 capitalize font-medium">
                      {authUser.userRole?.toLowerCase()}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-slate-800 border-slate-200 rounded-2xl shadow-xl w-52 p-1.5">
                  <DropdownMenuItem
                    className="cursor-pointer font-semibold rounded-xl text-xs py-2 hover:!bg-emerald-50 hover:!text-emerald-900"
                    onClick={() =>
                      router.push(
                        authUser.userRole?.toLowerCase() === "manager"
                          ? "/managers/properties"
                          : "/tenants/applications",
                        { scroll: false }
                      )
                    }
                  >
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuItem
                    className="cursor-pointer rounded-xl text-xs py-2 hover:!bg-slate-100"
                    onClick={() =>
                      router.push(
                        `/${authUser.userRole?.toLowerCase()}s/settings`,
                        { scroll: false }
                      )
                    }
                  >
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 rounded-xl text-xs py-2 hover:!bg-red-50 hover:!text-red-700"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/signin">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-200 border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-xl text-xs font-semibold h-9 px-3.5"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold shadow-xs h-9 px-4"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
