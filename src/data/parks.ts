export type ParkSlug = "buddhist" | "daoist" | "culture";

export type CultureIcon =
  | "home"
  | "book-open"
  | "circle"
  | "columns"
  | "wind"
  | "sun"
  | "message-circle"
  | "book"
  | "edit-3"
  | "users"
  | "heart"
  | "star"
  | "award"
  | "music"
  | "sunrise"
  | "user"
  | "compass"
  | "layers";

export type ParkCategory = {
  id: string;
  title: string;
  description: string;
  icon: CultureIcon;
};

export type CulturalPark = {
  slug: ParkSlug;
  title: string;
  englishTitle: string;
  identity: string;
  introduction: string;
  image: string;
  categories: ParkCategory[];
};

export type ParkBuilding = {
  id: string;
  parkSlug: ParkSlug;
  title: string;
  subtitle: string;
  description: string;
  scene: string;
  categoryIds: string[];
  icon: CultureIcon;
};

export type Scripture = {
  id: string;
  title: string;
  tradition: string;
  parkSlug: ParkSlug;
  description: string;
  excerpt: string;
  fullText: string;
  icon: CultureIcon;
};

export type Gathering = {
  id: string;
  day: string;
  time: string;
  title: string;
  description: string;
  icon: CultureIcon;
};

export type ChantingTrack = {
  id: string;
  title: string;
  parkSlug: ParkSlug;
  scriptureId: string;
  durationLabel: string;
  audioUrl: string;
};

export type Place = {
  slug: ParkSlug;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: CultureIcon;
  highlights: string[];
};

export const defaultParks: Record<ParkSlug, CulturalPark> = {
  buddhist: {
    slug: "buddhist",
    title: "佛教寺院",
    englishTitle: "Buddhist Monasteries",
    identity: "佛教文化园区",
    introduction:
      "以佛教寺院空间为主线，介绍殿堂建筑、佛教经典与禅修文化。园区内容聚焦佛教传统，不与其他园区的信仰内容混列。",
    image: "/images/buddhist-temple.png",
    categories: [
      {
        id: "buddhist-architecture",
        title: "寺院建筑",
        description: "山门、殿堂与藏经空间",
        icon: "home",
      },
      {
        id: "buddhist-scriptures",
        title: "佛教经典",
        description: "经典文化与阅读导览",
        icon: "book-open",
      },
      {
        id: "buddhist-practice",
        title: "礼佛与禅修",
        description: "礼仪传统与静心修习",
        icon: "circle",
      },
    ],
  },
  daoist: {
    slug: "daoist",
    title: "道教宫观",
    englishTitle: "Daoist Temples",
    identity: "道教文化园区",
    introduction:
      "围绕道教宫观、道家思想与传统修习展开，呈现山门、殿宇及道藏空间的文化脉络。此园区内容独立呈现道教传统。",
    image: "/images/daoist-temple.png",
    categories: [
      {
        id: "daoist-architecture",
        title: "宫观建筑",
        description: "山门、殿宇与观宇格局",
        icon: "columns",
      },
      {
        id: "daoist-thought",
        title: "道家思想",
        description: "人与自然的东方思考",
        icon: "wind",
      },
      {
        id: "daoist-scriptures",
        title: "道藏典籍",
        description: "道教经典与典藏文化",
        icon: "book-open",
      },
      {
        id: "daoist-practice",
        title: "修习文化",
        description: "静修空间与日常传统",
        icon: "sun",
      },
    ],
  },
  culture: {
    slug: "culture",
    title: "中华传统文化馆",
    englishTitle: "Chinese Heritage Pavilion",
    identity: "中华传统文化园区",
    introduction:
      "通过儒学、国学、书画、礼仪与节气文化，探索中华传统文化的多种表达。展馆内容以人文、艺术与生活传统为主。",
    image: "/images/culture-hall.png",
    categories: [
      {
        id: "culture-confucian",
        title: "儒学思想",
        description: "修身、处世与传统思想",
        icon: "message-circle",
      },
      {
        id: "culture-classics",
        title: "国学典籍",
        description: "传统典籍与阅读脉络",
        icon: "book",
      },
      {
        id: "culture-art",
        title: "书画艺术",
        description: "笔墨、书法与绘画",
        icon: "edit-3",
      },
      {
        id: "culture-ritual",
        title: "礼仪传统",
        description: "礼仪、节俗与生活文化",
        icon: "users",
      },
      {
        id: "culture-seasons",
        title: "节气民俗",
        description: "时令、节气与民间风俗",
        icon: "sun",
      },
    ],
  },
};

