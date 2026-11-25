import homeDualSanctuaryImg from "@/assets/images/home_dual_sanctuary_1795548698138.jpg";
import buddhistCloudGateImg from "@/assets/images/buddhist_cloud_gate_1795549705966.jpg";
import daxiongFrontExteriorImg from "@/assets/images/daxiong_front_exterior_1795627359651.jpg";
import daxiongFrontInteriorImg from "@/assets/images/daxiong_altar_v2_1795630776095.jpg";
import buddhistMainHallImg from "@/assets/images/buddhist_main_hall_1795548698936.jpg";
import guanyinFrontExteriorImg from "@/assets/images/guanyin_front_exterior_1795627360318.jpg";
import guanyinFrontInteriorImg from "@/assets/images/guanyin_altar_v2_1795630777155.jpg";
import dizangFrontExteriorImg from "@/assets/images/dizang_front_exterior_1795627361982.jpg";
import buddhistDizangHallImg from "@/assets/images/dizang_altar_v2_1795630778075.jpg";
import buddhistPurelandLotusImg from "@/assets/images/buddhist_pureland_lotus_1795549669802.jpg";
import purelandFrontInteriorImg from "@/assets/images/pureland_altar_v2_1795630778845.jpg";
import buddhistCultureLibraryImg from "@/assets/images/culture_altar_interior_1795630248619.jpg";
import daoistSanqingMountainImg from "@/assets/images/daoist_sanqing_mountain_1795548699503.jpg";
import daoistCultureCourtyardImg from "@/assets/images/daoist_culture_courtyard_1795549688866.jpg";
import sanqingFrontExteriorImg from "@/assets/images/sanqing_front_exterior_1795627363920.jpg";
import daoistSanqingInteriorImg from "@/assets/images/daoist_sanqing_interior_1795549687826.jpg";
import yuhuangFrontExteriorImg from "@/assets/images/yuhuang_front_exterior_1795627363885.jpg";
import yuhuangFrontInteriorImg from "@/assets/images/yuhuang_front_interior_1795627386805.jpg";
import daoistLaojunSanctuaryImg from "@/assets/images/daoist_laojun_sanctuary_1795549688966.jpg";
import laojunFrontInteriorImg from "@/assets/images/laojun_front_interior_1795627365413.jpg";
import daoistDaozangStudyImg from "@/assets/images/daoist_daozang_study_1795549706296.jpg";
import meditationBambooWaterImg from "@/assets/images/meditation_bamboo_water_1795548700079.jpg";
import type { NatureSoundType } from "@/lib/audio";

export type SceneReligionType = "buddhist" | "daoist" | "shared";

export type SceneInteractionConfig = {
  enableWorship: boolean;
  enableGongShou: boolean;
  enableWoodfish: boolean;
  enableWish: boolean;
  allowIncense: boolean;
  allowLamp: boolean;
  allowFlower: boolean;
};

export type SceneAudioConfig = {
  natureType: NatureSoundType;
  natureLabel: string;
  entryChime: "temple-bell" | "singing-bowl" | "jade-chime" | "none";
};

export type SceneConfig = {
  sceneId: string;
  sceneName: string;
  subtitle: string;
  religionType: SceneReligionType;
  hasInterior: boolean;
  exteriorImage: string;
  mainImage: string;
  backgroundImage: string;
  description: string;
  culturalNotes: string;
  traditionPractice: string;
  linkedBuildingId?: string;
  interactionConfig: SceneInteractionConfig;
  audioConfig: SceneAudioConfig;
};

