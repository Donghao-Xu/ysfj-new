import { useState } from "react";
import { useAppState } from "@/context/AppContext";
import { playWoodenFishSound } from "@/lib/audio";

export type LampStyle = "lotus" | "liuli" | "butter";
export type FlowerStyle = "lotus" | "chrysanthemum" | "jasmine";

const LAMP_COLORS: Record<
  LampStyle,
  { outer: string; inner: string; halo: string; label: string }
> = {
  lotus: {
    outer: "#f2b8c6",
    inner: "#ffdf8c",
    halo: "rgba(255, 206, 118, 0.52)",
    label: "莲花心灯",
  },
  liuli: {
    outer: "#9be0e8",
    inner: "#fff2b2",
    halo: "rgba(255, 224, 148, 0.48)",
    label: "琉璃明灯",
  },
  butter: {
    outer: "#e5b65c",
    inner: "#ffe394",
    halo: "rgba(255, 196, 92, 0.56)",
    label: "长明酥油灯",
  },
};

const FLOWER_COLORS: Record<
  FlowerStyle,
  { petal: string; innerPetal: string; center: string; label: string }
> = {
  lotus: {
    petal: "#f5becc",
    innerPetal: "#fae0e6",
    center: "#f4d06f",
    label: "清净莲花",
  },
  chrysanthemum: {
    petal: "#f1ca63",
    innerPetal: "#fbe59d",
    center: "#c87d28",
    label: "秋庭清菊",
  },
  jasmine: {
    petal: "#f7f4ea",
    innerPetal: "#ffffff",
    center: "#d4c37b",
    label: "素馨茉莉",
  },
};

/**
 * 诵经柔光动态光影层：
 * - playing = true 时展示缓慢流动的暖金光束与脉冲光晕
 * - playing = false（暂停或结束）时动画同步停止（animationPlayState: "paused"）
 */
export function SacredChantingAura({
  playing,
  tone = "buddhist",
  className = "",
}: {
  playing: boolean;
  tone?: "buddhist" | "daoist" | "meditation";
  className?: string;
}) {
  const palette =
    tone === "daoist"
      ? {
          core: "rgba(181, 222, 208, 0.28)",
          ring: "rgba(212, 182, 121, 0.36)",
          beam: "rgba(212, 239, 230, 0.16)",
        }
      : {
          core: "rgba(235, 186, 102, 0.30)",
          ring: "rgba(229, 193, 124, 0.42)",
          beam: "rgba(255, 228, 168, 0.18)",
        };

  const playState = playing ? "running" : "paused";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500 ${
        playing ? "opacity-100" : "opacity-20"
      } ${className}`}
    >
      {/* 中心柔和诵经光晕 */}
      <div
        className="animate-chanting-aura absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle, ${palette.core} 0%, transparent 72%)`,
          animationPlayState: playState,
        }}
      />
      {/* 缓缓斜向流转的柔和光束 */}
      <div
        className="animate-chanting-sweep absolute -inset-y-8 left-1/4 w-1/2 blur-xl"
        style={{
          background: `linear-gradient(90deg, transparent, ${palette.beam}, transparent)`,
          animationPlayState: playState,
        }}
      />
      {/* 外环微光波纹 */}
      <div
        className="animate-chanting-ring absolute top-1/2 left-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          borderColor: palette.ring,
          animationPlayState: playState,
        }}
      />
    </div>
  );
}

/**
 * 上香视觉元件：香枝入炉、炽热香头微光与缓慢飘升的层叠轻烟
 */
