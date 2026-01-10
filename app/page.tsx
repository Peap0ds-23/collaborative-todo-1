import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import Todos from "@/components/todos/todos";
import SignOutButton from "@/components/auth/signout-button";
import ThemeToggle from "@/components/theme/theme-toggle";
import NotificationBell from "@/components/notifications/notification-bell";

export default async function Home() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/signin");
  }

  return (
    <main className="min-h-screen flex flex-col gap-4 items-center justify-center bg-background">
      <div className="flex flex-col max-w-2xl w-full mx-4 border rounded-lg shadow-lg p-4 bg-card">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-4">
            <CheckCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            <h1 className="font-semibold text-2xl">Todos</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
        <Todos />
      </div>
    </main>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