export const sceneImages = {
  homeHero: homeDualSanctuaryImg,
  buddhistGate: buddhistCloudGateImg,
  buddhistMainHall: daxiongFrontExteriorImg,
  buddhistMainInterior: daxiongFrontInteriorImg,
  buddhistGuanyinHall: guanyinFrontExteriorImg,
  buddhistGuanyinInterior: guanyinFrontInteriorImg,
  buddhistDizangHall: dizangFrontExteriorImg,
  buddhistDizangInterior: buddhistDizangHallImg,
  buddhistPureland: purelandFrontInteriorImg,
  buddhistCulture: buddhistCultureLibraryImg,
  daoistMountain: daoistSanqingMountainImg,
  daoistGate: daoistCultureCourtyardImg,
  daoistSanqingExterior: sanqingFrontExteriorImg,
  daoistSanqingInterior: daoistSanqingInteriorImg,
  daoistYuhuangPavilion: yuhuangFrontExteriorImg,
  daoistYuhuangInterior: yuhuangFrontInteriorImg,
  daoistLaojunSanctuary: daoistLaojunSanctuaryImg,
  daoistLaojunInterior: laojunFrontInteriorImg,
  daoistCultureStudy: daoistDaozangStudyImg,
  meditationSanctuary: meditationBambooWaterImg,
};

export const BUDDHIST_GATE_SCENE: SceneConfig = {
  sceneId: "buddhist-gate",
  sceneName: "云上山门",
  subtitle: "佛教梵境 · 伽蓝清净入口",
  religionType: "buddhist",
  hasInterior: false,
  exteriorImage: buddhistCloudGateImg,
  mainImage: buddhistCloudGateImg,
  backgroundImage: buddhistCloudGateImg,
  description:
    "山门之外是喧嚣尘世，山门之内是伽蓝清净。整肃衣冠，缓步踏入云上山门，依次瞻礼大雄宝殿、观音殿、地藏殿与净土莲坛。",
  culturalNotes:
    "汉传佛教寺院常依山势建三门牌坊或重檐山门，分别象征空、无相、无愿三解脱门，是入寺收摄心念的第一重礼仪边界。",
  traditionPractice:
    "山门外不设香烛供养互动，入殿之后方行合掌礼敬。",
  interactionConfig: {
    enableWorship: false,
    enableGongShou: false,
    enableWoodfish: false,
    enableWish: false,
    allowIncense: false,
    allowLamp: false,
    allowFlower: false,
  },
  audioConfig: {
    natureType: "wind",
    natureLabel: "山门松风",
    entryChime: "temple-bell",
  },
};