export function IncenseOfferVisual({
  sticks,
  incenseSeq,
  compact = false,
}: {
  sticks: 0 | 1 | 3;
  incenseSeq: number;
  compact?: boolean;
}) {
  const lit = sticks > 0;
  return (
    <div
      key={`incense-${sticks}-${incenseSeq}`}
      className={`flex flex-col items-center ${
        compact ? "py-1" : "rounded-2xl bg-black/60 px-3.5 py-2 backdrop-blur-xs"
      }`}
    >
      <svg
        viewBox="0 0 80 74"
        className={`${compact ? "h-16 w-18" : "h-14 w-16"} overflow-visible`}
      >
        {lit && (
          <g>
            {/* 三股交错缓缓上升烟雾 */}
            <path
              d="M32 25 C27 14 37 7 31 -5 C27 -13 33 -19 30 -24"
              stroke={compact ? "#8b7258" : "#f5ecdc"}
              strokeWidth="1.7"
              strokeLinecap="round"
              fill="none"
              className="animate-incense"
            />
            <path
              d="M40 23 C46 11 35 4 41 -8 C45 -16 38 -22 42 -27"
              stroke={compact ? "#786048" : "#fff7e8"}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              className="animate-incense-alt"
              style={{ animationDelay: "0.75s" }}
            />
            <path
              d="M48 25 C52 14 43 8 49 -4 C52 -11 46 -18 48 -23"
              stroke={compact ? "#8b7258" : "#f3e8d4"}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              className="animate-incense"
              style={{ animationDelay: "1.55s" }}
            />

            {/* 香枝入炉 */}
            <g className="animate-incense-insert">
              <line
                x1="40"
                y1="25"
                x2="40"
                y2="48"
                stroke="#b57a40"
                strokeWidth="2.2"
              />
              <circle
                cx="40"
                cy="25"
                r="2.1"
                fill="#ff8f36"
                className="animate-ember"
              />
              {sticks === 3 && (
                <>
                  <line
                    x1="32"
                    y1="27"
                    x2="34"
                    y2="48"
                    stroke="#b57a40"
                    strokeWidth="2"
                  />
                  <circle
                    cx="32"
                    cy="27"
                    r="1.8"
                    fill="#ff8f36"
                    className="animate-ember"
                    style={{ animationDelay: "0.4s" }}
                  />
                  <line
                    x1="48"
                    y1="27"
                    x2="46"
                    y2="48"
                    stroke="#b57a40"
                    strokeWidth="2"
                  />
                  <circle
                    cx="48"
                    cy="27"
                    r="1.8"
                    fill="#ff8f36"
                    className="animate-ember"
                    style={{ animationDelay: "0.8s" }}
                  />
                </>
              )}
            </g>
          </g>
        )}

        {/* 铜香炉 */}
        <path
          d="M20 48 Q40 44 60 48 L55 63 Q40 68 25 63 Z"
          fill="#9d7138"
          stroke="#e5c17c"
          strokeWidth="1.3"
        />
        <ellipse cx="40" cy="48" rx="19" ry="3.2" fill="#704f25" />
        <ellipse cx="40" cy="64.5" rx="12" ry="2.2" fill="#7f5a29" />
      </svg>
      <span
        className={`text-[10px] font-medium ${
          compact
            ? "text-[#6e5d4f] dark:text-[#b2a18f]"
            : "text-[#f5ece0]"
        }`}
      >
        {lit ? `清香 ${sticks} 柱 · 烟缕袅袅` : "香炉静候"}
      </span>
    </div>
  );
}

/**
 * 供灯视觉元件：未点亮时灯盏静置，点击后火苗渐亮并散开温暖光晕
 */
