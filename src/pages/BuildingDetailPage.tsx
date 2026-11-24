import { ArrowLeft, CheckCircle2, Compass, MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { CulturalIcon } from "@/components/Icon";
import { useAppState } from "@/context/AppContext";

export function BuildingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBuilding, getPark, visitedBuildings, markBuildingVisited } =
    useAppState();
  const building = getBuilding(id ?? "");
  const park = building ? getPark(building.parkSlug) : undefined;

  if (!building || !park) {
    return (
      <div className="min-h-screen bg-[#f6f0e5] pb-24">
        <div className="mx-auto max-w-[520px] p-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#922e25] cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>返回首页</span>
          </button>
          <p className="text-[14px] text-[#39251d]">
            没有找到这处建筑，请返回园区重新选择。
          </p>
        </div>
        <BottomNav forceHomeActive />
      </div>
    );
  }

  const categories = park.categories.filter((category) =>
    building.categoryIds.includes(category.id),
  );
  const visited = visitedBuildings.includes(building.id);

  return (
    <div className="min-h-screen bg-[#f6f0e5] pb-24">
      <header className="sticky top-0 z-20 border-b border-[#e4d8c3]/70 bg-[#f6f0e5]/95 backdrop-blur-md">
        <div className="mx-auto flex h-13 max-w-[520px] items-center gap-3 px-4">
          <button
            type="button"
            aria-label="返回"
            onClick={() => navigate(`/parks/${park.slug}`)}
            className="flex items-center gap-1 text-[13px] font-medium text-[#39251d] hover:opacity-75 cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>返回</span>
          </button>
          <h1 className="truncate text-[16px] font-bold text-[#39251d]">
            {building.title}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] p-[19px]">
        {/* Hero */}
        <section className="relative flex h-[238px] flex-col justify-end overflow-hidden rounded-[24px] bg-[#563b2c]">
          <img
            src={park.image}
            alt={building.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 top-[22%]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(57, 37, 29, 0) 0%, rgba(57, 37, 29, 0.91) 100%)",
            }}
          />
          <div className="relative z-10 flex flex-col items-start px-[18px] pb-[18px]">
            <div className="mb-[9px] inline-flex items-center gap-1.5 rounded-[18px] bg-[#c59a53] px-[9px] py-1.5">
              <Compass size={12} className="text-[#39251d]" />
              <span className="text-[10px] font-bold text-[#39251d]">
                {park.identity}
              </span>
            </div>
            <h2 className="text-[26px] font-bold text-[#fff8eb]">
              {building.title}
            </h2>
            <p className="mt-1 text-[11px] text-[#fff8eb]/84">
              {building.subtitle}
            </p>
          </div>
        </section>

        {/* Visit Footprint Button */}
        <div className="mt-4 flex items-center justify-between rounded-[14px] border border-[#e4d8c3] bg-[#fffaf1] px-4 py-3">
          <div>
            <p className="text-[12px] font-bold text-[#39251d]">
              {visited ? "已记录云游足迹" : "记录此次云游"}
            </p>
            <p className="mt-0.5 text-[10px] text-[#857362]">
              登录后可跨设备同步您的寻访足迹
            </p>
          </div>
          <button
            type="button"
            onClick={() => void markBuildingVisited(building.id)}
            className={`inline-flex items-center gap-1.5 rounded-[18px] px-3.5 py-2 text-[11px] font-bold transition-opacity hover:opacity-90 cursor-pointer ${
              visited
                ? "bg-[#eadfc9] text-[#922e25]"
                : "bg-[#922e25] text-[#fff8eb]"
            }`}
          >
            {visited ? <CheckCircle2 size={14} /> : <MapPin size={14} />}
            <span>{visited ? "已打卡" : "打卡留念"}</span>
          </button>
        </div>

        {/* Description */}
        <section className="mt-5">
          <p className="text-[10px] tracking-[1px] text-[#c59a53]">建筑介绍</p>
          <p className="mt-[7px] text-[13px] leading-[22px] text-[#563b2c]">
            {building.description}
          </p>
        </section>

        {/* Scene Card */}
        <section className="mt-[19px] rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] p-[15px]">
          <div className="mb-1 flex items-center">
            <div className="mr-[11px] flex h-[39px] w-[39px] items-center justify-center rounded-[14px] bg-[#922e25]">
              <CulturalIcon
                name={building.icon}
                size={18}
                className="text-[#fff8eb]"
              />
            </div>
            <div className="flex-1">
              <p className="text-[10px] tracking-[1px] text-[#c59a53]">
                建筑场景
              </p>
              <p className="mt-[3px] text-[13px] font-bold text-[#39251d]">
                空间导览
              </p>
            </div>
          </div>
          <p className="mt-[7px] text-[13px] leading-[22px] text-[#563b2c]">
            {building.scene}
          </p>
        </section>

        {/* Categories */}
        <section className="mt-5">
          <p className="text-[10px] tracking-[1px] text-[#c59a53]">
            所属内容分类
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="inline-flex items-center gap-1.5 rounded-[18px] bg-[#eadfc9] px-[11px] py-2"
              >
                <CulturalIcon
                  name={category.icon}
                  size={13}
                  className="text-[#922e25]"
                />
                <span className="text-[10px] font-semibold text-[#563b2c]">
                  {category.title}
                </span>
              </div>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={() => navigate(`/parks/${park.slug}`)}
          className="mt-6 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[23px] bg-[#922e25] text-[12px] font-bold text-[#fff8eb] transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>返回{park.title}园区</span>
        </button>
      </main>
      <BottomNav forceHomeActive />
    </div>
  );
}
