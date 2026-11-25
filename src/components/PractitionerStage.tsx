import { Eye, Sparkles } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  ACTION_LABELS,
  type PractitionerAction,
  type ScenePeer,
} from "@/lib/presence";

const PEER_SLOTS: { left: number; bottom: number; scale: number }[] = [
  { left: 19, bottom: 26, scale: 0.8 },
  { left: 31, bottom: 30, scale: 0.76 },
  { left: 69, bottom: 30, scale: 0.76 },
  { left: 81, bottom: 26, scale: 0.8 },
  { left: 24, bottom: 20, scale: 0.84 },
  { left: 76, bottom: 20, scale: 0.84 },
  { left: 38, bottom: 34, scale: 0.72 },
  { left: 62, bottom: 34, scale: 0.72 },
  { left: 14, bottom: 22, scale: 0.82 },
  { left: 86, bottom: 22, scale: 0.82 },
  { left: 44, bottom: 36, scale: 0.7 },
  { left: 56, bottom: 36, scale: 0.7 },
];

function getSelfStationX(
  action: PractitionerAction,
  religion: "buddhist" | "daoist",
): number {
  if (religion === "daoist") {
    if (action === "incense") return 60;
    if (action === "gongshou") return 50;
    if (action === "chanting") return 44;
    return 50;
  }
  switch (action) {
    case "flower":
      return 25;
    case "lifo":
    case "hezhang":
      return 47;
    case "incense":
      return 55;
    case "lamp":
      return 74;
    case "woodfish":
    case "chanting":
      return 38;
    default:
      return 50;
  }
}

/**
 * 背面视角传统修行者人物（背对观众，面朝殿内佛像/三清神像）
 * - 采用约 7.5 头身自然成人比例（viewBox 0 0 120 212）
 * - 背面细节：后脑发髻/素冠/耳廓、海青/交领道袍后襟、宽袖垂褶、腰带丝绦、罗汉鞋/云履与地面投影
 * - 礼敬物品与手势均朝向正前方（屏幕深处佛像方向）伸展
 */
