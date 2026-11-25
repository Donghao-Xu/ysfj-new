import retreatHomeHeroImg from "@/assets/images/retreat_home_hero_1795627904060.jpg";
import retreatPortalBuddhistImg from "@/assets/images/retreat_portal_buddhist_1795627905404.jpg";
import retreatPortalDaoistImg from "@/assets/images/retreat_portal_daoist_1795627904789.jpg";
import retreatPortalNatureImg from "@/assets/images/retreat_portal_nature_1795627904453.jpg";

import medBuddhistChanImg from "@/assets/images/med_buddhist_chan_1795627905240.jpg";
import medBuddhistHallImg from "@/assets/images/med_buddhist_hall_1795627904243.jpg";
import medBuddhistLotusImg from "@/assets/images/med_buddhist_lotus_1795627904455.jpg";
import medBuddhistNianfoImg from "@/assets/images/med_buddhist_nianfo_1795627904263.jpg";
import medBuddhistWoodfishImg from "@/assets/images/med_buddhist_woodfish_1795627904049.jpg";
import medBuddhistBeadsImg from "@/assets/images/med_buddhist_beads_1795627905273.jpg";

import medDaoistCourtyardImg from "@/assets/images/med_daoist_courtyard_1795627905343.jpg";
import medDaoistForestImg from "@/assets/images/med_daoist_forest_1795627986588.jpg";
import medDaoistCloudsImg from "@/assets/images/med_daoist_clouds_1795627907131.jpg";
import medDaoistNatureImg from "@/assets/images/med_daoist_nature_1795628006475.jpg";
import medDaoistTaijiImg from "@/assets/images/med_daoist_taiji_1795628006382.jpg";

import medNatureStreamImg from "@/assets/images/med_nature_stream_1795627986192.jpg";
import medNatureBambooRainImg from "@/assets/images/med_nature_bamboo_rain_1795627928407.jpg";
import medNaturePineWindImg from "@/assets/images/med_nature_pine_wind_1795627986278.jpg";
import medNatureLakeImg from "@/assets/images/med_nature_lake_1795628007035.jpg";
import medNatureCloudViewImg from "@/assets/images/med_nature_cloud_view_1795627910520.jpg";
import medNatureStarlightImg from "@/assets/images/med_nature_starlight_1795628006572.jpg";

import type { NatureSoundType } from "@/lib/audio";

export type RetreatRealmId = "buddhist" | "daoist" | "nature";

export type RetreatEffectId =
  | "sunlight"
  | "incense"
  | "candle"
  | "ripples"
  | "lotus"
  | "rain"
  | "bamboo"
  | "pine"
  | "clouds"
  | "stars"
  | "taiji"
  | "motes";

export type BreathModeId = "free" | "slow" | "deep" | "custom";
export type BreathVisualId = "orb" | "lotus" | "halo" | "cloud";
export type RetreatFeatureMode =
  | "standard"
  | "nianfo"
  | "woodfish"
  | "beads"
  | "taiji";

export type RetreatBellType =
  | "temple-bell"
  | "singing-bowl"
  | "jade-chime"
  | "qing-bell"
  | "none";

export type RetreatSceneConfig = {
  sceneId: string;
  sceneName: string;
  subtitle: string;
  category: RetreatRealmId;
  categoryLabel: string;
  description: string;
  culturalNote: string;
  primaryImage: string;
  fallbackGradient: string;
  animationConfig: {
    effects: RetreatEffectId[];
    mistDensity: "light" | "medium" | "rich";
  };
  audioConfig: {
    defaultSound: NatureSoundType;
    allowedSounds: NatureSoundType[];
    bellType: RetreatBellType;
  };
  breathingConfig: {
    supported: boolean;
    defaultEnabled: boolean;
    defaultMode: BreathModeId;
    defaultVisual: BreathVisualId;
  };
  featureConfig: {
    mode: RetreatFeatureMode;
    helperNote?: string;
    naturalViews?: { id: string; label: string; prompt: string }[];
  };
};

export type RetreatRealmPortal = {
  id: RetreatRealmId;
  title: string;
  englishSubtitle: string;
  badgeText: string;
  description: string;
  image: string;
  fallbackGradient: string;
  accentClass: string;
};

