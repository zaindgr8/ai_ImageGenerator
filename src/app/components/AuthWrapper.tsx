"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

// Pages that don't require authentication
const publicPages = ["/login", "/signup"];

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Don't do anything while auth is loading
    if (loading) return;

    // Check if the current page is public
    const isPublicPage = publicPages.includes(pathname || "");

    // If user is not authenticated and page is not public, redirect to login
    if (!user && !isPublicPage) {
      router.push("/login");
      return;
    }

    // If user is authenticated and on a public page (like login), redirect to home
    if (user && isPublicPage) {
      router.push("/");
      return;
    }

    // Otherwise, show the page
    setIsAuthorized(true);
  }, [user, loading, router, pathname]);

  // Show loading state while authentication is being determined
  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // At this point, either:
  // 1. The user is authenticated and trying to access a protected page
  // 2. The page is public and can be accessed by anyone
  return <>{children}</>;
}
