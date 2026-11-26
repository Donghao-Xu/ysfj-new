import { useEffect, useState } from "react";
import type { SceneConfig } from "@/data/scenes";

/**
 * 专属场景主视觉展示组件：
 * 1. 严格按 scene.sceneId 与 imageMode（外观 / 殿内）绑定对应图片，杜绝不同场景共用或错乱。
 * 2. 外观切换至殿内、或连续切换不同大殿时均平滑淡入过渡。
 * 3. 加载异常时仅显示当前场景专属备用占位图。
 */
export function SceneStageImage({
  scene,
  imageMode = "interior",
  className = "h-full w-full object-cover",
}: {
  scene: SceneConfig;
  imageMode?: "exterior" | "interior";
  className?: string;
  disableZoomMotion?: boolean;
}) {
  const targetSrc =
    imageMode === "exterior" ? scene.exteriorImage : scene.mainImage;
  const targetKey = `${scene.sceneId}:${imageMode}:${targetSrc}`;

  const [displayed, setDisplayed] = useState<{
    key: string;
    scene: SceneConfig;
    src: string;
  }>({ key: targetKey, scene, src: targetSrc });
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const [isFadingIn, setIsFadingIn] = useState(false);
  const [useSecondarySrc, setUseSecondarySrc] = useState(false);
  const [failedKey, setFailedKey] = useState<string | null>(null);

  useEffect(() => {
    if (targetKey === displayed.key) return;

    const oldImg = failedKey === displayed.key ? null : displayed.src;
    setPrevSrc(oldImg);
    setDisplayed({ key: targetKey, scene, src: targetSrc });
    setUseSecondarySrc(false);
    setFailedKey(null);
    setIsFadingIn(true);

    const fadeTimer = window.setTimeout(() => {
      setPrevSrc(null);
      setIsFadingIn(false);
    }, 320);

    return () => window.clearTimeout(fadeTimer);
  }, [targetKey, scene, targetSrc, displayed.key, displayed.src, failedKey]);

  const activeSrc = useSecondarySrc
    ? displayed.scene.backgroundImage
    : displayed.src;
  const hasFailed = failedKey === displayed.key;

  const isDaoist = displayed.scene.religionType === "daoist";
  const fallbackBg = isDaoist
    ? "linear-gradient(155deg, #102420 0%, #1d3f37 52%, #294c42 100%)"
    : "linear-gradient(155deg, #2a1814 0%, #4d2820 52%, #683b28 100%)";

  const handleImageError = () => {
    if (
      !useSecondarySrc &&
      displayed.scene.backgroundImage &&
      displayed.scene.backgroundImage !== displayed.src
    ) {
      setUseSecondarySrc(true);
      return;
    }
    setFailedKey(displayed.key);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {prevSrc && (
        <img
          src={prevSrc}
          alt=""
          aria-hidden="true"
          className={`${className} pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300`}
        />
      )}

      {hasFailed ? (
        <div
          role="img"
          aria-label={`${displayed.scene.sceneName}专属备用视觉`}
          style={{ background: fallbackBg }}
          className="flex h-full w-full flex-col items-center justify-center p-8 text-center"
        >
          <svg
            viewBox="0 0 120 72"
            className="mb-3 h-14 w-24 opacity-75"
            aria-hidden="true"
          >
            <path
              d="M14 58 L60 16 L106 58 Z"
              fill="none"
              stroke={isDaoist ? "#b8ded1" : "#e5c17c"}
              strokeWidth="2"
            />
            <path
              d="M32 58 L32 38 L88 38 L88 58"
              fill="none"
              stroke={isDaoist ? "#86bfb0" : "#c59a53"}
              strokeWidth="1.6"
            />
          </svg>
          <p className="text-xs tracking-[0.2em] text-[#e5c17c]">
            {isDaoist ? "道教仙境 · 专属场景" : "佛教梵境 · 专属场景"}
          </p>
          <p className="mt-1 font-serif-display text-2xl font-bold text-[#fff8eb]">
            {displayed.scene.sceneName}
          </p>
          <p className="mt-1.5 max-w-sm text-xs text-[#fff8eb]/75">
            {displayed.scene.subtitle}
          </p>
        </div>
      ) : (
        <img
          key={`${displayed.key}-${useSecondarySrc ? "bg" : "main"}`}
          src={activeSrc}
          alt={`${displayed.scene.sceneName} - ${displayed.scene.subtitle}`}
          referrerPolicy="no-referrer"
          onLoad={() => {
            if (isFadingIn) setIsFadingIn(false);
          }}
          onError={handleImageError}
          className={`${className} transition-opacity duration-300 ${
            isFadingIn ? "opacity-85" : "opacity-100"
          }`}
        />
      )}
    </div>
  );
}