export function LampOfferVisual({
  lit,
  lampSeq,
  selectedLamp,
  compact = false,
}: {
  lit: boolean;
  lampSeq: number;
  selectedLamp: LampStyle;
  compact?: boolean;
}) {
  const style = LAMP_COLORS[selectedLamp];
  return (
    <div
      key={`lamp-${lit ? lampSeq : "off"}-${selectedLamp}`}
      className={`relative flex flex-col items-center ${
        compact ? "py-1" : "rounded-2xl bg-black/60 px-3.5 py-2 backdrop-blur-xs"
      }`}
    >
      {/* 温暖扩散光晕 */}
      {lit && (
        <span
          aria-hidden="true"
          className="animate-warm-halo pointer-events-none absolute -top-3 h-16 w-16 rounded-full blur-md"
          style={{ backgroundColor: style.halo }}
        />
      )}

      <svg
        viewBox="0 0 64 62"
        className={`relative ${compact ? "h-14 w-16" : "h-12 w-14"} overflow-visible`}
      >
        {/* 灯芯 */}
        <line
          x1="32"
          y1="26"
          x2="32"
          y2="32"
          stroke="#563c24"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* 点亮后逐渐燃起的灯火与内焰 */}
        {lit && (
          <g className="animate-lamp-ignite">
            <circle
              cx="32"
              cy="19"
              r="11"
              fill={style.halo}
              opacity="0.65"
            />
            <path
              d="M32 6 C39 14 39 24 32 27 C25 24 25 14 32 6 Z"
              fill={style.inner}
              className="animate-flame"
            />
            <path
              d="M32 13 C35 17 35 23 32 25 C29 23 29 17 32 13 Z"
              fill="#ffffff"
              opacity="0.88"
              className="animate-flame"
            />
          </g>
        )}

        {/* 灯盏 */}
        <path
          d="M17 32 Q32 48 47 32 Q41 50 32 50 Q23 50 17 32 Z"
          fill={style.outer}
          stroke="#b88b44"
          strokeWidth="1.1"
        />
        <rect x="23" y="50" width="18" height="4.5" rx="2.2" fill="#b88b44" />
      </svg>

      <span
        className={`relative text-[10px] font-medium ${
          lit
            ? compact
              ? "text-[#922e25] dark:text-[#e6bd73]"
              : "text-[#ffe6aa]"
            : "text-[#6e5d4f] dark:text-[#b2a18f]"
        }`}
      >
        {lit ? `${style.label}已亮` : `${style.label}（未燃）`}
      </span>
    </div>
  );
}

/**
 * 供花视觉元件：点击后花蕾出现并逐瓣舒展绽放
 */
export function FlowerOfferVisual({
  offered,
  flowerSeq,
  selectedFlower,
  compact = false,
}: {
  offered: boolean;
  flowerSeq: number;
  selectedFlower: FlowerStyle;
  compact?: boolean;
}) {
  const colors = FLOWER_COLORS[selectedFlower];
  return (
    <div
      key={`flower-${offered ? flowerSeq : "idle"}-${selectedFlower}`}
      className={`flex flex-col items-center ${
        compact ? "py-1" : "rounded-2xl bg-black/60 px-3.5 py-2 backdrop-blur-xs"
      } ${offered ? "animate-lotus-bloom" : ""}`}
    >
      <svg
        viewBox="0 0 64 58"
        className={`${compact ? "h-14 w-16" : "h-12 w-14"} overflow-visible`}
      >
        {/* 托叶 */}
        <ellipse cx="32" cy="49" rx="17" ry="4" fill="#4f7c61" />

        {offered ? (
          <g>
            {/* 外层左右瓣逐次向外舒展 */}
            <path
              d="M32 43 C15 39 9 25 14 15 C22 21 27 31 32 43 Z"
              fill={colors.petal}
              className="animate-petal-outer-left"
            />
            <path
              d="M32 43 C49 39 55 25 50 15 C42 21 37 31 32 43 Z"
              fill={colors.petal}
              className="animate-petal-outer-right"
            />
            {/* 中层左右瓣舒展 */}
            <path
              d="M32 42 C20 36 16 23 22 14 C27 20 30 30 32 42 Z"
              fill={colors.innerPetal}
              className="animate-petal-left"
            />
            <path
              d="M32 42 C44 36 48 23 42 14 C37 20 34 30 32 42 Z"
              fill={colors.innerPetal}
              className="animate-petal-right"
            />
            {/* 中央花瓣 */}
            <path
              d="M32 9 C26 20 26 34 32 43 C38 34 38 20 32 9 Z"
              fill={colors.petal}
              className="animate-petal-center"
            />
            {/* 金色花蕊 */}
            <circle
              cx="32"
              cy="30"
              r="3.8"
              fill={colors.center}
              className="animate-ember"
            />
          </g>
        ) : (
          /* 未献花前保持含苞待放状态 */
          <g opacity="0.72">
            <path
              d="M32 18 C27 26 27 37 32 44 C37 37 37 26 32 18 Z"
              fill={colors.petal}
            />
            <path
              d="M32 44 C26 38 24 29 27 23 C30 28 31 35 32 44 Z"
              fill={colors.innerPetal}
            />
            <path
              d="M32 44 C38 38 40 29 37 23 C34 28 33 35 32 44 Z"
              fill={colors.innerPetal}
            />
          </g>
        )}
      </svg>

      <span
        className={`text-[10px] font-medium ${
          offered
            ? compact
              ? "text-[#922e25] dark:text-[#e6bd73]"
              : "text-[#f5ece0]"
            : "text-[#6e5d4f] dark:text-[#b2a18f]"
        }`}
      >
        {offered ? `${colors.label}已绽` : "含苞待献"}
      </span>
    </div>
  );
}