export const BUDDHIST_SCENES: SceneConfig[] = [
  {
    sceneId: "buddhist-daxiong",
    sceneName: "大雄宝殿",
    subtitle: "寺院核心礼佛主殿 · 释迦牟尼佛",
    religionType: "buddhist",
    hasInterior: true,
    exteriorImage: daxiongFrontExteriorImg,
    mainImage: daxiongFrontInteriorImg,
    backgroundImage: buddhistMainHallImg,
    linkedBuildingId: "buddhist-daxiong-baodian",
    description:
      "大雄宝殿是汉传佛教寺院的中心主殿。“大雄”喻指佛陀具足大智、大勇与大悲，能够降伏烦恼。殿内正中奉释迦牟尼佛金身莲座像，巍峨庄严。",
    culturalNotes:
      "传统大雄宝殿采取中轴对称布局、重檐庑殿或歇山顶木构，白石月台前设铜鼎香炉；步入殿内可见红柱列阵、佛光朗照。",
    traditionPractice:
      "先于殿外瞻仰建筑气象，步入殿内后再至诚合掌、礼佛、敬香、供灯、供花与叩木鱼诵经。",
    interactionConfig: {
      enableWorship: true,
      enableGongShou: false,
      enableWoodfish: true,
      enableWish: true,
      allowIncense: true,
      allowLamp: true,
      allowFlower: true,
    },
    audioConfig: {
      natureType: "wind",
      natureLabel: "古刹晨风",
      entryChime: "singing-bowl",
    },
  },
  {
    sceneId: "buddhist-guanyin",
    sceneName: "观音殿",
    subtitle: "大悲观照 · 观世音菩萨殿堂",
    religionType: "buddhist",
    hasInterior: true,
    exteriorImage: guanyinFrontExteriorImg,
    mainImage: guanyinFrontInteriorImg,
    backgroundImage: guanyinFrontExteriorImg,
    linkedBuildingId: "buddhist-guanyin-dian",
    description:
      "观世音菩萨象征佛教“无缘大慈，同体大悲”的精神。殿内正中供奉手持净瓶与杨柳枝的观音菩萨金像，慈容柔和端庄。",
    culturalNotes:
      "观音殿飞檐舒展，窗棂晨光洒入殿心。在中国寺院建筑中往往紧邻主轴或单独成院，寓意在日常困顿中闻声观照、内心安稳。",
    traditionPractice:
      "步入观音殿内后，可献清莲一枝、点亮心灯，或静心诵读《心经》中“观自在菩萨”一节。",
    interactionConfig: {
      enableWorship: true,
      enableGongShou: false,
      enableWoodfish: true,
      enableWish: true,
      allowIncense: true,
      allowLamp: true,
      allowFlower: true,
    },
    audioConfig: {
      natureType: "stream",
      natureLabel: "净瓶清泉",
      entryChime: "singing-bowl",
    },
  },
  {
    sceneId: "buddhist-dizang",
    sceneName: "地藏殿",
    subtitle: "孝亲报恩 · 地藏菩萨肃穆空间",
    religionType: "buddhist",
    hasInterior: true,
    exteriorImage: dizangFrontExteriorImg,
    mainImage: buddhistDizangHallImg,
    backgroundImage: dizangFrontExteriorImg,
    linkedBuildingId: "buddhist-dizang-dian",
    description:
      "地藏菩萨头戴五佛冠、手持锡杖与摩尼宝珠，以“众生度尽，方证菩提”的深宏誓愿闻名，在汉传佛教文化中亦被视为“孝道”与“担当”的精神象征。",
    culturalNotes:
      "古松掩映下的地藏殿木构深沉肃穆，正门拾级而上可见正中庄严造像与长明烛火，常伴随追思先祖、报答亲恩的传统。",
    traditionPractice:
      "步入殿内感念父母师长恩德，点灯敬香、起一念善愿与担当，以平常善行回向亲友平安。",
    interactionConfig: {
      enableWorship: true,
      enableGongShou: false,
      enableWoodfish: true,
      enableWish: true,
      allowIncense: true,
      allowLamp: true,
      allowFlower: true,
    },
    audioConfig: {
      natureType: "rain",
      natureLabel: "禅院细雨",
      entryChime: "temple-bell",
    },
  },
  {
    sceneId: "buddhist-pureland",
    sceneName: "阿弥陀佛净土空间",
    subtitle: "清净莲池 · 念佛安住圣境",
    religionType: "buddhist",
    hasInterior: true,
    exteriorImage: buddhistPurelandLotusImg,
    mainImage: purelandFrontInteriorImg,
    backgroundImage: buddhistPurelandLotusImg,
    description:
      "净土文化以《佛说阿弥陀经》及莲池清净意象为核心，七宝池水波光潋滟、莲华静放，引导行者在专一念佛与觉照中远离散乱焦虑。",
    culturalNotes:
      "中轴石桥跨莲池直通莲坛主殿，正面仰望阿弥陀佛金色宝像，“七宝池、八功德水”寓意清净、温和、平等与光明。",
    traditionPractice:
      "步入莲坛之内，配合木鱼节拍或供一枝清莲，专心诵念经典，体验片刻心无杂念的安详。",
    interactionConfig: {
      enableWorship: true,
      enableGongShou: false,
      enableWoodfish: true,
      enableWish: true,
      allowIncense: false,
      allowLamp: true,
      allowFlower: true,
    },
    audioConfig: {
      natureType: "stream",
      natureLabel: "莲池清波",
      entryChime: "singing-bowl",
    },
  },
  {
    sceneId: "buddhist-culture",
    sceneName: "佛教文化展示空间",
    subtitle: "藏经阁 · 佛经翻译与禅修脉络",
    religionType: "buddhist",
    hasInterior: true,
    exteriorImage: buddhistCloudGateImg,
    mainImage: buddhistCultureLibraryImg,
    backgroundImage: buddhistCultureLibraryImg,
    linkedBuildingId: "buddhist-cangjing-ge",
    description:
      "步入幽静古朴的藏经阁木构空间，整架线装经卷沉静陈列。此处系统梳理汉传佛教从东汉传入、魏晋至隋唐的译经史、石窟艺术与寺院营造文化。",
    culturalNotes:
      "汉传佛教经典体系浩瀚，《大藏经》保存了数千卷汉译典籍；寺院“晨钟暮鼓”的作息制度则深刻影响了中国传统文人审美与日常生活。",
    traditionPractice:
      "入阁后可静立一香、轻叩木鱼或品读经卷摘要，循历史脉络认识东方佛学。",
    interactionConfig: {
      enableWorship: false,
      enableGongShou: false,
      enableWoodfish: true,
      enableWish: true,
      allowIncense: true,
      allowLamp: false,
      allowFlower: false,
    },
    audioConfig: {
      natureType: "birds",
      natureLabel: "藏经阁晨鸟",
      entryChime: "none",
    },
  },
];