export function PractitionerFigure({
  tradition,
  action,
  isSelf = false,
  label,
  onClick,
  hideLabel = false,
  hideStageProps = false,
  sizeClass,
}: {
  tradition: "buddhist" | "daoist";
  action: PractitionerAction;
  isSelf?: boolean;
  label: string;
  onClick?: () => void;
  hideLabel?: boolean;
  hideStageProps?: boolean;
  sizeClass?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const isDao = tradition === "daoist";

  const robeTop = isDao
    ? isSelf
      ? "#31695e"
      : "#254e46"
    : isSelf
      ? "#4e3930"
      : "#3c2e28";
  const robeBottom = isDao
    ? isSelf
      ? "#193a33"
      : "#142e28"
    : isSelf
      ? "#2b1f1a"
      : "#211915";
  const sashColor = isDao
    ? isSelf
      ? "#dcebe4"
      : "#b7ccc3"
    : isSelf
      ? "#a95e2f"
      : "#864b26";
  const sashDark = isDao
    ? isSelf
      ? "#9bbab0"
      : "#7d9b92"
    : isSelf
      ? "#7d401c"
      : "#633317";
  const collarTrim = isDao ? "#edf4f0" : "#e3ceb3";
  const rimLight = isDao
    ? "rgba(196, 232, 219, 0.32)"
    : "rgba(248, 212, 148, 0.34)";
  const hairColor = "#1b1614";
  const earSkin = "#d8b494";

  const isKneeling = action === "lifo";
  const isSeated = action === "woodfish" || action === "chanting";
  const isBowingStand = action === "hezhang" || action === "gongshou";

  const robeGradId = `robe-${uid}`;
  const sashGradId = `sash-${uid}`;
  const shadowGradId = `shadow-${uid}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-center focus:outline-none ${
        onClick ? "cursor-pointer" : "cursor-default"
      }`}
      aria-label={`${label} · ${ACTION_LABELS[action]}`}
    >
      {/* 角色上方静谧状态文字（大雄宝殿可通过 hideLabel 隐藏全部悬浮标签） */}
      {!hideLabel && (
        <span
          className={`mb-1 rounded-md px-2 py-0.5 text-[10px] font-medium tracking-wide whitespace-nowrap backdrop-blur-xs transition-transform group-hover:scale-105 ${
            isSelf
              ? isDao
                ? "border border-[#b8ded1]/45 bg-[#0b1f1b]/80 text-[#e8f6f0]"
                : "border border-[#e5c17c]/55 bg-[#1b120e]/80 text-[#fae4b8]"
              : "border border-white/15 bg-black/55 text-[#efe8dc]/90"
          }`}
        >
          {label} · {ACTION_LABELS[action]}
        </span>
      )}

      <svg
        viewBox="0 0 120 212"
        className={`${
          sizeClass
            ? sizeClass
            : isSelf
              ? "h-40 w-24 sm:h-48 sm:w-28 md:h-52 md:w-30"
              : "h-32 w-20 sm:h-36 sm:w-22 opacity-92"
        } overflow-visible drop-shadow-[0_8px_14px_rgba(0,0,0,0.6)]`}
      >
        <defs>
          <linearGradient id={robeGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={robeTop} />
            <stop offset="100%" stopColor={robeBottom} />
          </linearGradient>
          <linearGradient id={sashGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={sashColor} />
            <stop offset="100%" stopColor={sashDark} />
          </linearGradient>
          <radialGradient id={shadowGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.62)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* 脚下或蒲团地面投影 */}
        <ellipse
          cx="60"
          cy="198"
          rx={isSeated || isKneeling ? 34 : 24}
          ry="7"
          fill={`url(#${shadowGradId})`}
        />

        {/* 前方佛光 / 灯火暖晕（来自面前的佛前灯烛；若场景已摆放供桌灯盏则隐藏重复灯台） */}
        {action === "lamp" && !hideStageProps && (
          <g>
            {/* 前方灯台：位于人物前方偏右，面向殿内 */}
            <path d="M84 114 L92 114 L90 192 L86 192 Z" fill="#5e432a" />
            <ellipse cx="88" cy="193" rx="9" ry="3" fill="#46311d" />
            <path d="M77 110 Q88 119 99 110 L95 104 L81 104 Z" fill="#d9aa52" />
            <circle
              cx="88"
              cy="97"
              r="22"
              fill="rgba(255, 212, 118, 0.34)"
              className="animate-warm-halo"
            />
            <path
              d="M88 86 C92 93 92 100 88 103 C84 100 84 93 88 86 Z"
              fill="#ffeb99"
              className="animate-flame"
            />
          </g>
        )}

        {action === "chanting" && (
          <ellipse
            cx="60"
            cy="128"
            rx="44"
            ry="58"
            fill={
              isDao
                ? "rgba(184, 222, 209, 0.16)"
                : "rgba(235, 188, 108, 0.18)"
            }
            className="animate-chanting-aura"
          />
        )}

        {/* ==================== 1. 跪拜礼佛（背面俯首） ==================== */}
        {isKneeling ? (
          <g>
            {/* 拜垫（人物跪于垫上，面朝前方佛像） */}
            <ellipse
              cx="60"
              cy="189"
              rx="32"
              ry="9"
              fill="#6e2920"
              stroke="#c89a4e"
              strokeWidth="1.2"
            />
            <ellipse cx="60" cy="185" rx="28" ry="6.5" fill="#88362a" />

            {/* 背面跪姿双足跟与小腿下摆（贴地静止在垫后方） */}
            <ellipse cx="52" cy="191" rx="5.5" ry="3.8" fill="#181311" />
            <ellipse cx="68" cy="191" rx="5.5" ry="3.8" fill="#181311" />
            <path
              d="M36 184 Q60 176 84 184 Q78 191 60 191 Q42 191 36 184 Z"
              fill={robeBottom}
            />

            {/* 俯身下拜动态躯干 */}
            <g className="animate-avatar-lifo">
              {/* 跪姿展开的宽大背袍与腰部褶皱 */}
              <path
                d="M35 182 C34 152 38 118 44 102 Q60 95 76 102 C82 118 86 152 85 182 Q60 189 35 182 Z"
                fill={`url(#${robeGradId})`}
                stroke={rimLight}
                strokeWidth="0.9"
              />
              {/* 披肩斜搭缦衣背幅 */}
              <path
                d="M44 103 L76 128 L72 152 L39 124 Z"
                fill={`url(#${sashGradId})`}
                opacity="0.9"
              />
              {/* 向前俯拜时肩两侧外展的手肘与宽袖 */}
              <path
                d="M44 105 C33 114 31 128 36 142 L43 139 C40 128 42 117 47 112 Z"
                fill={robeTop}
              />
              <path
                d="M76 105 C87 114 89 128 84 142 L77 139 C80 128 78 117 73 112 Z"
                fill={robeTop}
              />
              {/* 后领与颈部 */}
              <path d="M51 101 Q60 95 69 101 L65 92 L55 92 Z" fill={collarTrim} />
              {/* 后脑勺（微低头向佛） */}
              <ellipse cx="60" cy="83" rx="11.5" ry="12.5" fill={hairColor} />
              <path
                d="M50 76 Q60 69 70 76"
                fill="none"
                stroke={rimLight}
                strokeWidth="1.2"
              />
            </g>
          </g>
        ) : isSeated ? (
          /* ==================== 2. 盘坐木鱼 / 诵经（背面） ==================== */
          <g>
            {/* 蒲团 */}
            <ellipse
              cx="60"
              cy="189"
              rx="32"
              ry="9"
              fill={isDao ? "#20473f" : "#6c2a21"}
              stroke="#c99b4f"
              strokeWidth="1.2"
            />
            <ellipse
              cx="60"
              cy="184"
              rx="28"
              ry="6.5"
              fill={isDao ? "#2b5e53" : "#87382c"}
            />

            <g
              className={
                action === "chanting"
                  ? "animate-avatar-chant"
                  : "animate-avatar-breathe"
              }
            >
              {/* 盘腿宽大下摆覆盖蒲团 */}
              <path
                d="M27 183 C29 162 42 152 60 152 C78 152 91 162 93 183 Q60 192 27 183 Z"
                fill={robeBottom}
                stroke={rimLight}
                strokeWidth="0.7"
              />
              {/* 挺直后背 */}
              <path
                d="M42 158 C41 132 42 106 43 92 Q60 85 77 92 C78 106 79 132 78 158 Q60 164 42 158 Z"
                fill={`url(#${robeGradId})`}
                stroke={rimLight}
                strokeWidth="0.8"
              />
              {/* 道袍背腰带 或 佛教背搭缦衣 */}
              {isDao ? (
                <g>
                  <path
                    d="M42 140 Q60 144 78 140 L78 146 Q60 150 42 146 Z"
                    fill={`url(#${sashGradId})`}
                  />
                  <path d="M56 146 L53 176 L58 177 L60 147 Z" fill={sashColor} />
                  <path d="M64 146 L67 176 L62 177 L60 147 Z" fill={sashDark} />
                </g>
              ) : (
                <path
                  d="M43 94 L77 124 L76 154 L42 121 Z"
                  fill={`url(#${sashGradId})`}
                  opacity="0.92"
                />
              )}

              {/* 左臂与右臂（自然向前） */}
              <path
                d="M43 94 C34 106 33 128 38 148 L44 146 C42 128 42 112 46 102 Z"
                fill={robeTop}
              />

              {action === "woodfish" ? (
                <>
                  {/* 身前右侧木鱼（若场景地面已有木鱼则不重复绘制） */}
                  {!hideStageProps && (
                    <>
                      <ellipse
                        cx="92"
                        cy="176"
                        rx="11"
                        ry="8"
                        fill="#9e632b"
                        stroke="#4a280e"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M84 176 Q92 179 100 176"
                        stroke="#3a1e09"
                        strokeWidth="1.6"
                        fill="none"
                      />
                    </>
                  )}
                  {/* 右手执槌轻敲（背面微动） */}
                  <g className="animate-avatar-woodfish">
                    <path
                      d="M77 94 C86 108 87 132 84 150 L77 148 C79 130 78 112 73 102 Z"
                      fill={robeTop}
                    />
                    <line
                      x1="83"
                      y1="149"
                      x2="91"
                      y2="167"
                      stroke="#633a18"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <circle cx="91" cy="167" r="2.6" fill="#dfb776" />
                  </g>
                </>
              ) : (
                <>
                  {/* 诵经：双臂捧经在前，右臂自然外展，经卷上沿微露 */}
                  <path
                    d="M77 94 C86 106 87 128 82 148 L76 146 C78 128 78 112 74 102 Z"
                    fill={robeTop}
                  />
                  {/* 经卷微露于肩前上方边缘 */}
                  <path
                    d="M49 91 L71 91 L73 84 L47 84 Z"
                    fill="#f4e6c8"
                    stroke="#b88b44"
                    strokeWidth="0.9"
                    opacity="0.92"
                  />
                </>
              )}

              {/* 后领与颈项 */}
              <path d="M51 91 Q60 86 69 91 L65 81 L55 81 Z" fill={collarTrim} />
              <rect x="55" y="75" width="10" height="8" rx="3" fill={earSkin} />

              {/* 后脑勺（背面观：耳廓微露，发丝与道髻） */}
              <ellipse cx="48.5" cy="69" rx="2.1" ry="3.8" fill={earSkin} />
              <ellipse cx="71.5" cy="69" rx="2.1" ry="3.8" fill={earSkin} />
              <ellipse cx="60" cy="66" rx="11.2" ry="12.5" fill={hairColor} />
              <path
                d="M50 58 Q60 52 70 58"
                fill="none"
                stroke={rimLight}
                strokeWidth="1.2"
              />
              {isDao && (
                <>
                  <circle cx="60" cy="52" r="4.2" fill={hairColor} />
                  <line
                    x1="51"
                    y1="52"
                    x2="69"
                    y2="52"
                    stroke="#d9be83"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </>
              )}
            </g>
          </g>
        ) : (
          /* ==================== 3. 站姿（7.5头身背面写实比例，面向佛像） ==================== */
          <g className="animate-avatar-breathe">
            {/* 脚下露出少许鞋跟（罗汉鞋 / 布履背面） */}
            <ellipse cx="52" cy="195" rx="5.5" ry="3.6" fill="#171311" />
            <ellipse cx="68" cy="195" rx="5.5" ry="3.6" fill="#171311" />

            {/* 宽大垂地长袍背面主体（肩 y=44 至衣摆 y=191，总身高与头长呈自然比例） */}
            <path
              d="M39 50 Q60 40 81 50 L85 118 L89 190 Q60 196 31 190 L35 118 Z"
              fill={`url(#${robeGradId})`}
              stroke={rimLight}
              strokeWidth="0.8"
            />

            {/* 背面衣褶垂直暗线（增强垂坠布料立体感） */}
            <path
              d="M46 112 L41 189 M55 106 L53 192 M66 106 L68 192 M75 112 L80 189"
              stroke="rgba(0,0,0,0.28)"
              strokeWidth="1.3"
              fill="none"
            />

            {/* 佛教斜披缦衣 / 道教腰带丝绦 */}
            {isDao ? (
              <g>
                {/* 后背护领 */}
                <path
                  d="M50 46 Q60 51 70 46 L68 41 L52 41 Z"
                  fill={collarTrim}
                />
                {/* 腰间丝绦带及背面垂尾 */}
                <path
                  d="M37 101 Q60 107 83 101 L83 107 Q60 113 37 107 Z"
                  fill={`url(#${sashGradId})`}
                />
                <path d="M55 107 L51 154 L57 156 L60 109 Z" fill={sashColor} />
                <path d="M65 107 L69 154 L63 156 L60 109 Z" fill={sashDark} />
              </g>
            ) : (
              <g>
                {/* 佛门素雅后领 */}
                <path
                  d="M50 46 Q60 51 70 46 L67 41 L53 41 Z"
                  fill={collarTrim}
                />
                {/* 缦衣由左肩斜披向右腰的背面轮廓 */}
                <path
                  d="M41 48 L82 94 L83 132 L38 82 Z"
                  fill={`url(#${sashGradId})`}
                  opacity="0.93"
                />
                <path
                  d="M42 54 L81 98"
                  stroke="rgba(255,232,190,0.22)"
                  strokeWidth="1"
                />
              </g>
            )}

            {/* 分动作的背面肩袖、手势与面向佛像的礼敬持物 */}
            {action === "idle" && (
              <g>
                {/* 自然下垂宽袖（双手在身前轻合） */}
                <path
                  d="M39 50 C31 64 29 94 33 122 L42 120 C41 96 42 74 44 62 Z"
                  fill={robeTop}
                  stroke={rimLight}
                  strokeWidth="0.6"
                />
                <path
                  d="M81 50 C89 64 91 94 87 122 L78 120 C79 96 78 74 76 62 Z"
                  fill={robeTop}
                  stroke={rimLight}
                  strokeWidth="0.6"
                />
              </g>
            )}

            {isBowingStand && (
              /* 合掌 / 拱手：双臂微向前抬，广袖在体侧向前收拢，并伴微微俯首 */
              <g className="animate-avatar-hezhang">
                <path
                  d="M39 50 C30 62 29 82 35 104 L43 100 C40 84 41 69 44 60 Z"
                  fill={robeTop}
                  stroke={rimLight}
                  strokeWidth="0.7"
                />
                <path
                  d="M81 50 C90 62 91 82 85 104 L77 100 C80 84 79 69 76 60 Z"
                  fill={robeTop}
                  stroke={rimLight}
                  strokeWidth="0.7"
                />
                {/* 胸前合十/拱手朝向佛像的暖金光晕（由身前透出） */}
                <ellipse
                  cx="60"
                  cy="66"
                  rx="22"
                  ry="12"
                  fill={
                    isDao
                      ? "rgba(184, 222, 209, 0.22)"
                      : "rgba(255, 224, 150, 0.24)"
                  }
                  className="animate-flame"
                />
              </g>
            )}

            {action === "incense" && (
              /* 上香：左袖自然垂于左侧，右臂举香向前上方供奉（远离镜头，朝向佛像） */
              <g>
                <path
                  d="M39 50 C31 64 29 92 33 118 L42 116 C40 94 41 72 44 60 Z"
                  fill={robeTop}
                />
                <g className="animate-avatar-incense">
                  {/* 右臂抬起前伸的宽袖背面轮廓 */}
                  <path
                    d="M78 52 C88 46 92 34 86 24 L78 27 C80 36 77 45 73 53 Z"
                    fill={robeTop}
                    stroke={rimLight}
                    strokeWidth="0.7"
                  />
                  {/* 手指背面略微可见于袖端之上 */}
                  <circle cx="82" cy="24" r="3.4" fill={earSkin} />
                  {/* 高举向佛像的三柱清香与袅袅青烟 */}
                  <line
                    x1="81"
                    y1="23"
                    x2="78"
                    y2="2"
                    stroke="#b57a40"
                    strokeWidth="1.6"
                  />
                  <line
                    x1="83"
                    y1="23"
                    x2="83"
                    y2="1"
                    stroke="#c28749"
                    strokeWidth="1.6"
                  />
                  <line
                    x1="85"
                    y1="23"
                    x2="88"
                    y2="3"
                    stroke="#b57a40"
                    strokeWidth="1.5"
                  />
                  <circle cx="78" cy="2" r="1.6" fill="#ff9436" className="animate-ember" />
                  <circle cx="83" cy="1" r="1.7" fill="#ff9436" className="animate-ember" />
                  <circle cx="88" cy="3" r="1.5" fill="#ff9436" className="animate-ember" />
                  <path
                    d="M83 0 C79 -10 88 -18 82 -28"
                    stroke="#f7efe0"
                    strokeWidth="1.6"
                    fill="none"
                    className="animate-incense"
                  />
                </g>
              </g>
            )}

            {action === "lamp" && (
              /* 点灯：右臂前伸手持引香枝点亮身前灯盏 */
              <g>
                <path
                  d="M39 50 C31 64 29 92 33 118 L42 116 C40 94 41 72 44 60 Z"
                  fill={robeTop}
                />
                <g className="animate-avatar-lamp">
                  <path
                    d="M78 52 C88 58 92 72 87 86 L79 84 C81 74 79 64 74 58 Z"
                    fill={robeTop}
                    stroke={rimLight}
                    strokeWidth="0.7"
                  />
                  <circle cx="83" cy="86" r="3" fill={earSkin} />
                  <line
                    x1="84"
                    y1="86"
                    x2="88"
                    y2="94"
                    stroke="#9f6932"
                    strokeWidth="1.6"
                  />
                  <circle cx="88" cy="94" r="2.2" fill="#ffd976" className="animate-flame" />
                </g>
              </g>
            )}

            {action === "flower" && (
              /* 供花：双臂捧莲花向殿前供台敬献（花枝高出肩头朝向佛像） */
              <g>
                <g className="animate-avatar-flower">
                  <path
                    d="M39 50 C29 58 29 74 36 86 L43 82 C39 73 40 62 44 56 Z"
                    fill={robeTop}
                  />
                  <path
                    d="M81 50 C91 58 91 74 84 86 L77 82 C81 73 80 62 76 56 Z"
                    fill={robeTop}
                  />
                  {/* 身前敬奉高过右肩的清莲枝 */}
                  <line
                    x1="77"
                    y1="52"
                    x2="86"
                    y2="29"
                    stroke="#4f7c61"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M86 19 C81 24 82 31 86 32 C90 31 91 24 86 19 Z"
                    fill="#f7c5d3"
                  />
                  <path
                    d="M80 26 Q84 31 86 32 Q88 31 92 26"
                    fill="#fadce4"
                  />
                </g>
              </g>
            )}

            {/* 颈部与后脑勺（所有站姿共用，随合掌/拱手微微前俯） */}
            <g className={isBowingStand ? "animate-avatar-head-bow" : ""}>
              <rect x="55" y="34" width="10" height="9" rx="3" fill={earSkin} />
              {/* 后脑视角两侧微露的耳廓 */}
              <ellipse cx="48.5" cy="27" rx="2.1" ry="3.8" fill={earSkin} />
              <ellipse cx="71.5" cy="27" rx="2.1" ry="3.8" fill={earSkin} />
              {/* 后脑勺（饱满自然椭圆头型，无正面五官） */}
              <ellipse cx="60" cy="24" rx="11.2" ry="12.8" fill={hairColor} />
              {/* 来自殿内佛前暖灯照射在头顶发丝的高光边缘 */}
              <path
                d="M50 15 Q60 9 70 15"
                fill="none"
                stroke={rimLight}
                strokeWidth="1.4"
              />
              {isDao && (
                <>
                  {/* 道士背面束发道髻与横木簪 */}
                  <circle cx="60" cy="10" r="4.4" fill={hairColor} />
                  <line
                    x1="50"
                    y1="10"
                    x2="70"
                    y2="10"
                    stroke="#d9be83"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </>
              )}
            </g>
          </g>
        )}
      </svg>
    </button>
  );
}

