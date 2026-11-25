import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { GlobalSoundControl } from "@/components/GlobalSoundControl";
import { OfflineIndicator } from "@/components/OfflineIndicator";

const navItems = [
  { label: "首页", path: "/" },
  { label: "佛道世界", path: "/worlds" },
  { label: "经典", path: "/classics" },
  { label: "静修", path: "/meditation" },
  { label: "我的", path: "/mine" },
] as const;

export function AppShell({
  children,
  forceActivePath,
  realmTone = "default",
}: {
  children: ReactNode;
  forceActivePath?: string;
  realmTone?: "default" | "buddhist" | "daoist";
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const isNavActive = (path: string) => {
    if (forceActivePath) return path === forceActivePath;
    if (path === "/") return location.pathname === "/";
    if (path === "/worlds") {
      return (
        location.pathname.startsWith("/worlds") ||
        location.pathname.startsWith("/parks") ||
        location.pathname.startsWith("/places") ||
        location.pathname.startsWith("/pilgrimage")
      );
    }
    if (path === "/meditation") {
      return (
        location.pathname.startsWith("/meditation") ||
        location.pathname.startsWith("/chanting")
      );
    }
    return location.pathname.startsWith(path);
  };

  const bgClass =
    realmTone === "daoist"
      ? "bg-[#eef3f0] dark:bg-[#101917]"
      : "bg-[#f6f1e7] dark:bg-[#14110f]";

  return (
    <div className={`min-h-screen ${bgClass} pb-20 md:pb-12 transition-colors duration-200`}>
      {/* Desktop Top Bar: 3-zone contract (Wordmark — 5 nav links — 1 primary CTA) */}
      <header className="sticky top-0 z-30 hidden border-b border-[#e2d7c5]/80 bg-[#f6f1e7]/92 backdrop-blur-md dark:border-[#332922]/80 dark:bg-[#14110f]/92 md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-serif-display text-lg font-bold tracking-wider text-[#2c221e] whitespace-nowrap shrink-0 cursor-pointer dark:text-[#efe7da]"
          >
            云上梵境
          </button>

          <nav
            aria-label="桌面主导航"
            className="flex items-center gap-7 text-sm font-medium"
          >
            {navItems.map((item) => {
              const active = isNavActive(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  aria-current={active ? "page" : undefined}
                  className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? "font-semibold text-[#922e25] underline decoration-[#b88b44] decoration-2 underline-offset-8 dark:text-[#d4a85d]"
                      : "text-[#6e5d4f] hover:text-[#2c221e] dark:text-[#b2a18f] dark:hover:text-[#efe7da]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <span className="hidden text-xs tracking-widest text-[#857362] whitespace-nowrap shrink-0 lg:inline dark:text-[#b2a18f]">
            一念清净 · 云开见境
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-4 md:px-6 md:pt-8">
        <OfflineIndicator />
        <div key={location.pathname} className="animate-page-enter">
          {children}
        </div>
      </div>

      <GlobalSoundControl realmTone={realmTone} />
      <BottomNav forceActivePath={forceActivePath} />
    </div>
  );
}