/**
 * 木鱼互动组件：敲击时触发槌落敲击动画、鱼身微振缩放、扩散声波环与无延迟木鱼音效
 */
export function WoodenFishInstrument({
  sessionCount,
  totalCount,
  volume,
  onTap,
  tone = "buddhist",
  compact = false,
}: {
  sessionCount: number;
  totalCount: number;
  volume?: number;
  onTap: () => void;
  tone?: "buddhist" | "meditation";
  compact?: boolean;
}) {
  const { settings } = useAppState();
  const [tapSeq, setTapSeq] = useState(0);

  const effectiveVol = volume ?? settings.defaultVolume;

  const handleStrike = () => {
    setTapSeq((s) => s + 1);
    playWoodenFishSound(effectiveVol);
    onTap();
  };

  const accentBg =
    tone === "buddhist"
      ? "bg-[#922e25] dark:bg-[#b5453a]"
      : "bg-[#922e25] dark:bg-[#b5453a]";

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#e2d7c5] bg-[#f6f1e7] p-5 dark:border-[#332922] dark:bg-[#241d19]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#2c221e] dark:text-[#efe7da]">
            木鱼静心（无需登录）
          </h3>
          <p className="mt-1 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
            轻触木鱼即可连续敲击，木槌轻叩、木鱼微振回响，实时同步无延迟。
          </p>
        </div>
        <div className="text-right tabular-nums">
          <p className="text-xl font-bold text-[#922e25] dark:text-[#d4a85d]">
            {sessionCount}
          </p>
          <p className="text-[11px] text-[#6e5d4f] dark:text-[#b2a18f]">
            累计 {totalCount} 声
          </p>
        </div>
      </div>

      {/* Interactive SVG Wooden Fish + Mallet + Sound Ring + Floating +1 */}
      <div className="my-4 flex flex-col items-center">
        <button
          type="button"
          onClick={handleStrike}
          aria-label="敲击木鱼"
          className={`group relative flex ${
            compact ? "h-28 w-28" : "h-34 w-34"
          } items-center justify-center rounded-full border border-[#c59a53]/50 bg-[#fcf9f2] shadow-sm transition-transform active:scale-95 cursor-pointer dark:bg-[#1d1815]`}
        >
          {/* 扩散声波环 */}
          {tapSeq > 0 && (
            <span
              key={`ring-${tapSeq}`}
              aria-hidden="true"
              className="animate-sound-ring pointer-events-none absolute inset-2 rounded-full border-2 border-[#c59a53]/85"
            />
          )}

          {/* 轻声计数浮起 */}
          {tapSeq > 0 && (
            <span
              key={`note-${tapSeq}`}
              aria-hidden="true"
              className="animate-note-float pointer-events-none absolute -top-1 right-4 text-xs font-bold text-[#922e25] dark:text-[#d4a85d]"
            >
              咚 · +1
            </span>
          )}

          {/* Wooden Fish & Mallet SVG */}
          <svg viewBox="0 0 120 100" className="h-24 w-26 overflow-visible">
            {/* Cushion (stationary) */}
            <ellipse
              cx="60"
              cy="83"
              rx="34"
              ry="8"
              fill="#8b352a"
              opacity="0.88"
            />
            {/* Wooden fish body (retriggered strike squash & vibration) */}
            <g
              key={`fish-body-${tapSeq}`}
              style={{ transformOrigin: "60px 60px" }}
              className={tapSeq > 0 ? "animate-wooden-fish" : ""}
            >
              <path
                d="M24 54 C24 34 42 22 64 22 C84 22 96 34 96 52 C96 68 82 78 60 78 C38 78 24 68 24 54 Z"
                fill="#b77b3c"
                stroke="#5c3618"
                strokeWidth="2"
              />
              <path
                d="M36 53 C48 56 64 56 76 52"
                stroke="#4a2810"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="80" cy="51" r="4.2" fill="#4a2810" />
              <path
                d="M40 34 C52 28 68 28 80 34"
                stroke="#e5be7e"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.72"
              />
            </g>

            {/* Mallet hitting top right of woodfish */}
            <g
              key={`mallet-${tapSeq}`}
              className={tapSeq > 0 ? "animate-mallet-hit" : ""}
            >
              <line
                x1="68"
                y1="22"
                x2="106"
                y2="14"
                stroke="#5c3618"
                strokeWidth="3.6"
                strokeLinecap="round"
              />
              <circle
                cx="66"
                cy="23"
                r="6"
                fill="#d9b26f"
                stroke="#5c3618"
                strokeWidth="1.5"
              />
            </g>
          </svg>
        </button>

        <button
          type="button"
          onClick={handleStrike}
          className={`mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl ${accentBg} px-5 py-2.5 text-sm font-bold text-[#fff8eb] transition-transform active:scale-[0.97] cursor-pointer`}
        >
          <span>轻叩木鱼</span>
        </button>
      </div>
    </div>
  );
}

