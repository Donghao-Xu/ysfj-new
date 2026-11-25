import { useEffect, useState } from "react";
import { useAppState } from "@/context/AppContext";
import type { RetreatEffectId, RetreatRealmId } from "@/data/retreatScenes";

const RAIN_DROPS_DESKTOP = [
  { left: "8%", top: "4%", delay: "0s", dur: "1.55s" },
  { left: "16%", top: "14%", delay: "0.35s", dur: "1.7s" },
  { left: "24%", top: "2%", delay: "0.8s", dur: "1.6s" },
  { left: "34%", top: "12%", delay: "0.2s", dur: "1.8s" },
  { left: "44%", top: "6%", delay: "1.05s", dur: "1.5s" },
  { left: "54%", top: "18%", delay: "0.55s", dur: "1.65s" },
  { left: "64%", top: "5%", delay: "0.15s", dur: "1.75s" },
  { left: "73%", top: "10%", delay: "0.95s", dur: "1.6s" },
  { left: "82%", top: "3%", delay: "0.45s", dur: "1.7s" },
  { left: "91%", top: "15%", delay: "1.2s", dur: "1.55s" },
];

const STARS_DESKTOP = [
  { left: "12%", top: "14%", size: 2.5, delay: "0.2s" },
  { left: "22%", top: "22%", size: 2, delay: "1.3s" },
  { left: "31%", top: "10%", size: 3, delay: "2.1s" },
  { left: "43%", top: "19%", size: 2, delay: "0.8s" },
  { left: "55%", top: "12%", size: 2.5, delay: "1.7s" },
  { left: "67%", top: "24%", size: 2, delay: "2.6s" },
  { left: "78%", top: "13%", size: 3, delay: "0.5s" },
  { left: "88%", top: "21%", size: 2, delay: "1.9s" },
  { left: "37%", top: "29%", size: 2, delay: "2.9s" },
  { left: "62%", top: "32%", size: 2.5, delay: "1.1s" },
];

