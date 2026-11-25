import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Compass,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { CulturalIcon } from "@/components/Icon";
import { ResilientImage } from "@/components/ResilientImage";
import { useAppState } from "@/context/AppContext";
import { getBuildingDedicatedImage, sceneImages } from "@/data/scenes";

export function ParkHomePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { getPark, getBuildingsForPark, visitedBuildings } = useAppState();
  const park = getPark(slug ?? "");
  const realmTone = park?.slug === "daoist" ? "daoist" : "default";

  if (!park) {
    return (
      <AppShell forceActivePath="/worlds">
        <div className="mx-auto max-w-2xl py-8">
          <button
            type="button"
            onClick={() => navigate("/worlds")}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#922e25] cursor-pointer dark:text-[#d4a85d]"
          >
            <ArrowLeft size={16} />
            <span>返回佛道世界</span>
          </button>
          <p className="text-sm text-[#39251d] dark:text-[#efe7da]">
            没有找到这个文化空间，请返回佛道世界重新选择。
          </p>
        </div>
      </AppShell>
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
    <AppShell forceActivePath="/worlds" realmTone={realmTone}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <button
            type="button"
            aria-label="返回"
            onClick={() =>
              navigate(
                park.slug === "buddhist"
                  ? "/worlds/buddhist"
                  : park.slug === "daoist"
                    ? "/worlds/daoist"
                    : "/worlds",
              )
            }
            className="flex items-center gap-1 text-sm font-medium text-[#39251d] hover:opacity-75 cursor-pointer dark:text-[#efe7da]"
          >
            <ArrowLeft size={18} />
            <span>
              返回{park.slug === "buddhist" ? "佛教梵境" : park.slug === "daoist" ? "道教仙境" : "佛道世界"}
            </span>
          </button>

          <nav
            aria-label="层级路径"
            className="hidden items-center gap-1 text-xs text-[#857362] sm:flex dark:text-[#a79886]"
          >
            <button
              type="button"
              onClick={() => navigate("/")}
              className="hover:text-[#922e25] cursor-pointer"
            >
              首页
            </button>
            <ChevronRight size={12} />
            <button
              type="button"
              onClick={() => navigate("/worlds")}
              className="hover:text-[#922e25] cursor-pointer"
            >
              佛道世界
            </button>
            <ChevronRight size={12} />
            <button
              type="button"
              onClick={() =>
                navigate(
                  park.slug === "buddhist" ? "/worlds/buddhist" : "/worlds/daoist",
                )
              }
              className="hover:text-[#922e25] cursor-pointer"
            >
              {park.slug === "buddhist" ? "佛教梵境" : "道教仙境"}
            </button>
            <ChevronRight size={12} />
            <span className="font-semibold text-[#922e25] dark:text-[#d4a85d]">
              建筑档案全览
            </span>
          </nav>
        </div>

        <h1 className="truncate font-serif-display text-base font-bold text-[#39251d] dark:text-[#efe7da]">
          {park.title}
        </h1>
      </div>

      {/* Park Hero */}
      <section className="relative flex min-h-[250px] md:min-h-[300px] flex-col justify-end overflow-hidden rounded-[22px] bg-[#2a221d]">
        <ResilientImage
          src={
            park.slug === "buddhist"
              ? sceneImages.buddhistGate
              : park.slug === "daoist"
                ? sceneImages.daoistMountain
                : park.image
          }
          alt={park.title}
          tone={park.slug === "daoist" ? "daoist" : "buddhist"}
          fallbackTitle={park.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(28, 20, 16, 0.92) 8%, rgba(28, 20, 16, 0.4) 55%, rgba(28, 20, 16, 0.1) 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-start p-5 md:p-8">
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#d4a85d]">
            <Compass size={13} />
            <span>{park.identity}</span>
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-[#fff8eb] md:text-3xl">
            {park.title}
          </h2>
          <p className="mt-1 text-xs text-[#fff8eb]/80">{park.englishTitle}</p>
          <p className="mt-2 text-xs text-[#fff8eb]/90">
            {parkBuildings.length} 处建筑空间 · 已寻访 {visitedCount} 处
          </p>
        </div>
      </section>

      {/* Intro Card */}
      <section className="mt-5 rounded-xl border border-[#e4d8c3] bg-[#fffaf1] p-5 dark:border-[#332922] dark:bg-[#1f1a17]">
        <p className="text-[11px] font-semibold tracking-widest text-[#b88b44]">
          空间介绍
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#563b2c] dark:text-[#cfc2b2]">
          {park.introduction}
        </p>
      </section>

      {/* Categories */}
      <div className="mt-7 mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-serif-display text-lg font-bold text-[#39251d] dark:text-[#efe7da]">
            内容分类
          </h3>
          <p className="mt-0.5 text-xs text-[#857362] dark:text-[#a79886]">
            只显示所属体系内的文化内容
          </p>
        </div>
        <Layers size={18} className="text-[#c59a53]" />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!activeCategory}
          onClick={() => setActiveCategory(null)}
          className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-opacity hover:opacity-90 cursor-pointer ${
            !activeCategory
              ? "bg-[#922e25] text-[#fff8eb]"
              : "bg-[#eadfc9] text-[#563b2c] dark:bg-[#2a211c] dark:text-[#d8cab8]"
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
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-opacity hover:opacity-90 cursor-pointer ${
                selected
                  ? "bg-[#922e25] text-[#fff8eb]"
                  : "bg-[#eadfc9] text-[#563b2c] dark:bg-[#2a211c] dark:text-[#d8cab8]"
              }`}
            >
              <CulturalIcon
                name={category.icon}
                size={13}
                className={
                  selected
                    ? "text-[#fff8eb]"
                    : "text-[#922e25] dark:text-[#d4a85d]"
                }
              />
              <span>{category.title}</span>
            </button>
          );
        })}
      </div>

      {/* Buildings Grid */}
      <div className="mt-7 mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-serif-display text-lg font-bold text-[#39251d] dark:text-[#efe7da]">
            建筑场景
          </h3>
          <p className="mt-0.5 text-xs text-[#857362] dark:text-[#a79886]">
            {activeCategory
              ? `当前展示 ${visibleBuildings.length} 处相关建筑`
              : "点击建筑，查看对应介绍与场景"}
          </p>
        </div>
        <span className="text-xs font-semibold text-[#39251d] dark:text-[#efe7da]">
          {visibleBuildings.length} / {parkBuildings.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleBuildings.map((building, index) => {
          const categoryName = park.categories.find((category) =>
            building.categoryIds.includes(category.id),
          )?.title;
          const visited = visitedBuildings.includes(building.id);
          const thumbImage = getBuildingDedicatedImage(
            building.id,
            park.slug,
            park.image,
          );

          return (
            <button
              key={building.id}
              type="button"
              aria-label={`查看${building.title}详情`}
              onClick={() => navigate(`/parks/buildings/${building.id}`)}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#e4d8c3] bg-[#fffaf1] text-left transition-all hover:border-[#c59a53] hover:shadow-md cursor-pointer dark:border-[#332922] dark:bg-[#1f1a17]"
            >
              <div className="relative h-36 w-full overflow-hidden bg-[#2a221d]">
                <ResilientImage
                  src={thumbImage}
                  alt={building.title}
                  tone={park.slug === "daoist" ? "daoist" : "buddhist"}
                  fallbackTitle={building.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(28, 20, 16, 0.72) 0%, rgba(28, 20, 16, 0.1) 55%, transparent 100%)",
                  }}
                />
                <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
                  <span className="rounded bg-[#1e1712]/70 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-[#f3dba8] backdrop-blur-xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-1.5 rounded-full bg-[#1e1712]/65 px-2 py-1 backdrop-blur-xs">
                    {visited && (
                      <CheckCircle2
                        size={13}
                        className="text-[#d4a85d]"
                      />
                    )}
                    <ArrowUpRight
                      size={14}
                      className="text-[#fff8eb]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#c59a53]/20 text-[#922e25] dark:bg-[#c59a53]/15 dark:text-[#d4a85d]">
                    <CulturalIcon
                      name={building.icon}
                      size={16}
                    />
                  </div>
                  <span className="font-serif-display text-base font-bold text-[#39251d] dark:text-[#efe7da]">
                    {building.title}
                  </span>
                </div>
                <span className="mt-2 text-xs leading-relaxed text-[#857362] dark:text-[#a79886]">
                  {categoryName ?? building.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-[#857362] dark:text-[#a79886]">
        {park.title}内容独立维护，建筑介绍只展示所属体系的相关文化。
      </p>
    </AppShell>
  );
}