export const defaultBuildings: ParkBuilding[] = [
  {
    id: "buddhist-tianwang-dian",
    parkSlug: "buddhist",
    title: "天王殿",
    subtitle: "寺院入口殿堂",
    description:
      "天王殿通常位于寺院入口附近，是认识寺院空间秩序的重要起点。殿前多接山门广场，殿后衔接庭院与大雄宝殿，体现中轴对称的传统伽蓝七堂格局。",
    scene:
      "从山门进入后，沿中轴线步入殿前庭院，感受檐下木构斗拱的稳重比例，了解入口空间与寺院礼仪之间的联系。",
    categoryIds: ["buddhist-architecture", "buddhist-practice"],
    icon: "home",
  },
  {
    id: "buddhist-daxiong-baodian",
    parkSlug: "buddhist",
    title: "大雄宝殿",
    subtitle: "寺院主要殿堂",
    description:
      "大雄宝殿是整座寺院的核心礼仪殿堂，体量最为庄严宏阔，也是了解佛教礼仪、殿堂彩画与传统木构大木作技艺的核心空间。",
    scene:
      "观察殿堂的中轴布局、重檐歇山屋顶结构与殿前月台，认识其在寺院整体格局中的核心位置。",
    categoryIds: [
      "buddhist-architecture",
      "buddhist-scriptures",
      "buddhist-practice",
    ],
    icon: "columns",
  },
  {
    id: "buddhist-guanyin-dian",
    parkSlug: "buddhist",
    title: "观音殿",
    subtitle: "观音信仰文化空间",
    description:
      "观音殿以观音信仰及相关文化为主题，展现慈悲济世理念在佛教造像艺术、壁画与民间文化中的温润表达。",
    scene:
      "在安静庄重的殿堂场景中，细观造像衣纹与藻井装饰，了解观音文化与礼佛传统。",
    categoryIds: ["buddhist-architecture", "buddhist-practice"],
    icon: "heart",
  },
  {
    id: "buddhist-dizang-dian",
    parkSlug: "buddhist",
    title: "地藏殿",
    subtitle: "地藏信仰文化空间",
    description:
      "地藏殿介绍地藏孝亲与悲愿精神在佛教文化中的象征意义，常设于主殿侧翼，氛围清幽肃穆，内容与其他园区清晰区分。",
    scene:
      "通过殿堂布局与主题介绍，了解地藏信仰、相关典籍及寺院中的人文关怀表达。",
    categoryIds: ["buddhist-architecture", "buddhist-practice"],
    icon: "sun",
  },
  {
    id: "buddhist-cangjing-ge",
    parkSlug: "buddhist",
    title: "藏经阁",
    subtitle: "佛教典籍收藏空间",
    description:
      "藏经阁多位于寺院中轴线最深处的高台或楼阁之中，防潮通风，专门用于珍藏、整理与研读大藏经等佛教经卷。",
    scene:
      "走近典籍陈列与经橱藏书空间，了解线装经折装的保存方式及寺院阅藏传统。",
    categoryIds: ["buddhist-architecture", "buddhist-scriptures"],
    icon: "book-open",
  },
  {
    id: "buddhist-chanxiu-tang",
    parkSlug: "buddhist",
    title: "禅修堂",
    subtitle: "禅修与静心空间",
    description:
      "禅修堂亦称禅堂，空间陈设极简素雅，光线柔和，旨在帮助行者收摄身心、体验止观静坐的佛教日常修习文化。",
    scene:
      "在简洁宁静的堂内空间中，认识禅床排列、香板仪轨与一呼一吸间的正念文化。",
    categoryIds: ["buddhist-architecture", "buddhist-practice"],
    icon: "circle",
  },
  {
    id: "daoist-shanmen",
    parkSlug: "daoist",
    title: "山门",
    subtitle: "宫观入口与空间起点",
    description:
      "山门是道教宫观的重要入口，往往依山势而筑，连接林壑云雾与宫观建筑群落，象征由尘世步入清幽仙境的过渡。",
    scene:
      "由山门石阶拾级而上，沿院落与轴线观察建筑如何顺应山川地势、融入自然。",
    categoryIds: ["daoist-architecture"],
    icon: "home",
  },
  {
    id: "daoist-sanqing-dian",
    parkSlug: "daoist",
    title: "三清殿",
    subtitle: "道教重要殿堂",
    description:
      "三清殿是道教宫观的最高主殿，围绕道教“道生一，一生二，二生三”的宇宙观构建，呈现宫观礼仪与殿宇艺术的精华。",
    scene:
      "仰观殿宇飞檐与脊饰瑞兽，了解殿堂格局、道教神系文化与斋醮仪式传统。",
    categoryIds: ["daoist-architecture", "daoist-thought", "daoist-practice"],
    icon: "sun",
  },
  {
    id: "daoist-yuhuang-dian",
    parkSlug: "daoist",
    title: "玉皇殿",
    subtitle: "玉皇信仰文化空间",
    description:
      "玉皇殿多建于宫观高台之上，空间开阔疏朗，介绍玉皇信仰在道教宫观与中华传统岁时民俗中的深厚文化表达。",
    scene:
      "立于殿前石栏远眺群山，通过殿堂空间与碑刻故事认识道教文化的多层次面貌。",
    categoryIds: ["daoist-architecture", "daoist-thought"],
    icon: "star",
  },
  {
    id: "daoist-zushi-dian",
    parkSlug: "daoist",
    title: "祖师殿",
    subtitle: "道教祖师文化空间",
    description:
      "祖师殿以历代高道祖师传承与宫观法脉为主题，展现道教尊师重道、绵延千年的历史人物与师承脉络。",
    scene:
      "沿着祖师画像、碑志与宫观建筑导览，了解道教文化如何通过典籍与身教延续。",
    categoryIds: ["daoist-architecture", "daoist-thought", "daoist-practice"],
    icon: "award",
  },
  {
    id: "daoist-daozang-ge",
    parkSlug: "daoist",
    title: "道藏阁",
    subtitle: "道教典籍收藏空间",
    description:
      "道藏阁专门保存《正统道藏》等道教经典与养生、天文、医药文献，展示“三洞四辅”的传统分类体系。",
    scene:
      "在松风掩映的藏书楼阁中，认识道教文献的分类整理与抄经传统，与佛教园区独立区分。",
    categoryIds: ["daoist-architecture", "daoist-scriptures"],
    icon: "book-open",
  },
  {
    id: "daoist-jingxiu-tang",
    parkSlug: "daoist",
    title: "静修堂",
    subtitle: "道教静修文化空间",
    description:
      "静修堂注重采光纳气与自然通风，介绍道教“清静无为、致虚守静”的修习传统与养生内省文化。",
    scene:
      "在庭院竹影与清风之中，了解静修空间的布置、日常作息与身心观照之道。",
    categoryIds: ["daoist-architecture", "daoist-practice"],
    icon: "wind",
  },
  {
    id: "culture-ruxue-guan",
    parkSlug: "culture",
    title: "儒学馆",
    subtitle: "儒学思想与修身文化",
    description:
      "儒学馆聚焦“仁、义、礼、智、信”与格物致知、修身齐家的传统精神，呈现儒家思想两千余年的演进脉络。",
    scene:
      "通过杏坛讲学图景、历代书院规制与典籍展陈，体会儒学的处世智慧与家国情怀。",
    categoryIds: ["culture-confucian"],
    icon: "message-circle",
  },
  {
    id: "culture-guoxue-guan",
    parkSlug: "culture",
    title: "国学馆",
    subtitle: "传统典籍与学术脉络",
    description:
      "国学馆系统梳理“经、史、子、集”四部分类传统，展示古代刻印、装帧与读书治学的方法。",
    scene:
      "沿着竹简、卷轴到雕版线装书的历史线索，探索中华知识传统与文脉传承。",
    categoryIds: ["culture-classics"],
    icon: "book",
  },
  {
    id: "culture-shuhua-guan",
    parkSlug: "culture",
    title: "书画馆",
    subtitle: "笔墨与东方审美",
    description:
      "书画馆以文房四宝、篆隶楷行草书法与山水花鸟画为主题，阐释“气韵生动”与留白意境的东方美学。",
    scene:
      "在案头笔墨与长卷展陈的场景中，认识宣纸、徽墨、端砚的材料之美与书法章法。",
    categoryIds: ["culture-art"],
    icon: "edit-3",
  },
  {
    id: "culture-liyi-guan",
    parkSlug: "culture",
    title: "礼仪馆",
    subtitle: "礼仪传统与生活文化",
    description:
      "礼仪馆介绍中华“礼仪之邦”的日常交往礼节、冠笄婚丧礼俗及茶道、香道、雅集等生活美学。",
    scene:
      "通过厅堂座次、拜揖礼节与器物礼制介绍，感受传统生活秩序中的敬意与温度。",
    categoryIds: ["culture-ritual"],
    icon: "users",
  },
  {
    id: "culture-jieqi-guan",
    parkSlug: "culture",
    title: "节气文化馆",
    subtitle: "时令、节气与民俗",
    description:
      "节气文化馆围绕二十四节气、物候观察与传统节日风俗展开，展现古人顺应天时、与自然节律共生的智慧。",
    scene:
      "循着春生夏长、秋收冬藏的四季轮转，了解立春、清明、冬至等节气风俗与饮食养生。",
    categoryIds: ["culture-seasons"],
    icon: "sun",
  },
];