const MOTES_DESKTOP = [
  { left: "15%", top: "64%", delay: "0s", dur: "8.2s" },
  { left: "29%", top: "52%", delay: "1.6s", dur: "7.4s" },
  { left: "48%", top: "72%", delay: "2.9s", dur: "9.0s" },
  { left: "65%", top: "56%", delay: "0.9s", dur: "7.8s" },
  { left: "79%", top: "68%", delay: "3.4s", dur: "8.6s" },
  { left: "89%", top: "50%", delay: "2.1s", dur: "7.5s" },
];

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export function RetreatSceneAtmosphere({
  category,
  effects,
  mistDensity = "medium",
  immersive = false,
}: {
  category: RetreatRealmId;
  effects: RetreatEffectId[];
  mistDensity?: "light" | "medium" | "rich";
  immersive?: boolean;
}) {
  const { settings } = useAppState();
  const isMobile = useIsMobileViewport();

  if (settings.animationMode === "off" || settings.animationMode === "reduced") {
    return null;
  }

  const has = (id: RetreatEffectId) => effects.includes(id);

  const mistOpacity =
    mistDensity === "rich"
      ? "opacity-90"
      : mistDensity === "medium"
        ? "opacity-65"
        : "opacity-40";

  const mistTint =
    category === "buddhist"
      ? "rgba(255, 242, 220, 0.16)"
      : category === "daoist"
        ? "rgba(205, 232, 222, 0.20)"
        : "rgba(222, 238, 240, 0.18)";

  const sunGradient =
    category === "buddhist"
      ? "radial-gradient(ellipse at top left, rgba(255, 222, 158, 0.34), rgba(212, 168, 93, 0.08) 52%, transparent 74%)"
      : "radial-gradient(ellipse at top right, rgba(218, 238, 230, 0.28), rgba(181, 141, 70, 0.08) 48%, transparent 74%)";

  const rainDrops = isMobile
    ? RAIN_DROPS_DESKTOP.filter((_, idx) => idx % 2 === 0)
    : RAIN_DROPS_DESKTOP;
  const stars = isMobile
    ? STARS_DESKTOP.filter((_, idx) => idx % 2 === 0)
    : STARS_DESKTOP;
  const motes = isMobile
    ? MOTES_DESKTOP.filter((_, idx) => idx % 2 === 0)
    : MOTES_DESKTOP;

  const moteColor =
    category === "buddhist"
      ? "#f8deb0"
      : category === "daoist"
        ? "#d2efe4"
        : "#e2f0f5";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* 1. 天光与窗光斜照缓慢变化 */}
      {has("sunlight") && (
        <div
          className="animate-sun-sweep absolute -top-20 -left-12 h-80 w-80 rounded-full md:h-[28rem] md:w-[28rem]"
          style={{ background: sunGradient }}
        />
      )}

      {/* 2. 山间薄雾与云海分层缓慢流动 */}
      {has("clouds") && (
        <>
          <svg
            viewBox="0 0 800 220"
            preserveAspectRatio="none"
            className={`animate-cloud-slow absolute inset-x-0 top-0 h-32 w-[116%] -left-[8%] ${mistOpacity}`}
          >
            <path
              d="M0,74 C150,30 240,104 380,60 C520,18 640,96 800,48 L800,0 L0,0 Z"
              fill={mistTint}
            />
          </svg>
          <svg
            viewBox="0 0 800 220"
            preserveAspectRatio="none"
            className={`animate-cloud-reverse absolute inset-x-0 bottom-0 h-36 w-[118%] -left-[9%] ${mistOpacity}`}
          >
            <path
              d="M0,130 C160,72 280,152 440,104 C600,56 710,136 800,92 L800,220 L0,220 Z"
              fill={mistTint}
            />
          </svg>
        </>
      )}

      {/* 3. 竹林/松林斜雨与细雨丝 */}
      {has("rain") && (
        <div className="absolute inset-0">
          {rainDrops.map((drop, i) => (
            <span
              key={i}
              className="animate-retreat-rain absolute h-8 w-[1.5px] rounded-full bg-gradient-to-b from-transparent via-[#dceee8]/70 to-[#f2faf7]/85"
              style={{
                left: drop.left,
                top: drop.top,
                animationDelay: drop.delay,
                animationDuration: drop.dur,
              }}
            />
          ))}
        </div>
      )}

      {/* 4. 水面细微涟漪 */}
      {has("ripples") && (
        <div className="absolute inset-x-0 bottom-8 flex items-center justify-around px-10 opacity-65">
          <div className="relative flex items-center justify-center">
            <span className="animate-water-ripple h-10 w-28 rounded-full border border-[#e3f3ee]/45" />
            <span
              className="animate-water-ripple absolute h-6 w-16 rounded-full border border-[#e3f3ee]/35"
              style={{ animationDelay: "1.9s" }}
            />
          </div>
          <div className="relative hidden items-center justify-center sm:flex">
            <span
              className="animate-water-ripple h-8 w-24 rounded-full border border-[#e3f3ee]/40"
              style={{ animationDelay: "1.1s" }}
            />
          </div>
        </div>
      )}

      {/* 5. 池面莲花轻绽（仅限佛教莲池场景） */}
      {has("lotus") && category === "buddhist" && (
        <svg
          viewBox="0 0 90 62"
          className="animate-lotus-bloom absolute right-8 bottom-6 h-12 w-16 opacity-80"
        >
          <path
            d="M45 14 C39 24 39 36 45 45 C51 36 51 24 45 14 Z"
            fill="#f7d6df"
          />
          <path
            d="M45 45 C32 39 25 27 30 18 C37 23 41 33 45 45 Z"
            fill="#f0bacb"
            opacity="0.9"
          />
          <path
            d="M45 45 C58 39 65 27 60 18 C53 23 49 33 45 45 Z"
            fill="#f0bacb"
            opacity="0.9"
          />
          <ellipse cx="45" cy="48" rx="24" ry="4.5" fill="#5e8d70" opacity="0.7" />
        </svg>
      )}

      {/* 6. 香炉袅袅清烟 */}
      {has("incense") && (
        <svg
          viewBox="0 0 60 72"
          className="absolute bottom-6 left-1/2 h-24 w-16 -translate-x-1/2 overflow-visible opacity-75"
        >
          <path
            d="M25 60 C19 44 33 34 25 18 C20 8 28 2 24 -8"
            stroke={category === "daoist" ? "#d5efe6" : "#f6e7cc"}
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
            className="animate-incense"
          />
          <path
            d="M35 60 C41 44 27 32 35 16 C39 8 32 1 36 -8"
            stroke={category === "daoist" ? "#d5efe6" : "#fff4de"}
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
            className="animate-incense-alt"
            style={{ animationDelay: "1.1s" }}
          />
        </svg>
      )}

      {/* 7. 佛殿暖灯 / 烛火轻微闪烁 */}
      {has("candle") && (
        <div className="absolute bottom-6 left-6 flex items-center gap-3 opacity-85">
          <span className="animate-flame h-4 w-4 rounded-full bg-[#ffd985]/80 blur-[4px]" />
          <span
            className="animate-flame h-3 w-3 rounded-full bg-[#ffcb6b]/70 blur-[3px]"
            style={{ animationDelay: "0.7s" }}
          />
        </div>
      )}

      {/* 8. 竹叶或松枝微晃剪影 */}
      {(has("bamboo") || has("pine")) && (
        <svg
          viewBox="0 0 120 140"
          className="animate-retreat-bamboo absolute -bottom-2 -left-2 h-28 w-24 opacity-45"
        >
          <path
            d="M16,138 Q30,84 46,42 M30,98 Q58,82 78,74 M22,74 Q50,54 68,40 M36,52 Q54,30 64,16"
            stroke={has("bamboo") ? "#95cbb4" : "#b3cbb7"}
            strokeWidth="2.3"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse
            cx="72"
            cy="74"
            rx="13"
            ry="3.4"
            transform="rotate(-14 72 74)"
            fill={has("bamboo") ? "#95cbb4" : "#b3cbb7"}
          />
          <ellipse
            cx="64"
            cy="39"
            rx="11"
            ry="3"
            transform="rotate(-26 64 39)"
            fill={has("bamboo") ? "#95cbb4" : "#b3cbb7"}
          />
        </svg>
      )}

      {/* 9. 深夜星辰轻闪 */}
      {has("stars") && (
        <div className="absolute inset-0">
          {stars.map((star, idx) => (
            <span
              key={idx}
              className="animate-retreat-star absolute rounded-full bg-[#fff9e6]"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: star.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* 10. 太极意境体验第一阶段：背景太极光晕慢转（非强干扰） */}
      {has("taiji") && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 ${
            immersive ? "top-[42%] opacity-35" : "top-1/2 opacity-40"
          }`}
        >
          <svg
            viewBox="0 0 120 120"
            className="animate-retreat-taiji h-44 w-44 md:h-56 md:w-56"
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(216, 238, 229, 0.45)"
              strokeWidth="1.2"
            />
            <path
              d="M60,8 A52,52 0 1,1 60,112 A26,26 0 1,1 60,60 A26,26 0 1,0 60,8 Z"
              fill="rgba(225, 242, 236, 0.25)"
            />
            <path
              d="M60,8 A52,52 0 1,0 60,112 A26,26 0 1,0 60,60 A26,26 0 1,1 60,8 Z"
              fill="rgba(16, 36, 32, 0.38)"
            />
            <circle cx="60" cy="34" r="5" fill="rgba(16, 36, 32, 0.42)" />
            <circle cx="60" cy="86" r="5" fill="rgba(225, 242, 236, 0.42)" />
          </svg>
        </div>
      )}

      {/* 11. 少量自然光粒子 */}
      {has("motes") &&
        motes.map((mote, index) => (
          <span
            key={index}
            className="animate-mote absolute h-1.5 w-1.5 rounded-full blur-[0.5px]"
            style={{
              left: mote.left,
              top: mote.top,
              backgroundColor: moteColor,
              animationDelay: mote.delay,
              animationDuration: mote.dur,
            }}
          />
        ))}
    </div>
  );
}
