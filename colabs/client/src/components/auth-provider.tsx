"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, checkAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isLoading) return;

    const isProtectedPath = pathname.startsWith("/documents");

    if (!user && isProtectedPath) {
      router.replace("/login");
    }

    if (user && pathname === "/login") {
      router.replace("/");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading && pathname.startsWith("/documents")) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
