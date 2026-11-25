import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { CulturalIcon } from "@/components/Icon";
import { ResilientImage } from "@/components/ResilientImage";
import { places } from "@/data/parks";

export function PlaceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const place = places[slug ?? ""];
  const realmTone = slug === "daoist" ? "daoist" : "default";

  if (!place) {
    return (
      <AppShell forceActivePath="/worlds">
        <div className="mx-auto max-w-2xl py-8">
          <button
            type="button"
            onClick={() => navigate("/worlds")}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#922e25] cursor-pointer dark:text-[#d4a85d]"
          >
            <ArrowLeft size={16} />
            <span>返回</span>
          </button>
          <p className="text-sm text-[#39251d] dark:text-[#efe7da]">
            暂时没有找到这个文化空间。
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell forceActivePath="/worlds" realmTone={realmTone}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm font-medium text-[#39251d] hover:opacity-75 cursor-pointer dark:text-[#efe7da]"
          >
            <ArrowLeft size={18} />
            <span>返回</span>
          </button>
          <h1 className="truncate font-serif-display text-lg font-bold text-[#39251d] dark:text-[#efe7da]">
            {place.title}
          </h1>
        </div>

        <section className="relative flex min-h-[245px] md:min-h-[290px] flex-col justify-end overflow-hidden rounded-[22px] bg-[#2a221d]">
          <ResilientImage
            src={place.image}
            alt={place.title}
            fallbackTitle={place.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(28, 20, 16, 0.92) 8%, rgba(28, 20, 16, 0.35) 55%, rgba(28, 20, 16, 0.1) 100%)",
            }}
          />
          <div className="relative z-10 p-5 md:p-8">
            <CulturalIcon
              name={place.icon}
              size={18}
              className="text-[#d4a85d]"
            />
            <h2 className="mt-2 font-serif-display text-2xl font-bold text-[#fff8eb] md:text-3xl">
              {place.title}
            </h2>
            <p className="mt-1 text-xs text-[#fff8eb]/85">{place.subtitle}</p>
          </div>
        </section>

        <p className="mt-5 text-sm leading-relaxed text-[#563b2c] dark:text-[#cfc2b2]">
          {place.description}
        </p>

        <h3 className="mt-7 mb-2 font-serif-display text-base font-bold text-[#39251d] dark:text-[#efe7da]">
          探索内容
        </h3>
        <div>
          {place.highlights.map((highlight, index) => (
            <div
              key={highlight}
              className="flex items-center gap-3 border-b border-[#e4d8c3] py-3.5 dark:border-[#332922]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eadfc9] text-xs font-bold text-[#39251d] dark:bg-[#2a211c] dark:text-[#d8cab8]">
                0{index + 1}
              </div>
              <span className="flex-1 text-sm font-medium text-[#39251d] dark:text-[#efe7da]">
                {highlight}
              </span>
              <ArrowUpRight size={16} className="text-[#c59a53]" />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate("/classics")}
          className="mt-7 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#922e25] text-sm font-bold text-[#fff8eb] transition-opacity hover:opacity-90 cursor-pointer"
        >
          <span>继续阅读经典</span>
          <ArrowRight size={17} />
        </button>
      </div>
    </AppShell>
  );
}
