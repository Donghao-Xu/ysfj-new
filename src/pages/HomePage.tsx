import {
  ArrowRight,
  BookOpen,
  Compass,
  MapPin,
  Wind,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { ResilientImage } from "@/components/ResilientImage";
import { SacredEnvironmentLayer } from "@/components/SacredAtmosphere";
import { sceneImages } from "@/data/scenes";
import { dailyQuotes, v2Images } from "@/data/v2Content";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <AppShell>
      {/* Mobile Compact Brand Bar */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <div>
          <h1 className="font-serif-display text-xl font-bold tracking-wider text-[#2c221e] dark:text-[#efe7da]">
            云上梵境
          </h1>
          <p className="mt-0.5 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
            一念清净 · 云开见境
          </p>
        </div>
        <PWAInstallButton compact />
      </div>

      {/* Panoramic World Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-[#e2d7c5] bg-[#2c221e] dark:border-[#332922]">
        <div className="relative h-[300px] md:h-[420px]">
          <ResilientImage
            src={v2Images.homeHero}
            alt="云海仙山间的寺院与道观"
            fallbackTitle="云上梵境 · 佛道双境"
            className="animate-camera-push h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/38 to-transparent" />
          <SacredEnvironmentLayer variant="home" showLantern showLotus />

          <div className="absolute inset-x-0 bottom-0 flex flex-col items-start justify-end p-6 md:p-10">
            <p className="text-xs font-medium tracking-[0.2em] text-[#e7d4b1]">
              佛道双境 · 数字沉浸世界
            </p>
            <h2 className="mt-2 max-w-2xl font-serif-display text-3xl leading-snug font-bold tracking-wide text-[#fff8eb] md:text-5xl">
              一念清净 · 云开见境
            </h2>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[#f5ece0]/90 md:text-base">
              融合东方古建美学与自然山水的清净之地。直达佛教大雄宝殿与道教三清殿，先瞻宏伟外观，再入殿静心礼敬。
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/worlds/buddhist")}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#b88b44] px-5 py-2.5 text-sm font-semibold text-[#1f1612] transition-all hover:opacity-90 active:scale-[0.97] cursor-pointer"
              >
                <span>进入佛教梵境</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/worlds/daoist")}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#d6e5de]/60 bg-[#183831]/85 px-5 py-2.5 text-sm font-semibold text-[#f3f8f5] backdrop-blur-sm transition-all hover:bg-[#1f4e45] active:scale-[0.97] cursor-pointer"
              >
                <span>进入道教仙境</span>
                <ArrowRight size={16} />
              </button>
              <div className="hidden md:block">
                <PWAInstallButton compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equal-Weight Direct Dual Realm Portals (1-click entry) */}
      <section className="mt-8 md:mt-10">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div>
            <h2 className="font-serif-display text-xl font-bold text-[#2c221e] dark:text-[#efe7da] md:text-2xl">
              两大独立文化世界
            </h2>
            <p className="mt-1 text-xs text-[#6e5d4f] dark:text-[#b2a18f] md:text-sm">
              一键直达佛教与道教主殿正面外观，入殿后即可开启礼敬与静心互动
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/worlds")}
            className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-[#922e25] hover:underline sm:inline-flex cursor-pointer dark:text-[#d4a85d]"
          >
            <span>全部殿堂导览</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2">
          {/* Direct Buddhist Realm Portal */}
          <button
            type="button"
            onClick={() => navigate("/worlds/buddhist")}
            className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl border border-[#e2d7c5] bg-[#3a221c] text-left transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer dark:border-[#332922]"
          >
            <ResilientImage
              src={sceneImages.buddhistMainHall}
              alt="佛教梵境大雄宝殿正面外观"
              tone="buddhist"
              fallbackTitle="佛教梵境"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/38 to-transparent" />
            <div className="relative z-10 p-6">
              <p className="text-xs font-medium tracking-wider text-[#e5c17c]">
                佛教文化体系 · 庄严 · 慈悲 · 清净
              </p>
              <h3 className="mt-1.5 font-serif-display text-2xl font-bold text-[#fff8eb]">
                佛教梵境 · 大雄宝殿
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#f5ece0]/88 md:text-sm">
                直达大雄宝殿、观音殿、地藏殿与净土莲坛；先赏正面宏伟外观，步入大殿后可合掌、礼佛、上香、供灯、供花与叩木鱼。
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#e5c17c]">
                <span>直入佛教梵境</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </button>

          {/* Direct Daoist Realm Portal */}
          <button
            type="button"
            onClick={() => navigate("/worlds/daoist")}
            className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl border border-[#c7d6ce] bg-[#162d27] text-left transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer dark:border-[#243a34]"
          >
            <ResilientImage
              src={sceneImages.daoistSanqingExterior}
              alt="道教仙境三清殿正面外观"
              tone="daoist"
              fallbackTitle="道教仙境"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f1b]/90 via-[#0d1f1b]/40 to-transparent" />
            <div className="relative z-10 p-6">
              <p className="text-xs font-medium tracking-wider text-[#c5dfd3]">
                道教文化体系 · 仙山 · 宫观 · 自然
              </p>
              <h3 className="mt-1.5 font-serif-display text-2xl font-bold text-[#f3f8f5]">
                道教仙境 · 三清殿
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#e1ece7]/88 md:text-sm">
                直达三清殿、玉皇殿、太上老君殿与道藏阁；先仰宫观气象，入殿后行拱手礼、品读道藏、聆听山林天籁。
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4b679]">
                <span>直入道教仙境</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Core Feature Pillars (Direct 1-click navigation to each functional module) */}
      <section className="mt-8 md:mt-10">
        <div className="mb-4">
          <h2 className="font-serif-display text-xl font-bold text-[#2c221e] dark:text-[#efe7da]">
            清净修习体验
          </h2>
          <p className="mt-1 text-xs text-[#6e5d4f] dark:text-[#b2a18f] md:text-sm">
            点击任意模块即可直达对应空间，无需多层跳转
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate("/classics")}
            className="flex min-h-[96px] items-center gap-4 rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-5 text-left transition-all hover:border-[#b88b44] hover:bg-[#f6f1e7] active:scale-[0.99] cursor-pointer dark:border-[#332922] dark:bg-[#1d1815] dark:hover:bg-[#251e1a]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ebe2d2] text-[#922e25] dark:bg-[#2a221d] dark:text-[#d4a85d]">
              <BookOpen size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-bold text-[#2c221e] dark:text-[#efe7da]">
                  经典图书馆
                </p>
                <ArrowRight size={14} className="shrink-0 text-[#857362]" />
              </div>
              <p className="mt-0.5 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                佛经与道经严格分馆，支持收藏与阅读进度
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/meditation")}
            className="flex min-h-[96px] items-center gap-4 rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-5 text-left transition-all hover:border-[#b88b44] hover:bg-[#f6f1e7] active:scale-[0.99] cursor-pointer dark:border-[#332922] dark:bg-[#1d1815] dark:hover:bg-[#251e1a]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ebe2d2] text-[#1f4e45] dark:bg-[#2a221d] dark:text-[#86bfb0]">
              <Wind size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-bold text-[#2c221e] dark:text-[#efe7da]">
                  云上静修
                </p>
                <ArrowRight size={14} className="shrink-0 text-[#857362]" />
              </div>
              <p className="mt-0.5 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                佛境、道境与自然静修，含呼吸引导、木鱼念珠与声景
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/pilgrimage")}
            className="flex min-h-[96px] items-center gap-4 rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-5 text-left transition-all hover:border-[#b88b44] hover:bg-[#f6f1e7] active:scale-[0.99] cursor-pointer dark:border-[#332922] dark:bg-[#1d1815] dark:hover:bg-[#251e1a]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ebe2d2] text-[#b88b44] dark:bg-[#2a221d] dark:text-[#d4a85d]">
              <MapPin size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-bold text-[#2c221e] dark:text-[#efe7da]">
                  数字朝圣导览
                </p>
                <ArrowRight size={14} className="shrink-0 text-[#857362]" />
              </div>
              <p className="mt-0.5 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                寻访中国名山古刹与道教宫观圣地脉络
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Daily Verified Classics Quotes (Strictly Attributed) */}
      <section className="mt-8 md:mt-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif-display text-xl font-bold text-[#2c221e] dark:text-[#efe7da]">
              每日一句经典
            </h2>
            <p className="mt-1 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
              甄选自公版可靠经典，明确标明所属体系与文献出处
            </p>
          </div>
          <Compass size={18} className="text-[#b88b44]" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[dailyQuotes.buddhist, dailyQuotes.daoist].map((item) => (
            <div
              key={item.tradition}
              className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-6 dark:border-[#332922] dark:bg-[#1d1815]"
            >
              <div className="flex items-center justify-between text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                <span
                  className={
                    item.tradition === "buddhist"
                      ? "font-semibold text-[#922e25] dark:text-[#e5a89f]"
                      : "font-semibold text-[#1f4e45] dark:text-[#86bfb0]"
                  }
                >
                  {item.traditionLabel}
                </span>
                <span>{item.source}</span>
              </div>
              <p className="mt-3 font-serif-display text-lg leading-relaxed font-semibold text-[#2c221e] dark:text-[#efe7da]">
                “{item.quote}”
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#6e5d4f] dark:text-[#b2a18f]">
                {item.reflection}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Clean Respectful Footer */}
      <footer className="mt-10 border-t border-[#e2d7c5] pt-6 text-center text-xs leading-relaxed text-[#6e5d4f] dark:border-[#332922] dark:text-[#b2a18f]">
        <p>
          云上梵境 · 佛道双境数字沉浸世界 — 基础功能永久免费，不设功德交易或焦虑排行。
        </p>
      </footer>
    </AppShell>
  );
}
