import {
  AlertCircle,
  BookOpen,
  Check,
  ChevronRight,
  Edit2,
  ShieldCheck,
  Sun,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { useAppState } from "@/context/AppContext";

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
    visitedBuildings,
    favoriteScriptures,
    joinedGatherings,
    updateDisplayName,
    resendVerificationEmail,
    refreshAuthUser,
    signOut,
  } = useAppState();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const isSignedIn = Boolean(authUser);
  const displayName =
    profile?.displayName ||
    authUser?.displayName ||
    authUser?.email?.split("@")[0] ||
    "云游访客";

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    await updateDisplayName(nameInput);
    setEditingName(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f0e5] pb-24">
      <main className="mx-auto max-w-[520px] px-[22px] pt-6">
        <OfflineIndicator />

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-[1.6px] text-[#c59a53]">
            个人空间 · 云游记
          </span>
          <div className="flex h-[37px] w-[37px] items-center justify-center rounded-[13px] bg-[#eadfc9]">
            <User size={17} className="text-[#c59a53]" />
          </div>
        </div>

        <h1 className="mt-[15px] text-[31px] font-bold text-[#39251d]">我的</h1>

        {/* Profile Card */}
        <section className="mt-[22px] rounded-[18px] bg-[#922e25] p-4">
          <div className="flex items-center">
            <div className="mr-[13px] flex h-[53px] w-[53px] shrink-0 items-center justify-center rounded-full bg-[#fff8eb]/15">
              {isSignedIn ? (
                <UserCheck size={25} className="text-[#fff8eb]" />
              ) : (
                <User size={25} className="text-[#fff8eb]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[17px] font-bold text-[#fff8eb]">
                  {!authReady ? "正在读取账号…" : displayName}
                </p>
                {isSignedIn && isEmailVerified && (
                  <button
                    type="button"
                    aria-label="修改昵称"
                    onClick={() => {
                      setNameInput(displayName);
                      setEditingName((v) => !v);
                    }}
                    className="rounded-full p-1 text-[#fff8eb]/75 hover:text-[#fff8eb] cursor-pointer"
                  >
                    <Edit2 size={12} />
                  </button>
                )}
              </div>
              <p className="mt-1 truncate text-[10px] text-[#fff8eb]/78">
                {!authReady
                  ? "请稍候"
                  : authUser
                    ? `${authUser.email}${isAdmin ? " · 管理员" : ""}`
                    : "登录后，多设备云端同步您的静心与足迹"}
              </p>
            </div>
            {authReady &&
              (isSignedIn ? (
                <button
                  type="button"
                  aria-label="退出登录"
                  onClick={() => void signOut()}
                  className="rounded-[15px] bg-[#c59a53] px-2.5 py-1.5 text-[10px] font-bold text-[#39251d] transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
                >
                  退出
                </button>
              ) : (
                <button
                  type="button"
                  aria-label="登录或注册统一账号"
                  onClick={() => navigate("/sign-in")}
                  className="rounded-[15px] bg-[#c59a53] px-2.5 py-1.5 text-[10px] font-bold text-[#39251d] transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
                >
                  登录
                </button>
              ))}
          </div>

          {editingName && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                maxLength={80}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="输入新昵称"
                className="flex-1 rounded-[10px] bg-[#fffaf1] px-3 py-1.5 text-[12px] text-[#39251d] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="inline-flex items-center gap-1 rounded-[10px] bg-[#c59a53] px-3 py-1.5 text-[11px] font-bold text-[#39251d] cursor-pointer"
              >
                <Check size={13} />
                <span>保存</span>
              </button>
            </div>
          )}
        </section>

        {/* Unverified Email Warning */}
        {isSignedIn && !isEmailVerified && (
          <div className="mt-3 rounded-[14px] border border-[#c59a53] bg-[#eadfc9] p-3.5 text-[11px] text-[#39251d]">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#922e25]" />
              <div className="flex-1">
                <p className="font-bold">邮箱尚未验证</p>
                <p className="mt-0.5 leading-4 text-[#563b2c]">
                  请查收验证邮件并点击链接，完成后即可开启云端多设备同步。
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
                    className="rounded-[12px] bg-[#922e25] px-2.5 py-1 text-[10px] font-bold text-[#fff8eb] cursor-pointer"
                  >
                    刷新验证状态
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await resendVerificationEmail();
                      setStatusMsg("验证邮件已重发。");
                    }}
                    className="rounded-[12px] bg-[#fffaf1] px-2.5 py-1 text-[10px] font-semibold text-[#563b2c] cursor-pointer"
                  >
                    重发邮件
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Synced Progress Summary */}
        <section className="mt-4 grid grid-cols-4 gap-2">
          <div className="rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] p-2.5 text-center">
            <p className="text-[15px] font-bold text-[#922e25]">
              {totalChantingMinutes}
            </p>
            <p className="mt-0.5 text-[10px] text-[#857362]">静心分钟</p>
          </div>
          <div className="rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] p-2.5 text-center">
            <p className="text-[15px] font-bold text-[#39251d]">
              {chantingSessionsCount}
            </p>
            <p className="mt-0.5 text-[10px] text-[#857362]">诵经次数</p>
          </div>
          <div className="rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] p-2.5 text-center">
            <p className="text-[15px] font-bold text-[#39251d]">
              {visitedBuildings.length}
            </p>
            <p className="mt-0.5 text-[10px] text-[#857362]">建筑足迹</p>
          </div>
          <div className="rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] p-2.5 text-center">
            <p className="text-[15px] font-bold text-[#39251d]">
              {favoriteScriptures.length + joinedGatherings.length}
            </p>
            <p className="mt-0.5 text-[10px] text-[#857362]">收藏/共修</p>
          </div>
        </section>

        {/* Owner-Only Admin Entry */}
        {isAdmin && (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="flex w-full items-center rounded-[14px] border border-[#c59a53] bg-[#eadfc9] p-[14px] text-left transition-opacity hover:opacity-90 cursor-pointer"
            >
              <div className="mr-3 flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[13px] bg-[#922e25]">
                <ShieldCheck size={19} className="text-[#c59a53]" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-[#39251d]">
                  管理员内容发布后台
                </p>
                <p className="mt-0.5 text-[10px] text-[#563b2c]">
                  管理园区建筑、发布经典全文与共修活动（仅本人可见）
                </p>
              </div>
              <ChevronRight size={18} className="text-[#922e25]" />
            </button>
          </div>
        )}

        {/* PWA Install Prompt */}
        <div className="mt-4">
          <PWAInstallButton />
        </div>

        <h2 className="mt-6 mb-[11px] text-[15px] font-bold text-[#39251d]">
          继续你的文化旅程
        </h2>

        <div className="space-y-[9px]">
          <button
            type="button"
            onClick={() => navigate("/classics")}
            className="flex w-full items-center rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] p-[13px] text-left transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
          >
            <div className="mr-[11px] flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[13px] bg-[#eadfc9]">
              <BookOpen size={17} className="text-[#922e25]" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[#39251d]">经典阅读</p>
              <p className="mt-1 text-[10px] text-[#857362]">
                回到典籍，继续静心品读
              </p>
            </div>
            <ChevronRight size={18} className="text-[#857362]" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/community")}
            className="flex w-full items-center rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] p-[13px] text-left transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
          >
            <div className="mr-[11px] flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[13px] bg-[#eadfc9]">
              <Users size={17} className="text-[#922e25]" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[#39251d]">共修安排</p>
              <p className="mt-1 text-[10px] text-[#857362]">
                查看适合自己的共修时刻
              </p>
            </div>
            <ChevronRight size={18} className="text-[#857362]" />
          </button>
        </div>

        {/* About Card */}
        <section className="mt-[17px] flex flex-col items-center rounded-[15px] bg-[#eadfc9] p-[19px] text-center">
          <div className="flex h-[39px] w-[39px] items-center justify-center rounded-[14px] bg-[#fffaf1]">
            <Sun size={18} className="text-[#c59a53]" />
          </div>
          <h3 className="mt-[9px] text-[15px] font-bold text-[#39251d]">
            云上梵境
          </h3>
          <p className="mt-[5px] text-[11px] leading-[18px] text-[#563b2c]">
            面向全球用户的中国传统宗教文化与古建筑探索空间。
          </p>
          <p className="mt-2.5 text-[10px] text-[#857362]">
            {isSignedIn && isEmailVerified
              ? "云端账号已连接 · 数据实时同步"
              : "支持离线安装到手机桌面"}
          </p>
        </section>

        <p className="mt-[17px] text-center text-[10px] text-[#857362]">
          心怀敬意，亲近传统。
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