export const RETREAT_HERO = {
  title: "云上静修",
  subtitle: "让心慢下来，让世界静下来。",
  tagline: "佛道双境 · 自然静修 · 沉浸式数字静修体验",
  image: retreatHomeHeroImg,
  fallbackGradient: "from-[#2d383c] via-[#1f292a] to-[#12181a]",
};

export const RETREAT_REALMS: RetreatRealmPortal[] = [
  {
    id: "buddhist",
    title: "佛境静修",
    englishSubtitle: "禅堂 · 佛殿 · 莲池 · 木鱼 · 念珠",
    badgeText: "6 个专属静修场景",
    description:
      "在汉传禅堂微光、庄严佛殿香烟与清净莲池间静坐安住，亦提供无排名干扰的念佛、木鱼节拍与 108 颗念珠拨动修习。",
    image: retreatPortalBuddhistImg,
    fallbackGradient: "from-[#4e2d24] via-[#341f18] to-[#1d120e]",
    accentClass: "text-[#e5c17c]",
  },
  {
    id: "daoist",
    title: "道境静修",
    englishSubtitle: "道观 · 山林 · 云海 · 自然 · 太极意境",
    badgeText: "5 个专属静修场景",
    description:
      "依道法自然与清静守一传统营造，涵盖古柏道观庭院、深山松林、云海观息、自然观静及第一阶段太极意境呼吸静心。",
    image: retreatPortalDaoistImg,
    fallbackGradient: "from-[#1c3b34] via-[#162d28] to-[#0d1c19]",
    accentClass: "text-[#b6dfd2]",
  },
  {
    id: "nature",
    title: "自然静修",
    englishSubtitle: "山泉 · 竹雨 · 松涛 · 湖畔 · 云海 · 星空",
    badgeText: "6 个纯净自然场景",
    description:
      "不带特定宗教仪轨的纯粹山水空间。伴随流水、竹林细雨、松风、平湖涟漪与深夜星海，适合所有渴望片刻宁静的大众体验。",
    image: retreatPortalNatureImg,
    fallbackGradient: "from-[#1e353d] via-[#1c2e30] to-[#111c1e]",
    accentClass: "text-[#c3e0df]",
  },
];

