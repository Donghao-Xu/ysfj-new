import { useEffect, useState } from "react";
import { useAppState } from "@/context/AppContext";

export type AtmosphereVariant = "home" | "buddhist" | "daoist" | "meditation";

const DESKTOP_MOTES = [
  { left: "14%", top: "68%", delay: "0s", dur: "8s" },
  { left: "26%", top: "54%", delay: "1.4s", dur: "7.2s" },
  { left: "41%", top: "74%", delay: "2.8s", dur: "8.8s" },
  { left: "58%", top: "48%", delay: "0.9s", dur: "7.6s" },
  { left: "72%", top: "66%", delay: "3.3s", dur: "9.2s" },
  { left: "84%", top: "52%", delay: "1.9s", dur: "8.1s" },
  { left: "91%", top: "70%", delay: "4.1s", dur: "7.4s" },
];

const MOBILE_MOTES = DESKTOP_MOTES.filter((_, idx) => idx % 2 === 0);

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

export function SacredEnvironmentLayer({
  variant = "home",
  showLantern = true,
  showLotus = false,
}: {
  variant?: AtmosphereVariant;
  showLantern?: boolean;
  showLotus?: boolean;
}) {
  const { settings } = useAppState();
  const isMobile = useIsMobileViewport();

  if (settings.animationMode === "off" || settings.animationMode === "reduced") {
    return null;
  }

  const isDaoist = variant === "daoist" || variant === "meditation";
  const mistPrimary = isDaoist
    ? "rgba(214, 236, 228, 0.22)"
    : "rgba(255, 244, 224, 0.22)";
  const mistSecondary = isDaoist
    ? "rgba(182, 220, 208, 0.16)"
    : "rgba(246, 214, 165, 0.16)";
  const sunGlow = isDaoist
    ? "radial-gradient(ellipse at top right, rgba(212, 235, 224, 0.30), rgba(181, 141, 70, 0.08) 48%, transparent 72%)"
    : "radial-gradient(ellipse at top right, rgba(255, 226, 166, 0.34), rgba(197, 154, 83, 0.1) 50%, transparent 72%)";
  const moteColor = isDaoist ? "#d4efe6" : "#f7dda4";
  const motes = isMobile ? MOBILE_MOTES : DESKTOP_MOTES;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* 1. 太阳光与天光慢变 */}
      <div
        className="animate-sun-sweep absolute -top-16 -right-16 h-72 w-72 rounded-full md:h-96 md:w-96"
        style={{ background: sunGlow }}
      />

      {/* 2. 云海与山间薄雾缓缓流动 */}
      <svg
        viewBox="0 0 800 220"
        preserveAspectRatio="none"
        className="animate-cloud-slow absolute inset-x-0 top-0 h-32 w-[112%] -left-[6%] opacity-80"
      >
        <path
          d="M0,78 C130,36 220,108 360,64 C490,24 610,94 800,52 L800,0 L0,0 Z"
          fill={mistSecondary}
        />
      </svg>

      <svg
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        className="animate-cloud-reverse absolute inset-x-0 bottom-8 h-28 w-[116%] -left-[8%] opacity-90"
      >
        <path
          d="M0,120 C160,68 280,148 440,98 C590,52 700,132 800,88 L800,200 L0,200 Z"
          fill={mistPrimary}
        />
      </svg>

      {/* 3. 水面细微波纹（底部水景） */}
      <div className="absolute right-8 bottom-3 flex items-center justify-center opacity-55">
        <span
          className="animate-water-ripple h-10 w-24 rounded-full border"
          style={{
            borderColor: isDaoist
              ? "rgba(184, 222, 209, 0.45)"
              : "rgba(245, 220, 175, 0.45)",
          }}
        />
        <span
          className="animate-water-ripple absolute h-6 w-14 rounded-full border"
          style={{
            animationDelay: "2.1s",
            borderColor: isDaoist
              ? "rgba(184, 222, 209, 0.4)"
              : "rgba(245, 220, 175, 0.4)",
          }}
        />
      </div>

      {/* 4. 边角松竹花草轻拂 */}
      <svg
        viewBox="0 0 120 140"
        className="animate-foliage-sway absolute -bottom-2 -left-2 h-24 w-20 opacity-45 md:h-28 md:w-24"
      >
        <path
          d="M14,138 Q28,84 44,44 M28,96 Q54,78 72,72 M22,74 Q48,54 64,40 M35,54 Q52,32 62,18"
          stroke={isDaoist ? "#86bfb0" : "#d8c195"}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse
          cx="68"
          cy="71"
          rx="11"
          ry="3.5"
          transform="rotate(-14 68 71)"
          fill={isDaoist ? "#86bfb0" : "#d8c195"}
        />
        <ellipse
          cx="61"
          cy="39"
          rx="10"
          ry="3"
          transform="rotate(-28 61 39)"
          fill={isDaoist ? "#86bfb0" : "#d8c195"}
        />
      </svg>

      {/* 5. 檐下灯笼 / 烛火自然闪烁 */}
      {showLantern && (
        <div className="absolute top-4 left-5 flex items-center gap-2 opacity-80">
          <div className="relative flex h-7 w-5 items-center justify-center rounded-full border border-[#f2c879]/60 bg-[#b84c35]/65">
            <span className="animate-flame h-2.5 w-2 rounded-full bg-[#ffe19c] blur-[1px]" />
          </div>
        </div>
      )}

      {/* 6. 池面莲花缓慢绽放（仅用于首页/佛教意境） */}
      {showLotus && !isDaoist && (
        <svg
          viewBox="0 0 80 56"
          className="animate-lotus-bloom absolute right-14 bottom-4 h-10 w-14 opacity-75"
        >
          <path
            d="M40 12 C34 22 34 34 40 42 C46 34 46 22 40 12 Z"
            fill="#f7d8df"
          />
          <path
            d="M40 42 C28 36 22 25 26 17 C33 21 37 31 40 42 Z"
            fill="#f2bfd0"
            opacity="0.9"
          />
          <path
            d="M40 42 C52 36 58 25 54 17 C47 21 43 31 40 42 Z"
            fill="#f2bfd0"
            opacity="0.9"
          />
          <ellipse cx="40" cy="45" rx="22" ry="4" fill="#6f9e7f" opacity="0.65" />
        </svg>
      )}

      {/* 7. 少量自然光粒子（手机端自动减半） */}
      {motes.map((mote, index) => (
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

export function SceneTransitionCurtain({
  type,
  transitionKey,
}: {
  type: "buddhist-light" | "daoist-mist" | null;
  transitionKey: string | number;
}) {
  const { settings } = useAppState();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!type || settings.animationMode === "off") {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [type, transitionKey, settings.animationMode]);

  if (!visible || !type) return null;

  if (type === "buddhist-light") {
    return (
      <div
        key={`veil-${transitionKey}`}
        aria-hidden="true"
        className="animate-buddhist-veil pointer-events-none fixed inset-0 z-40"
        style={{
          background:
            "radial-gradient(circle at center, rgba(245, 208, 120, 0.36) 0%, rgba(146, 46, 37, 0.16) 55%, transparent 85%)",
        }}
      />
    );
  }

  return (
    <div
      key={`mist-${transitionKey}`}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      <div
        className="animate-mist-left absolute inset-y-0 left-0 w-3/5"
        style={{
          background:
            "linear-gradient(to right, rgba(232, 242, 237, 0.85), rgba(206, 226, 217, 0.45), transparent)",
        }}
      />
      <div
        className="animate-mist-right absolute inset-y-0 right-0 w-3/5"
        style={{
          background:
            "linear-gradient(to left, rgba(232, 242, 237, 0.85), rgba(206, 226, 217, 0.45), transparent)",
        }}
      />
    </div>
  );
}
