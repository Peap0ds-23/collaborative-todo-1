"use client";

import { useState } from "react";
import { signout } from "@/actions/auth/actions";
import { Button } from "@/components/ui/button";
import { LoadingSpinner, LogOutIcon } from "@/components/icons";

export default function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      // Clear all localStorage
      if (typeof window !== "undefined") {
        localStorage.clear();

        // Clear all cookies by setting them to expire
        document.cookie.split(";").forEach((cookie) => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });

        // Clear sessionStorage
        sessionStorage.clear();
      }

      // Call server signout action
      await signout();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSignOut}
      disabled={isLoading}
      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Sign out"
      title="Sign out"
    >
      {isLoading ? (
        <LoadingSpinner className="w-5 h-5 text-gray-700 dark:text-gray-400" />
      ) : (
        <LogOutIcon className="w-5 h-5 text-gray-700 dark:text-gray-400" />
      )}
    </Button>
  );
}
