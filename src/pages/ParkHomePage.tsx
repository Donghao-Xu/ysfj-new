import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Compass,
  Layers,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { CulturalIcon } from "@/components/Icon";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useAppState } from "@/context/AppContext";

export function ParkHomePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { getPark, getBuildingsForPark, visitedBuildings } = useAppState();
  const park = getPark(slug ?? "");

  if (!park) {
    return (
      <div className="min-h-screen bg-[#f6f0e5] pb-24">
        <div className="mx-auto max-w-[520px] p-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#922e25] cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>返回首页</span>
          </button>
          <p className="text-[14px] text-[#39251d]">
            没有找到这个文化园区，请返回首页。
          </p>
        </div>
        <BottomNav forceHomeActive />
      </div>
    );
  }

  const parkBuildings = getBuildingsForPark(park.slug);
  const visibleBuildings = parkBuildings.filter(
    (building) =>
      !activeCategory || building.categoryIds.includes(activeCategory),
  );
  const visitedCount = parkBuildings.filter((b) =>
    visitedBuildings.includes(b.id),
  ).length;

  return (
    <div className="min-h-screen bg-[#f6f0e5] pb-24">
      <header className="sticky top-0 z-20 border-b border-[#e4d8c3]/70 bg-[#f6f0e5]/95 backdrop-blur-md">
        <div className="mx-auto flex h-13 max-w-[520px] items-center justify-between px-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="返回"
              onClick={() => navigate("/")}
              className="flex items-center gap-1 text-[13px] font-medium text-[#39251d] hover:opacity-75 cursor-pointer"
            >
              <ArrowLeft size={18} />
              <span>返回</span>
            </button>
            <h1 className="truncate text-[16px] font-bold text-[#39251d]">
              {park.title}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/places/${park.slug}`)}
            className="inline-flex shrink-0 items-center gap-1 rounded-[14px] bg-[#eadfc9] px-2.5 py-1 text-[10px] font-semibold text-[#563b2c] cursor-pointer"
          >
            <Sparkles size={11} className="text-[#922e25]" />
            <span>文化脉络</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-[19px] pt-[15px]">
        <OfflineIndicator />

        {/* Park Hero */}
        <section className="relative flex h-[252px] flex-col justify-end overflow-hidden rounded-[24px] bg-[#563b2c]">
          <img
            src={park.image}
            alt={park.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 top-[20%]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(57, 37, 29, 0) 0%, rgba(57, 37, 29, 0.91) 100%)",
            }}
          />
          <div className="relative z-10 flex flex-col items-start px-[18px] pb-[18px]">
            <div className="mb-[9px] inline-flex items-center gap-1.5 rounded-[18px] bg-[#c59a53] px-[9px] py-1.5">
              <Compass size={13} className="text-[#39251d]" />
              <span className="text-[10px] font-bold text-[#39251d]">
                {park.identity}
              </span>
            </div>
            <h2 className="text-[25px] font-bold text-[#fff8eb]">
              {park.title}
            </h2>
            <p className="mt-[3px] text-[10px] text-[#fff8eb]/80">
              {park.englishTitle}
            </p>
            <p className="mt-2 text-[11px] text-[#fff8eb]/90">
              {parkBuildings.length} 处建筑空间 · 已打卡 {visitedCount} 处
            </p>
          </div>
        </section>

        {/* Intro Card */}
        <section className="mt-[14px] rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] p-[15px]">
          <p className="text-[10px] tracking-[1px] text-[#c59a53]">园区介绍</p>
          <p className="mt-[7px] text-[12px] leading-5 text-[#563b2c]">
            {park.introduction}
          </p>
        </section>

        {/* Categories */}
        <div className="mt-[22px] mb-[11px] flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold text-[#39251d]">内容分类</h3>
            <p className="mt-1 text-[10px] text-[#857362]">
              只显示本园区的文化内容
            </p>
          </div>
          <Layers size={18} className="text-[#c59a53]" />
        </div>

        <div className="flex flex-wrap gap-[7px]">
          <button
            type="button"
            aria-pressed={!activeCategory}
            onClick={() => setActiveCategory(null)}
            className={`rounded-[18px] px-[11px] py-2 text-[10px] font-semibold transition-opacity hover:opacity-90 cursor-pointer ${
              !activeCategory
                ? "bg-[#922e25] text-[#fff8eb]"
                : "bg-[#eadfc9] text-[#563b2c]"
            }`}
          >
            全部
          </button>
          {park.categories.map((category) => {
            const selected = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveCategory(selected ? null : category.id)}
                className={`inline-flex items-center gap-1.5 rounded-[18px] px-[11px] py-2 text-[10px] font-semibold transition-opacity hover:opacity-90 cursor-pointer ${
                  selected
                    ? "bg-[#922e25] text-[#fff8eb]"
                    : "bg-[#eadfc9] text-[#563b2c]"
                }`}
              >
                <CulturalIcon
                  name={category.icon}
                  size={13}
                  className={selected ? "text-[#fff8eb]" : "text-[#922e25]"}
                />
                <span>{category.title}</span>
              </button>
            );
          })}
        </div>

        {/* Buildings Grid */}
        <div className="mt-[22px] mb-[11px] flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold text-[#39251d]">建筑场景</h3>
            <p className="mt-1 text-[10px] text-[#857362]">
              {activeCategory
                ? `当前展示 ${visibleBuildings.length} 处相关建筑`
                : "点击建筑，查看对应介绍与场景"}
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#39251d]">
            {visibleBuildings.length} / {parkBuildings.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {visibleBuildings.map((building, index) => {
            const categoryName = park.categories.find((category) =>
              building.categoryIds.includes(category.id),
            )?.title;
            const visited = visitedBuildings.includes(building.id);

            return (
              <button
                key={building.id}
                type="button"
                aria-label={`查看${building.title}详情`}
                onClick={() => navigate(`/parks/buildings/${building.id}`)}
                className="flex min-h-[145px] flex-col rounded-[14px] border border-[#e4d8c3] bg-[#fffaf1] p-[13px] text-left transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[1px] text-[#c59a53]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-1">
                    {visited && (
                      <CheckCircle2 size={14} className="text-[#922e25]" />
                    )}
                    <ArrowUpRight size={15} className="text-[#922e25]" />
                  </div>
                </div>
                <div className="mt-[7px] flex h-[37px] w-[37px] items-center justify-center rounded-[13px] bg-[#c59a53]">
                  <CulturalIcon
                    name={building.icon}
                    size={19}
                    className="text-[#39251d]"
                  />
                </div>
                <span className="mt-2 text-[14px] font-bold text-[#39251d]">
                  {building.title}
                </span>
                <span className="mt-1 text-[10px] leading-[15px] text-[#857362]">
                  {categoryName ?? building.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-[19px] text-center text-[10px] leading-4 text-[#857362]">
          {park.title}内容独立维护，建筑介绍只展示所属园区的相关文化。
        </p>
      </main>
      <BottomNav forceHomeActive />
    </div>
  );
}
