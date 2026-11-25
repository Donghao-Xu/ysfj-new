import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ResilientImage } from "@/components/ResilientImage";
import { useAppState } from "@/context/AppContext";
import {
  BUDDHIST_GATE_SCENE,
  BUDDHIST_SCENES,
  DAOIST_MOUNTAIN_SCENE,
  DAOIST_SCENES,
  sceneImages,
} from "@/data/scenes";

export function WorldsPage() {
  const navigate = useNavigate();
  const { getBuildingsForPark, visitedBuildings } = useAppState();

  const buddhistBuildings = getBuildingsForPark("buddhist");
  const daoistBuildings = getBuildingsForPark("daoist");
  const buddhistVisited = buddhistBuildings.filter((b) =>
    visitedBuildings.includes(b.id),
  ).length;
  const daoistVisited = daoistBuildings.filter((b) =>
    visitedBuildings.includes(b.id),
  ).length;

  return (
    <AppShell>
      {/* 简洁面包屑 */}
      <div className="mb-4 flex items-center gap-2 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1 font-medium text-[#4c362a] hover:text-[#922e25] cursor-pointer dark:text-[#dccbb6]"
        >
          <ArrowLeft size={14} />
          <span>首页</span>
        </button>
        <span>/</span>
        <span className="font-semibold text-[#922e25] dark:text-[#d4a85d]">
          佛道世界
        </span>
      </div>

      <div className="mb-6 md:mb-8">
        <p className="text-xs font-medium tracking-wider text-[#b88b44]">
          佛道双境总览 · 点击任意殿堂直达正面场景
        </p>
        <h1 className="mt-1.5 font-serif-display text-3xl font-bold text-[#2c221e] dark:text-[#efe7da]">
          佛道世界
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6e5d4f] dark:text-[#b2a18f]">
          佛教梵境与道教仙境各自独立。可直接点击下方任意殿堂名称直达正面建筑，点击「步入大殿」即可入殿礼敬与静心互动。
        </p>
      </div>

      {/* Equal Dual Worlds Cards (Direct 1-click access to main halls or specific halls) */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        {/* Buddhist World */}
        <article className="flex flex-col overflow-hidden rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] dark:border-[#332922] dark:bg-[#1d1815]">
          <div className="relative h-56 md:h-64">
            <ResilientImage
              src={sceneImages.buddhistMainHall}
              alt="佛教梵境大雄宝殿正面"
              tone="buddhist"
              fallbackTitle="佛教梵境"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-xs text-[#e5c17c]">
                佛教文化体系 · 已探索 {buddhistVisited} / {buddhistBuildings.length} 处殿宇
              </p>
              <h2 className="mt-1 font-serif-display text-2xl font-bold text-[#fff8eb]">
                佛教梵境
              </h2>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-6">
            <div>
              <p className="text-sm leading-relaxed text-[#4c362a] dark:text-[#dccbb6]">
                点击任意殿堂直达正面景观，入殿后可体验合掌、礼佛、上香、供灯、供花与木鱼诵经：
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[...BUDDHIST_SCENES, BUDDHIST_GATE_SCENE].map((scene) => (
                  <button
                    key={scene.sceneId}
                    type="button"
                    onClick={() =>
                      navigate(`/worlds/buddhist?scene=${scene.sceneId}`)
                    }
                    className="rounded-lg border border-[#e2d7c5] bg-[#f6f1e7] px-3 py-1.5 text-xs font-medium text-[#4c362a] transition-colors hover:border-[#922e25] hover:bg-[#ebe2d2] hover:text-[#922e25] cursor-pointer dark:border-[#332922] dark:bg-[#241d19] dark:text-[#dccbb6] dark:hover:text-[#e5c17c]"
                  >
                    {scene.sceneName}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/worlds/buddhist")}
              className="mt-6 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#922e25] px-5 py-3 text-sm font-semibold text-[#fff8eb] transition-opacity hover:opacity-90 cursor-pointer dark:bg-[#b5453a]"
            >
              <span>直入佛教梵境 · 大雄宝殿</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </article>

        {/* Daoist World */}
        <article className="flex flex-col overflow-hidden rounded-2xl border border-[#c7d6ce] bg-[#f4f8f5] dark:border-[#243a34] dark:bg-[#13221f]">
          <div className="relative h-56 md:h-64">
            <ResilientImage
              src={sceneImages.daoistSanqingExterior}
              alt="道教仙境三清殿正面"
              tone="daoist"
              fallbackTitle="道教仙境"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1d19]/85 via-[#0c1d19]/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-xs text-[#b8ded1]">
                道教文化体系 · 已探索 {daoistVisited} / {daoistBuildings.length} 处宫观
              </p>
              <h2 className="mt-1 font-serif-display text-2xl font-bold text-[#f3f8f5]">
                道教仙境
              </h2>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-6">
            <div>
              <p className="text-sm leading-relaxed text-[#2c443e] dark:text-[#c7dcd5]">
                点击任意宫观直达正面外观，入殿后可行拱手礼、清香静思与静诵道经：
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[...DAOIST_SCENES, DAOIST_MOUNTAIN_SCENE].map((scene) => (
                  <button
                    key={scene.sceneId}
                    type="button"
                    onClick={() =>
                      navigate(`/worlds/daoist?scene=${scene.sceneId}`)
                    }
                    className="rounded-lg border border-[#c7d6ce] bg-[#e7f0eb] px-3 py-1.5 text-xs font-medium text-[#2c443e] transition-colors hover:border-[#1f4e45] hover:bg-[#d7e5dd] cursor-pointer dark:border-[#243a34] dark:bg-[#192d29] dark:text-[#c7dcd5]"
                  >
                    {scene.sceneName}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/worlds/daoist")}
              className="mt-6 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#1f4e45] px-5 py-3 text-sm font-semibold text-[#f3f8f5] transition-opacity hover:opacity-90 cursor-pointer dark:bg-[#2d6a5e]"
            >
              <span>直入道教仙境 · 三清殿</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </article>
      </div>

      {/* Single Progressive Extension Link */}
      <div className="mt-8">
        <button
          type="button"
          onClick={() => navigate("/pilgrimage")}
          className="flex min-h-[76px] w-full items-center justify-between rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] px-5 py-4 text-left transition-colors hover:bg-[#f2eadc] cursor-pointer dark:border-[#332922] dark:bg-[#1d1815] dark:hover:bg-[#261f1b]"
        >
          <div className="flex items-center gap-3.5">
            <MapPin size={20} className="text-[#b88b44]" />
            <div>
              <p className="text-sm font-bold text-[#2c221e] dark:text-[#efe7da]">
                延伸巡礼 · 数字朝圣导览
              </p>
              <p className="mt-0.5 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                走近中国历史名山古刹与道教宫观圣地
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-[#6e5d4f]" />
        </button>
      </div>
    </AppShell>
  );
}
