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

export const SettingsLayout = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => {
  const location = useLocation();
  const { signOut } = useClerk();

  return (
    <main className="min-h-dvh flex flex-col max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors w-fit"
        >
          <LucideArrowLeft className="size-4" />
          Back to chat
        </Link>

        <button
          type="button"
          onClick={() => {
            signOut({ redirectUrl: "/sign-in" });
          }}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <LucideLogOut className="size-4" />
          Log out
        </button>
      </div>

      <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      )}

      <nav className="mt-6 mb-5 flex items-center gap-2 border-b border-zinc-200 pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.href ||
            location.pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </main>
  );
};
