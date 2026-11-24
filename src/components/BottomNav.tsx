import { BookOpen, Home, Music, User, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { label: "首页", path: "/", icon: Home },
  { label: "经典", path: "/classics", icon: BookOpen },
  { label: "诵经", path: "/chanting", icon: Music },
  { label: "共修", path: "/community", icon: Users },
  { label: "我的", path: "/mine", icon: User },
] as const;

export function BottomNav({ forceHomeActive = false }: { forceHomeActive?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      aria-label="主导航"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e4d8c3] bg-[#f6f0e5]/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-[520px] items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = forceHomeActive
            ? tab.path === "/"
            : tab.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(tab.path);

          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              aria-current={active ? "page" : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-1.5 transition-opacity active:opacity-75 cursor-pointer"
            >
              <Icon
                size={21}
                strokeWidth={1.9}
                className={active ? "text-[#922e25]" : "text-[#857362]"}
              />
              <span
                className={`text-[11px] leading-none ${
                  active
                    ? "font-bold text-[#922e25]"
                    : "font-medium text-[#857362]"
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