export const RETREAT_SCENES: RetreatSceneConfig[] = [
  // ================= 入口一：佛境静修（6个场景） =================
  {
    sceneId: "retreat-buddhist-chan",
    sceneName: "禅堂静坐",
    subtitle: "木构清幽禅堂 · 窗格柔光",
    category: "buddhist",
    categoryLabel: "佛境静修",
    description:
      "古朴温暖的汉传禅堂室内，蒲团安放于素净席面。午后与清晨阳光透过木窗斜照地面，树影随风轻摇，安顿散乱心绪。",
    culturalNote:
      "传统汉传禅堂讲究“止语安住”，不事繁文缛节，重在觉察当下起心动念，让呼吸自然舒缓。",
    primaryImage: medBuddhistChanImg,
    fallbackGradient: "from-[#493426] via-[#312219] to-[#1a120d]",
    animationConfig: { effects: ["sunlight", "bamboo", "motes"], mistDensity: "light" },
    audioConfig: {
      defaultSound: "temple",
      allowedSounds: ["temple", "wind", "birds", "rain"],
      bellType: "qing-bell",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: true,
      defaultMode: "slow",
      defaultVisual: "orb",
    },
    featureConfig: { mode: "standard" },
  },
  {
    sceneId: "retreat-buddhist-hall",
    sceneName: "佛殿静坐",
    subtitle: "庄严佛像 · 缓升青烟 · 烛火微光",
    category: "buddhist",
    categoryLabel: "佛境静修",
    description:
      "在深沉宏阔的传统佛殿中瞻礼澄明佛像，铜炉香烟缓慢袅袅升起，莲座烛灯发出温暖微光，感受一份厚重而安稳的守望。",
    culturalNote:
      "佛殿静坐以庄严与慈悲氛围为依归，敬香灯火意在映照内心明净，而非祈求外在交换。",
    primaryImage: medBuddhistHallImg,
    fallbackGradient: "from-[#542921] via-[#361a15] to-[#1c0d0a]",
    animationConfig: { effects: ["incense", "candle", "motes"], mistDensity: "light" },
    audioConfig: {
      defaultSound: "temple",
      allowedSounds: ["temple", "rain", "wind"],
      bellType: "temple-bell",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: true,
      defaultMode: "slow",
      defaultVisual: "halo",
    },
    featureConfig: { mode: "standard" },
  },
  {
    sceneId: "retreat-buddhist-lotus",
    sceneName: "莲池静心",
    subtitle: "莲池清波 · 晨雾莲影",
    category: "buddhist",
    categoryLabel: "佛境静修",
    description:
      "晨光薄雾覆于寺院莲池之上，水波起细微涟漪，青翠荷叶轻摆，粉色与白莲次第舒展，令人观水而忘尘嚣。",
    culturalNote:
      "佛教以莲华喻清净不染之心境，观想莲池静谧，意在练习于纷扰日常中保有一念清凉。",
    primaryImage: medBuddhistLotusImg,
    fallbackGradient: "from-[#274036] via-[#21312b] to-[#131d1a]",
    animationConfig: { effects: ["ripples", "lotus", "clouds", "motes"], mistDensity: "medium" },
    audioConfig: {
      defaultSound: "stream",
      allowedSounds: ["stream", "lake", "birds", "temple"],
      bellType: "singing-bowl",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: true,
      defaultMode: "slow",
      defaultVisual: "lotus",
    },
    featureConfig: { mode: "standard" },
  },
  {
    sceneId: "retreat-buddhist-nianfo",
    sceneName: "念佛静修",
    subtitle: "一念相续 · 线装经案微灯",
    category: "buddhist",
    categoryLabel: "佛境静修",
    description:
      "选取一句传统佛号或四句清净偈语，配以柔光与清磬，不急不躁默念或出声随诵，让杂念渐归专一。",
    culturalNote:
      "本空间只提供清净持念伴随，绝不记录“念诵排行榜”或诱导功德攀比，每次停留皆随缘自在。",
    primaryImage: medBuddhistNianfoImg,
    fallbackGradient: "from-[#4b3221] via-[#322015] to-[#1a110b]",
    animationConfig: { effects: ["candle", "sunlight", "motes"], mistDensity: "light" },
    audioConfig: {
      defaultSound: "temple",
      allowedSounds: ["temple", "stream", "rain"],
      bellType: "qing-bell",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: false,
      defaultMode: "free",
      defaultVisual: "halo",
    },
    featureConfig: {
      mode: "nianfo",
      helperNote: "选择佛号与时长后，可同步配合轻柔背景音与单曲循环。",
    },
  },
  {
    sceneId: "retreat-buddhist-woodfish",
    sceneName: "木鱼专注",
    subtitle: "古朴樟木 · 声息相依",
    category: "buddhist",
    categoryLabel: "佛境静修",
    description:
      "专注倾听每一声清脆柔和的樟木回响。支持手动逐声敲击，亦可开启可调速度的自动节拍模式，随木鱼韵律收摄心神。",
    culturalNote:
      "传统寺院诵经用木鱼定拍，取鱼目昼夜常醒之意；今日用于静修，则是借规律清音安顿浮躁思绪。",
    primaryImage: medBuddhistWoodfishImg,
    fallbackGradient: "from-[#4c2b1f] via-[#2e1a13] to-[#180d09]",
    animationConfig: { effects: ["candle", "motes"], mistDensity: "light" },
    audioConfig: {
      defaultSound: "temple",
      allowedSounds: ["temple", "rain", "wind"],
      bellType: "qing-bell",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: false,
      defaultMode: "free",
      defaultVisual: "orb",
    },
    featureConfig: {
      mode: "woodfish",
      helperNote: "点击木鱼或开启自动节拍，可随时调节每分钟叩击次数与静音开关。",
    },
  },
  {
    sceneId: "retreat-buddhist-beads",
    sceneName: "念珠修习",
    subtitle: "一零八颗 · 触指计数",
    category: "buddhist",
    categoryLabel: "佛境静修",
    description:
      "轻点或滑动屏幕拨动 108 颗老檀木念珠，伴随温润清脆的拨珠声与柔和微光，以指尖细微觉察替代走神思虑。",
    culturalNote:
      "念珠又称数珠，常以百八颗象征断除百八烦恼；此处仅作静心专注计数，不设功德数值攀比。",
    primaryImage: medBuddhistBeadsImg,
    fallbackGradient: "from-[#433327] via-[#2d221a] to-[#19130f]",
    animationConfig: { effects: ["sunlight", "motes"], mistDensity: "light" },
    audioConfig: {
      defaultSound: "temple",
      allowedSounds: ["temple", "birds", "wind"],
      bellType: "singing-bowl",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: false,
      defaultMode: "free",
      defaultVisual: "orb",
    },
    featureConfig: {
      mode: "beads",
      helperNote: "轻点中央或左右滑动念珠皆可前拨一颗，支持暂停与清零。",
    },
  },

  // ================= 入口二：道境静修（5个场景） =================
  {
    sceneId: "retreat-daoist-courtyard",
    sceneName: "道观静坐",
    subtitle: "古柏青瓦 · 铜炉清烟",
    category: "daoist",
    categoryLabel: "道境静修",
    description:
      "静谧幽深的古道观庭院，灰瓦飞檐静映远山薄云，百年古柏枝影轻晃，铜鼎香炉微烟升起，清净自足。",
    culturalNote:
      "道教静坐常与“致虚极，守静笃”相应，庭院与香烟并非形式崇拜，而是帮助身心从喧嚣退回宁静。",
    primaryImage: medDaoistCourtyardImg,
    fallbackGradient: "from-[#1e3d35] via-[#182e29] to-[#0e1b18]",
    animationConfig: { effects: ["incense", "clouds", "pine", "motes"], mistDensity: "medium" },
    audioConfig: {
      defaultSound: "daoist",
      allowedSounds: ["daoist", "wind", "pine", "birds"],
      bellType: "jade-chime",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: true,
      defaultMode: "slow",
      defaultVisual: "cloud",
    },
    featureConfig: { mode: "standard" },
  },
  {
    sceneId: "retreat-daoist-forest",
    sceneName: "山林静修",
    subtitle: "古松苔石 · 山涧薄雾",
    category: "daoist",
    categoryLabel: "道境静修",
    description:
      "身处隐逸仙观旁的苍翠松林，青苔巨石卧于溪畔，晨间薄雾在树干间缓缓流动，耳畔惟闻溪声与松风。",
    culturalNote:
      "道家历来推崇“人法地，地法天，天法道，道法自然”，走进山林、观察草木水石本身即是静修。",
    primaryImage: medDaoistForestImg,
    fallbackGradient: "from-[#1c382f] via-[#162b24] to-[#0d1915]",
    animationConfig: { effects: ["pine", "clouds", "ripples", "motes"], mistDensity: "medium" },
    audioConfig: {
      defaultSound: "pine",
      allowedSounds: ["pine", "stream", "birds", "daoist"],
      bellType: "jade-chime",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: true,
      defaultMode: "slow",
      defaultVisual: "orb",
    },
    featureConfig: { mode: "standard" },
  },
  {
    sceneId: "retreat-daoist-clouds",
    sceneName: "云海观息",
    subtitle: "凌绝云海 · 天地吐纳",
    category: "daoist",
    categoryLabel: "道境静修",
    description:
      "立于道教仙山峰崖之上，白茫茫云海在脚下平缓涌动，天光晨曦沿着远山轮廓缓变，伴随不强求憋气的柔和呼吸引导。",
    culturalNote:
      "传统吐纳讲究细、匀、深、长，切忌用力屏息憋闷；本体验重在放松自然呼吸与开阔心胸。",
    primaryImage: medDaoistCloudsImg,
    fallbackGradient: "from-[#223945] via-[#1c2b35] to-[#10181f]",
    animationConfig: { effects: ["clouds", "sunlight", "motes"], mistDensity: "rich" },
    audioConfig: {
      defaultSound: "wind",
      allowedSounds: ["wind", "daoist", "pine"],
      bellType: "jade-chime",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: true,
      defaultMode: "deep",
      defaultVisual: "cloud",
    },
    featureConfig: { mode: "standard" },
  },
  {
    sceneId: "retreat-daoist-nature",
    sceneName: "自然观静",
    subtitle: "山谷平湖 · 静观万物",
    category: "daoist",
    categoryLabel: "道境静修",
    description:
      "面向苍翠山谷、如镜湖泊与茵茵草坡，无丝毫繁杂装饰，可于安静观察山水草木与自然天籁之间练习不评价、不执着。",
    culturalNote:
      "《道德经》有云“万物并作，吾以观复”，静观自然生息往复，本身就是传统道家修养心灵的方式。",
    primaryImage: medDaoistNatureImg,
    fallbackGradient: "from-[#203d37] via-[#1a312c] to-[#0f1d1a]",
    animationConfig: { effects: ["clouds", "ripples", "bamboo"], mistDensity: "light" },
    audioConfig: {
      defaultSound: "birds",
      allowedSounds: ["birds", "lake", "wind", "stream"],
      bellType: "jade-chime",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: true,
      defaultMode: "free",
      defaultVisual: "halo",
    },
    featureConfig: {
      mode: "standard",
      naturalViews: [
        {
          id: "valley",
          label: "幽谷山岚",
          prompt: "看山谷薄雾缓缓聚散，不急着留住，也不急着赶走。",
        },
        {
          id: "mirror-lake",
          label: "平湖照影",
          prompt: "水面不动时便能清晰映照群山，人心静下来亦复如是。",
        },
        {
          id: "meadow",
          label: "汀草微风",
          prompt: "感受草叶随微风摆动的节律，让肩膀和下颌自然松垂。",
        },
      ],
    },
  },
  {
    sceneId: "retreat-daoist-taiji",
    sceneName: "太极意境体验",
    subtitle: "第一阶段 · 柔和太极图 + 慢节律呼吸 + 静修计时",
    category: "daoist",
    categoryLabel: "道境静修",
    description:
      "以高山青石道台为背景，中央呈现缓缓旋转的柔和太极图意境与雾气光晕，同步配合慢节奏呼吸引导与安静自然声景。",
    culturalNote:
      "诚实说明：当前为第一阶段轻量意境体验，重点在阴阳流转的视觉安顿与自然调息，不替代传统线下太极拳法或医疗指导。",
    primaryImage: medDaoistTaijiImg,
    fallbackGradient: "from-[#213a38] via-[#192b2a] to-[#101b1b]",
    animationConfig: { effects: ["taiji", "clouds", "sunlight", "motes"], mistDensity: "medium" },
    audioConfig: {
      defaultSound: "daoist",
      allowedSounds: ["daoist", "wind", "stream", "pine"],
      bellType: "jade-chime",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: true,
      defaultMode: "slow",
      defaultVisual: "halo",
    },
    featureConfig: {
      mode: "taiji",
      helperNote: "第一阶段功能：柔和太极图缓转 + 吸呼节律引导 + 静修计时 + 自然背景音。",
    },
  },

  // ================= 入口三：自然静修（6个场景，无宗教限制） =================
  {
    sceneId: "retreat-nature-stream",
    sceneName: "山间流水",
    subtitle: "清泉石上 · 潺潺水韵",
    category: "nature",
    categoryLabel: "自然静修",
    description:
      "澄澈山涧溪水穿过青苔卵石缓缓流淌，薄雾沿水面轻飘，配合逼真流动水声，如临深山幽谷般清凉舒展。",
    culturalNote:
      "纯自然听觉与视觉静心空间，无任何宗教背景门槛，适合工作间隙短暂放空或舒缓精神紧绷。",
    primaryImage: medNatureStreamImg,
    fallbackGradient: "from-[#1e3a38] via-[#162b2a] to-[#0d1918]",
    animationConfig: { effects: ["ripples", "clouds", "motes"], mistDensity: "light" },
    audioConfig: {
      defaultSound: "stream",
      allowedSounds: ["stream", "birds", "wind"],
      bellType: "none",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: true,
      defaultMode: "free",
      defaultVisual: "orb",
    },
    featureConfig: { mode: "standard" },
  },
  {
    sceneId: "retreat-nature-bamboo-rain",
    sceneName: "雨落竹林",
    subtitle: "翠竹听雨 · 清凉雾气",
    category: "nature",
    categoryLabel: "自然静修",
    description:
      "绵密柔和的细雨落入修长翠竹林中，雨丝斜飘、竹叶随风微晃，配合淅沥雨滴叩竹之声，洗去心中燥热烦躁。",
    culturalNote:
      "纯自然雨林意境体验，可伴随均匀舒缓雨声学习、休憩或平静入睡前的静坐。",
    primaryImage: medNatureBambooRainImg,
    fallbackGradient: "from-[#1d392e] via-[#162b23] to-[#0d1814]",
    animationConfig: { effects: ["rain", "bamboo", "clouds"], mistDensity: "medium" },
    audioConfig: {
      defaultSound: "bamboo-rain",
      allowedSounds: ["bamboo-rain", "rain", "wind"],
      bellType: "none",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: true,
      defaultMode: "slow",
      defaultVisual: "cloud",
    },
    featureConfig: { mode: "standard" },
  },
  {
    sceneId: "retreat-nature-pine-wind",
    sceneName: "松林风声",
    subtitle: "万壑松涛 · 山风清朗",
    category: "nature",
    categoryLabel: "自然静修",
    description:
      "高大苍劲的山林赤松在清风中轻轻摇曳，晨光穿过松针洒下斑驳微光，耳畔阵阵低沉松涛呼啸复归平静。",
    culturalNote:
      "古人听松风以洗俗尘；平稳舒缓的风声频谱有助于屏蔽周围环境杂音，专心休息。",
    primaryImage: medNaturePineWindImg,
    fallbackGradient: "from-[#21362c] via-[#192821] to-[#101814]",
    animationConfig: { effects: ["pine", "sunlight", "clouds", "motes"], mistDensity: "light" },
    audioConfig: {
      defaultSound: "pine",
      allowedSounds: ["pine", "wind", "birds"],
      bellType: "none",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: true,
      defaultMode: "slow",
      defaultVisual: "orb",
    },
    featureConfig: { mode: "standard" },
  },
  {
    sceneId: "retreat-nature-lake",
    sceneName: "湖畔静坐",
    subtitle: "明镜平湖 · 岸边微澜",
    category: "nature",
    categoryLabel: "自然静修",
    description:
      "傍晚微光中的高山湖畔安静如镜，岸边几圈细微涟漪荡开，天光倒影缓缓变化，伴随轻缓湖水拍岸声，照见内心平和。",
    culturalNote:
      "自然风光静修不强加任何念诵或观想内容，只需如实安静坐在水边呼吸片刻。",
    primaryImage: medNatureLakeImg,
    fallbackGradient: "from-[#2b3042] via-[#202636] to-[#121620]",
    animationConfig: { effects: ["ripples", "sunlight", "clouds"], mistDensity: "light" },
    audioConfig: {
      defaultSound: "lake",
      allowedSounds: ["lake", "wind", "birds"],
      bellType: "none",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: true,
      defaultMode: "deep",
      defaultVisual: "halo",
    },
    featureConfig: { mode: "standard" },
  },
  {
    sceneId: "retreat-nature-cloud-view",
    sceneName: "云海观景",
    subtitle: "高远山巅 · 无垠云涛",
    category: "nature",
    categoryLabel: "自然静修",
    description:
      "纯自然视野的高山之巅，没有任何人工建筑或人物打扰，远方群青峰峦在雪白翻涌云海间沉默矗立，开阔眼界与胸怀。",
    culturalNote:
      "当注意力从狭小屏幕回到辽阔天际线与云层缓慢变幻，往往能迅速缓解长久紧盯工作造成的疲惫。",
    primaryImage: medNatureCloudViewImg,
    fallbackGradient: "from-[#2e3b48] via-[#222d38] to-[#141a21]",
    animationConfig: { effects: ["clouds", "sunlight"], mistDensity: "rich" },
    audioConfig: {
      defaultSound: "wind",
      allowedSounds: ["wind", "pine", "lake"],
      bellType: "none",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: true,
      defaultMode: "deep",
      defaultVisual: "cloud",
    },
    featureConfig: { mode: "standard" },
  },
  {
    sceneId: "retreat-nature-starlight",
    sceneName: "星空静心",
    subtitle: "深夜微星 · 静谧夜色",
    category: "nature",
    categoryLabel: "自然静修",
    description:
      "远离城市霓虹的深邃夜空，星点温和闪烁，银河微光与湖面星影上下呼应，在极轻缓的夜色声景中放下白日思虑。",
    culturalNote:
      "适合睡前静心、夜间安神放松，或深夜独处时让自己重新找回安静节律。",
    primaryImage: medNatureStarlightImg,
    fallbackGradient: "from-[#131b31] via-[#0e1526] to-[#080c17]",
    animationConfig: { effects: ["stars", "ripples", "motes"], mistDensity: "light" },
    audioConfig: {
      defaultSound: "night",
      allowedSounds: ["night", "lake", "rain"],
      bellType: "none",
    },
    breathingConfig: {
      supported: true,
      defaultEnabled: true,
      defaultMode: "deep",
      defaultVisual: "orb",
    },
    featureConfig: { mode: "standard" },
  },
];