/**
 * 殿堂实景层上的人物互动与同境共修舞台：
 * - 展示背对观众、面向殿内圣像的自己（位于前景地面）
 * - 展示同殿在线实名同修（位于中景两侧地面，同步呈现实景动作，严格止语不可聊天）
 * - 供台可点击热区置于神台前方高度，不与地面人物重叠
 */
export function HallInteractiveStageOverlay({
  tradition,
  selfAction,
  peers,
  canPublish,
  totalInScene,
  onSelectHotspot,
}: {
  tradition: "buddhist" | "daoist";
  selfAction: PractitionerAction;
  peers: ScenePeer[];
  canPublish: boolean;
  totalInScene: number;
  onSelectHotspot: (action: PractitionerAction) => void;
}) {
  const [silentNotice, setSilentNotice] = useState("");
  const toastTimerRef = useRef<number | null>(null);
  const selfX = getSelfStationX(selfAction, tradition);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showSilentPeerToast = (peer: ScenePeer) => {
    setSilentNotice(
      `「${peer.alias}」正在${ACTION_LABELS[peer.action]} · 同境止语共修，只可相望静心，不可对话`,
    );
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setSilentNotice(""), 3200);
  };

  const hotspots: {
    action: PractitionerAction;
    label: string;
    left: string;
    top: string;
  }[] =
    tradition === "daoist"
      ? [
          { action: "gongshou", label: "行拱手礼", left: "44%", top: "44%" },
          { action: "incense", label: "清香静思", left: "64%", top: "40%" },
        ]
      : [];

  return (
    <>
      {/* 左上角轻量实时同修人数（止语提示，无聊天入口） */}
      <div className="pointer-events-none absolute top-16 left-4 z-20 flex max-w-[calc(100%-2rem)] flex-col items-start gap-1">
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/55 px-2.5 py-1 text-[11px] font-medium text-[#f7efe2] backdrop-blur-xs">
          <Eye size={12} className="text-[#e5c17c]" />
          <span className="tabular-nums">
            同殿共修 {totalInScene} 人 ·{" "}
            {peers.length > 0 ? `含 ${peers.length} 位在线同修 · ` : ""}
            止语同行
          </span>
        </div>
        {!canPublish && (
          <span className="rounded bg-black/45 px-2 py-0.5 text-[10px] text-[#f5ece0]/75 backdrop-blur-xs">
            登录后您的身影也会实时显现于殿内
          </span>
        )}
      </div>

      {/* 殿内供台高度的可点击互动热区（位于人物前方圣像/供案处） */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {hotspots.map((spot) => {
          const active = selfAction === spot.action;
          return (
            <button
              key={spot.action}
              type="button"
              onClick={() => onSelectHotspot(spot.action)}
              style={{ left: spot.left, top: spot.top }}
              className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all cursor-pointer backdrop-blur-xs ${
                active
                  ? "border border-[#ffe29e] bg-[#922e25]/85 text-[#fff8eb] scale-105 shadow-md"
                  : "border border-white/30 bg-black/45 text-[#f7efe2]/90 hover:bg-black/70 hover:scale-105"
              }`}
            >
              <Sparkles size={10} className="text-[#f3c978]" />
              <span>{spot.label}</span>
            </button>
          );
        })}
      </div>

      {/* 殿堂地面角色层：中景在线同修（小比例靠后）+ 前景自己（背对观众，面朝佛像） */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {peers.map((peer) => {
          const slot = PEER_SLOTS[peer.slotIndex % PEER_SLOTS.length];
          return (
            <div
              key={peer.uid}
              style={{
                left: `${slot.left}%`,
                bottom: `${slot.bottom}%`,
                transform: `translateX(-50%) scale(${slot.scale})`,
              }}
              className="pointer-events-auto absolute origin-bottom transition-all duration-700 ease-out"
            >
              <PractitionerFigure
                tradition={peer.religionType}
                action={peer.action}
                label={peer.alias}
                onClick={() => showSilentPeerToast(peer)}
              />
            </div>
          );
        })}

        {/* 当前用户自己（立足殿前前景，背对镜头面向佛像） */}
        <div
          style={{ left: `${selfX}%`, bottom: "4%" }}
          className="pointer-events-auto absolute -translate-x-1/2 transition-all duration-700 ease-out"
        >
          <PractitionerFigure
            tradition={tradition}
            action={selfAction}
            isSelf
            label="我"
          />
        </div>
      </div>

      {/* 点击同修时的止语提醒（严禁聊天） */}
      {silentNotice && (
        <div className="pointer-events-none absolute top-26 left-4 z-30 max-w-xs rounded-xl border border-[#e5c17c]/50 bg-black/80 px-3 py-2 text-[11px] text-[#ffe8ba] shadow-lg backdrop-blur-sm">
          {silentNotice}
        </div>
      )}
    </>
  );
}