export const defaultScriptures: Scripture[] = [
  {
    id: "heart",
    title: "般若心经",
    tradition: "佛教 · 般若经典",
    parkSlug: "buddhist",
    description:
      "全称《般若波罗蜜多心经》，以二百六十字高度凝练般若智慧，陪伴读者观照自心、放下执着。",
    excerpt: "色不异空，空不异色；色即是空，空即是色。",
    fullText: `观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。

舍利子，色不异空，空不异色，色即是空，空即是色，受想行识，亦复如是。

舍利子，是诸法空相，不生不灭，不垢不净，不增不减。是故空中无色，无受想行识，无眼耳鼻舌身意，无色声香味触法，无眼界，乃至无意识界。无无明，亦无无明尽，乃至无老死，亦无老死尽。无苦集灭道，无智亦无得。

以无所得故，菩提萨埵，依般若波罗蜜多故，心无挂碍，无挂碍故，无有恐怖，远离颠倒梦想，究竟涅槃。三世诸佛，依般若波罗蜜多故，得阿耨多罗三藐三菩提。

故知般若波罗蜜多，是大神咒，是大明咒，是无上咒，是无等等咒，能除一切苦，真实不虚。故说般若波罗蜜多咒，即说咒曰：揭谛揭谛，波罗揭谛，波罗僧揭谛，菩提萨婆诃。`,
    icon: "circle",
  },
  {
    id: "tao",
    title: "道德经（选章）",
    tradition: "道家 · 哲思典籍",
    parkSlug: "daoist",
    description:
      "老子所著道家核心经典，探寻自然运转与万物生发之道，体会朴素、柔和而深远的东方哲学智慧。",
    excerpt: "人法地，地法天，天法道，道法自然。",
    fullText: `【第一章】
道可道，非常道；名可名，非常名。
无名天地之始，有名万物之母。
故常无欲，以观其妙；常有欲，以观其徼。
此两者同出而异名，同谓之玄，玄之又玄，众妙之门。

【第八章】
上善若水。水善利万物而不争，处众人之所恶，故几于道。
居善地，心善渊，与善仁，言善信，政善治，事善能，动善时。
夫唯不争，故无尤。

【第二十五章】
有物混成，先天地生。寂兮寥兮，独立而不改，周行而不殆，可以为天地母。吾不知其名，强字之曰道，强为之名曰大。大曰逝，逝曰远，远曰反。故道大，天大，地大，人亦大。域中有四大，而人居其一焉。人法地，地法天，天法道，道法自然。`,
    icon: "wind",
  },
  {
    id: "analects",
    title: "论语（选篇）",
    tradition: "儒家 · 修身经典",
    parkSlug: "culture",
    description:
      "记录孔子及弟子言行的儒家经典，在日常问答与处世准则之间，感受礼、仁、孝悌与好学修身之道。",
    excerpt: "学而时习之，不亦说乎？",
    fullText: `【学而篇】
子曰：“学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？”

曾子曰：“吾日三省吾身：为人谋而不忠乎？与朋友交而不信乎？传不习乎？”

子曰：“君子食无求饱，居无求安，敏于事而慎于言，就有道而正焉，可谓好学也已。”

【里仁篇】
子曰：“里仁为美。择不处仁，焉得知？”
子曰：“君子喻于义，小人喻于利。”
子曰：“见贤思齐焉，见不贤而内自省也。”

【子罕篇】
子曰：“三军可夺帅也，匹夫不可夺志也。”
子曰：“知者不惑，仁者不忧，勇者不惧。”`,
    icon: "book-open",
  },
];