export function getRetreatSceneById(sceneId: string): RetreatSceneConfig | undefined {
  return RETREAT_SCENES.find((s) => s.sceneId === sceneId);
}

export function getRetreatScenesByRealm(realm: RetreatRealmId): RetreatSceneConfig[] {
  return RETREAT_SCENES.filter((s) => s.category === realm);
}

export type AudioLibraryCategory = "buddhist" | "daoist" | "nature";

export const RETREAT_AUDIO_CATALOG: {
  id: NatureSoundType;
  label: string;
  category: AudioLibraryCategory;
  desc: string;
}[] = [
  // 佛教氛围声音
  { id: "temple", label: "佛殿禅堂清境", category: "buddhist", desc: "柔和禅堂空气感与低微清韵" },
  // 道教氛围声音
  { id: "daoist", label: "道观仙山清风", category: "daoist", desc: "古观高崖疏朗柔和风声" },
  // 自然静修声音
  { id: "stream", label: "山间清泉流水", category: "nature", desc: "溪涧卵石清冽流水" },
  { id: "bamboo-rain", label: "雨落竹林清音", category: "nature", desc: "细雨轻叩翠竹叶间" },
  { id: "rain", label: "檐下绵密细雨", category: "nature", desc: "均匀柔和的日常雨声" },
  { id: "pine", label: "深山万壑松涛", category: "nature", desc: "古松林间沉稳自然风声" },
  { id: "wind", label: "高山清风长啸", category: "nature", desc: "云海山脊舒缓清风" },
  { id: "lake", label: "平湖浅岸微澜", category: "nature", desc: "静水轻拍湖石之声" },
  { id: "birds", label: "晨林清脆鸟鸣", category: "nature", desc: "拂晓山林间歇轻啼" },
  { id: "night", label: "深夜星夜静谧", category: "nature", desc: "低频夜色与微光轻韵" },
];