/**
 * 殿堂主画幅上的交互动画叠加层：
 * - 合掌（平滑双掌合十动作）
 * - 礼佛（庄严俯首问讯/拜礼动作）
 * - 上香（香枝与缓慢上升烟雾）
 * - 供灯（渐亮灯火与大范围温暖光晕）
 * - 供花（花瓣逐次舒展绽放）
 * - 诵经（柔和动态光影，暂停同步停止）
 */
export function BuddhistRitualStage({
  hezhangSeq,
  hezhangActive,
  lifoSeq,
  lifoActive,
  incenseLit,
  incenseSeq,
  lampLit,
  lampSeq,
  selectedLamp,
  flowerOffered,
  flowerSeq,
  selectedFlower,
  chantingPlaying,
}: {
  hezhangSeq: number;
  hezhangActive: boolean;
  lifoSeq: number;
  lifoActive: boolean;
  incenseLit: 0 | 1 | 3;
  incenseSeq: number;
  lampLit: boolean;
  lampSeq: number;
  selectedLamp: LampStyle;
  flowerOffered: boolean;
  flowerSeq: number;
  selectedFlower: FlowerStyle;
  chantingPlaying: boolean;
}) {
  return (
    <>
      {/* 供灯点亮后对殿堂画面的温暖光晕渲染 */}
      {lampLit && (
        <div
          key={`stage-halo-${lampSeq}`}
          aria-hidden="true"
          className="animate-warm-halo pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(255, 206, 112, 0.34) 0%, rgba(255, 190, 88, 0.14) 45%, transparent 78%)",
          }}
        />
      )}

      {/* 诵经柔和动态光影（播放时流动，暂停时同步停止） */}
      <SacredChantingAura playing={chantingPlaying} tone="buddhist" />

      {/* 供养区：位于前景人物前方的供案高度（供花 + 上香 + 供灯） */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[38%] z-10 flex scale-90 items-end justify-center gap-3 px-4 sm:gap-6 sm:scale-95">
        {flowerOffered && (
          <FlowerOfferVisual
            offered
            flowerSeq={flowerSeq}
            selectedFlower={selectedFlower}
          />
        )}

        {incenseLit > 0 && (
          <IncenseOfferVisual
            sticks={incenseLit}
            incenseSeq={incenseSeq}
          />
        )}

        {lampLit && (
          <LampOfferVisual
            lit
            lampSeq={lampSeq}
            selectedLamp={selectedLamp}
          />
        )}
      </div>

      {/* 1. 合掌：平滑合掌动作 */}
      {hezhangActive && (
        <div
          key={`hezhang-${hezhangSeq}`}
          className="animate-hezhang-float pointer-events-none fixed inset-x-0 top-1/4 z-30 mx-auto flex w-64 flex-col items-center rounded-2xl border border-[#e5c17c]/50 bg-[#1a1310]/85 px-5 py-4 text-center text-[#fff8eb] shadow-2xl backdrop-blur-md"
        >
          <svg viewBox="0 0 96 84" className="h-20 w-24 overflow-visible">
            <circle
              cx="48"
              cy="42"
              r="34"
              fill="rgba(229, 193, 124, 0.16)"
              stroke="#e5c17c"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {/* 左掌平滑合拢 */}
            <path
              d="M47 16 C39 27 35 42 37 59 C41 63 45 64 47 64 Z"
              fill="#f3d6b2"
              stroke="#cfa87a"
              strokeWidth="0.9"
              className="animate-palms-left"
            />
            {/* 右掌平滑合拢 */}
            <path
              d="M49 16 C57 27 61 42 59 59 C55 63 51 64 49 64 Z"
              fill="#e9c59c"
              stroke="#c99f72"
              strokeWidth="0.9"
              className="animate-palms-right"
            />
          </svg>
          <p className="mt-1 font-serif-display text-sm font-semibold text-[#ffe8ba]">
            合掌收摄 · 身心安住
          </p>
        </div>
      )}

      {/* 2. 礼佛：庄严自然的礼佛俯首问讯动作 */}
      {lifoActive && (
        <div
          key={`lifo-${lifoSeq}`}
          className="animate-reverent-bow pointer-events-none fixed inset-x-0 top-1/4 z-30 mx-auto flex w-72 flex-col items-center rounded-2xl border border-[#e5c17c]/55 bg-[#1a1310]/88 px-6 py-5 text-center text-[#fff8eb] shadow-2xl backdrop-blur-md"
        >
          <svg viewBox="0 0 110 92" className="h-22 w-28 overflow-visible">
            {/* 庄严佛光晕 */}
            <circle
              cx="55"
              cy="32"
              r="32"
              fill="rgba(255, 214, 130, 0.18)"
              className="animate-lifo-halo"
            />
            {/* 蒲团与礼佛莲座 */}
            <ellipse cx="52" cy="74" rx="28" ry="6" fill="#7c3328" opacity="0.9" />
            <ellipse cx="52" cy="70" rx="22" ry="4" fill="#b88b44" opacity="0.55" />

            {/* 礼佛人物：跪坐微俯身再缓起 */}
            <g className="animate-lifo-body">
              {/* 膝与下裳 */}
              <path
                d="M36 68 Q48 64 62 68 L58 72 L38 72 Z"
                fill="#c9a574"
              />
              {/* 僧袍身躯 */}
              <path
                d="M40 66 C39 51 41 37 46 31 C52 34 55 49 54 66 Z"
                fill="#d8b683"
                stroke="#f5dfbb"
                strokeWidth="0.8"
              />
              {/* 头部低垂致敬 */}
              <circle cx="46" cy="24" r="6.8" fill="#f3d6b2" />
              {/* 礼敬手臂与合十伸展 */}
              <path
                d="M47 36 C56 41 64 49 69 57"
                stroke="#f3d6b2"
                strokeWidth="4.2"
                strokeLinecap="round"
                fill="none"
                className="animate-lifo-arms"
              />
            </g>
          </svg>
          <p className="mt-1 font-serif-display text-sm font-semibold text-[#ffe8ba]">
            虔诚礼佛 · 至诚顶礼
          </p>
          <p className="mt-0.5 text-[11px] text-[#e6d5bc]/85">
            一礼清净尘劳，心向光明本源
          </p>
        </div>
      )}
    </>
  );
}

