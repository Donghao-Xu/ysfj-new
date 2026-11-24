import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Move,
  Music,
  Sun,
  Sunrise,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { CulturalIcon } from "@/components/Icon";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import type { CultureIcon, ParkSlug } from "@/data/parks";

type Destination = {
  slug: ParkSlug;
  title: string;
  subtitle: string;
  icon: CultureIcon;
  image?: string;
};

const destinations: Destination[] = [
  {
    slug: "buddhist",
    title: "佛教寺院",
    subtitle: "山门清净 · 禅意悠远",
    icon: "circle",
    image: "/images/buddhist-temple.png",
  },
  {
    slug: "daoist",
    title: "道教宫观",
    subtitle: "问道名山 · 观宇千年",
    icon: "wind",
    image: "/images/daoist-temple.png",
  },
  {
    slug: "culture",
    title: "中华传统文化馆",
    subtitle: "典籍礼乐 · 东方文脉",
    icon: "book-open",
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f6f0e5] pb-24">
      <main className="mx-auto max-w-[520px] px-5 pt-6">
        <OfflineIndicator />

        {/* Brand Row */}
        <header className="mb-[18px] flex items-center">
          <div className="mr-[11px] flex h-[42px] w-[42px] items-center justify-center rounded-[15px] bg-[#922e25]">
            <Sun size={19} className="text-[#c59a53]" />
          </div>
          <div className="flex-1">
            <h1 className="text-[19px] font-bold tracking-[1.2px] text-[#39251d]">
              云上梵境
            </h1>
            <p className="mt-0.5 text-[11px] tracking-[1.1px] text-[#857362]">
              YUN SHANG FAN JING
            </p>
          </div>
          <PWAInstallButton compact />
        </header>

        {/* Hero Card */}
        <section className="relative flex h-[286px] flex-col justify-end overflow-hidden rounded-[24px] bg-[#563b2c]">
          <img
            src="/images/temple-hero.png"
            alt="东方古刹飞檐"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 top-[24%]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(57, 37, 29, 0) 0%, rgba(57, 37, 29, 0.91) 100%)",
            }}
          />
          <div className="relative z-10 flex flex-col items-start px-[21px] pb-5">
            <div className="mb-[11px] inline-flex items-center gap-1.5 rounded-[20px] bg-[#c59a53] px-2.5 py-1.5">
              <Sunrise size={13} className="text-[#39251d]" />
              <span className="text-[10px] font-semibold tracking-[0.8px] text-[#39251d]">
                东方古建 · 云端礼敬
              </span>
            </div>
            <h2 className="text-[27px] leading-[36px] font-bold tracking-[1.4px] text-[#fff8eb]">
              寻一方清净，
              <br />
              阅千年文脉
            </h2>
            <p className="mt-[5px] text-[12px] text-[#fff8eb]/86">
              从飞檐古刹开始，走近中国传统文化
            </p>
            <button
              type="button"
              onClick={() => navigate("/parks/buddhist")}
              className="mt-[15px] inline-flex items-center gap-2 rounded-[24px] bg-[#c59a53] px-[15px] py-[9px] text-[12px] font-bold text-[#39251d] transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
            >
              <span>开启云游</span>
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="absolute top-[18px] right-[18px] z-10 flex h-[47px] w-[39px] items-center justify-center rounded-[5px] border border-[#c59a53] bg-[#39251d]/40">
            <span className="text-[21px] font-bold text-[#c59a53]">境</span>
          </div>
        </section>

        {/* Section Heading */}
        <div className="mt-[25px] mb-[13px] flex items-center justify-between">
          <div>
            <h2 className="text-[19px] font-bold tracking-[0.6px] text-[#39251d]">
              循着东方文脉
            </h2>
            <p className="mt-1 text-[11px] tracking-[0.4px] text-[#857362]">
              寻访古建，静心观照
            </p>
          </div>
          <Move size={18} className="text-[#c59a53]" />
        </div>

        {/* Horizontal Destination Rail */}
        <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {destinations.map((item) => (
            <button
              key={item.slug}
              type="button"
              aria-label={`进入${item.title}`}
              onClick={() => navigate(`/parks/${item.slug}`)}
              className="relative h-[166px] w-[228px] shrink-0 overflow-hidden rounded-[16px] bg-[#eadfc9] text-left transition-opacity hover:opacity-95 active:opacity-80 cursor-pointer"
            >
              {item.image ? (
                <>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(57, 37, 29, 0) 22%, rgba(57, 37, 29, 0.91) 100%)",
                    }}
                  />
                  <div className="absolute inset-x-[14px] bottom-[14px] flex flex-col items-start">
                    <CulturalIcon
                      name={item.icon}
                      size={16}
                      className="text-[#c59a53]"
                    />
                    <span className="mt-1.5 text-[17px] font-bold text-[#fff8eb]">
                      {item.title}
                    </span>
                    <span className="mt-[3px] text-[11px] text-[#fff8eb]/84">
                      {item.subtitle}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col justify-center border border-[#e4d8c3] bg-[#eadfc9] p-[15px]">
                  <div className="mb-2.5 flex h-[39px] w-[39px] items-center justify-center rounded-[13px] bg-[#922e25]">
                    <CulturalIcon
                      name={item.icon}
                      size={21}
                      className="text-[#fff8eb]"
                    />
                  </div>
                  <span className="text-[15px] leading-[21px] font-bold text-[#39251d]">
                    {item.title}
                  </span>
                  <span className="mt-1 text-[10px] text-[#563b2c]">
                    {item.subtitle}
                  </span>
                  <div className="mt-[11px] flex items-center gap-[7px]">
                    <span className="h-px w-6 bg-[#c59a53]" />
                    <Sun size={14} className="text-[#c59a53]" />
                    <span className="h-px w-6 bg-[#c59a53]" />
                  </div>
                </div>
              )}
              <div className="absolute top-2.5 right-2.5 flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#39251d]/55">
                <ArrowUpRight size={15} className="text-[#fff8eb]" />
              </div>
            </button>
          ))}
        </div>

        {/* Daily Practice Card */}
        <button
          type="button"
          aria-label="进入诵经静心"
          onClick={() => navigate("/chanting")}
          className="mt-[18px] flex w-full items-center gap-3 rounded-[14px] border border-[#e4d8c3] bg-[#fffaf1] px-[14px] py-[13px] text-left transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
        >
          <div className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[13px] bg-[#922e25]">
            <Music size={20} className="text-[#fff8eb]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.5px] text-[#857362]">
              每日一刻 · 安住当下
            </p>
            <p className="mt-[3px] text-[14px] font-semibold text-[#39251d]">
              留一段清宁给自己
            </p>
          </div>
          <ChevronRight size={19} className="text-[#c59a53]" />
        </button>

        <p className="mt-[18px] text-center text-[10px] leading-4 text-[#857362]">
          心怀敬意，亲近传统；以文化相连，让善意相遇。
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
