import { useClerk } from "@clerk/clerk-react";
import {
  LucideArrowLeft,
  LucideCreditCard,
  LucideKey,
  LucideLogOut,
  LucideMail,
  LucideUserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "src/lib/utils";

const navItems = [
  {
    href: "/settings/account",
    label: "Account",
    icon: LucideUserRound,
  },
  {
    href: "/settings/api-key",
    label: "API Key",
    icon: LucideKey,
  },
  {
    href: "/settings/subscription",
    label: "Subscription",
    icon: LucideCreditCard,
  },
  {
    href: "/settings/contact",
    label: "Contact",
    icon: LucideMail,
  },
];

export const SettingsLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { signOut } = useClerk();

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-zinc-900 text-zinc-300">
        <div className="p-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <LucideArrowLeft className="size-4" />
            Back to chat
          </Link>
        </div>

        <nav className="flex flex-col gap-0.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="border-t border-zinc-800 p-3">
          <button
            type="button"
            onClick={() => {
              signOut({ redirectUrl: "/sign-in" });
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <LucideLogOut className="size-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-50 bg-zinc-900 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <LucideArrowLeft className="size-4" />
            Back
          </Link>
          <button
            type="button"
            onClick={() => {
              signOut({ redirectUrl: "/sign-in" });
            }}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <LucideLogOut className="size-4" />
            Log out
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-4 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content area */}
      <main className="flex-1 overflow-y-auto bg-zinc-200 pt-24 md:pt-0">
        <div className="max-w-3xl mx-auto px-6 py-10 md:px-10 md:py-12">
          {children}
        </div>
      </main>
    </div>
  );
};
