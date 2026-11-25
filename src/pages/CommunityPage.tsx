import { ArrowLeft, Check, ChevronRight, Heart, Plus, Sun, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { CulturalIcon } from "@/components/Icon";
import { useAppState } from "@/context/AppContext";

export function CommunityPage() {
  const navigate = useNavigate();
  const { gatherings, joinedGatherings, toggleGathering } = useAppState();

  return (
    <AppShell forceActivePath="/meditation">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate("/meditation")}
            className="inline-flex min-h-[38px] items-center gap-1.5 text-sm font-medium text-[#4c362a] hover:text-[#922e25] cursor-pointer dark:text-[#dccbb6]"
          >
            <ArrowLeft size={16} />
            <span>返回静心修习</span>
          </button>

          <nav
            aria-label="层级路径"
            className="hidden items-center gap-1 text-xs text-[#857362] sm:flex dark:text-[#a79886]"
          >
            <button
              type="button"
              onClick={() => navigate("/meditation")}
              className="hover:text-[#922e25] cursor-pointer"
            >
              静心修习
            </button>
            <ChevronRight size={12} />
            <span className="font-semibold text-[#922e25] dark:text-[#d4a85d]">
              共修安排
            </span>
          </nav>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-[1.6px] text-[#b88b44]">
            同心 · 共读 · 共修
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eadfc9] dark:bg-[#2a211c]">
            <Users size={18} className="text-[#b88b44]" />
          </div>
        </div>

        <h1 className="mt-4 font-serif-display text-3xl font-bold text-[#39251d] dark:text-[#efe7da]">
          共修安排
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[#857362] dark:text-[#a79886]">
          以文化相连，在日常里一起留一刻清净。不设排名，不强制参与。
        </p>

        {/* Welcome Card */}
        <section className="mt-6 flex flex-col items-center rounded-[22px] bg-[#922e25] p-6 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff8eb]/15">
            <Heart size={20} className="text-[#fff8eb]" />
          </div>
          <h2 className="mt-3 font-serif-display text-lg font-bold text-[#fff8eb]">
            善意相连，静心同行
          </h2>
          <p className="mt-1 text-xs text-[#fff8eb]/85">
            选择一项共修安排，为自己的日常留白。
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-px w-9 bg-[#c59a53]" />
            <Sun size={14} className="text-[#c59a53]" />
            <span className="h-px w-9 bg-[#c59a53]" />
          </div>
        </section>

        <div className="mt-7 mb-3 flex items-center justify-between">
          <h2 className="font-serif-display text-lg font-bold text-[#39251d] dark:text-[#efe7da]">
            近期共读与静修时段
          </h2>
          <span className="text-xs text-[#857362] dark:text-[#a79886]">
            已参与 {joinedGatherings.length} 项
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {gatherings.map((item) => {
            const isJoined = joinedGatherings.includes(item.id);
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-[#e4d8c3] bg-[#fffaf1] p-4 dark:border-[#332922] dark:bg-[#1f1a17]"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eadfc9] dark:bg-[#2a211c]">
                      <CulturalIcon
                        name={item.icon}
                        size={18}
                        className="text-[#922e25] dark:text-[#d4a85d]"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-[#b88b44]">
                        {item.day} · {item.time}
                      </p>
                      <p className="mt-0.5 font-serif-display text-base font-bold text-[#39251d] dark:text-[#efe7da]">
                        {item.title}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#857362] dark:text-[#a79886]">
                    {item.description}
                  </p>
                </div>
                <button
                  type="button"
                  aria-pressed={isJoined}
                  aria-label={
                    isJoined ? `退出${item.title}` : `参加${item.title}`
                  }
                  onClick={() => void toggleGathering(item.id)}
                  className={`mt-4 flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-90 cursor-pointer ${
                    isJoined
                      ? "bg-[#eadfc9] text-[#922e25] dark:bg-[#2a211c] dark:text-[#d4a85d]"
                      : "bg-[#922e25] text-[#fff8eb]"
                  }`}
                >
                  {isJoined ? <Check size={15} /> : <Plus size={15} />}
                  <span>{isJoined ? "已加入 · 轻触退出" : "参与共修"}</span>
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-[#857362] dark:text-[#a79886]">
          共修安排为应用内的文化体验，不代表具体宗教组织活动。
        </p>
      </div>
    </AppShell>
  );
}
