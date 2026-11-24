import {
  Bell,
  Clock,
  FileAudio,
  Music,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Sun,
  Volume2,
  VolumeX,
  Wind,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useLocation } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useAppState } from "@/context/AppContext";
import { playSingingBowlChime, playWoodenFishSound } from "@/lib/audio";

type SessionLength = 3 | 5 | 10;
const sessionLengths: SessionLength[] = [3, 5, 10];

export function ChantingPage() {
  const location = useLocation();
  const initialScriptureId = (
    location.state as { scriptureId?: string } | null
  )?.scriptureId;

  const {
    scriptures,
    chantingTracks,
    totalChantingMinutes,
    chantingSessionsCount,
    chantingLogs,
    recordChantingSession,
  } = useAppState();

  const [selectedScriptureId, setSelectedScriptureId] = useState<string>(
    initialScriptureId || scriptures[0]?.id || "heart",
  );
  const [length, setLength] = useState<SessionLength>(5);
  const [secondsLeft, setSecondsLeft] = useState<number>(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [woodfishCount, setWoodfishCount] = useState(0);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string>("");
  const [activeAudioTitle, setActiveAudioTitle] = useState<string>("");
  const [loopAudio, setLoopAudio] = useState(true);
  const localObjectUrlRef = useRef<string | null>(null);
  const recordedRef = useRef(false);

  const activeScripture =
    scriptures.find((s) => s.id === selectedScriptureId) || scriptures[0];

  useEffect(() => {
    return () => {
      if (localObjectUrlRef.current) {
        URL.revokeObjectURL(localObjectUrlRef.current);
      }
    };
  }, []);

  const handleSelectLocalAudio = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (localObjectUrlRef.current) {
      URL.revokeObjectURL(localObjectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    localObjectUrlRef.current = url;
    setActiveAudioUrl(url);
    setActiveAudioTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft === 0 && !recordedRef.current) {
      recordedRef.current = true;
      setIsRunning(false);
      if (soundEnabled) playSingingBowlChime();
      void recordChantingSession(
        length,
        activeScripture?.id || "heart",
        activeScripture?.title || "静心诵读",
      );
    }
  }, [
    secondsLeft,
    length,
    activeScripture,
    soundEnabled,
    recordChantingSession,
  ]);

  const chooseLength = (minutes: SessionLength) => {
    if (isRunning) return;
    recordedRef.current = false;
    setLength(minutes);
    setSecondsLeft(minutes * 60);
  };

  const toggleSession = () => {
    if (secondsLeft === 0) {
      recordedRef.current = false;
      setSecondsLeft(length * 60);
    }
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    if (nextRunning && soundEnabled) {
      playSingingBowlChime();
    }
  };

  const resetSession = () => {
    recordedRef.current = false;
    setIsRunning(false);
    setSecondsLeft(length * 60);
  };

  const tapWoodfish = () => {
    setWoodfishCount((c) => c + 1);
    if (soundEnabled) playWoodenFishSound();
  };

  const displayTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(
    secondsLeft % 60,
  ).padStart(2, "0")}`;
  const progress = ((length * 60 - secondsLeft) / (length * 60)) * 100;

  return (
    <div className="min-h-screen bg-[#f6f0e5] pb-24">
      <main className="mx-auto max-w-[520px] px-[22px] pt-6">
        <OfflineIndicator />

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-[1.6px] text-[#c59a53]">
            静心 · 诵读 · 共鸣
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={soundEnabled ? "关闭提示音" : "开启提示音"}
              onClick={() => setSoundEnabled((s) => !s)}
              className="flex h-[37px] w-[37px] items-center justify-center rounded-[13px] bg-[#eadfc9] text-[#563b2c] cursor-pointer"
            >
              {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <div className="flex h-[37px] w-[37px] items-center justify-center rounded-[13px] bg-[#eadfc9]">
              <Music size={17} className="text-[#c59a53]" />
            </div>
          </div>
        </div>

        <h1 className="mt-[15px] text-[31px] font-bold text-[#39251d]">诵经</h1>
        <p className="mt-1.5 text-[13px] leading-[21px] text-[#857362]">
          为自己留一段安静的时间，专注当下这一刻。
        </p>

        {/* Stats Strip */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-[14px] border border-[#e4d8c3] bg-[#fffaf1] px-3.5 py-2.5">
            <p className="text-[10px] text-[#857362]">累计静心时长</p>
            <p className="mt-0.5 text-[16px] font-bold text-[#39251d]">
              {totalChantingMinutes} 分钟
            </p>
          </div>
          <div className="rounded-[14px] border border-[#e4d8c3] bg-[#fffaf1] px-3.5 py-2.5">
            <p className="text-[10px] text-[#857362]">已完成次数</p>
            <p className="mt-0.5 text-[16px] font-bold text-[#922e25]">
              {chantingSessionsCount} 次
            </p>
          </div>
        </div>

        {/* Scripture Selector */}
        {scriptures.length > 0 && (
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
            {scriptures.map((s) => {
              const active = s.id === activeScripture?.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={isRunning}
                  onClick={() => setSelectedScriptureId(s.id)}
                  className={`shrink-0 rounded-[18px] px-3 py-1.5 text-[11px] font-semibold transition-opacity cursor-pointer disabled:opacity-60 ${
                    active
                      ? "bg-[#922e25] text-[#fff8eb]"
                      : "border border-[#e4d8c3] bg-[#fffaf1] text-[#563b2c]"
                  }`}
                >
                  {s.title}
                </button>
              );
            })}
          </div>
        )}

        {/* Practice Timer Panel */}
        <section className="mt-4 flex flex-col items-center rounded-[24px] border border-[#e4d8c3] bg-[#fffaf1] p-[22px]">
          <div className="relative mb-[13px] flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#eadfc9]">
            <Wind size={23} className="text-[#c59a53]" />
            <div className="pointer-events-none absolute inset-0 rounded-full border border-[#c59a53]/65" />
            <div className="pointer-events-none absolute inset-[7px] rounded-full border border-[#c59a53]/45" />
          </div>

          <p className="text-[11px] tracking-[1px] text-[#857362]">
            静心计时 · {activeScripture?.title || "自在观心"}
          </p>
          <p
            aria-live="polite"
            className="mt-[5px] text-[47px] leading-none font-semibold tracking-[2px] text-[#39251d] tabular-nums"
          >
            {displayTime}
          </p>
          <p className="mt-[5px] text-[12px] text-[#857362]">
            {secondsLeft === 0
              ? "本次静心已圆满并记录"
              : isRunning
                ? "慢下来，安住当下"
                : "选择时长，开始一段清宁"}
          </p>

          {activeScripture && (
            <p className="mt-3 rounded-[12px] bg-[#f6f0e5] px-3 py-2 text-center text-[12px] leading-5 font-medium text-[#922e25]">
              “{activeScripture.excerpt}”
            </p>
          )}

          {/* Duration Selector */}
          <div className="mt-5 mb-[18px] flex gap-[9px]">
            {sessionLengths.map((minutes) => {
              const selected = length === minutes;
              return (
                <button
                  key={minutes}
                  type="button"
                  disabled={isRunning}
                  aria-pressed={selected}
                  onClick={() => chooseLength(minutes)}
                  className={`rounded-[20px] px-[14px] py-[9px] text-[11px] font-semibold transition-opacity cursor-pointer disabled:cursor-not-allowed ${
                    selected
                      ? "bg-[#922e25] text-[#fff8eb]"
                      : "bg-[#eadfc9] text-[#563b2c]"
                  }`}
                >
                  {minutes} 分钟
                </button>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="h-[3px] w-full overflow-hidden rounded-[2px] bg-[#eee6d8]">
            <div
              className="h-full bg-[#c59a53] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="mt-5 flex items-center gap-[11px]">
            <button
              type="button"
              aria-label={isRunning ? "暂停静心计时" : "开始静心计时"}
              onClick={toggleSession}
              className="flex min-h-[46px] min-w-[140px] items-center justify-center gap-2 rounded-[25px] bg-[#922e25] px-5 text-[13px] font-bold text-[#fff8eb] transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
            >
              {isRunning ? <Pause size={17} /> : <Play size={17} />}
              <span>
                {isRunning
                  ? "暂停"
                  : secondsLeft === 0
                    ? "再来一次"
                    : "开始静心"}
              </span>
            </button>
            <button
              type="button"
              aria-label="轻叩木鱼"
              onClick={tapWoodfish}
              className="flex h-[46px] items-center gap-1.5 rounded-[23px] bg-[#c59a53] px-4 text-[12px] font-bold text-[#39251d] transition-transform active:scale-95 cursor-pointer"
            >
              <Bell size={15} />
              <span>木鱼 {woodfishCount > 0 ? `· ${woodfishCount}` : ""}</span>
            </button>
            <button
              type="button"
              aria-label="重置静心计时"
              onClick={resetSession}
              className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#eadfc9] text-[#563b2c] transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </section>

        {/* Chanting Audio Player (Cloud + Local Audio) */}
        <section className="mt-4 rounded-[18px] border border-[#e4d8c3] bg-[#fffaf1] p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileAudio size={16} className="text-[#922e25]" />
              <h2 className="text-[13px] font-bold text-[#39251d]">
                诵经伴音播放
              </h2>
            </div>
            <label className="rounded-[14px] bg-[#eadfc9] px-3 py-1.5 text-[11px] font-bold text-[#922e25] cursor-pointer hover:opacity-90">
              <span>本地音频试听</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleSelectLocalAudio}
                className="hidden"
              />
            </label>
          </div>

          {chantingTracks.length > 0 && (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {chantingTracks.map((track) => {
                const selected = activeAudioUrl === track.audioUrl;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => {
                      setActiveAudioUrl(track.audioUrl);
                      setActiveAudioTitle(track.title);
                    }}
                    className={`shrink-0 rounded-[14px] px-3 py-1.5 text-[11px] font-semibold cursor-pointer ${
                      selected
                        ? "bg-[#922e25] text-[#fff8eb]"
                        : "border border-[#e4d8c3] bg-[#f6f0e5] text-[#563b2c]"
                    }`}
                  >
                    {track.title} · {track.durationLabel}
                  </button>
                );
              })}
            </div>
          )}

          {activeAudioUrl ? (
            <div className="mt-3 space-y-2 rounded-[12px] bg-[#f6f0e5] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[12px] font-semibold text-[#39251d]">
                  正在加载：{activeAudioTitle}
                </p>
                <button
                  type="button"
                  onClick={() => setLoopAudio((v) => !v)}
                  className={`inline-flex items-center gap-1 rounded-[10px] px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                    loopAudio
                      ? "bg-[#922e25] text-[#fff8eb]"
                      : "bg-[#eadfc9] text-[#563b2c]"
                  }`}
                >
                  <Repeat size={11} />
                  <span>{loopAudio ? "单曲循环" : "播放一次"}</span>
                </button>
              </div>
              <audio
                key={activeAudioUrl}
                controls
                loop={loopAudio}
                muted={!soundEnabled}
                src={activeAudioUrl}
                className="h-9 w-full"
              />
            </div>
          ) : (
            <p className="mt-2.5 text-[11px] leading-5 text-[#857362]">
              {chantingTracks.length > 0
                ? "点击上方云端曲目即可播放，或选择手机/电脑里的本地 MP3 伴音静心。"
                : "可直接点击右上角「本地音频试听」选取手机或电脑中的 MP3 / M4A 诵经音频陪练。"}
            </p>
          )}
        </section>

        {/* Guidance Card */}
        <div className="mt-4 flex items-center gap-[13px] rounded-[12px] bg-[#eadfc9] p-[15px]">
          <Sun size={18} className="shrink-0 text-[#c59a53]" />
          <div className="flex-1">
            <p className="text-[13px] font-bold text-[#39251d]">
              一呼一吸，回到此刻
            </p>
            <p className="mt-1 text-[11px] text-[#857362]">
              可开启提示音伴随清磬起止，或轻叩木鱼保持诵读节拍。
            </p>
          </div>
        </div>

        {/* Recent Logs */}
        {chantingLogs.length > 0 && (
          <section className="mt-5">
            <h2 className="mb-2.5 flex items-center gap-1.5 text-[14px] font-bold text-[#39251d]">
              <Clock size={15} className="text-[#c59a53]" />
              <span>近期静心记录</span>
            </h2>
            <div className="space-y-2">
              {chantingLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] px-3.5 py-2.5 text-[12px]"
                >
                  <span className="font-semibold text-[#39251d]">
                    {log.scriptureTitle}
                  </span>
                  <span className="text-[11px] text-[#857362]">
                    {log.minutes} 分钟 ·{" "}
                    {new Date(log.createdAtMs).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
