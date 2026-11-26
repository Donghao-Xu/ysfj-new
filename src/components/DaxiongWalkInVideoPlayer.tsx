import { Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * 大雄宝殿独立连续步入视频播放器（V2.2.1）：
 * - 严格基于原生 HTML5 <video> 连续播放，零多图叠加、零缩放拉伸、零柱子重影。
 * - 独立 16:9 画面适配容器，保持建筑真实透视比例（桌面与移动端均不裁切不变形）。
 * - 播放期间仅保留极简「暂停 / 继续」与「退出」控制，结束后自动进入殿内静态礼敬模式。
 */
export function DaxiongWalkInVideoPlayer({
  videoSrc,
  webmSrc,
  posterSrc,
  isTestPlaceholder = false,
  mutedByDefault = true,
  onComplete,
  onExit,
}: {
  videoSrc: string;
  webmSrc?: string | null;
  posterSrc?: string;
  isTestPlaceholder?: boolean;
  mutedByDefault?: boolean;
  onComplete: () => void;
  onExit: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [paused, setPaused] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    completedRef.current = false;
    setLoadError(false);
    setAutoplayBlocked(false);
    setProgress(0);
    video.currentTime = 0;

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        setAutoplayBlocked(true);
        setPaused(true);
      });
    }
  }, [videoSrc, webmSrc]);

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video || loadError) return;

    if (video.paused) {
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          setAutoplayBlocked(true);
        });
      }
      setAutoplayBlocked(false);
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
      return;
    }
    setProgress(Math.min(1, Math.max(0, video.currentTime / video.duration)));
  };

  const handleEnded = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setProgress(1);
    onCompleteRef.current();
  };

  return (
    <div className="relative aspect-[16/9] w-full select-none overflow-hidden bg-[#160f0c]">
      {loadError ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-[#f5ece0]">
          <p className="text-sm font-medium text-[#e5c17c]">
            步入视频暂无法加载
          </p>
          <p className="max-w-md text-xs text-[#d8cab8]">
            为保证空间画面真实准确，已停用静态图替代拉伸动画。您可以直接进入殿内静态礼敬模式。
          </p>
          <div className="mt-1 flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleEnded}
              className="min-h-[38px] rounded-lg bg-[#b88b44] px-4 py-1.5 text-xs font-semibold text-[#1f1612] hover:opacity-95 cursor-pointer"
            >
              直接进入大殿
            </button>
            <button
              type="button"
              onClick={onExit}
              className="min-h-[38px] rounded-lg border border-white/20 bg-[#1a110e] px-4 py-1.5 text-xs text-[#f5ece0] hover:bg-[#2a1b16] cursor-pointer"
            >
              返回院落
            </button>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          playsInline
          muted={mutedByDefault}
          preload="auto"
          poster={isTestPlaceholder ? undefined : posterSrc}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={() => {
            setPaused(false);
            setAutoplayBlocked(false);
          }}
          onPause={() => setPaused(true)}
          onError={() => setLoadError(true)}
          className="block h-full w-full object-cover object-center"
        >
          {webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* 若为测试占位资源，在左上角保持清晰、克制的单行标识 */}
      {isTestPlaceholder && !loadError && (
        <div className="pointer-events-none absolute top-3 left-3 z-20">
          <span className="rounded-md bg-[#140d0a]/75 px-2.5 py-1 text-[11px] tracking-wide text-[#e5c17c]">
            测试占位视频 · 仅用于验证播放器与入殿衔接
          </span>
        </div>
      )}

      {/* 移动端若阻止自动播放，提供单一点按启动按钮 */}
      {autoplayBlocked && !loadError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#e5c17c]/60 bg-[#1a110e]/85 px-5 py-2 text-xs font-semibold text-[#fff8eb] hover:bg-[#2a1b16] cursor-pointer"
          >
            <Play size={14} />
            <span>点击播放步入视频</span>
          </button>
        </div>
      )}

      {/* 极简播放控制：仅保留「暂停 / 继续」与「退出」 */}
      {!loadError && (
        <div className="absolute right-3 bottom-3.5 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/20 bg-[#140d0a]/78 px-3.5 text-xs font-medium text-[#fff8eb] backdrop-blur-xs transition-colors hover:bg-[#2a1b16]/90 cursor-pointer"
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
            <span>{paused ? "继续" : "暂停"}</span>
          </button>
          <button
            type="button"
            onClick={onExit}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/20 bg-[#140d0a]/78 px-3.5 text-xs font-medium text-[#fff8eb] backdrop-blur-xs transition-colors hover:bg-[#2a1b16]/90 cursor-pointer"
          >
            <X size={13} />
            <span>退出</span>
          </button>
        </div>
      )}

      {/* 底部 2px 极细视频进度条 */}
      {!loadError && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[2px] bg-white/15">
          <div
            className="h-full bg-[#e5c17c]/85 transition-[width] duration-100"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
