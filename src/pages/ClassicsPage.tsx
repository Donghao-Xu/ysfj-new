import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Heart,
  Info,
  Music,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { CulturalIcon } from "@/components/Icon";
import { useAppState } from "@/context/AppContext";
import type { Scripture } from "@/data/parks";

type ClassicTraditionTab = "buddhist" | "daoist";

export function ClassicsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab =
    searchParams.get("tradition") === "daoist" ? "daoist" : "buddhist";

  const {
    scriptures,
    favoriteScriptures,
    readingProgress,
    toggleFavoriteScripture,
    updateReadingProgress,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<ClassicTraditionTab>(initialTab);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selected, setSelected] = useState<Scripture | null>(null);
  const readingContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const param = searchParams.get("tradition");
    if (param === "daoist" || param === "buddhist") {
      setActiveTab(param);
    }
  }, [searchParams]);

  const switchTab = (tab: ClassicTraditionTab) => {
    setActiveTab(tab);
    setSearchParams({ tradition: tab }, { replace: true });
  };

  const buddhistList = useMemo(
    () => scriptures.filter((s) => s.parkSlug === "buddhist"),
    [scriptures],
  );
  const daoistList = useMemo(
    () => scriptures.filter((s) => s.parkSlug === "daoist"),
    [scriptures],
  );

  const visibleList = useMemo(() => {
    const base = activeTab === "buddhist" ? buddhistList : daoistList;
    const q = searchText.trim().toLowerCase();
    return base.filter((item) => {
      if (onlyFavorites && !favoriteScriptures.includes(item.id)) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.tradition.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q)
      );
    });
  }, [activeTab, buddhistList, daoistList, favoriteScriptures, onlyFavorites, searchText]);

  const handleOpenScripture = (item: Scripture) => {
    setSelected(item);
    if ((readingProgress[item.id] || 0) < 10) {
      updateReadingProgress(item.id, 10);
    }
  };

  const handleScrollReading = () => {
    if (!selected || !readingContainerRef.current) return;
    const el = readingContainerRef.current;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 20) {
      updateReadingProgress(selected.id, 100);
      return;
    }
    const pct = Math.round((el.scrollTop / maxScroll) * 100);
    if (pct > 10) {
      updateReadingProgress(selected.id, Math.min(100, pct));
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-medium tracking-wider text-[#b88b44]">
            经典图书馆 · 佛道分馆典藏
          </p>
          <h1 className="mt-1.5 font-serif-display text-3xl font-bold text-[#2c221e] dark:text-[#efe7da]">
            经典阅读
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-[#6e5d4f] dark:text-[#b2a18f]">
            佛教经典与道教经典严格分馆陈列，优先收录公版可靠译本与传世文本，支持个人收藏与阅读进度记录。
          </p>
        </div>

        <div className="text-xs text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
          佛经 {buddhistList.length} 部 · 道经 {daoistList.length} 部 · 已收藏{" "}
          {favoriteScriptures.length} 部
        </div>
      </div>

      {/* Category Switch + Filter Controls */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex rounded-xl bg-[#ebe2d2] p-1 dark:bg-[#2a221d]">
          <button
            type="button"
            onClick={() => switchTab("buddhist")}
            className={`min-h-[42px] rounded-lg px-5 py-2 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "buddhist"
                ? "bg-[#922e25] text-[#fff8eb]"
                : "text-[#4c362a] hover:text-[#2c221e] dark:text-[#dccbb6]"
            }`}
          >
            佛教经典（{buddhistList.length}）
          </button>
          <button
            type="button"
            onClick={() => switchTab("daoist")}
            className={`min-h-[42px] rounded-lg px-5 py-2 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "daoist"
                ? "bg-[#1f4e45] text-[#f3f8f5]"
                : "text-[#4c362a] hover:text-[#2c221e] dark:text-[#dccbb6]"
            }`}
          >
            道教经典（{daoistList.length}）
          </button>
        </div>

        <div className="flex flex-1 items-center gap-2.5 md:max-w-md">
          <div className="relative flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#6e5d4f]"
            />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索经名、导读或名句…"
              className="min-h-[42px] w-full rounded-xl border border-[#e2d7c5] bg-[#fcf9f2] pr-3 pl-9 text-xs text-[#2c221e] focus:border-[#922e25] focus:outline-none dark:border-[#332922] dark:bg-[#1d1815] dark:text-[#efe7da]"
            />
          </div>
          <button
            type="button"
            onClick={() => setOnlyFavorites((v) => !v)}
            className={`inline-flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              onlyFavorites
                ? "bg-[#922e25] text-[#fff8eb]"
                : "border border-[#e2d7c5] bg-[#fcf9f2] text-[#4c362a] dark:border-[#332922] dark:bg-[#1d1815] dark:text-[#dccbb6]"
            }`}
          >
            <Heart
              size={14}
              className={onlyFavorites ? "fill-current" : ""}
            />
            <span>仅看收藏</span>
          </button>
        </div>
      </div>

      {/* Scriptures Grid */}
      {visibleList.length === 0 ? (
        <div className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-8 text-center dark:border-[#332922] dark:bg-[#1d1815]">
          <BookOpen size={28} className="mx-auto text-[#b88b44]" />
          <p className="mt-3 text-sm font-semibold text-[#2c221e] dark:text-[#efe7da]">
            当前筛选条件下暂无匹配典籍
          </p>
          <p className="mt-1 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
            可清除搜索关键词或取消“仅看收藏”筛选。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibleList.map((item) => {
            const isFav = favoriteScriptures.includes(item.id);
            const progress = readingProgress[item.id] || 0;
            const accentColor =
              activeTab === "daoist"
                ? "text-[#1f4e45] dark:text-[#86bfb0]"
                : "text-[#922e25] dark:text-[#e5a89f]";
            const progressFill =
              activeTab === "daoist" ? "bg-[#1f4e45]" : "bg-[#922e25]";

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-5 transition-colors hover:bg-[#f7f2e7] dark:border-[#332922] dark:bg-[#1d1815] dark:hover:bg-[#241d19]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ebe2d2] dark:bg-[#2a221d]">
                        <CulturalIcon
                          name={item.icon}
                          size={19}
                          className={accentColor}
                        />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${accentColor}`}>
                          {item.tradition}
                        </p>
                        <h2 className="mt-0.5 font-serif-display text-lg font-bold text-[#2c221e] dark:text-[#efe7da]">
                          {item.title}
                        </h2>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={isFav ? `取消收藏${item.title}` : `收藏${item.title}`}
                      onClick={() => void toggleFavoriteScripture(item.id)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f6f1e7] hover:bg-[#ebe2d2] cursor-pointer dark:bg-[#241d19]"
                    >
                      <Heart
                        size={16}
                        className={
                          isFav
                            ? "fill-[#922e25] text-[#922e25]"
                            : "text-[#6e5d4f] dark:text-[#b2a18f]"
                        }
                      />
                    </button>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-[#4c362a] dark:text-[#dccbb6]">
                    {item.description}
                  </p>
                  <p className="mt-2.5 font-serif-display text-xs italic text-[#6e5d4f] dark:text-[#b2a18f]">
                    “{item.excerpt}”
                  </p>
                </div>

                <div className="mt-4 border-t border-[#e2d7c5] pt-3.5 dark:border-[#332922]">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
                    <span>阅读进度</span>
                    <span>
                      {progress >= 100 ? "已读完" : `${progress}%`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ebe2d2] dark:bg-[#2a221d]">
                    <div
                      className={`h-full transition-all duration-300 ${progressFill}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenScripture(item)}
                    className="mt-3 flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#ebe2d2] px-4 py-2 text-xs font-bold text-[#2c221e] hover:opacity-90 cursor-pointer dark:bg-[#2a221d] dark:text-[#efe7da]"
                  >
                    <span>打开全文阅读</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Honest Editorial Curation Note */}
      <section className="mt-8 rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-5 dark:border-[#332922] dark:bg-[#1d1815]">
        <div className="flex items-start gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-[#b88b44]" />
          <div className="text-xs leading-relaxed text-[#6e5d4f] dark:text-[#b2a18f]">
            <p className="font-semibold text-[#2c221e] dark:text-[#efe7da]">
              内容严谨性与版权说明
            </p>
            <p className="mt-1">
              {activeTab === "buddhist"
                ? "佛教经典分馆目前优先收录公版汉译经典（如《心经》《金刚经》《阿弥陀经》节选）。其余各宗派（天台、华严、律宗等）详注本仍在核实文献版本与校勘来源中，未完成核实前不作填充。"
                : "道教经典分馆目前收录公版通行本与《正统道藏》传统传本（如《道德经》《太上老君说常清静经》《庄子》选篇）。其余科仪斋醮、丹道文献正在核对可靠古籍来源，后续将逐步补充上线。"}
            </p>
          </div>
        </div>
      </section>

      {/* Scripture Full-Text Editorial Reader Modal */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs md:items-center md:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="animate-panel-up flex max-h-[88vh] w-full max-w-3xl flex-col rounded-t-3xl border border-[#e2d7c5] bg-[#f6f1e7] px-5 pt-4 pb-6 shadow-2xl md:rounded-3xl md:px-8 md:py-6 dark:border-[#332922] dark:bg-[#14110f]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#e2d7c5] pb-4 dark:border-[#332922]">
              <div>
                <p className="text-xs font-medium text-[#b88b44]">
                  {selected.tradition}
                </p>
                <h3 className="mt-1 font-serif-display text-2xl font-bold text-[#2c221e] dark:text-[#efe7da]">
                  {selected.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="收藏经典"
                  onClick={() => void toggleFavoriteScripture(selected.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ebe2d2] cursor-pointer dark:bg-[#2a221d]"
                >
                  <Heart
                    size={17}
                    className={
                      favoriteScriptures.includes(selected.id)
                        ? "fill-[#922e25] text-[#922e25]"
                        : "text-[#4c362a] dark:text-[#dccbb6]"
                    }
                  />
                </button>
                <button
                  type="button"
                  aria-label="关闭阅读窗口"
                  onClick={() => setSelected(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ebe2d2] text-[#4c362a] cursor-pointer dark:bg-[#2a221d] dark:text-[#dccbb6]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div
              ref={readingContainerRef}
              onScroll={handleScrollReading}
              className="mt-4 flex-1 overflow-y-auto pr-2"
            >
              <div className="mx-auto max-w-2xl space-y-4">
                <div className="rounded-xl border border-[#e2d7c5] bg-[#fcf9f2] p-4 text-center dark:border-[#332922] dark:bg-[#1d1815]">
                  <p className="font-serif-display text-base leading-relaxed font-semibold text-[#922e25] dark:text-[#d4a85d]">
                    “{selected.excerpt}”
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-[#6e5d4f] dark:text-[#b2a18f]">
                  {selected.description}
                </p>
                <div className="whitespace-pre-line rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-5 font-serif-display text-[15px] leading-[1.95] text-[#2c221e] md:p-7 md:text-base dark:border-[#332922] dark:bg-[#1d1815] dark:text-[#efe7da]">
                  {selected.fullText}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-[#e2d7c5] pt-4 dark:border-[#332922]">
              <div className="flex items-center gap-2 text-xs text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
                <span>
                  当前进度：{readingProgress[selected.id] || 0}%
                </span>
                <button
                  type="button"
                  onClick={() => updateReadingProgress(selected.id, 100)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#ebe2d2] px-2.5 py-1 text-[11px] font-semibold text-[#2c221e] hover:opacity-90 cursor-pointer dark:bg-[#2a221d] dark:text-[#efe7da]"
                >
                  <CheckCircle2 size={12} />
                  <span>标记已读完</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const target = selected;
                    setSelected(null);
                    navigate("/meditation", {
                      state: { scriptureId: target.id },
                    });
                  }}
                  className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[#922e25] px-4 py-2 text-xs font-bold text-[#fff8eb] cursor-pointer dark:bg-[#b5453a]"
                >
                  <Music size={14} />
                  <span>前往静心诵读</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="min-h-[42px] rounded-xl bg-[#ebe2d2] px-5 py-2 text-xs font-semibold text-[#4c362a] cursor-pointer dark:bg-[#2a221d] dark:text-[#dccbb6]"
                >
                  收起
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
