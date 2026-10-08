"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Hotel, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isLoggedIn, openAuthModal } = useAuth();

  // Hide on admin/manager/profile dashboard views where full-screen dashboard controls exist
  const isDashboardRoute =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/manage") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  if (isDashboardRoute) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Explore",
      href: "/destinations",
      icon: Compass,
      isActive: pathname.startsWith("/destinations") || pathname.startsWith("/tours"),
    },
    {
      label: "Hotels",
      href: "/hotels",
      icon: Hotel,
      isActive: pathname.startsWith("/hotels"),
    },
    {
      label: "Community",
      href: "/community",
      icon: MessageSquare,
      isActive: pathname.startsWith("/community"),
    },
    {
      label: isLoggedIn ? "Profile" : "Sign In",
      href: isLoggedIn ? "/profile" : "#signin",
      icon: User,
      isActive: pathname.startsWith("/profile"),
      onClick: (e: React.MouseEvent) => {
        if (!isLoggedIn) {
          e.preventDefault();
          openAuthModal("login");
        }
      },
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb- safe"
    >
      <div className="grid grid-cols-5 items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 ${
                active
                  ? "text-stone-900 font-semibold"
                  : "text-stone-400 hover:text-stone-600 font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    active ? "scale-110 stroke-[2.25]" : "stroke-[1.75]"
                  }`}
                />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-stone-900" />
                )}
              </div>
              <span className="text-[10px] mt-1 leading-none tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
