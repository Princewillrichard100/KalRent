"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { Menu, ShieldCheck, User } from "lucide-react";
import { useLoginModal } from "@/hooks/useLoginModal";
import { useRegisterModal } from "@/hooks/useRegisterModal";
import { useRentModal } from "@/hooks/useRentModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserMenuProps {
  currentUser?: {
    cognitoInfo?: {
      userId?: string;
      email?: string;
    };
    userInfo?: {
      name?: string;
      email?: string;
      image?: string;
    };
    userRole?: string;
  } | null;
}

export const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
  const router = useRouter();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const rentModal = useRentModal();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onRent = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }
    rentModal.onOpen();
  }, [currentUser, loginModal, rentModal]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    window.location.href = "/";
  };

  const isManager = currentUser?.userRole?.toLowerCase() === "manager";

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex flex-row items-center gap-2">
        <button
          type="button"
          onClick={onRent}
          className="
            hidden 
            md:block 
            text-xs 
            font-bold 
            py-2 
            px-3.5 
            rounded-full 
            hover:bg-slate-100 
            transition 
            cursor-pointer 
            text-slate-700
          "
        >
          {isManager ? "Add Listing" : "List your hostel"}
        </button>

        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 text-slate-500 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="hidden xl:inline text-slate-600 text-[11px]">BaaS Escrow</span>
        </div>

        <button
          type="button"
          onClick={toggleOpen}
          className="
            p-1.5
            md:py-1 
            md:px-2 
            border 
            border-slate-200 
            flex 
            flex-row 
            items-center 
            gap-2.5 
            rounded-full 
            cursor-pointer 
            hover:shadow-sm 
            transition
            bg-white
          "
          aria-label="User navigation menu"
        >
          <Menu className="w-4 h-4 text-slate-600 ml-1" />
          <div className="hidden md:block">
            <Avatar className="w-7 h-7 border border-slate-200">
              <AvatarImage src={currentUser?.userInfo?.image} />
              <AvatarFallback className="bg-rose-500 text-white text-[10px] font-bold">
                {currentUser?.userInfo?.name?.[0]?.toUpperCase() ||
                  currentUser?.userRole?.[0]?.toUpperCase() || (
                    <User className="w-3.5 h-3.5" />
                  )}
              </AvatarFallback>
            </Avatar>
          </div>
        </button>
      </div>

      {isOpen && (
        <div
          className="
            absolute 
            rounded-2xl 
            shadow-xl 
            w-[40vw] 
            md:w-56 
            bg-white 
            border 
            border-slate-100 
            overflow-hidden 
            right-0 
            top-12 
            text-xs 
            z-50
            py-1.5
          "
        >
          <div className="flex flex-col cursor-pointer">
            {currentUser ? (
              <>
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 mb-1">
                  <div className="font-bold text-slate-900 truncate">
                    {currentUser.userInfo?.name || "My Account"}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {currentUser.userRole?.toLowerCase()} portal
                  </div>
                </div>

                {isManager ? (
                  <>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/managers/properties");
                      }}
                      className="px-4 py-2.5 hover:bg-slate-50 font-semibold text-slate-700 text-left transition"
                    >
                      My Properties
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        rentModal.onOpen();
                      }}
                      className="px-4 py-2.5 hover:bg-slate-50 font-semibold text-slate-700 text-left transition"
                    >
                      Add New Listing
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/managers/applications");
                      }}
                      className="px-4 py-2.5 hover:bg-slate-50 font-semibold text-slate-700 text-left transition"
                    >
                      Tenant Applications
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/tenants/favorites");
                      }}
                      className="px-4 py-2.5 hover:bg-slate-50 font-semibold text-slate-700 text-left transition"
                    >
                      Saved Hostels
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/tenants/applications");
                      }}
                      className="px-4 py-2.5 hover:bg-slate-50 font-semibold text-slate-700 text-left transition"
                    >
                      My Applications
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/tenants/residences");
                      }}
                      className="px-4 py-2.5 hover:bg-slate-50 font-semibold text-slate-700 text-left transition"
                    >
                      Current Residences
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/${currentUser.userRole?.toLowerCase()}s/settings`);
                  }}
                  className="px-4 py-2.5 hover:bg-slate-50 text-slate-600 text-left transition"
                >
                  Account Settings
                </button>

                <hr className="my-1 border-slate-100" />
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2.5 hover:bg-rose-50 text-rose-600 font-semibold text-left transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    loginModal.onOpen();
                  }}
                  className="px-4 py-2.5 hover:bg-slate-50 font-bold text-slate-900 text-left transition"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    registerModal.onOpen();
                  }}
                  className="px-4 py-2.5 hover:bg-slate-50 text-slate-600 text-left transition"
                >
                  Sign up
                </button>
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    rentModal.onOpen();
                  }}
                  className="px-4 py-2.5 hover:bg-slate-50 text-slate-600 text-left transition"
                >
                  List your hostel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
