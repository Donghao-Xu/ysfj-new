import { Check, Heart, Plus, Sun, Users } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { CulturalIcon } from "@/components/Icon";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useAppState } from "@/context/AppContext";

export function CommunityPage() {
  const { gatherings, joinedGatherings, toggleGathering } = useAppState();

  return (
    <div className="min-h-screen bg-[#f6f0e5] pb-24">
      <main className="mx-auto max-w-[520px] px-[22px] pt-6">
        <OfflineIndicator />

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-[1.6px] text-[#c59a53]">
            同心 · 共读 · 共修
          </span>
          <div className="flex h-[37px] w-[37px] items-center justify-center rounded-[13px] bg-[#eadfc9]">
            <Users size={17} className="text-[#c59a53]" />
          </div>
        </div>

        <h1 className="mt-[15px] text-[31px] font-bold text-[#39251d]">共修</h1>
        <p className="mt-1.5 text-[13px] leading-[21px] text-[#857362]">
          以文化相连，在日常里一起留一刻清净。
        </p>

        {/* Welcome Card */}
        <section className="mt-[22px] flex flex-col items-center rounded-[24px] bg-[#922e25] p-[19px] text-center">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[15px] bg-[#fff8eb]/15">
            <Heart size={20} className="text-[#fff8eb]" />
          </div>
          <h2 className="mt-[11px] text-[17px] font-bold text-[#fff8eb]">
            善意相连，静心同行
          </h2>
          <p className="mt-[5px] text-[11px] text-[#fff8eb]/80">
            选择一项共修安排，为自己的日常留白。
          </p>
          <div className="mt-[15px] flex items-center gap-2">
            <span className="h-px w-[35px] bg-[#c59a53]" />
            <Sun size={14} className="text-[#c59a53]" />
            <span className="h-px w-[35px] bg-[#c59a53]" />
          </div>
        </section>

        <div className="mt-[25px] mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#39251d]">共修安排</h2>
          <span className="text-[11px] text-[#857362]">
            已参与 {joinedGatherings.length} 项
          </span>
        </div>

        <div className="space-y-[11px]">
          {gatherings.map((item) => {
            const isJoined = joinedGatherings.includes(item.id);
            return (
              <div
                key={item.id}
                className="rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] p-[15px]"
              >
                <div className="flex items-center">
                  <div className="mr-[11px] flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] bg-[#eadfc9]">
                    <CulturalIcon
                      name={item.icon}
                      size={18}
                      className="text-[#922e25]"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] tracking-[0.3px] text-[#c59a53]">
                      {item.day} · {item.time}
                    </p>
                    <p className="mt-[3px] text-[15px] font-bold text-[#39251d]">
                      {item.title}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-[17px] text-[#857362]">
                  {item.description}
                </p>
                <button
                  type="button"
                  aria-pressed={isJoined}
                  aria-label={
                    isJoined ? `退出${item.title}` : `参加${item.title}`
                  }
                  onClick={() => void toggleGathering(item.id)}
                  className={`mt-3 flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-[20px] text-[11px] font-bold transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer ${
                    isJoined
                      ? "bg-[#eadfc9] text-[#922e25]"
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

        <p className="mt-[7px] text-[10px] leading-4 text-[#857362]">
          共修安排为应用内的文化体验，不代表具体宗教组织活动。
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