export const DAOIST_MOUNTAIN_SCENE: SceneConfig = {
  sceneId: "daoist-mountain",
  sceneName: "道教仙山入口",
  subtitle: "道教仙境 · 云海峰峦圣地",
  religionType: "daoist",
  hasInterior: false,
  exteriorImage: daoistSanqingMountainImg,
  mainImage: daoistSanqingMountainImg,
  backgroundImage: daoistSanqingMountainImg,
  description:
    "道教宫观多依名山林壑而建，顺应山川气象。立于仙山云海之畔，远观峰巅青瓦飞檐，步入三清殿、玉皇殿、太上老君殿与道藏阁。",
  culturalNotes:
    "中国道教名山如武当山、青城山、龙虎山皆讲究“天人合一、道法自然”，建筑随山势起伏，与松柏云雾融为一体。",
  traditionPractice:
    "山门远眺不作殿内礼仪，进入殿堂之后方行拱手致敬。",
  interactionConfig: {
    enableWorship: false,
    enableGongShou: false,
    enableWoodfish: false,
    enableWish: false,
    allowIncense: false,
    allowLamp: false,
    allowFlower: false,
  },
  audioConfig: {
    natureType: "wind",
    natureLabel: "仙山松涛",
    entryChime: "jade-chime",
  },
};

