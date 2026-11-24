import {
  BookOpen,
  Bookmark,
  ChevronRight,
  Heart,
  Music,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { CulturalIcon } from "@/components/Icon";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useAppState } from "@/context/AppContext";
import type { Scripture } from "@/data/parks";

export function ClassicsPage() {
  const navigate = useNavigate();
  const { scriptures, favoriteScriptures, toggleFavoriteScripture } =
    useAppState();
  const [selected, setSelected] = useState<Scripture | null>(null);

  return (
    <div className="min-h-screen bg-[#f6f0e5] pb-24">
      <main className="mx-auto max-w-[520px] px-[22px] pt-6">
        <OfflineIndicator />

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-[1.6px] text-[#c59a53]">
            典籍 · 诵读 · 观心
          </span>
          <div className="flex h-[37px] w-[37px] items-center justify-center rounded-[13px] bg-[#eadfc9]">
            <BookOpen size={17} className="text-[#c59a53]" />
          </div>
        </div>

        <h1 className="mt-[15px] text-[31px] font-bold text-[#39251d]">经典</h1>
        <p className="mt-1.5 text-[13px] leading-[21px] text-[#857362]">
          从一段古文开始，走近中华传统思想与修习智慧。
        </p>

        {/* Feature Card */}
        <div className="mt-[22px] flex items-center rounded-[18px] bg-[#922e25] p-4">
          <div className="mr-3 flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[15px] bg-[#fff8eb]/15">
            <Bookmark size={20} className="text-[#fff8eb]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-[#fff8eb]/75">
              今日共读 · 已收藏 {favoriteScriptures.length} 部
            </p>
            <p className="mt-1 text-[14px] font-bold text-[#fff8eb]">
              读一段经典，静一刻心
            </p>
          </div>
          <Sun size={21} className="text-[#c59a53]" />
        </div>

        <h2 className="mt-7 mb-3 text-[16px] font-bold text-[#39251d]">
          精选典籍
        </h2>

        <div className="space-y-2.5">
          {scriptures.map((item) => {
            const isFav = favoriteScriptures.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`阅读${item.title}`}
                onClick={() => setSelected(item)}
                className="flex w-full items-center rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] p-[14px] text-left transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
              >
                <div className="mr-3 flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[14px] bg-[#eadfc9]">
                  <CulturalIcon
                    name={item.icon}
                    size={18}
                    className="text-[#922e25]"
                  />
                </div>
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] tracking-[0.4px] text-[#c59a53]">
                      {item.tradition}
                    </p>
                    {isFav && (
                      <Heart
                        size={11}
                        className="fill-[#922e25] text-[#922e25]"
                      />
                    )}
                  </div>
                  <p className="mt-1 text-[16px] font-bold text-[#39251d]">
                    {item.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-[17px] text-[#857362]">
                    {item.description}
                  </p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-[#857362]" />
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-[10px] leading-4 text-[#857362]">
          经典内容用于文化阅读与交流，欢迎带着敬意细细品读。
        </p>
      </main>

      {/* Scripture Full-Text Modal */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#39251d]/55"
          onClick={() => setSelected(null)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-[520px] flex-col rounded-t-[24px] bg-[#f6f0e5] px-[23px] pt-3 pb-7 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-[38px] shrink-0 rounded-[2px] bg-[#e4d8c3]" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] tracking-[0.7px] text-[#c59a53]">
                  {selected.tradition}
                </p>
                <h3 className="mt-[5px] text-[24px] font-bold text-[#39251d]">
                  {selected.title}
                </h3>
              </div>
              <button
                type="button"
                aria-label="收藏经典"
                onClick={() => void toggleFavoriteScripture(selected.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eadfc9] cursor-pointer"
              >
                <Heart
                  size={17}
                  className={
                    favoriteScriptures.includes(selected.id)
                      ? "fill-[#922e25] text-[#922e25]"
                      : "text-[#563b2c]"
                  }
                />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto pr-1">
              <div className="rounded-[14px] border border-[#e4d8c3] bg-[#fffaf1] p-4">
                <p className="text-center text-[16px] leading-7 font-semibold text-[#922e25]">
                  “{selected.excerpt}”
                </p>
              </div>
              <p className="mt-3 text-[12px] leading-[21px] text-[#857362]">
                {selected.description}
              </p>
              <div className="mt-4 whitespace-pre-line rounded-[14px] border border-[#e4d8c3] bg-[#fffaf1] p-4 text-[14px] leading-7 text-[#39251d]">
                {selected.fullText}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  const target = selected;
                  setSelected(null);
                  navigate("/chanting", {
                    state: { scriptureId: target.id },
                  });
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[22px] bg-[#922e25] py-3 text-[12px] font-bold text-[#fff8eb] cursor-pointer"
              >
                <Music size={15} />
                <span>静心诵读此篇</span>
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-[22px] bg-[#eadfc9] px-6 py-3 text-[12px] font-semibold text-[#563b2c] cursor-pointer"
              >
                收起
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
