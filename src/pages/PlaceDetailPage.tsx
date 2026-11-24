import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { CulturalIcon } from "@/components/Icon";
import { places } from "@/data/parks";

export function PlaceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const place = places[slug ?? ""];

  if (!place) {
    return (
      <div className="min-h-screen bg-[#f6f0e5] p-6">
        <div className="mx-auto max-w-[520px]">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#922e25] cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>返回</span>
          </button>
          <p className="text-[14px] text-[#39251d]">暂时没有找到这个文化空间。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f0e5] pb-10">
      <header className="sticky top-0 z-20 border-b border-[#e4d8c3]/70 bg-[#f6f0e5]/95 backdrop-blur-md">
        <div className="mx-auto flex h-13 max-w-[520px] items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-[13px] font-medium text-[#39251d] hover:opacity-75 cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>返回</span>
          </button>
          <h1 className="truncate text-[16px] font-bold text-[#39251d]">
            {place.title}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] p-5">
        <section className="relative flex h-[245px] flex-col justify-end overflow-hidden rounded-[24px] bg-[#563b2c]">
          <img
            src={place.image}
            alt={place.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 top-[28%]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(57, 37, 29, 0) 0%, rgba(57, 37, 29, 0.91) 100%)",
            }}
          />
          <div className="relative z-10 px-[19px] pb-[19px]">
            <CulturalIcon
              name={place.icon}
              size={18}
              className="text-[#c59a53]"
            />
            <h2 className="mt-[7px] text-[25px] font-bold text-[#fff8eb]">
              {place.title}
            </h2>
            <p className="mt-1 text-[12px] text-[#fff8eb]/85">
              {place.subtitle}
            </p>
          </div>
        </section>

        <p className="mt-[19px] text-[14px] leading-6 text-[#563b2c]">
          {place.description}
        </p>

        <h3 className="mt-6 mb-[9px] text-[16px] font-bold text-[#39251d]">
          探索内容
        </h3>
        <div>
          {place.highlights.map((highlight, index) => (
            <div
              key={highlight}
              className="flex items-center gap-[11px] border-b border-[#e4d8c3] py-[13px]"
            >
              <div className="flex h-[31px] w-[31px] items-center justify-center rounded-[11px] bg-[#eadfc9] text-[10px] font-bold text-[#39251d]">
                0{index + 1}
              </div>
              <span className="flex-1 text-[13px] font-medium text-[#39251d]">
                {highlight}
              </span>
              <ArrowUpRight size={16} className="text-[#c59a53]" />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate("/classics")}
          className="mt-6 flex min-h-[48px] w-full items-center justify-center gap-[9px] rounded-[25px] bg-[#922e25] text-[13px] font-bold text-[#fff8eb] transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
        >
          <span>继续阅读经典</span>
          <ArrowRight size={17} />
        </button>
      </main>
    </div>
  );
}
