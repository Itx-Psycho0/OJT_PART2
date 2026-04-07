"use client";

import Link from "next/link";
import Image from "next/image";
import SearchInput from "./search-input";
import { useAuthStore } from "@/store/use-auth-store";
import { LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const { user, logout } = useAuthStore();

  return (
    <nav className="flex items-center mt-1 justify-between h-full w-full ">
      <div className="flex gap-3 items-center shrink-0 pr-6">
        <Link href="/">
          <Image src="/logo.svg" alt="logo" width={60} height={60} />
        </Link>
        <div className="text-3xl">CoLabs</div>
      </div>
      <SearchInput />
      <div className="flex items-center gap-3 pl-6 shrink-0">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full hover:bg-neutral-100 p-1 pr-2 transition-colors">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 border-b border-neutral-100">
                <p className="text-sm font-medium truncate">{user.displayName}</p>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
              </div>
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-neutral-700"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
};
