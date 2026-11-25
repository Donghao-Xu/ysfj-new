import { BookOpen, Compass, Home, User, Wind } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { label: "首页", path: "/", icon: Home },
  { label: "佛道世界", path: "/worlds", icon: Compass },
  { label: "经典", path: "/classics", icon: BookOpen },
  { label: "静修", path: "/meditation", icon: Wind },
  { label: "我的", path: "/mine", icon: User },
] as const;

export function BottomNav({
  forceActivePath,
}: {
  forceActivePath?: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const isTabActive = (tabPath: string) => {
    if (forceActivePath) return tabPath === forceActivePath;
    if (tabPath === "/") return location.pathname === "/";
    if (tabPath === "/worlds") {
      return (
        location.pathname.startsWith("/worlds") ||
        location.pathname.startsWith("/parks") ||
        location.pathname.startsWith("/places") ||
        location.pathname.startsWith("/pilgrimage")
      );
    }
    if (tabPath === "/meditation") {
      return (
        location.pathname.startsWith("/meditation") ||
        location.pathname.startsWith("/chanting")
      );
    }
    return location.pathname.startsWith(tabPath);
  };

  return (
    <nav
      aria-label="底部主导航"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e2d7c5] bg-[#f6f1e7]/95 backdrop-blur-md dark:border-[#332922] dark:bg-[#14110f]/95 md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isTabActive(tab.path);

          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              aria-current={active ? "page" : undefined}
              className="flex min-h-[44px] flex-col items-center justify-center gap-1 py-1 transition-opacity active:opacity-75 cursor-pointer"
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.2 : 1.8}
                className={
                  active
                    ? "text-[#922e25] dark:text-[#d4a85d]"
                    : "text-[#6e5d4f] dark:text-[#b2a18f]"
                }
              />
              <span
                className={`text-[11px] leading-none whitespace-nowrap ${
                  active
                    ? "font-bold text-[#922e25] dark:text-[#d4a85d]"
                    : "font-medium text-[#6e5d4f] dark:text-[#b2a18f]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
