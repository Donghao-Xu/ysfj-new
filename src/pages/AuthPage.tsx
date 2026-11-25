import { ArrowLeft, ArrowRight, CheckCircle2, Mail, Sun } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/context/AppContext";

type AuthMode = "sign-in" | "sign-up";

function translateFirebaseAuthError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("auth/operation-not-allowed")) {
    return "邮箱密码登录尚未在 Firebase 控制台开启。请先使用下方的「使用 Google 继续」，或前往 Firebase Console -> Authentication -> Sign-in method 启用 Email/Password。";
  }
  if (msg.includes("auth/email-already-in-use")) {
    return "该邮箱已被注册，请直接切换到登录页面。";
  }
  if (
    msg.includes("auth/invalid-credential") ||
    msg.includes("auth/wrong-password") ||
    msg.includes("auth/user-not-found")
  ) {
    return "邮箱或密码不正确，请核对后重试。";
  }
  if (msg.includes("auth/weak-password")) {
    return "密码强度不足，请至少设置 6 位字符。";
  }
  if (msg.includes("auth/invalid-email")) {
    return "电子邮箱格式不正确。";
  }
  if (msg.includes("auth/popup-closed-by-user")) {
    return "您已取消 Google 登录窗口。";
  }
  if (msg.includes("auth/unauthorized-domain")) {
    return "当前预览域名尚未授权 Google 登录弹窗，请在 Firebase Console 授权域名或使用邮箱登录。";
  }
  if (msg.includes("auth/too-many-requests")) {
    return "操作过于频繁，请稍候再试。";
  }
  return "登录认证暂时不可用，请检查网络或账号配置后重试。";
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const {
    authUser,
    isEmailVerified,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resendVerificationEmail,
    refreshAuthUser,
    sendPasswordReset,
  } = useAppState();

  const [displayName, setDisplayName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [info, setInfo] = useState("");
  const [awaitingEmailCheck, setAwaitingEmailCheck] = useState(false);

  const isSignUp = mode === "sign-up";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback("");
    setInfo("");

    if (!emailAddress.includes("@")) {
      setFeedback("请输入有效的电子邮箱地址。");
      return;
    }
    if (password.length < 6) {
      setFeedback("密码长度至少为 6 位。");
      return;
    }

    setBusy(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(emailAddress, password, displayName);
        setAwaitingEmailCheck(true);
        setInfo(
          "账号已创建！我们已向您的邮箱发送验证邮件，请打开邮箱点击验证链接后再点击「我已完成验证」。",
        );
      } else {
        await signInWithEmail(emailAddress, password);
        navigate("/mine");
      }
    } catch (error) {
      setFeedback(translateFirebaseAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setFeedback("");
    setInfo("");
    setBusy(true);
    try {
      await signInWithGoogle();
      navigate("/mine");
    } catch (error) {
      setFeedback(translateFirebaseAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  const handleCheckVerification = async () => {
    setBusy(true);
    setFeedback("");
    try {
      const verified = await refreshAuthUser();
      if (verified) {
        navigate("/mine");
      } else {
        setFeedback("尚未检测到验证完成，请确认已点击邮箱中的验证链接。");
      }
    } catch {
      setFeedback("刷新状态失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!emailAddress.includes("@")) {
      setFeedback("请先在上方输入您的注册邮箱，再点击重置密码。");
      return;
    }
    setBusy(true);
    setFeedback("");
    try {
      await sendPasswordReset(emailAddress);
      setInfo(`已向 ${emailAddress} 发送密码重置邮件，请查收。`);
    } catch (error) {
      setFeedback(translateFirebaseAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  const showVerificationScreen =
    awaitingEmailCheck || (authUser !== null && !isEmailVerified);

  return (
    <div className="min-h-screen bg-[#f6f0e5] text-[#39251d]">
      <div className="mx-auto flex min-h-screen max-w-[520px] flex-col justify-center px-6 py-8">
        <button
          type="button"
          onClick={() => navigate("/mine")}
          className="mb-4 inline-flex w-fit items-center gap-1.5 text-[12px] font-medium text-[#857362] hover:text-[#39251d] cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>返回个人空间</span>
        </button>

        <div className="mx-auto flex h-[49px] w-[49px] items-center justify-center rounded-[17px] bg-[#922e25]">
          <Sun size={21} className="text-[#c59a53]" />
        </div>
        <p className="mt-2.5 text-center text-[19px] font-bold text-[#39251d]">
          云上梵境
        </p>
        <p className="mt-[3px] text-center text-[9px] tracking-[1.6px] text-[#857362]">
          YUN SHANG FAN JING
        </p>

        {showVerificationScreen ? (
          <div className="mt-7 rounded-[20px] border border-[#e4d8c3] bg-[#fffaf1] p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eadfc9]">
              <Mail size={22} className="text-[#922e25]" />
            </div>
            <h1 className="mt-4 text-[20px] font-bold text-[#39251d]">
              请验证您的电子邮箱
            </h1>
            <p className="mt-2 text-[12px] leading-5 text-[#563b2c]">
              验证邮件已发送至{" "}
              <strong className="text-[#922e25]">
                {authUser?.email || emailAddress}
              </strong>
              。完成验证后即可开启多设备云端同步。
            </p>
            {feedback && (
              <p role="alert" className="mt-3 text-[11px] text-[#ef4444]">
                {feedback}
              </p>
            )}
            {info && (
              <p className="mt-3 text-[11px] text-[#563b2c]">{info}</p>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={handleCheckVerification}
              className="mt-5 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[24px] bg-[#922e25] text-[13px] font-bold text-[#fff8eb] cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              <span>{busy ? "正在确认…" : "我已完成验证"}</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await resendVerificationEmail();
                  setInfo("验证邮件已重新发送，请查看收件箱或垃圾邮件箱。");
                } catch (err) {
                  setFeedback(translateFirebaseAuthError(err));
                } finally {
                  setBusy(false);
                }
              }}
              className="mt-3 py-2 text-[11px] font-semibold text-[#922e25] cursor-pointer"
            >
              重新发送验证邮件
            </button>
          </div>
        ) : (
          <>
            <h1 className="mt-7 text-center text-[23px] font-bold text-[#39251d]">
              {isSignUp ? "开启你的文化旅程" : "欢迎回到云上梵境"}
            </h1>
            <p className="mt-2 mb-[20px] text-center text-[12px] leading-[19px] text-[#857362]">
              {isSignUp
                ? "创建一个统一账号，跨设备同步阅读、静心与共修记录。"
                : "登录后，三个文化园区共用同一云端账号。"}
            </p>

            {/* Google Sign-In First (Zero-config ready) */}
            <button
              type="button"
              disabled={busy}
              onClick={handleGoogle}
              className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-[24px] border border-[#e4d8c3] bg-[#fffaf1] text-[13px] font-semibold text-[#39251d] transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
            >
              <span className="text-[16px] font-bold text-[#922e25]">G</span>
              <span>{busy ? "正在连接…" : "使用 Google 账号继续"}</span>
            </button>

            <div className="my-[18px] flex items-center gap-[11px]">
              <div className="h-px flex-1 bg-[#e4d8c3]" />
              <span className="text-[10px] text-[#857362]">或使用邮箱密码</span>
              <div className="h-px flex-1 bg-[#e4d8c3]" />
            </div>

            <form onSubmit={handleSubmit}>
              {isSignUp && (
                <>
                  <label
                    htmlFor="auth-name"
                    className="mt-2 mb-[7px] block text-[11px] font-semibold text-[#563b2c]"
                  >
                    称呼 / 昵称（可选）
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    maxLength={80}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="例如：云上行者"
                    className="min-h-[48px] w-full rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] px-[14px] text-[13px] text-[#39251d] placeholder:text-[#857362] focus:border-[#922e25] focus:outline-none"
                  />
                </>
              )}

              <label
                htmlFor="auth-email"
                className="mt-3 mb-[7px] block text-[11px] font-semibold text-[#563b2c]"
              >
                电子邮箱
              </label>
              <input
                id="auth-email"
                type="email"
                maxLength={160}
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="请输入电子邮箱"
                className="min-h-[48px] w-full rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] px-[14px] text-[13px] text-[#39251d] placeholder:text-[#857362] focus:border-[#922e25] focus:outline-none"
              />

              <label
                htmlFor="auth-password"
                className="mt-3 mb-[7px] block text-[11px] font-semibold text-[#563b2c]"
              >
                密码
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? "请设置至少 6 位密码" : "请输入密码"}
                className="min-h-[48px] w-full rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] px-[14px] text-[13px] text-[#39251d] placeholder:text-[#857362] focus:border-[#922e25] focus:outline-none"
              />

              {!isSignUp && (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] font-medium text-[#857362] hover:text-[#922e25] cursor-pointer"
                  >
                    忘记密码？
                  </button>
                </div>
              )}

              {feedback && (
                <p
                  role="alert"
                  className="mt-2.5 rounded-[10px] bg-[#ef4444]/10 p-2.5 text-[11px] leading-[17px] text-[#922e25]"
                >
                  {feedback}
                </p>
              )}
              {info && (
                <p className="mt-2.5 rounded-[10px] bg-[#eadfc9] p-2.5 text-[11px] leading-[17px] text-[#563b2c]">
                  {info}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || !emailAddress || !password}
                className="mt-[19px] flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[25px] bg-[#922e25] text-[13px] font-bold text-[#fff8eb] transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>
                  {busy
                    ? "请稍候…"
                    : isSignUp
                      ? "注册统一账号"
                      : "邮箱登录"}
                </span>
                {!busy && <ArrowRight size={16} />}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setFeedback("");
                setInfo("");
                navigate(isSignUp ? "/sign-in" : "/sign-up");
              }}
              className="mx-auto py-[17px] text-[11px] text-[#857362] cursor-pointer"
            >
              {isSignUp ? "已有账号？" : "还没有账号？"}
              <span className="font-bold text-[#922e25]">
                {isSignUp ? " 去登录" : " 立即注册"}
              </span>
            </button>
          </>
        )}

        <p className="mt-2.5 text-center text-[9px] text-[#857362]">
          一个账号通行三个文化园区，内容分类彼此独立。
        </p>
      </div>
    </div>
  );
}
