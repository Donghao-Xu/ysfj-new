import { Pause, Play, RotateCcw, Volume2, VolumeX, Wind } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  type BreathModeId,
  type BreathVisualId,
  type RetreatRealmId,
  NIANFO_PHRASES,
} from "@/data/retreatScenes";
import { playBeadClickSound, playWoodenFishSound } from "@/lib/audio";

export type BreathingGuideProps = {
  enabled: boolean;
  onToggleEnabled: () => void;
  mode: BreathModeId;
  onModeChange: (mode: BreathModeId) => void;
  visual: BreathVisualId;
  onVisualChange: (visual: BreathVisualId) => void;
  inhaleSec: number;
  exhaleSec: number;
  onCustomSecChange: (inhale: number, exhale: number) => void;
  active: boolean;
  tone: RetreatRealmId;
  compact?: boolean;
};

/**
 * 呼吸引导系统：
 * - 不强制屏息/憋气，采用轻柔二阶段（吸气 / 呼气）或自由随息
 * - 可随时开启/关闭，支持 4 种柔和视觉形态（光球、莲花、光环、云雾）
 * - 明确标注仅为放松辅助，非医疗治疗
 */
export function BreathingGuideWidget({
  enabled,
  onToggleEnabled,
  mode,
  onModeChange,
  visual,
  onVisualChange,
  inhaleSec,
  exhaleSec,
  onCustomSecChange,
  active,
  tone,
  compact = false,
}: BreathingGuideProps) {
  const [phase, setPhase] = useState<"inhale" | "exhale">("inhale");
  const [secondsLeftInPhase, setSecondsLeftInPhase] = useState(5);

  const cycleInhale = mode === "slow" ? 5 : mode === "deep" ? 4 : inhaleSec;
  const cycleExhale = mode === "slow" ? 5 : mode === "deep" ? 6 : exhaleSec;

  useEffect(() => {
    if (!enabled || !active || mode === "free") {
      setPhase("inhale");
      setSecondsLeftInPhase(cycleInhale);
      return;
    }

    let currentPhase: "inhale" | "exhale" = "inhale";
    let remaining = cycleInhale;
    setPhase(currentPhase);
    setSecondsLeftInPhase(remaining);

    const timer = window.setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        currentPhase = currentPhase === "inhale" ? "exhale" : "inhale";
        remaining = currentPhase === "inhale" ? cycleInhale : cycleExhale;
      }
      setPhase(currentPhase);
      setSecondsLeftInPhase(remaining);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [enabled, active, mode, cycleInhale, cycleExhale]);

  const accentText =
    tone === "buddhist"
      ? "text-[#f7dba5]"
      : tone === "daoist"
        ? "text-[#bce6d7]"
        : "text-[#cde7eb]";

  const glowColor =
    tone === "buddhist"
      ? "rgba(240, 198, 120, 0.34)"
      : tone === "daoist"
        ? "rgba(164, 224, 204, 0.30)"
        : "rgba(182, 225, 235, 0.30)";

  const borderColor =
    tone === "buddhist"
      ? "border-[#e5c17c]/65"
      : tone === "daoist"
        ? "border-[#9fd5c2]/65"
        : "border-[#b4dae2]/65";

  const scaleClass =
    !enabled || !active
      ? "scale-95 opacity-80"
      : mode === "free"
        ? "animate-breathe"
        : phase === "inhale"
          ? "scale-115 opacity-100"
          : "scale-82 opacity-75";

  const durationMs =
    mode === "free"
      ? 900
      : (phase === "inhale" ? cycleInhale : cycleExhale) * 1000;

  if (!enabled && compact) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="font-serif-display text-lg text-[#fff8eb]/85">
          安住此刻 · 自然清净
        </p>
        <button
          type="button"
          onClick={onToggleEnabled}
          className="mt-3 rounded-xl border border-white/25 bg-white/10 px-4 py-1.5 text-xs text-[#fff8eb]/90 backdrop-blur-xs hover:bg-white/20 cursor-pointer"
        >
          开启呼吸引导
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      {enabled && (
        <div className="relative my-3 flex h-44 w-44 items-center justify-center sm:h-48 sm:w-48">
          <div
            className={`relative flex h-36 w-36 items-center justify-center transition-all ease-in-out ${scaleClass}`}
            style={{
              transitionDuration: `${Math.min(durationMs, 6000)}ms`,
            }}
          >
            {visual === "orb" && (
              <div
                className={`flex h-36 w-36 items-center justify-center rounded-full border ${borderColor} backdrop-blur-xs`}
                style={{
                  background: `radial-gradient(circle, ${glowColor} 0%, rgba(255,255,255,0.06) 72%)`,
                }}
              >
                <span className={`font-serif-display text-lg font-semibold ${accentText}`}>
                  {!active
                    ? "随息放松"
                    : mode === "free"
                      ? "自然呼吸"
                      : phase === "inhale"
                        ? "轻缓吸气"
                        : "慢慢呼气"}
                </span>
              </div>
            )}

            {visual === "lotus" && (
              <svg viewBox="0 0 120 110" className="h-36 w-36 overflow-visible">
                <circle cx="60" cy="58" r="46" fill={glowColor} opacity="0.45" />
                <path
                  d="M60 22 C49 40 49 66 60 84 C71 66 71 40 60 22 Z"
                  fill="rgba(250, 224, 232, 0.86)"
                />
                <path
                  d="M60 84 C38 72 28 50 35 34 C46 43 53 62 60 84 Z"
                  fill="rgba(244, 198, 214, 0.78)"
                />
                <path
                  d="M60 84 C82 72 92 50 85 34 C74 43 67 62 60 84 Z"
                  fill="rgba(244, 198, 214, 0.78)"
                />
                <path
                  d="M60 85 C29 77 18 59 22 45 C36 53 48 67 60 85 Z"
                  fill="rgba(235, 178, 198, 0.56)"
                />
                <path
                  d="M60 85 C91 77 102 59 98 45 C84 53 72 67 60 85 Z"
                  fill="rgba(235, 178, 198, 0.56)"
                />
              </svg>
            )}

            {visual === "halo" && (
              <div className="relative flex h-36 w-36 items-center justify-center">
                <span
                  className={`absolute inset-0 rounded-full border-2 ${borderColor}`}
                  style={{ boxShadow: `0 0 28px ${glowColor}` }}
                />
                <span
                  className={`absolute inset-4 rounded-full border ${borderColor} opacity-80`}
                />
                <span
                  className={`absolute inset-8 rounded-full border ${borderColor} opacity-55`}
                />
                <Wind size={24} className={accentText} />
              </div>
            )}

            {visual === "cloud" && (
              <svg viewBox="0 0 140 100" className="h-32 w-40">
                <ellipse cx="70" cy="54" rx="52" ry="26" fill={glowColor} />
                <ellipse
                  cx="52"
                  cy="52"
                  rx="28"
                  ry="20"
                  fill="rgba(255,255,255,0.22)"
                />
                <ellipse
                  cx="88"
                  cy="54"
                  rx="30"
                  ry="18"
                  fill="rgba(255,255,255,0.18)"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      {enabled && (
        <p
          aria-live="polite"
          className={`font-serif-display text-base font-semibold tabular-nums ${
            compact ? "text-[#fff8eb]" : "text-[#2c221e] dark:text-[#efe7da]"
          }`}
        >
          {!active
            ? "准备就绪后，跟随节律放松呼吸"
            : mode === "free"
              ? "自由呼吸 · 无需数秒，保持舒适自然"
              : `${phase === "inhale" ? "吸气" : "呼气"} · ${secondsLeftInPhase} 秒`}
        </p>
      )}

      {!compact && (
        <div className="mt-4 w-full max-w-md space-y-3 rounded-xl border border-[#e2d7c5] bg-[#f6f1e7] p-4 text-left dark:border-[#332922] dark:bg-[#241d19]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#2c221e] dark:text-[#efe7da]">
              呼吸引导辅助
            </span>
            <button
              type="button"
              onClick={onToggleEnabled}
              className={`min-h-[32px] rounded-lg px-3 text-xs font-semibold cursor-pointer ${
                enabled
                  ? "bg-[#1f4e45] text-[#f3f8f5]"
                  : "bg-[#ebe2d2] text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]"
              }`}
            >
              {enabled ? "已开启" : "已关闭"}
            </button>
          </div>

          {enabled && (
            <>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: "free", label: "自由呼吸" },
                    { id: "slow", label: "缓慢 5/5" },
                    { id: "deep", label: "舒缓 4/6" },
                    { id: "custom", label: "自定义" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onModeChange(item.id)}
                    className={`min-h-[34px] rounded-lg px-2 text-[11px] font-semibold cursor-pointer ${
                      mode === item.id
                        ? "bg-[#922e25] text-[#fff8eb] dark:bg-[#b5453a]"
                        : "bg-[#ebe2d2] text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {mode === "custom" && (
                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <label className="flex flex-col gap-1 text-[#4c362a] dark:text-[#dccbb6]">
                    <span>吸气 {inhaleSec} 秒</span>
                    <input
                      type="range"
                      min={3}
                      max={8}
                      value={inhaleSec}
                      onChange={(e) =>
                        onCustomSecChange(Number(e.target.value), exhaleSec)
                      }
                      className="accent-[#922e25] cursor-pointer"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-[#4c362a] dark:text-[#dccbb6]">
                    <span>呼气 {exhaleSec} 秒</span>
                    <input
                      type="range"
                      min={3}
                      max={10}
                      value={exhaleSec}
                      onChange={(e) =>
                        onCustomSecChange(inhaleSec, Number(e.target.value))
                      }
                      className="accent-[#922e25] cursor-pointer"
                    />
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-[#6e5d4f] dark:text-[#b2a18f]">
                  引导形态
                </span>
                <div className="flex gap-1.5">
                  {(
                    [
                      { id: "orb", label: "光球" },
                      { id: "lotus", label: "莲花" },
                      { id: "halo", label: "光环" },
                      { id: "cloud", label: "云雾" },
                    ] as const
                  ).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onVisualChange(v.id)}
                      className={`min-h-[30px] rounded-lg px-2.5 text-[11px] font-medium cursor-pointer ${
                        visual === v.id
                          ? "bg-[#b88b44] text-[#1f1612]"
                          : "bg-[#ebe2d2] text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <p className="text-[11px] leading-relaxed text-[#6e5d4f] dark:text-[#b2a18f]">
            不设憋气要求，仅作日常放松辅助，不构成任何医疗建议或治疗。
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * 木鱼专注修习组件：
 * - 手动轻敲 + 清晰柔和樟木回响 + 波纹缩放反馈
 * - 可切换自动节拍模式（可调节每分钟叩击次数 + 暂停/恢复 + 静音开关）
 */
export function RetreatWoodfishPanel({
  volume,
  soundEnabled,
  onToggleSound,
  onTapRecord,
  darkOverlay = false,
}: {
  volume: number;
  soundEnabled: boolean;
  onToggleSound?: () => void;
  onTapRecord?: () => void;
  darkOverlay?: boolean;
}) {
  const [tapSeq, setTapSeq] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [autoMode, setAutoMode] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const [bpm, setBpm] = useState(52);

  const strike = () => {
    setTapSeq((s) => s + 1);
    setSessionCount((c) => c + 1);
    if (soundEnabled) {
      playWoodenFishSound(volume);
    }
    onTapRecord?.();
  };

  useEffect(() => {
    if (!autoMode || autoPaused) return undefined;
    const intervalMs = Math.max(450, Math.round(60000 / bpm));
    const timer = window.setInterval(() => {
      setTapSeq((s) => s + 1);
      setSessionCount((c) => c + 1);
      if (soundEnabled) {
        playWoodenFishSound(volume);
      }
      onTapRecord?.();
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [autoMode, autoPaused, bpm, soundEnabled, volume, onTapRecord]);

  const cardBg = darkOverlay
    ? "border-white/20 bg-black/45 text-[#fff8eb] backdrop-blur-md"
    : "border-[#e2d7c5] bg-[#f6f1e7] text-[#2c221e] dark:border-[#332922] dark:bg-[#241d19] dark:text-[#efe7da]";

  const subtleText = darkOverlay
    ? "text-[#f5ece0]/80"
    : "text-[#6e5d4f] dark:text-[#b2a18f]";

  return (
    <div className={`mx-auto w-full max-w-md rounded-2xl border p-5 ${cardBg}`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-serif-display text-base font-bold">木鱼专注</h3>
          <p className={`mt-0.5 text-xs ${subtleText}`}>
            轻敲回响，或开启柔和自动节拍随息定心
          </p>
        </div>
        <span className="font-serif-display text-xl font-bold text-[#d4a85d] tabular-nums">
          {sessionCount} 声
        </span>
      </div>

      <div className="my-5 flex flex-col items-center">
        <button
          type="button"
          onClick={strike}
          aria-label="敲击木鱼"
          className="relative flex h-34 w-34 items-center justify-center rounded-full border border-[#d4a85d]/55 bg-[#201611]/75 shadow-md transition-transform active:scale-95 cursor-pointer"
        >
          {tapSeq > 0 && (
            <span
              key={`wf-ring-${tapSeq}`}
              aria-hidden="true"
              className="animate-sound-ring pointer-events-none absolute inset-2 rounded-full border-2 border-[#e5c17c]/85"
            />
          )}
          <svg viewBox="0 0 120 100" className="h-24 w-28 overflow-visible">
            <ellipse
              cx="60"
              cy="83"
              rx="34"
              ry="8"
              fill="#8b352a"
              opacity="0.9"
            />
            <g
              key={`wf-body-${tapSeq}`}
              style={{ transformOrigin: "60px 60px" }}
              className={tapSeq > 0 ? "animate-wooden-fish" : ""}
            >
              <path
                d="M24 54 C24 34 42 22 64 22 C84 22 96 34 96 52 C96 68 82 78 60 78 C38 78 24 68 24 54 Z"
                fill="#b77b3c"
                stroke="#4a2810"
                strokeWidth="2"
              />
              <path
                d="M36 53 C48 56 64 56 76 52"
                stroke="#3d200c"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="80" cy="51" r="4.2" fill="#3d200c" />
            </g>
            <g
              key={`wf-mallet-${tapSeq}`}
              className={tapSeq > 0 ? "animate-mallet-hit" : ""}
            >
              <line
                x1="68"
                y1="22"
                x2="106"
                y2="14"
                stroke="#e5c17c"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <circle
                cx="66"
                cy="23"
                r="6"
                fill="#e5c17c"
                stroke="#5c3618"
                strokeWidth="1.5"
              />
            </g>
          </svg>
        </button>

        <button
          type="button"
          onClick={strike}
          className="mt-3 min-h-[42px] w-full rounded-xl bg-[#922e25] px-5 py-2 text-sm font-bold text-[#fff8eb] hover:opacity-90 active:scale-[0.98] cursor-pointer"
        >
          手动轻叩木鱼
        </button>
      </div>

      {/* 自动节拍与静音设置 */}
      <div className="space-y-2.5 border-t border-white/15 pt-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setAutoMode((m) => !m);
              setAutoPaused(false);
            }}
            className={`min-h-[34px] rounded-lg px-3 font-semibold cursor-pointer ${
              autoMode
                ? "bg-[#b88b44] text-[#1f1612]"
                : darkOverlay
                  ? "bg-white/15 text-[#fff8eb]"
                  : "bg-[#ebe2d2] text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]"
            }`}
          >
            {autoMode ? "自动节拍：开启" : "开启自动节拍"}
          </button>

          <div className="flex items-center gap-2">
            {autoMode && (
              <button
                type="button"
                onClick={() => setAutoPaused((p) => !p)}
                className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-white/15 px-3 font-semibold cursor-pointer"
              >
                {autoPaused ? <Play size={13} /> : <Pause size={13} />}
                <span>{autoPaused ? "继续" : "暂停"}</span>
              </button>
            )}
            {onToggleSound && (
              <button
                type="button"
                onClick={onToggleSound}
                aria-label={soundEnabled ? "木鱼静音" : "开启木鱼声音"}
                className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-white/15 px-2.5 cursor-pointer"
              >
                {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span>{soundEnabled ? "有声" : "静音"}</span>
              </button>
            )}
          </div>
        </div>

        {autoMode && (
          <div className="flex items-center justify-between gap-3">
            <span className={subtleText}>节拍速度</span>
            <input
              type="range"
              min={30}
              max={100}
              step={2}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="flex-1 accent-[#d4a85d] cursor-pointer"
            />
            <span className="w-16 text-right tabular-nums">{bpm} 次/分</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 念珠修习交互组件（108 颗）：
 * - 点击中央或左右轻滑皆可前拨一颗念珠
 * - 支持暂停、清零、念珠音效开关，不设功德数值或排名
 */
export function RetreatBeadsPanel({
  volume,
  soundEnabled,
  onToggleSound,
  darkOverlay = false,
}: {
  volume: number;
  soundEnabled: boolean;
  onToggleSound?: () => void;
  darkOverlay?: boolean;
}) {
  const TOTAL_BEADS = 108;
  const RING_BEADS = 27; // Clean visual ring slice (27 x 4 = 108)
  const [count, setCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [popSeq, setPopSeq] = useState(0);
  const dragStartY = useRef<number | null>(null);

  const advanceBead = () => {
    if (paused) return;
    setCount((c) => c + 1);
    setPopSeq((s) => s + 1);
    if (soundEnabled) {
      playBeadClickSound(volume);
    }
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragStartY.current = e.clientY;
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return;
    const diff = e.clientY - dragStartY.current;
    dragStartY.current = null;
    // Swipe up/down >= 18px advances one bead; simple click also handled by onClick
    if (Math.abs(diff) >= 18) {
      advanceBead();
    }
  };

  const currentInMala = count % TOTAL_BEADS;
  const completedRounds = Math.floor(count / TOTAL_BEADS);
  const activeVisualIndex = count % RING_BEADS;

  const cardBg = darkOverlay
    ? "border-white/20 bg-black/45 text-[#fff8eb] backdrop-blur-md"
    : "border-[#e2d7c5] bg-[#f6f1e7] text-[#2c221e] dark:border-[#332922] dark:bg-[#241d19] dark:text-[#efe7da]";
  const subtleText = darkOverlay
    ? "text-[#f5ece0]/80"
    : "text-[#6e5d4f] dark:text-[#b2a18f]";

  return (
    <div className={`mx-auto w-full max-w-md rounded-2xl border p-5 ${cardBg}`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-serif-display text-base font-bold">
            一零八念珠修习
          </h3>
          <p className={`mt-0.5 text-xs ${subtleText}`}>
            轻点或上下滑动念珠拨动计数，专注当下每一刻
          </p>
        </div>
        <div className="text-right tabular-nums">
          <p className="font-serif-display text-lg font-bold text-[#d4a85d]">
            {currentInMala} / {TOTAL_BEADS}
          </p>
          <p className={`text-[11px] ${subtleText}`}>
            已绕 {completedRounds} 圈 · 共 {count} 颗
          </p>
        </div>
      </div>

      {/* Circular Mala Visualization + Interactive Bead Dial */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={advanceBead}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter" || e.key === "ArrowDown") {
            e.preventDefault();
            advanceBead();
          }
        }}
        aria-label="拨动念珠"
        className="relative mx-auto my-5 flex h-44 w-44 touch-pan-x items-center justify-center rounded-full select-none cursor-pointer"
      >
        <svg viewBox="0 0 180 180" className="h-44 w-44">
          <circle
            cx="90"
            cy="90"
            r="68"
            fill="none"
            stroke="rgba(212, 168, 93, 0.3)"
            strokeWidth="1.5"
          />
          {Array.from({ length: RING_BEADS }).map((_, idx) => {
            const angle = ((idx - activeVisualIndex) / RING_BEADS) * Math.PI * 2 - Math.PI / 2;
            const x = 90 + Math.cos(angle) * 68;
            const y = 90 + Math.sin(angle) * 68;
            const isFocal = idx === activeVisualIndex;
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r={isFocal ? 8.5 : 5.2}
                fill={isFocal ? "#d4a85d" : "#6c4830"}
                stroke={isFocal ? "#fff5d8" : "#3f2818"}
                strokeWidth={isFocal ? 1.5 : 0.8}
              />
            );
          })}
        </svg>

        <div
          key={popSeq}
          className="animate-bead-pop pointer-events-none absolute flex flex-col items-center justify-center text-center"
        >
          <span className="font-serif-display text-2xl font-bold text-[#d4a85d] tabular-nums">
            {currentInMala}
          </span>
          <span className={`mt-0.5 text-[11px] ${subtleText}`}>
            {paused ? "已暂停拨珠" : "轻触或滑动拨下一颗"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-[#922e25] px-3 font-semibold text-[#fff8eb] cursor-pointer"
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
            <span>{paused ? "恢复" : "暂停"}</span>
          </button>
          <button
            type="button"
            onClick={() => setCount(0)}
            className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-white/15 px-3 font-semibold cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>重置</span>
          </button>
        </div>

        {onToggleSound && (
          <button
            type="button"
            onClick={onToggleSound}
            className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-white/15 px-3 cursor-pointer"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>{soundEnabled ? "拨珠有声" : "静音"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 念佛静修界面：选念经典圣号、不设功德排行与虚假效果
 */
export function RetreatNianfoPanel({
  selectedPhraseId,
  onSelectPhrase,
  darkOverlay = false,
}: {
  selectedPhraseId: string;
  onSelectPhrase: (id: string) => void;
  darkOverlay?: boolean;
}) {
  const active =
    NIANFO_PHRASES.find((p) => p.id === selectedPhraseId) || NIANFO_PHRASES[0];

  const cardBg = darkOverlay
    ? "border-white/20 bg-black/45 text-[#fff8eb] backdrop-blur-md"
    : "border-[#e2d7c5] bg-[#f6f1e7] text-[#2c221e] dark:border-[#332922] dark:bg-[#241d19] dark:text-[#efe7da]";

  const subtleText = darkOverlay
    ? "text-[#f5ece0]/80"
    : "text-[#6e5d4f] dark:text-[#b2a18f]";

  return (
    <div className={`mx-auto w-full max-w-lg rounded-2xl border p-5 text-center ${cardBg}`}>
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-2">
        {NIANFO_PHRASES.map((item) => {
          const isSelected = item.id === active.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPhrase(item.id)}
              className={`min-h-[34px] shrink-0 rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "bg-[#922e25] text-[#fff8eb]"
                  : darkOverlay
                    ? "bg-white/12 text-[#fff8eb]/85"
                    : "bg-[#ebe2d2] text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]"
              }`}
            >
              {item.text}
            </button>
          );
        })}
      </div>

      <p className="mt-4 font-serif-display text-2xl font-bold tracking-wider text-[#e5c17c] md:text-3xl">
        {active.text}
      </p>
      <p className={`mx-auto mt-2 max-w-md text-xs leading-relaxed ${subtleText}`}>
        {active.meaning}
      </p>
    </div>
  );
}
