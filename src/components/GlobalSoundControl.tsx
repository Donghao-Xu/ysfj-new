import {
  Music,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAppState } from "@/context/AppContext";
import {
  RETREAT_MUSIC_LIBRARY,
  SOUND_LAYER_META,
  soundManager,
  type RetreatMusicTrackId,
  type SoundLayerKey,
} from "@/lib/audio";

export function GlobalSoundControl({
  realmTone = "default",
}: {
  realmTone?: "default" | "buddhist" | "daoist";
}) {
  const { settings, updateSettings } = useAppState();
  const [open, setOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState(() =>
    soundManager.getActiveStatus(),
  );

  useEffect(() => {
    return soundManager.subscribe(() => {
      setActiveStatus(soundManager.getActiveStatus());
    });
  }, []);

  const hasActiveAudio =
    Boolean(activeStatus.ambient) ||
    activeStatus.religious !== "none" ||
    activeStatus.music !== "none";

  const accentBg =
    realmTone === "daoist"
      ? "bg-[#1f4e45] text-[#f3f8f5]"
      : "bg-[#922e25] text-[#fff8eb]";

  const toggleLayerEnabled = (key: SoundLayerKey) => {
    const prev = settings.soundLayers[key];
    updateSettings({
      soundLayers: {
        ...settings.soundLayers,
        [key]: { ...prev, enabled: !prev.enabled },
      },
    });
  };

  const setLayerVolume = (key: SoundLayerKey, volume: number) => {
    const prev = settings.soundLayers[key];
    updateSettings({
      soundLayers: {
        ...settings.soundLayers,
        [key]: { ...prev, enabled: volume > 0 ? true : prev.enabled, volume },
      },
    });
  };

  const handleSelectMusicTrack = (trackId: RetreatMusicTrackId) => {
    updateSettings({ musicTrackId: trackId });
    if (trackId === "none") {
      soundManager.stopMusic();
    } else {
      soundManager.startMusic(trackId);
    }
  };

  return (
    <div className="fixed right-4 bottom-20 z-35 flex flex-col items-end gap-2 md:right-6 md:bottom-6">
      {open && (
        <div
          role="dialog"
          aria-label="云上声音系统全局调控"
          className="animate-panel-up w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2]/96 p-4 shadow-2xl backdrop-blur-lg dark:border-[#332922] dark:bg-[#191512]/96"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#e2d7c5] pb-3 dark:border-[#332922]">
            <div>
              <h3 className="font-serif-display text-sm font-bold text-[#2c221e] dark:text-[#efe7da]">
                云上声音系统 · 五层声景调控
              </h3>
              <p className="mt-0.5 text-[11px] text-[#6e5d4f] dark:text-[#b2a18f]">
                {settings.masterMuted
                  ? "已开启全局静音（互动流程不受影响）"
                  : hasActiveAudio
                    ? "多声层平滑融合运行中"
                    : "已就绪 · 进入场景或点击试听开启声景"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="关闭声音面板"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ebe2d2] text-[#4c362a] hover:opacity-85 cursor-pointer dark:bg-[#2a221d] dark:text-[#dccbb6]"
            >
              <X size={15} />
            </button>
          </div>

          {/* Master Mute Row */}
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#f6f1e7] px-3 py-2 dark:bg-[#241d19]">
            <span className="text-xs font-semibold text-[#2c221e] dark:text-[#efe7da]">
              全局声音总控
            </span>
            <button
              type="button"
              onClick={() =>
                updateSettings({ masterMuted: !settings.masterMuted })
              }
              className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-lg px-3 text-xs font-bold cursor-pointer ${
                settings.masterMuted
                  ? "bg-[#922e25] text-[#fff8eb]"
                  : accentBg
              }`}
            >
              {settings.masterMuted ? (
                <VolumeX size={14} />
              ) : (
                <Volume2 size={14} />
              )}
              <span>{settings.masterMuted ? "已静音 · 点击恢复" : "声音开启"}</span>
            </button>
          </div>

          {/* 5 Independent Layers */}
          <div className="mt-3 space-y-2.5">
            {SOUND_LAYER_META.map((layer) => {
              const cfg = settings.soundLayers[layer.key];
              return (
                <div
                  key={layer.key}
                  className="rounded-xl border border-[#e2d7c5]/80 bg-[#f6f1e7]/75 px-3 py-2 dark:border-[#332922] dark:bg-[#241d19]/75"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#2c221e] dark:text-[#efe7da]">
                        {layer.label}
                      </p>
                      <p className="truncate text-[10px] text-[#6e5d4f] dark:text-[#b2a18f]">
                        {layer.shortDesc}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleLayerEnabled(layer.key)}
                      className={`min-h-[26px] shrink-0 rounded-md px-2 text-[11px] font-semibold cursor-pointer ${
                        cfg.enabled
                          ? accentBg
                          : "bg-[#ebe2d2] text-[#6e5d4f] dark:bg-[#2a221d] dark:text-[#b2a18f]"
                      }`}
                    >
                      {cfg.enabled ? "开" : "关"}
                    </button>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={cfg.volume}
                      onChange={(e) =>
                        setLayerVolume(layer.key, Number(e.target.value))
                      }
                      aria-label={`${layer.label}音量`}
                      className="flex-1 accent-[#b88b44] cursor-pointer"
                    />
                    <span className="w-9 text-right text-[11px] text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
                      {Math.round(cfg.volume * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* L3 Built-in Music Track Selector */}
          <div className="mt-3 border-t border-[#e2d7c5] pt-3 dark:border-[#332922]">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-[#2c221e] dark:text-[#efe7da]">
                <Music size={13} className="text-[#b88b44]" />
                <span>L3 静修音乐曲库（原创零版权合成）</span>
              </span>
              {activeStatus.music !== "none" && (
                <button
                  type="button"
                  onClick={() => soundManager.stopMusic()}
                  className="text-[11px] font-semibold text-[#922e25] hover:underline cursor-pointer dark:text-[#e5c17c]"
                >
                  暂停曲目
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
              {RETREAT_MUSIC_LIBRARY.map((track) => {
                const selected = settings.musicTrackId === track.id;
                const playing = activeStatus.music === track.id && track.id !== "none";
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleSelectMusicTrack(track.id)}
                    className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-left text-[11px] transition-colors cursor-pointer ${
                      selected
                        ? "border-[#b88b44] bg-[#ebe2d2] font-semibold text-[#2c221e] dark:bg-[#2a221d] dark:text-[#efe7da]"
                        : "border-[#e2d7c5]/70 bg-[#f6f1e7]/60 text-[#4c362a] hover:bg-[#ebe2d2] dark:border-[#332922] dark:bg-[#241d19]/60 dark:text-[#dccbb6]"
                    }`}
                  >
                    <span className="truncate pr-2">{track.label}</span>
                    <span className="shrink-0 text-[10px] opacity-75">
                      {playing ? "演奏中" : selected ? "已选" : "试听"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Compact Dock Trigger Bar */}
      <div className="flex items-center gap-1.5 rounded-xl border border-[#e2d7c5] bg-[#fcf9f2]/94 p-1 shadow-lg backdrop-blur-md dark:border-[#332922] dark:bg-[#191512]/94">
        <button
          type="button"
          onClick={() =>
            updateSettings({ masterMuted: !settings.masterMuted })
          }
          aria-label={settings.masterMuted ? "取消静音" : "全局静音"}
          title={settings.masterMuted ? "点击开启声音" : "点击一键静音"}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer ${
            settings.masterMuted
              ? "bg-[#922e25] text-[#fff8eb]"
              : hasActiveAudio
                ? accentBg
                : "bg-[#ebe2d2] text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]"
          }`}
        >
          {settings.masterMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#2c221e] hover:bg-[#ebe2d2] cursor-pointer dark:text-[#efe7da] dark:hover:bg-[#2a221d]"
        >
          <SlidersHorizontal size={14} className="text-[#b88b44]" />
          <span className="whitespace-nowrap">云上声境</span>
        </button>
      </div>
    </div>
  );
}
