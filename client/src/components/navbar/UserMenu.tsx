"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { AiOutlineMenu } from "react-icons/ai";
import { useLoginModal } from "@/hooks/useLoginModal";
import { useRegisterModal } from "@/hooks/useRegisterModal";
import { useRentModal } from "@/hooks/useRentModal";
import Avatar from "@/components/Avatar";
import MenuItem from "@/components/navbar/MenuItem";

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
      <div className="flex flex-row items-center gap-3">
        <div
          onClick={onRent}
          className="
            hidden
            md:block
            text-sm 
            font-semibold 
            py-3 
            px-4 
            rounded-full 
            hover:bg-neutral-100 
            transition 
            cursor-pointer
          "
        >
          {isManager ? "Add Listing" : "Airbnb your home"}
        </div>
        <div 
          onClick={toggleOpen}
          className="
            p-4
            md:py-1
            md:px-2
            border-[1px] 
            border-neutral-200 
            flex 
            flex-row 
            items-center 
            gap-3 
            rounded-full 
            cursor-pointer 
            hover:shadow-md 
            transition
          "
        >
          <AiOutlineMenu />
          <div className="hidden md:block">
            <Avatar src={currentUser?.userInfo?.image} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          className="
            absolute 
            rounded-xl 
            shadow-md
            w-[40vw]
            md:w-3/4 
            bg-white 
            overflow-hidden 
            right-0 
            top-12 
            text-sm
            z-50
          "
        >
          <div className="flex flex-col cursor-pointer">
            {currentUser ? (
              <>
                {isManager ? (
                  <>
                    <MenuItem 
                      label="My properties" 
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/managers/properties");
                      }}
                    />
                    <MenuItem 
                      label="Airbnb my home" 
                      onClick={() => {
                        setIsOpen(false);
                        rentModal.onOpen();
                      }}
                    />
                    <MenuItem 
                      label="Tenant applications" 
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/managers/applications");
                      }}
                    />
                  </>
                ) : (
                  <>
                    <MenuItem 
                      label="My trips" 
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/tenants/residences");
                      }}
                    />
                    <MenuItem 
                      label="My favorites" 
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/tenants/favorites");
                      }}
                    />
                    <MenuItem 
                      label="My reservations" 
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/tenants/applications");
                      }}
                    />
                    <MenuItem 
                      label="Airbnb my home" 
                      onClick={() => {
                        setIsOpen(false);
                        rentModal.onOpen();
                      }}
                    />
                  </>
                )}
                <MenuItem 
                  label="Account settings" 
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/${currentUser.userRole?.toLowerCase()}s/settings`);
                  }}
                />
                <hr />
                <MenuItem 
                  label="Logout" 
                  onClick={handleSignOut}
                />
              </>
            ) : (
              <>
                <MenuItem 
                  label="Login" 
                  onClick={() => {
                    setIsOpen(false);
                    loginModal.onOpen();
                  }}
                />
                <MenuItem 
                  label="Sign up" 
                  onClick={() => {
                    setIsOpen(false);
                    registerModal.onOpen();
                  }}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