export const RETREAT_BELL_LABELS: Record<RetreatBellType, string> = {
  "qing-bell": "佛殿清磬",
  "temple-bell": "古刹钟声",
  "singing-bowl": "静心颂钵",
  "jade-chime": "道观玉磬",
  none: "无结束钟声",
};

export const NIANFO_PHRASES = [
  {
    id: "amitabha",
    text: "南无阿弥陀佛",
    meaning: "汉传净土传统圣号，意为“归依无量光明与无量寿命”，助行者放下纷扰、心归清净。",
  },
  {
    id: "guanyin",
    text: "南无观世音菩萨",
    meaning: "观照世间音声、生起柔和慈悲与不慌不乱的观照力。",
  },
  {
    id: "shakyamuni",
    text: "南无本师释迦牟尼佛",
    meaning: "忆念佛教创立者觉悟与平静示范，收摄散心、端正仪态。",
  },
  {
    id: "dizang",
    text: "南无地藏王菩萨",
    meaning: "感念父母师长恩德，培养稳重、担当与耐心。",
  },
  {
    id: "heart-verse",
    text: "观自在菩萨 · 照见五蕴皆空",
    meaning: "节选自唐玄奘译《般若波罗蜜多心经》首句，提示觉察自身念头而不随焦虑流转。",
  },
];

export const DAOIST_RETREAT_CULTURE = {
  title: "道境静修文化脉络",
  paragraphs: [
    "道教静修讲究“致虚极，守静笃”与“道法自然”，并非刻意憋气或追逐神秘异象，而是借自然山水、松柏风声与缓慢调息，使浮躁的心绪逐步恢复沉静清明。",
    "在传统体系中，佛教静修与道教静修各有独立典籍与礼制：道境以道观庭院、自然山林、云海吐纳与太极阴阳意境为特色；现代数字静修则保留其中平和松弛的智慧，不制造功利或玄虚承诺。",
  ],
};

export const DURATION_PRESETS = [5, 10, 15, 20, 30, 60] as const;
