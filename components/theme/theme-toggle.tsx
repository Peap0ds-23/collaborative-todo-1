"use client";

import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "@/components/icons";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
            {theme === "light" ? (
                <MoonIcon className="w-5 h-5 text-gray-700" />
            ) : (
                <SunIcon className="w-5 h-5 text-yellow-400" />
            )}
        </Button>
    );
}
