import { LucideArrowLeft, LucideCreditCard, LucideKey } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";

const navItems = [
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

  return (
    <main className="h-dvh flex flex-col max-w-2xl mx-auto px-6 py-10">
      <Link
        to="/"
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors w-fit mb-8"
      >
        <LucideArrowLeft className="size-4" />
        Back to chat
      </Link>

      <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}

      <nav className="mt-6 mb-5 flex items-center gap-2 border-b border-zinc-200 pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

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