export function DaoistRitualStage({
  gongShouSeq,
  gongShouActive,
}: {
  gongShouSeq: number;
  gongShouActive: boolean;
}) {
  return (
    <>
      {/* 宫观灯火闪烁与香炉上升青烟 */}
      <div className="pointer-events-none absolute top-4 right-4 z-10 flex items-center gap-3">
        {/* 八角宫灯 */}
        <div className="flex items-center gap-1.5 rounded-xl bg-[#0b1b18]/65 px-3 py-1.5 backdrop-blur-xs">
          <svg viewBox="0 0 28 36" className="h-6 w-5">
            <line
              x1="14"
              y1="0"
              x2="14"
              y2="6"
              stroke="#d4b679"
              strokeWidth="1.5"
            />
            <polygon
              points="7,8 21,8 24,18 20,28 8,28 4,18"
              fill="#1f4e45"
              stroke="#d4b679"
              strokeWidth="1.4"
            />
            <circle
              cx="14"
              cy="18"
              r="4.2"
              fill="#ffe49e"
              className="animate-flame"
            />
          </svg>
          <span className="text-[11px] text-[#dbeae4]">宫灯清朗</span>
        </div>

        {/* 青铜炉烟 */}
        <div className="flex items-center gap-1.5 rounded-xl bg-[#0b1b18]/65 px-3 py-1.5 backdrop-blur-xs">
          <svg viewBox="0 0 36 36" className="h-6 w-6 overflow-visible">
            <path
              d="M15 16 C12 9 19 5 15 -2"
              stroke="#d4efe6"
              strokeWidth="1.5"
              fill="none"
              className="animate-incense"
            />
            <path
              d="M21 15 C24 8 18 4 22 -3"
              stroke="#d4efe6"
              strokeWidth="1.3"
              fill="none"
              className="animate-incense-alt"
              style={{ animationDelay: "1.2s" }}
            />
            <path
              d="M8 20 Q18 18 28 20 L25 30 Q18 33 11 30 Z"
              fill="#4b6b63"
              stroke="#d4b679"
              strokeWidth="1"
            />
          </svg>
          <span className="text-[11px] text-[#dbeae4]">炉香袅袅</span>
        </div>
      </div>

      {/* 拱手致敬手势动画 */}
      {gongShouActive && (
        <div
          key={`gongshou-${gongShouSeq}`}
          className="animate-reverent-bow pointer-events-none fixed inset-x-0 top-1/4 z-30 mx-auto flex w-64 flex-col items-center rounded-2xl border border-[#b8ded1]/40 bg-[#0b1d19]/85 px-5 py-4 text-center text-[#f3f8f5] shadow-2xl backdrop-blur-md"
        >
          <svg viewBox="0 0 96 84" className="h-16 w-20">
            <circle
              cx="48"
              cy="42"
              r="34"
              fill="rgba(184, 222, 209, 0.12)"
              stroke="#b8ded1"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {/* Traditional Daoist Gongshou (left palm enveloping right hand) */}
            <path
              d="M26 42 C32 30 44 28 52 34 L50 54 C40 58 30 52 26 42 Z"
              fill="#dce8e2"
              className="animate-palms-left"
            />
            <path
              d="M70 42 C64 30 52 28 44 34 L46 54 C56 58 66 52 70 42 Z"
              fill="#b9cfc6"
              className="animate-palms-right"
            />
          </svg>
          <p className="mt-1 font-serif-display text-sm font-semibold text-[#d4efe6]">
            拱手致敬 · 法天象地
          </p>
        </div>
      )}
    </>
  );
}
