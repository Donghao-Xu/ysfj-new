import { Download, Smartphone, X } from "lucide-react";
import { useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export function PWAInstallButton({ compact = false }: { compact?: boolean }) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 rounded-[18px] border border-[#e4d8c3] bg-[#fffaf1] px-3 py-1.5 text-[11px] font-semibold text-[#922e25] transition-opacity hover:opacity-90 cursor-pointer"
        >
          <Download size={13} />
          <span>安装到桌面</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="flex w-full items-center gap-3 rounded-[14px] border border-[#e4d8c3] bg-[#fffaf1] p-[14px] text-left transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
        >
          <div className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[13px] bg-[#eadfc9]">
            <Smartphone size={18} className="text-[#922e25]" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-[#39251d]">
              {isInstallable ? "安装「云上梵境」到手机桌面" : "添加到手机主屏幕"}
            </p>
            <p className="mt-0.5 text-[10px] text-[#857362]">
              {isIOS
                ? "在 iPhone / iPad Safari 中点击分享按钮即可安装"
                : "像独立手机 App 一样全屏运行，支持离线静心阅读"}
            </p>
          </div>
          <Download size={16} className="shrink-0 text-[#c59a53]" />
        </button>
      )}

      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="安装手机应用指引"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#39251d]/55 p-4"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-[20px] border border-[#e4d8c3] bg-[#f6f0e5] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-[#39251d]">
                安装「云上梵境」到手机
              </h3>
              <button
                type="button"
                aria-label="关闭"
                onClick={() => setShowGuide(false)}
                className="rounded-full p-1 text-[#857362] hover:bg-[#eadfc9] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            {isIOS ? (
              <ol className="mt-3 space-y-2 text-[12px] leading-6 text-[#563b2c]">
                <li>1. 请使用苹果自带的 <strong>Safari 浏览器</strong> 打开本页面。</li>
                <li>2. 点击底部工具栏的 <strong>「分享」</strong> 图标（方框带向上箭头）。</li>
                <li>3. 向下滑动，点击 <strong>「添加到主屏幕」</strong>，即可在手机桌面像原生 App 一样启动。</li>
              </ol>
            ) : (
              <ol className="mt-3 space-y-2 text-[12px] leading-6 text-[#563b2c]">
                <li>1. 在手机 Chrome、Edge 或系统浏览器右上角打开菜单（⋮）。</li>
                <li>2. 选择 <strong>「安装应用」</strong> 或 <strong>「添加到主屏幕」</strong>。</li>
                <li>3. 确认后即可独立全屏运行，支持离线查看经典与静心计时。</li>
              </ol>
            )}
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-[22px] bg-[#922e25] py-2.5 text-[12px] font-bold text-[#fff8eb] cursor-pointer"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
}
