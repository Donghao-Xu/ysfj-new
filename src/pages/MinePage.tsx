import {
  AlertCircle,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Edit2,
  Heart,
  Lock,
  Moon,
  ShieldCheck,
  Sun,
  Trash2,
  User,
  UserCheck,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { useAppState } from "@/context/AppContext";

type MineTab = "favorites" | "reading" | "meditation" | "wishes" | "settings";

export function MinePage() {
  const navigate = useNavigate();
  const {
    authUser,
    authReady,
    isEmailVerified,
    isAdmin,
    profile,
    totalChantingMinutes,
    chantingSessionsCount,
    chantingLogs,
    visitedBuildings,
    favoriteScriptures,
    scriptures,
    readingProgress,
    wishes,
    woodfishTotal,
    pilgrimageVisited,
    settings,
    updateDisplayName,
    resendVerificationEmail,
    refreshAuthUser,
    signOut,
    deletePersonalWish,
    updateSettings,
  } = useAppState();

  const [tab, setTab] = useState<MineTab>("favorites");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const isSignedIn = Boolean(authUser);
  const displayName =
    profile?.displayName ||
    authUser?.displayName ||
    authUser?.email?.split("@")[0] ||
    "云游访客";

  const favoriteItems = scriptures.filter((s) =>
    favoriteScriptures.includes(s.id),
  );
  const readItems = scriptures.filter((s) => (readingProgress[s.id] || 0) > 0);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    await updateDisplayName(nameInput);
    setEditingName(false);
  };

  return (
    <AppShell>
      {/* Profile & Summary Banner */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-2xl bg-[#922e25] p-6 text-[#fff8eb] lg:col-span-5 dark:bg-[#70221b]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#fff8eb]/15">
              {isSignedIn ? <UserCheck size={26} /> : <User size={26} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate font-serif-display text-xl font-bold">
                  {!authReady ? "正在读取账号…" : displayName}
                </h1>
                {isSignedIn && isEmailVerified && (
                  <button
                    type="button"
                    aria-label="修改昵称"
                    onClick={() => {
                      setNameInput(displayName);
                      setEditingName((v) => !v);
                    }}
                    className="rounded-full p-1 text-[#fff8eb]/80 hover:text-[#fff8eb] cursor-pointer"
                  >
                    <Edit2 size={13} />
                  </button>
                )}
              </div>
              <p className="mt-1 truncate text-xs text-[#fff8eb]/80">
                {!authReady
                  ? "请稍候"
                  : authUser
                    ? `${authUser.email}${isAdmin ? " · 管理员" : ""}`
                    : "本地数据直接可用，无需强制注册；登录后可多设备同步"}
              </p>
            </div>
            {authReady &&
              (isSignedIn ? (
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="min-h-[38px] shrink-0 rounded-xl bg-[#b88b44] px-3.5 py-1.5 text-xs font-bold text-[#1f1612] hover:opacity-90 cursor-pointer"
                >
                  退出
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/sign-in")}
                  className="min-h-[38px] shrink-0 rounded-xl bg-[#b88b44] px-3.5 py-1.5 text-xs font-bold text-[#1f1612] hover:opacity-90 cursor-pointer"
                >
                  登录 / 注册
                </button>
              ))}
          </div>

          {editingName && (
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                maxLength={80}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="输入新昵称"
                className="min-h-[40px] flex-1 rounded-xl bg-[#fffaf1] px-3 text-xs text-[#2c221e] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="inline-flex min-h-[40px] items-center gap-1 rounded-xl bg-[#b88b44] px-3.5 text-xs font-bold text-[#1f1612] cursor-pointer"
              >
                <Check size={13} />
                <span>保存</span>
              </button>
            </div>
          )}

          {isSignedIn && !isEmailVerified && (
            <div className="mt-4 rounded-xl bg-[#fffaf1] p-3 text-xs text-[#2c221e]">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#922e25]" />
                <div className="flex-1">
                  <p className="font-bold">邮箱尚未验证</p>
                  <p className="mt-0.5 text-[11px] text-[#6e5d4f]">
                    请点击邮件中的验证链接以开启多设备同步。
                  </p>
                  {statusMsg && (
                    <p className="mt-1 font-medium text-[#922e25]">{statusMsg}</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await refreshAuthUser();
                        setStatusMsg(
                          ok ? "邮箱已验证！" : "尚未检测到验证，请先点击邮件链接。",
                        );
                      }}
                      className="rounded-lg bg-[#922e25] px-2.5 py-1 text-[11px] font-bold text-[#fff8eb] cursor-pointer"
                    >
                      刷新状态
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await resendVerificationEmail();
                        setStatusMsg("验证邮件已重发。");
                      }}
                      className="rounded-lg bg-[#ebe2d2] px-2.5 py-1 text-[11px] font-semibold text-[#4c362a] cursor-pointer"
                    >
                      重发邮件
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Stats Strip */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-7">
          <div className="flex flex-col justify-center rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-4 dark:border-[#332922] dark:bg-[#1d1815]">
            <p className="text-xs text-[#6e5d4f] dark:text-[#b2a18f]">静心时长</p>
            <p className="mt-1 font-serif-display text-2xl font-bold text-[#922e25] tabular-nums dark:text-[#d4a85d]">
              {totalChantingMinutes} 分钟
            </p>
            <p className="mt-1 text-[11px] text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
              {chantingSessionsCount} 次静坐 · 木鱼 {woodfishTotal}
            </p>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-4 dark:border-[#332922] dark:bg-[#1d1815]">
            <p className="text-xs text-[#6e5d4f] dark:text-[#b2a18f]">收藏与阅读</p>
            <p className="mt-1 font-serif-display text-2xl font-bold text-[#2c221e] tabular-nums dark:text-[#efe7da]">
              {favoriteItems.length} 部
            </p>
            <p className="mt-1 text-[11px] text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
              已阅读 {readItems.length} 部典籍
            </p>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-4 dark:border-[#332922] dark:bg-[#1d1815]">
            <p className="text-xs text-[#6e5d4f] dark:text-[#b2a18f]">寻访足迹</p>
            <p className="mt-1 font-serif-display text-2xl font-bold text-[#1f4e45] tabular-nums dark:text-[#86bfb0]">
              {visitedBuildings.length + pilgrimageVisited.length} 处
            </p>
            <p className="mt-1 text-[11px] text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
              殿宇 {visitedBuildings.length} · 朝圣 {pilgrimageVisited.length}
            </p>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-4 dark:border-[#332922] dark:bg-[#1d1815]">
            <p className="text-xs text-[#6e5d4f] dark:text-[#b2a18f]">私人祈愿</p>
            <p className="mt-1 font-serif-display text-2xl font-bold text-[#2c221e] tabular-nums dark:text-[#efe7da]">
              {wishes.length} 条
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-[#6e5d4f] dark:text-[#b2a18f]">
              <Lock size={11} />
              <span>仅自己可见</span>
            </p>
          </div>
        </section>
      </div>

      {/* Owner-Only Admin Console Card */}
      {isAdmin && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="flex w-full items-center justify-between rounded-2xl border border-[#b88b44] bg-[#ebe2d2] p-4 text-left transition-opacity hover:opacity-90 cursor-pointer dark:border-[#d4a85d]/50 dark:bg-[#2a221d]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#922e25] text-[#e5c17c]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#2c221e] dark:text-[#efe7da]">
                  管理员内容发布后台
                </p>
                <p className="mt-0.5 text-xs text-[#4c362a] dark:text-[#dccbb6]">
                  管理建筑、导入经书 (.txt/.md/.pdf)、发布音频与共修（仅管理员本人可见）
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#922e25] dark:text-[#d4a85d]" />
          </button>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="no-scrollbar mt-6 flex gap-1.5 overflow-x-auto rounded-xl bg-[#ebe2d2] p-1 dark:bg-[#2a221d]">
        {[
          { id: "favorites" as const, label: "我的收藏" },
          { id: "reading" as const, label: "阅读记录" },
          { id: "meditation" as const, label: "静心记录" },
          { id: "wishes" as const, label: "祈愿记录" },
          { id: "settings" as const, label: "设置与隐私" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-[42px] flex-1 shrink-0 rounded-lg px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              tab === item.id
                ? "bg-[#922e25] text-[#fff8eb]"
                : "text-[#4c362a] hover:text-[#2c221e] dark:text-[#dccbb6]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-5">
        {tab === "favorites" && (
          <section className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-6 dark:border-[#332922] dark:bg-[#1d1815]">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#2c221e] dark:text-[#efe7da]">
              <Heart size={16} className="text-[#922e25]" />
              <span>收藏的经典（{favoriteItems.length}）</span>
            </h2>
            {favoriteItems.length === 0 ? (
              <div className="mt-4 text-center text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                <p>还没有收藏任何经典。</p>
                <button
                  type="button"
                  onClick={() => navigate("/classics")}
                  className="mt-3 rounded-xl bg-[#ebe2d2] px-4 py-2 font-semibold text-[#2c221e] cursor-pointer dark:bg-[#2a221d] dark:text-[#efe7da]"
                >
                  去经典图书馆看看
                </button>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {favoriteItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/classics?tradition=${
                          item.parkSlug === "daoist" ? "daoist" : "buddhist"
                        }`,
                      )
                    }
                    className="flex items-center justify-between rounded-xl border border-[#e2d7c5] bg-[#f6f1e7] p-4 text-left hover:bg-[#ebe2d2] cursor-pointer dark:border-[#332922] dark:bg-[#241d19]"
                  >
                    <div>
                      <p className="text-[11px] text-[#b88b44]">{item.tradition}</p>
                      <p className="mt-0.5 font-serif-display text-sm font-bold text-[#2c221e] dark:text-[#efe7da]">
                        {item.title}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-[#6e5d4f]" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "reading" && (
          <section className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-6 dark:border-[#332922] dark:bg-[#1d1815]">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#2c221e] dark:text-[#efe7da]">
              <BookOpen size={16} className="text-[#b88b44]" />
              <span>我的阅读记录（{readItems.length}）</span>
            </h2>
            {readItems.length === 0 ? (
              <p className="mt-4 text-center text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                打开经典全文阅读后，系统会自动记录您的阅读进度。
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {readItems.map((item) => {
                  const pct = readingProgress[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl bg-[#f6f1e7] p-4 dark:bg-[#241d19]"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#2c221e] dark:text-[#efe7da]">
                          {item.title}
                        </span>
                        <span className="text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
                          {pct >= 100 ? "已读完" : `已读 ${pct}%`}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#ebe2d2] dark:bg-[#2a221d]">
                        <div
                          className="h-full bg-[#922e25]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {tab === "meditation" && (
          <section className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-6 dark:border-[#332922] dark:bg-[#1d1815]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-bold text-[#2c221e] dark:text-[#efe7da]">
                <Clock size={16} className="text-[#1f4e45]" />
                <span>静修记录（共 {chantingSessionsCount} 次 · 累计 {totalChantingMinutes} 分钟）</span>
              </h2>
              <button
                type="button"
                onClick={() => navigate("/meditation")}
                className="text-xs font-semibold text-[#922e25] hover:underline cursor-pointer dark:text-[#d4a85d]"
              >
                前往云上静修 →
              </button>
            </div>
            {chantingLogs.length === 0 ? (
              <p className="mt-4 text-center text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                暂无静修记录。前往「静心 / 云上静修」完成静修后，若已开启记录功能将保存于此（仅自己可见）。
              </p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {chantingLogs.map((log) => {
                  const categoryLabel =
                    log.category === "buddhist"
                      ? "佛境静修"
                      : log.category === "daoist"
                        ? "道境静修"
                        : log.category === "nature"
                          ? "自然静修"
                          : "静心诵念";
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[#f6f1e7] px-4 py-3 text-xs dark:bg-[#241d19]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#2c221e] dark:text-[#efe7da]">
                          {log.scriptureTitle}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#6e5d4f] dark:text-[#b2a18f]">
                          {categoryLabel}
                        </p>
                      </div>
                      <span className="shrink-0 text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
                        {log.minutes} 分钟 ·{" "}
                        {new Date(log.createdAtMs).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {tab === "wishes" && (
          <section className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-6 dark:border-[#332922] dark:bg-[#1d1815]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-bold text-[#2c221e] dark:text-[#efe7da]">
                <Lock size={16} className="text-[#922e25]" />
                <span>我的祈愿与清思记录</span>
              </h2>
              <span className="text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                默认仅保存在本地设备，绝不公开
              </span>
            </div>

            {wishes.length === 0 ? (
              <p className="mt-4 text-center text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                您可在「佛教梵境」或「道教仙境」写下私人心愿，仅自己可见。
              </p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {wishes.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-start justify-between gap-3 rounded-xl bg-[#f6f1e7] p-4 dark:bg-[#241d19]"
                  >
                    <div>
                      <p className="text-[11px] text-[#6e5d4f] dark:text-[#b2a18f]">
                        {w.realm === "buddhist"
                          ? "佛教梵境 · 祈愿"
                          : w.realm === "daoist"
                            ? "道教仙境 · 清思"
                            : "静心随笔"}{" "}
                        · {new Date(w.createdAtMs).toLocaleDateString("zh-CN")}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[#2c221e] dark:text-[#efe7da]">
                        {w.text}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="删除此条记录"
                      onClick={() => deletePersonalWish(w.id)}
                      className="rounded-lg p-2 text-[#6e5d4f] hover:bg-[#ebe2d2] hover:text-[#922e25] cursor-pointer dark:text-[#b2a18f]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "settings" && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <section className="space-y-5 rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-6 dark:border-[#332922] dark:bg-[#1d1815]">
              <h2 className="text-base font-bold text-[#2c221e] dark:text-[#efe7da]">
                基础与外观设置
              </h2>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-[#2c221e] dark:text-[#efe7da]">
                    <Volume2 size={15} />
                    <span>默认音量</span>
                  </span>
                  <span className="text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
                    {Math.round(settings.defaultVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={settings.defaultVolume}
                  onChange={(e) =>
                    updateSettings({ defaultVolume: Number(e.target.value) })
                  }
                  className="mt-2 w-full accent-[#922e25] cursor-pointer"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-[#2c221e] dark:text-[#efe7da]">
                  主题色调
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSettings({ themeMode: "light" })}
                    className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      settings.themeMode === "light"
                        ? "bg-[#922e25] text-[#fff8eb]"
                        : "bg-[#ebe2d2] text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]"
                    }`}
                  >
                    <Sun size={15} />
                    <span>宣纸日间</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ themeMode: "dark" })}
                    className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      settings.themeMode === "dark"
                        ? "bg-[#b5453a] text-[#fff8eb]"
                        : "bg-[#ebe2d2] text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]"
                    }`}
                  >
                    <Moon size={15} />
                    <span>静夜深色</span>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#2c221e] dark:text-[#efe7da]">
                  场景动态效果
                </p>
                <p className="mt-0.5 text-[11px] text-[#6e5d4f] dark:text-[#b2a18f]">
                  支持自动响应系统「减少动态效果」设置，手机端已自动优化粒子数量
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "full", label: "完整意境" },
                      { id: "reduced", label: "轻量柔和" },
                      { id: "off", label: "关闭动态" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateSettings({ animationMode: opt.id })}
                      className={`min-h-[40px] rounded-xl text-xs font-semibold cursor-pointer ${
                        (settings.animationMode || "full") === opt.id
                          ? "bg-[#922e25] text-[#fff8eb] dark:bg-[#b5453a]"
                          : "bg-[#ebe2d2] text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[#2c221e] dark:text-[#efe7da]">
                      场景切换方式（V3.0 阶段0）
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#6e5d4f] dark:text-[#b2a18f]">
                      旧版图片透视拉伸步行引擎已停用，现默认使用无变形静态切换；真实 3DGS 漫游原型请前往「空间实验室」
                    </p>
                  </div>
                  <span className="inline-flex min-h-[34px] shrink-0 items-center rounded-xl bg-[#ebe2d2] px-3 text-xs font-semibold text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]">
                    已停用旧算法
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#2c221e] dark:text-[#efe7da]">
                      记录静修历史
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#6e5d4f] dark:text-[#b2a18f]">
                      仅自己可见，绝不作排行或打卡催促；关闭后将不再保存新记录
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateSettings({
                        recordRetreatLogs: !(settings.recordRetreatLogs ?? true),
                      })
                    }
                    className={`min-h-[36px] shrink-0 rounded-xl px-3.5 text-xs font-bold cursor-pointer ${
                      (settings.recordRetreatLogs ?? true)
                        ? "bg-[#1f4e45] text-[#f3f8f5]"
                        : "bg-[#ebe2d2] text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]"
                    }`}
                  >
                    {(settings.recordRetreatLogs ?? true) ? "已开启" : "已关闭"}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#2c221e] dark:text-[#efe7da]">
                  默认静修时长
                </p>
                <div className="mt-2 grid grid-cols-5 gap-1.5">
                  {[5, 10, 15, 20, 30].map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => updateSettings({ defaultRetreatMinutes: min })}
                      className={`min-h-[38px] rounded-xl text-xs font-semibold tabular-nums cursor-pointer ${
                        (settings.defaultRetreatMinutes || 15) === min
                          ? "bg-[#922e25] text-[#fff8eb] dark:bg-[#b5453a]"
                          : "bg-[#ebe2d2] text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]"
                      }`}
                    >
                      {min}分
                    </button>
                  ))}
                </div>
              </div>

              <PWAInstallButton />
            </section>

            <section className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-6 dark:border-[#332922] dark:bg-[#1d1815]">
              <h2 className="text-base font-bold text-[#2c221e] dark:text-[#efe7da]">
                隐私说明与文化原则
              </h2>
              <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-[#4c362a] dark:text-[#dccbb6]">
                <li>
                  • <strong>无需强制注册</strong>：阅读经典、木鱼静心、自然声景、阅读进度与私人祈愿默认均保存在您本地浏览器的 LocalStorage 中，不收集额外隐私。
                </li>
                <li>
                  • <strong>私人祈愿严格保密</strong>：祈愿与清思文字默认仅自己可见，不公开、不设榜单、不做社交曝光。
                </li>
                <li>
                  • <strong>基础功能永久免费</strong>：不贩卖焦虑，不以任何付费形式换取功德、福报或消灾承诺。
                </li>
                <li>
                  • <strong>自愿登录同步</strong>：若您选择登录云端账号，仅同步个人档案、收藏与静坐计时统计，其他用户无权查阅。
                </li>
              </ul>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}