export const DAOIST_SCENES: SceneConfig[] = [
  {
    sceneId: "daoist-sanqing",
    sceneName: "三清殿",
    subtitle: "道教最高主殿 · 三清尊神",
    religionType: "daoist",
    hasInterior: true,
    exteriorImage: sanqingFrontExteriorImg,
    mainImage: daoistSanqingInteriorImg,
    backgroundImage: sanqingFrontExteriorImg,
    linkedBuildingId: "daoist-sanqing-dian",
    description:
      "三清殿是道教宫观的最高主殿，翠绿琉璃重檐飞拱矗立于白石太极月台之上；殿内正中奉玉清元始天尊、上清灵宝天尊、太清道德天尊三清圣像。",
    culturalNotes:
      "三清象征“道生一，一生二，二生三，三生万物”的宇宙演化本源；殿外太极丹墀与殿内藻井八卦纹饰共同体现“法天象地”的宫观礼制。",
    traditionPractice:
      "先在殿外瞻仰宫观气势，步入三清殿内后再行道教传统拱手礼（左手抱右手）、清香静思或静诵道经。",
    interactionConfig: {
      enableWorship: false,
      enableGongShou: true,
      enableWoodfish: false,
      enableWish: true,
      allowIncense: false,
      allowLamp: false,
      allowFlower: false,
    },
    audioConfig: {
      natureType: "wind",
      natureLabel: "殿前清风",
      entryChime: "jade-chime",
    },
  },
  {
    sceneId: "daoist-yuhuang",
    sceneName: "玉皇殿",
    subtitle: "穹苍云海 · 峰顶玉皇阁",
    religionType: "daoist",
    hasInterior: true,
    exteriorImage: yuhuangFrontExteriorImg,
    mainImage: yuhuangFrontInteriorImg,
    backgroundImage: yuhuangFrontExteriorImg,
    linkedBuildingId: "daoist-yuhuang-dian",
    description:
      "玉皇殿建于千仞绝顶与云海之上，翠瓦金脊对称端方，白石台阶直通朱门；殿内正中玉皇大帝御坐金龙屏风之前，庄严恢宏。",
    culturalNotes:
      "如武当山金顶、泰山玉皇顶等名山玉皇殿皆临云海而立，正面仰望尽显高远疏朗之气象。",
    traditionPractice:
      "观览绝顶宫阙外观后，步入玉皇殿内行拱手致敬，体会“仰观宇宙之大”的开阔胸襟。",
    interactionConfig: {
      enableWorship: false,
      enableGongShou: true,
      enableWoodfish: false,
      enableWish: true,
      allowIncense: false,
      allowLamp: false,
      allowFlower: false,
    },
    audioConfig: {
      natureType: "wind",
      natureLabel: "绝顶长风",
      entryChime: "jade-chime",
    },
  },
  {
    sceneId: "daoist-laojun",
    sceneName: "太上老君殿",
    subtitle: "古柏竹简 · 老子道德思想",
    religionType: "daoist",
    hasInterior: true,
    exteriorImage: daoistLaojunSanctuaryImg,
    mainImage: laojunFrontInteriorImg,
    backgroundImage: daoistLaojunSanctuaryImg,
    linkedBuildingId: "daoist-zushi-dian",
    description:
      "古柏幽庭映衬之下，老君殿古朴宁静。步入殿内正面可见老子铜像安详端坐，案前陈列《道德经》竹简卷册与青铜清炉。",
    culturalNotes:
      "老子著《道德经》五千言，确立“道法自然”“上善若水”的哲学基石，是中华人文精神的重要源头。",
    traditionPractice:
      "入殿行礼静思，体悟在繁杂生活中做减法、守静笃定之道。",
    interactionConfig: {
      enableWorship: false,
      enableGongShou: true,
      enableWoodfish: false,
      enableWish: true,
      allowIncense: false,
      allowLamp: false,
      allowFlower: false,
    },
    audioConfig: {
      natureType: "birds",
      natureLabel: "古柏林鸟",
      entryChime: "jade-chime",
    },
  },
  {
    sceneId: "daoist-gate",
    sceneName: "道观山门",
    subtitle: "青瓦牌坊 · 太极青石庭院",
    religionType: "daoist",
    hasInterior: false,
    exteriorImage: daoistCultureCourtyardImg,
    mainImage: daoistCultureCourtyardImg,
    backgroundImage: daoistCultureCourtyardImg,
    linkedBuildingId: "daoist-shanmen",
    description:
      "穿过苍松掩映的青瓦牌坊山门，脚下为素雅石砌太极庭院，两侧八角宫灯微光温润。道观山门连接尘世与仙山清境。",
    culturalNotes:
      "道观山门及棂星门依山势石阶拾级而上，讲究左右对称与阴阳平衡。",
    traditionPractice:
      "此处为宫观室外庭院与入口气象展示，敬礼互动请步入三清殿等正殿内进行。",
    interactionConfig: {
      enableWorship: false,
      enableGongShou: false,
      enableWoodfish: false,
      enableWish: false,
      allowIncense: false,
      allowLamp: false,
      allowFlower: false,
    },
    audioConfig: {
      natureType: "wind",
      natureLabel: "山门松风",
      entryChime: "jade-chime",
    },
  },
  {
    sceneId: "daoist-culture",
    sceneName: "道藏阁",
    subtitle: "典籍陈列 · 自然养生智慧",
    religionType: "daoist",
    hasInterior: true,
    exteriorImage: sanqingFrontExteriorImg,
    mainImage: daoistDaozangStudyImg,
    backgroundImage: daoistDaozangStudyImg,
    linkedBuildingId: "daoist-daozang-ge",
    description:
      "窗外翠竹云峰相映，阁内书架卷帙浩繁。集中介绍道教独有的“三洞四辅”《正统道藏》文献分类、宫观山水营造与四时静修智慧。",
    culturalNotes:
      "道教礼仪严明而重自然，与佛教礼仪各自独立传承：拱手抱拳、清香礼敬、诵读道经，皆讲求内清外静。",
    traditionPractice:
      "步入道藏阁内可静诵道经或记录清思感悟，亦可聆听竹院清泉调息。",
    interactionConfig: {
      enableWorship: false,
      enableGongShou: true,
      enableWoodfish: false,
      enableWish: true,
      allowIncense: false,
      allowLamp: false,
      allowFlower: false,
    },
    audioConfig: {
      natureType: "stream",
      natureLabel: "竹院清泉",
      entryChime: "none",
    },
  },
];

