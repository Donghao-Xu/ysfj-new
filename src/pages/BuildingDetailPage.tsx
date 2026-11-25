import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Compass,
  MapPin,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { CulturalIcon } from "@/components/Icon";
import { ResilientImage } from "@/components/ResilientImage";
import { useAppState } from "@/context/AppContext";
import {
  getBuildingDedicatedImage,
  getSceneByBuildingId,
} from "@/data/scenes";

export function BuildingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBuilding, getPark, visitedBuildings, markBuildingVisited } =
    useAppState();
  const building = getBuilding(id ?? "");
  const park = building ? getPark(building.parkSlug) : undefined;
  const realmTone = park?.slug === "daoist" ? "daoist" : "default";

  if (!building || !park) {
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
            没有找到这处建筑，请返回重新选择。
          </p>
        </div>
      </AppShell>
    );
  }

  const categories = park.categories.filter((category) =>
    building.categoryIds.includes(category.id),
  );
  const visited = visitedBuildings.includes(building.id);
  const dedicatedImage = getBuildingDedicatedImage(
    building.id,
    park.slug,
    park.image,
  );

  const matchedScene = getSceneByBuildingId(building.id);

  return (
    <AppShell forceActivePath="/worlds" realmTone={realmTone}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            aria-label="返回"
            onClick={() => navigate(`/parks/${park.slug}`)}
            className="flex items-center gap-1 text-sm font-medium text-[#39251d] hover:opacity-75 cursor-pointer dark:text-[#efe7da]"
          >
            <ArrowLeft size={18} />
            <span>返回{park.title}</span>
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
              onClick={() => navigate(`/parks/${park.slug}`)}
              className="hover:text-[#922e25] cursor-pointer"
            >
              建筑档案
            </button>
            <ChevronRight size={12} />
            <span className="font-semibold text-[#922e25] dark:text-[#d4a85d]">
              {building.title}
            </span>
          </nav>
        </div>

        {/* Hero */}
        <section className="relative flex min-h-[240px] md:min-h-[290px] flex-col justify-end overflow-hidden rounded-[22px] bg-[#2a221d]">
          <ResilientImage
            src={dedicatedImage}
            alt={building.title}
            tone={park.slug === "daoist" ? "daoist" : "buddhist"}
            fallbackTitle={building.title}
            className="animate-camera-push absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(28, 20, 16, 0.92) 8%, rgba(28, 20, 16, 0.35) 55%, rgba(28, 20, 16, 0.1) 100%)",
            }}
          />
          <div className="relative z-10 flex flex-col items-start p-5 md:p-8">
            <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#d4a85d]">
              <Compass size={13} />
              <span>{park.identity}</span>
            </div>
            <h1 className="font-serif-display text-2xl font-bold text-[#fff8eb] md:text-3xl">
              {building.title}
            </h1>
            <p className="mt-1 text-xs text-[#fff8eb]/85">{building.subtitle}</p>
          </div>
        </section>

        {/* Visit Footprint Button */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e4d8c3] bg-[#fffaf1] px-4 py-3.5 dark:border-[#332922] dark:bg-[#1f1a17]">
          <div>
            <p className="text-sm font-bold text-[#39251d] dark:text-[#efe7da]">
              {visited ? "已记录云游足迹" : "记录此次云游"}
            </p>
            <p className="mt-0.5 text-xs text-[#857362] dark:text-[#a79886]">
              登录后可跨设备同步您的寻访足迹
            </p>
          </div>
          <button
            type="button"
            onClick={() => void markBuildingVisited(building.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-opacity hover:opacity-90 cursor-pointer ${
              visited
                ? "bg-[#eadfc9] text-[#922e25] dark:bg-[#2c221d] dark:text-[#d4a85d]"
                : "bg-[#922e25] text-[#fff8eb]"
            }`}
          >
            {visited ? <CheckCircle2 size={14} /> : <MapPin size={14} />}
            <span>{visited ? "已记录" : "打卡留念"}</span>
          </button>
        </div>

        {/* Description */}
        <section className="mt-6">
          <p className="text-[11px] font-semibold tracking-widest text-[#b88b44]">
            建筑介绍
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#563b2c] dark:text-[#cfc2b2]">
            {building.description}
          </p>
        </section>

        {/* Scene Card */}
        <section className="mt-5 rounded-xl border border-[#e4d8c3] bg-[#fffaf1] p-5 dark:border-[#332922] dark:bg-[#1f1a17]">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#922e25]">
              <CulturalIcon
                name={building.icon}
                size={18}
                className="text-[#fff8eb]"
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#b88b44]">
                建筑场景
              </p>
              <p className="text-sm font-bold text-[#39251d] dark:text-[#efe7da]">
                空间导览
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#563b2c] dark:text-[#cfc2b2]">
            {building.scene}
          </p>
        </section>

        {/* Categories */}
        <section className="mt-6">
          <p className="text-[11px] font-semibold tracking-widest text-[#b88b44]">
            所属内容分类
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#eadfc9] px-3 py-1.5 dark:bg-[#2a211c]"
              >
                <CulturalIcon
                  name={category.icon}
                  size={13}
                  className="text-[#922e25] dark:text-[#d4a85d]"
                />
                <span className="text-xs font-semibold text-[#563b2c] dark:text-[#d8cab8]">
                  {category.title}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(`/parks/${park.slug}`)}
            className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl border border-[#e4d8c3] bg-[#fffaf1] text-sm font-bold text-[#39251d] transition-opacity hover:opacity-90 cursor-pointer dark:border-[#332922] dark:bg-[#1f1a17] dark:text-[#efe7da]"
          >
            <ArrowLeft size={16} />
            <span>返回{park.title}</span>
          </button>
          {matchedScene && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/worlds/${matchedScene.religionType}?scene=${matchedScene.sceneId}`,
                )
              }
              className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#922e25] text-sm font-bold text-[#fff8eb] transition-opacity hover:opacity-90 cursor-pointer"
            >
              <span>前往此殿实景互动</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
