import { ArrowLeft, CheckCircle2, Info, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ResilientImage } from "@/components/ResilientImage";
import { useAppState } from "@/context/AppContext";
import { pilgrimageSites } from "@/data/v2Content";

type PilgrimageFilter = "all" | "buddhist" | "daoist";

export function PilgrimagePage() {
  const navigate = useNavigate();
  const { pilgrimageVisited, togglePilgrimageVisited } = useAppState();
  const [filter, setFilter] = useState<PilgrimageFilter>("all");

  const visibleSites = pilgrimageSites.filter(
    (s) => filter === "all" || s.tradition === filter,
  );

  return (
    <AppShell forceActivePath="/worlds">
      <div className="mb-4 flex items-center gap-2 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
        <button
          type="button"
          onClick={() => navigate("/worlds")}
          className="inline-flex items-center gap-1 font-medium text-[#4c362a] hover:text-[#922e25] cursor-pointer dark:text-[#dccbb6]"
        >
          <ArrowLeft size={14} />
          <span>佛道世界</span>
        </button>
        <span>/</span>
        <span className="font-semibold text-[#922e25] dark:text-[#d4a85d]">
          数字朝圣
        </span>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-medium tracking-wider text-[#b88b44]">
            数字朝圣 · 佛教名山与道教宫观巡礼
          </p>
          <h1 className="mt-1.5 font-serif-display text-3xl font-bold text-[#2c221e] dark:text-[#efe7da]">
            数字朝圣
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-[#6e5d4f] dark:text-[#b2a18f]">
            精选中国历史上有明确文献与文物依据的佛教名山古刹与道教名山宫观，分别介绍地理位置、建筑特色与史料来源。
          </p>
        </div>
        <p className="text-xs text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
          已记录心向朝圣 {pilgrimageVisited.length} / {pilgrimageSites.length} 处
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 inline-flex rounded-xl bg-[#ebe2d2] p-1 dark:bg-[#2a221d]">
        {[
          { id: "all" as const, label: "全部圣地" },
          { id: "buddhist" as const, label: "佛教名山古刹" },
          { id: "daoist" as const, label: "道教名山宫观" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`min-h-[40px] rounded-lg px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filter === item.id
                ? item.id === "daoist"
                  ? "bg-[#1f4e45] text-[#f3f8f5]"
                  : "bg-[#922e25] text-[#fff8eb]"
                : "text-[#4c362a] hover:text-[#2c221e] dark:text-[#dccbb6]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {visibleSites.map((site) => {
          const isVisited = pilgrimageVisited.includes(site.id);
          const isDao = site.tradition === "daoist";
          return (
            <article
              key={site.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] dark:border-[#332922] dark:bg-[#1d1815]"
            >
              <div className="relative h-52">
                <ResilientImage
                  src={site.image}
                  alt={site.name}
                  tone={isDao ? "daoist" : "buddhist"}
                  fallbackTitle={site.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-xs text-[#e5c17c]">
                    {isDao ? "道教圣地" : "佛教圣地"} · {site.categoryLabel}
                  </p>
                  <h2 className="mt-1 font-serif-display text-2xl font-bold text-[#fff8eb]">
                    {site.name}
                  </h2>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div className="space-y-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[#6e5d4f] dark:text-[#b2a18f]">
                    <MapPin size={14} />
                    <span>{site.location}</span>
                  </p>
                  <p className="text-sm leading-relaxed text-[#2c221e] dark:text-[#efe7da]">
                    {site.summary}
                  </p>
                  <p className="text-xs text-[#4c362a] dark:text-[#dccbb6]">
                    {site.highlights}
                  </p>
                  <p className="border-t border-[#e2d7c5] pt-2.5 text-[11px] text-[#6e5d4f] dark:border-[#332922] dark:text-[#b2a18f]">
                    {site.sourceNote}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => togglePilgrimageVisited(site.id)}
                  className={`mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
                    isVisited
                      ? "bg-[#ebe2d2] text-[#922e25] dark:bg-[#2a221d] dark:text-[#d4a85d]"
                      : isDao
                        ? "bg-[#1f4e45] text-[#f3f8f5]"
                        : "bg-[#922e25] text-[#fff8eb]"
                  }`}
                >
                  {isVisited ? <CheckCircle2 size={15} /> : <MapPin size={15} />}
                  <span>
                    {isVisited ? "已记录朝圣足迹（轻触取消）" : "记录心向朝圣足迹"}
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Future Map Scope Notice */}
      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-5 text-xs leading-relaxed text-[#6e5d4f] dark:border-[#332922] dark:bg-[#1d1815] dark:text-[#b2a18f]">
        <Info size={17} className="mt-0.5 shrink-0 text-[#b88b44]" />
        <p>
          当前版本提供名山与古建筑历史导览与足迹记录；交互式全景地图与三维古建漫游将在后续版本基于真实测绘与公开档案逐步建设。
        </p>
      </div>
    </AppShell>
  );
}
