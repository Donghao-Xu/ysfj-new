import React from "react";

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || "页面出现了一点小状况",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Application ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f0e5] px-6 text-center text-[#39251d]">
          <div className="max-w-sm rounded-[20px] border border-[#e4d8c3] bg-[#fffaf1] p-6">
            <h1 className="text-[18px] font-bold text-[#922e25]">
              页面暂时无法显示
            </h1>
            <p className="mt-2 text-[12px] leading-5 text-[#563b2c]">
              云端数据连接或操作遇到异常，请刷新页面重试。如果今日免费额度已用完，明日恢复后即可继续。
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-[20px] bg-[#922e25] px-6 py-2.5 text-[12px] font-bold text-[#fff8eb] cursor-pointer"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