export const defaultGatherings: Gathering[] = [
  {
    id: "reading",
    day: "每日",
    time: "随时参与",
    title: "一日一读",
    description: "选读一段经典，以安静的阅读开启今天。",
    icon: "book-open",
  },
  {
    id: "mindful",
    day: "周末",
    time: "清晨共修",
    title: "静心时刻",
    description: "留出片刻时间，专注呼吸与内心。",
    icon: "sunrise",
  },
  {
    id: "culture",
    day: "每月",
    time: "文化雅集",
    title: "传统文化共读",
    description: "在典籍与礼乐中，一起分享东方文化。",
    icon: "users",
  },
];

export const places: Record<string, Place> = {
  buddhist: {
    slug: "buddhist",
    title: "佛教寺院",
    subtitle: "山门清净 · 禅意悠远",
    description:
      "沿着山门、殿宇与回廊，感受中国寺院建筑的秩序之美与静谧氛围。",
    image: "/images/buddhist-temple.png",
    icon: "circle",
    highlights: ["寺院建筑与营造", "佛教经典与文化", "礼仪传统与日常修习"],
  },
  daoist: {
    slug: "daoist",
    title: "道教宫观",
    subtitle: "问道名山 · 观宇千年",
    description:
      "走近依山而建的宫观与古建群落，了解道教文化中人与自然的相处之道。",
    image: "/images/daoist-temple.png",
    icon: "wind",
    highlights: ["名山宫观与历史", "道家典籍与思想", "传统建筑与自然观"],
  },
  culture: {
    slug: "culture",
    title: "中华传统文化馆",
    subtitle: "典籍礼乐 · 东方文脉",
    description:
      "从典籍、礼乐与传统建筑出发，循着历史脉络理解中华文化的丰富内涵。",
    image: "/images/temple-hero.png",
    icon: "book-open",
    highlights: ["经典典籍与思想", "礼乐传统与节气", "古建筑与营造智慧"],
  },
};
