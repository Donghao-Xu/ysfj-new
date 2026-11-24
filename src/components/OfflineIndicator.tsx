import { WifiOff } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const { quotaWarning } = useAppState();

  if (isOnline && !quotaWarning) return null;

  return (
    <div className="mx-auto mb-3 flex max-w-[520px] items-center gap-2 rounded-[12px] border border-[#c59a53]/50 bg-[#eadfc9] px-3.5 py-2 text-[11px] text-[#563b2c]">
      <WifiOff size={14} className="shrink-0 text-[#922e25]" />
      <span>
        {!isOnline
          ? "当前处于离线模式，已加载本地缓存数据。"
          : quotaWarning}
      </span>
    </div>
  );
}