export const ALL_SCENES_BY_ID: Record<string, SceneConfig> = Object.fromEntries(
  [
    BUDDHIST_GATE_SCENE,
    ...BUDDHIST_SCENES,
    DAOIST_MOUNTAIN_SCENE,
    ...DAOIST_SCENES,
  ].map((s) => [s.sceneId, s]),
);

const BUILDING_TO_SCENE_IMAGE: Record<string, string> = {
  "buddhist-tianwang-dian": buddhistCloudGateImg,
  "buddhist-daxiong-baodian": daxiongFrontExteriorImg,
  "buddhist-guanyin-dian": guanyinFrontExteriorImg,
  "buddhist-dizang-dian": dizangFrontExteriorImg,
  "buddhist-cangjing-ge": buddhistCultureLibraryImg,
  "buddhist-chanxiu-tang": meditationBambooWaterImg,
  "daoist-shanmen": daoistCultureCourtyardImg,
  "daoist-sanqing-dian": sanqingFrontExteriorImg,
  "daoist-yuhuang-dian": yuhuangFrontExteriorImg,
  "daoist-zushi-dian": daoistLaojunSanctuaryImg,
  "daoist-daozang-ge": daoistDaozangStudyImg,
  "daoist-jingxiu-tang": meditationBambooWaterImg,
};

export function getSceneById(sceneId: string): SceneConfig | undefined {
  return ALL_SCENES_BY_ID[sceneId];
}

export function getSceneByBuildingId(
  buildingId: string,
): { sceneId: string; religionType: "buddhist" | "daoist" } | undefined {
  const bMatch = BUDDHIST_SCENES.find((s) => s.linkedBuildingId === buildingId);
  if (bMatch) {
    return { sceneId: bMatch.sceneId, religionType: "buddhist" };
  }
  const dMatch = DAOIST_SCENES.find((s) => s.linkedBuildingId === buildingId);
  if (dMatch) {
    return { sceneId: dMatch.sceneId, religionType: "daoist" };
  }
  return undefined;
}

export function getBuildingDedicatedImage(
  buildingId: string,
  parkSlug: string,
  fallbackParkImage: string,
): string {
  if (BUILDING_TO_SCENE_IMAGE[buildingId]) {
    return BUILDING_TO_SCENE_IMAGE[buildingId];
  }
  if (parkSlug === "buddhist") return daxiongFrontExteriorImg;
  if (parkSlug === "daoist") return sanqingFrontExteriorImg;
  return fallbackParkImage;
}
