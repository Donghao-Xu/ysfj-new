import type { Scripture } from "@/data/parks";
import { sceneImages } from "@/data/scenes";

export const v2Images = {
  homeHero: sceneImages.homeHero,
  buddhistGate: sceneImages.buddhistGate,
  buddhistMainHall: sceneImages.buddhistMainHall,
  daoistMountain: sceneImages.daoistMountain,
  daoistTemple: sceneImages.daoistGate,
  meditationSanctuary: sceneImages.meditationSanctuary,
};

export type DailyQuote = {
  tradition: "buddhist" | "daoist";
  traditionLabel: string;
  quote: string;
  source: string;
  reflection: string;
};

export const dailyQuotes: { buddhist: DailyQuote; daoist: DailyQuote } = {
  buddhist: {
    tradition: "buddhist",
    traditionLabel: "佛教经典",
    quote: "照见五蕴皆空，度一切苦厄。",
    source: "《般若波罗蜜多心经》（玄奘译本）",
    reflection: "观照当下起心动念，不为外境所牵，便是清净安住之处。",
  },
  daoist: {
    tradition: "daoist",
    traditionLabel: "道教经典",
    quote: "上善若水。水善利万物而不争。",
    source: "《道德经·第八章》（通行本）",
    reflection: "如水般顺应自然、谦下利他而不争锋，内心自生宁静从容。",
  },
};

export type RealmHall = {
  id: string;
  linkedBuildingId?: string;
  title: string;
  subtitle: string;
  summary: string;
  culturalNotes: string;
  traditionPractice: string;
};

export const buddhistRealmHalls: RealmHall[] = [
  {
    id: "buddhist-daxiong",
    linkedBuildingId: "buddhist-daxiong-baodian",
    title: "大雄宝殿",
    subtitle: "寺院核心礼佛殿堂",
    summary:
      "大雄宝殿是汉传佛教寺院的中心主殿。“大雄”喻指佛陀具足大智、大勇与大悲，能够降伏烦恼。殿内传统常奉释迦牟尼佛，左右或辅以药师佛、阿弥陀佛（三世佛）或文殊、普贤二大士。",
    culturalNotes:
      "传统大雄宝殿多采用中轴对称布局、重檐歇山顶木构技艺，殿前设宽阔月台与铜香炉，体现庄严有序的伽蓝空间格局。",
    traditionPractice:
      "入殿礼佛以至诚恭敬为主：合掌肃立、问讯礼拜、敬香供灯，重在收摄自心，而非祈求外在交换。",
  },
  {
    id: "buddhist-guanyin",
    linkedBuildingId: "buddhist-guanyin-dian",
    title: "观音殿",
    subtitle: "大悲观照 · 慈悲济世空间",
    summary:
      "观世音菩萨象征佛教“无缘大慈，同体大悲”的精神。中国佛教寺院常专设观音殿或大悲殿，表达在日常困顿中闻声救苦、柔和忍辱的慈悲观照。",
    culturalNotes:
      "观音造像在中国文化中经历了深厚的本土化融合，从敦煌壁画到宋代木雕水月观音，均以安详端庄、衣纹流畅著称。",
    traditionPractice:
      "在此空间可静心诵读《心经》中“观自在菩萨”一节，体会由自心觉察生起的安稳慈悲。",
  },
  {
    id: "buddhist-dizang",
    linkedBuildingId: "buddhist-dizang-dian",
    title: "地藏殿",
    subtitle: "孝亲报恩 · 坚毅悲愿空间",
    summary:
      "地藏菩萨以“众生度尽，方证菩提”的深宏誓愿闻名，在汉传佛教文化中亦被视为“孝道”与“担当”精神的重要象征。",
    culturalNotes:
      "安徽九华山被公认为地藏菩萨应化道场，寺院中的地藏殿氛围清幽肃穆，常伴随追思先祖、报答亲恩的文化传统。",
    traditionPractice:
      "感念父母师长恩德，起一念善愿与担当，以平常善行回向身边亲友平安。",
  },
  {
    id: "buddhist-pureland",
    title: "阿弥陀佛净土主题空间",
    subtitle: "清净莲池 · 念佛安住主题区",
    summary:
      "净土文化以《佛说阿弥陀经》及西方净土莲池清净意象为核心，强调“心净则国土净”，引导行者在专一念佛与觉照中远离散乱焦虑。",
    culturalNotes:
      "“七宝池、八功德水、四色莲华”在佛教文化中寓意清净、温和、平等与光明，成为历代寺院莲池建筑与净土壁画的重要灵感来源。",
    traditionPractice:
      "可配合木鱼节拍或静坐计时，专心诵念经典或默念佛号，体验片刻心无杂念的安详。",
  },
  {
    id: "buddhist-culture",
    linkedBuildingId: "buddhist-cangjing-ge",
    title: "佛教文化展示空间",
    subtitle: "伽蓝营造 · 佛经翻译与禅修传统",
    summary:
      "系统梳理汉传佛教从东汉传入、魏晋南北朝至隋唐鼎盛时期的译经史（鸠摩罗什、玄奘等高僧）、石窟造像艺术及寺院木构营造文化。",
    culturalNotes:
      "汉传佛教经典体系浩瀚，《大藏经》保存了数千卷汉译典籍；寺院“晨钟暮鼓”的作息制度则深刻影响了中国传统文人审美与日常生活。",
    traditionPractice:
      "建议前往「经典图书馆 → 佛教经典」阅读公版典籍全文，循历史脉络认识东方佛学。",
  },
];

export const daoistRealmHalls: RealmHall[] = [
  {
    id: "daoist-sanqing",
    linkedBuildingId: "daoist-sanqing-dian",
    title: "三清殿",
    subtitle: "道教最高主殿 · 三清文化",
    summary:
      "三清殿是道教宫观的最高主殿，奉祀道教尊神“三清”——玉清元始天尊、上清灵宝天尊、太清道德天尊，象征“道生一，一生二，二生三，三生万物”的宇宙演化本源。",
    culturalNotes:
      "三清殿多建于宫观中轴线最高台基之上，殿宇飞檐凌空、琉璃或青瓦覆顶，脊饰龙凤仙人，体现道教“法天象地、敬天法祖”的宫观礼制。",
    traditionPractice:
      "道教入殿行拱手礼（左阳右阴，左手抱右手，微鞠躬致敬），以恭敬清净之心观照大道运转与天地秩序。",
  },
  {
    id: "daoist-yuhuang",
    linkedBuildingId: "daoist-yuhuang-dian",
    title: "玉皇殿",
    subtitle: "穹苍秩序 · 岁时民俗文化",
    summary:
      "玉皇上帝（玉皇大帝）在道教体系中位居高天、统理天地万象，在中华民间传统与宫观文化中也承载着风调雨顺、顺应天时、重德行善的文化祈愿。",
    culturalNotes:
      "名山宫观常于峰顶建玉皇阁或玉皇殿（如武当山金顶、泰山玉皇顶），建筑依山势而立，开阔疏朗，与山峦云海融为一体。",
    traditionPractice:
      "立于高台远眺山川云海，体会古人“仰观宇宙之大，俯察品类之盛”的开阔胸襟。",
  },
  {
    id: "daoist-laojun",
    linkedBuildingId: "daoist-zushi-dian",
    title: "太上老君文化空间",
    subtitle: "道德本源 · 老子思想传承",
    summary:
      "老子（李耳）著《道德经》五千言，确立了“道法自然”“上善若水”“致虚守静”的哲学基石，在道教传统中被尊为太清道德天尊（太上老君）。",
    culturalNotes:
      "陕西周至楼观台、河南鹿邑太清宫、福建泉州清源山老君岩等地，均保留着绵延千年的老子文化遗迹与碑刻文献。",
    traditionPractice:
      "阅读《道德经》与《清静经》，学习在繁杂生活中减法处世、守静笃定。",
  },
  {
    id: "daoist-culture",
    linkedBuildingId: "daoist-daozang-ge",
    title: "道教文化与礼仪展示空间",
    subtitle: "道藏典籍 · 拱手礼仪 · 自然养生观",
    summary:
      "集中介绍道教独有的“三洞四辅”《正统道藏》文献分类、宫观“顺应山水”的建筑营造法则，以及日常“子午卯酉”静坐调息、顺应二十四节气的生活智慧。",
    culturalNotes:
      "道教礼仪严明而重自然，与佛教礼仪各有独立体系：拱手抱拳、清香礼敬、诵读道经，皆讲求内清外静、不尚浮华。",
    traditionPractice:
      "前往「经典图书馆 → 道教经典」品读《道德经》《清静经》，或在「静心修习」开启山风溪流声静坐调息。",
  },
];

export const additionalPublicScriptures: Scripture[] = [
  {
    id: "diamond-excerpt",
    title: "金刚般若波罗蜜经（节选）",
    tradition: "佛教 · 般若经典（鸠摩罗什译）",
    parkSlug: "buddhist",
    description:
      "大乘佛教最具影响力的经典之一。此处收录公版鸠摩罗什译本中“法会因由”“善现启请”及核心偈颂节选。",
    excerpt: "应无所住而生其心。",
    fullText: `【法会因由分第一】
如是我闻。一时佛在舍卫国祇树给孤独园，与大比丘众千二百五十人俱。尔时世尊食时，著衣持钵，入舍卫大城乞食。于其城中，次第乞已，还至本处。饭食讫，收衣钵，洗足已，敷座而坐。

【善现启请分第二（节选）】
时，长老须菩提在大众中即从座起，偏袒右肩，右膝著地，合掌恭敬而白佛言：“希有！世尊！如来善护念诸菩萨，善付嘱诸菩萨。世尊！善男子、善女人，发阿耨多罗三藐三菩提心，应云何住？云何降伏其心？”

佛言：“善哉，善哉。须菩提！如汝所说，如来善护念诸菩萨，善付嘱诸菩萨。汝今谛听！当为汝说：善男子、善女人，发阿耨多罗三藐三菩提心，应如是住，如是降伏其心。”

【大乘正宗分第三（节选）】
佛告须菩提：“诸菩萨摩诃萨应如是降伏其心！所有一切众生之类：若卵生、若胎生、若湿生、若化生；若有色、若无色；若有想、若无想、若非有想非无想，我皆令入无余涅槃而灭度之。如是灭度无量无数无边众生，实无众生得灭度者。”

【核心要句】
菩萨于法，应无所住，行于布施。……应无所住而生其心。

【应化非真分第三十二】
一切有为法，如梦幻泡影，如露亦如电，应作如是观。`,
    icon: "book-open",
  },
  {
    id: "amitabha-excerpt",
    title: "佛说阿弥陀经（节选）",
    tradition: "佛教 · 净土经典（鸠摩罗什译）",
    parkSlug: "buddhist",
    description:
      "净土宗核心经典之一，以莲池、清风、德水等静谧意象引导行者修习执持专注、内心清净。",
    excerpt: "执持名号，一心不乱。",
    fullText: `【开篇】
如是我闻。一时佛在舍卫国祇树给孤独园，与大比丘僧千二百五十人俱，皆是大阿罗汉，众所知识。

【七宝池意象（节选）】
尔时，佛告长老舍利弗：“从是西方，过十万亿佛土，有世界名曰极乐，其土有佛，号阿弥陀，今现在说法。舍利弗，彼土何故名为极乐？其国众生，无有众苦，但受诸乐，故名极乐。

又舍利弗，极乐国土，七重栏楯，七重罗网，七重行树，皆是四宝周匝围绕，是故彼国名为极乐。

又舍利弗，极乐国土，有七宝池，八功德水充满其中，池底纯以金沙布地。四边阶道，金、银、琉璃、玻璃合成。上有楼阁，亦以金、银、琉璃、玻璃、砗磲、赤珠、玛瑙而严饰之。池中莲花大如车轮，青色青光、黄色黄光、赤色赤光、白色白光，微妙香洁。”

【修习核心（节选）】
舍利弗，若有善男子善女人，闻说阿弥陀佛，执持名号，若一日、若二日、若三日、若四日、若五日、若六日、若七日，一心不乱，其人临命终时，阿弥陀佛与诸圣众现在其前。是人终时，心不颠倒，即得往生阿弥陀佛极乐国土。`,
    icon: "circle",
  },
  {
    id: "qingjing-jing",
    title: "太上老君说常清静经（全篇）",
    tradition: "道教 · 日诵经典（《正统道藏》公版传本）",
    parkSlug: "daoist",
    description:
      "道教宫观日常功课重要经典之一，全文四百余字，阐述澄清心念、远离贪妄、回归清静本性的修习要旨。",
    excerpt: "人能常清静，天地悉皆归。",
    fullText: `老君曰：大道无形，生育天地；大道无情，运行日月；大道无名，长养万物；吾不知其名，强名曰道。

夫道者：有清有浊，有动有静；天清地浊，天动地静。男清女浊，男动女静。降本流末，而生万物。清者浊之源，动者静之基。人能常清静，天地悉皆归。

夫人神好清，而心扰之；人心好静，而欲牵之。常能遣其欲，而心自静，澄其心而神自清。自然六欲不生，三毒消灭。所以不能者，为心未澄，欲未遣也。

能遣之者，内观其心，心无其心；外观其形，形无其形；远观其物，物无其物。三者既悟，唯见于空；观空亦空，空无所空；所空既无，无无亦无；无无既无，湛然常寂；寂无所寂，欲岂能生？欲既不生，即是真静。

真常应物，真常得性；常应常静，常清静矣。如此清静，渐入真道；既入真道，名为得道，虽名得道，实无所得；为化众生，名为得道；能悟之者，可传圣道。

老君曰：上士无争，下士好争；上德不德，下德执德。执着之者，不名道德。众生所以不得真道者，为有妄心。既有妄心，即惊其神；既惊其神，即着万物；既着万物，即生贪求；既生贪求，即是烦恼；烦恼妄想，忧苦身心；便遭浊辱，流浪生死，常沉苦海，永失真道。真常之道，悟者自得，得悟道者，常清静矣。`,
    icon: "wind",
  },
  {
    id: "zhuangzi-xiaoyao",
    title: "庄子 · 逍遥游（节选）",
    tradition: "道家 · 经典文献（战国·庄周）",
    parkSlug: "daoist",
    description:
      "道家哲思代表篇章之一，借大鹏南徙、朝菌蟪蛄之喻，启发人超越狭隘视角，体悟从容自在的精神境界。",
    excerpt: "水之积也不厚，则其负大舟也无力。",
    fullText: `北冥有鱼，其名为鲲。鲲之大，不知其几千里也；化而为鸟，其名为鹏。鹏之背，不知其几千里也；怒而飞，其翼若垂天之云。是鸟也，海运则将徙于南冥。南冥者，天池也。

《齐谐》者，志怪者也。《谐》之言曰：“鹏之徙于南冥也，水击三千里，抟扶摇而上者九万里，去以六月息者也。”野马也，尘埃也，生物之以息相吹也。天之苍苍，其正色邪？其远而无所至极邪？其视下也，亦若是则已矣。

且夫水之积也不厚，则其负大舟也无力。覆杯水于坳堂之上，则芥为之舟；置杯焉则胶，水浅而舟大也。风之积也不厚，则其负大翼也无力。故九万里，则风斯在下矣，而后乃今培风；背负青天，而莫之夭阏者，而后乃今将图南。`,
    icon: "sun",
  },
];

export type PilgrimageSite = {
  id: string;
  name: string;
  tradition: "buddhist" | "daoist";
  categoryLabel: string;
  location: string;
  summary: string;
  highlights: string;
  image: string;
  sourceNote: string;
};

export const pilgrimageSites: PilgrimageSite[] = [
  {
    id: "wutai",
    name: "五台山寺院群",
    tradition: "buddhist",
    categoryLabel: "中国佛教四大名山之一",
    location: "中国 · 山西省忻州市",
    summary:
      "五台山由五座台顶环抱而成，汉传佛教尊为文殊菩萨应化道场。现存唐代木构佛光寺东大殿、南禅寺大殿等珍贵古建筑，具有极高的建筑与宗教史价值。",
    highlights: "代表建筑：显通寺、塔院寺大白塔、佛光寺唐代木构",
    image: sceneImages.buddhistMainHall,
    sourceNote: "资料来源：中国佛教名山志与国家文物保护公开档案",
  },
  {
    id: "putuo",
    name: "普陀山普济禅寺",
    tradition: "buddhist",
    categoryLabel: "中国佛教四大名山之一",
    location: "中国 · 浙江省舟山市",
    summary:
      "地处东海舟山群岛，汉传佛教传统尊为观世音菩萨道场，素有“海天佛国”之称。寺院群落临海依山，潮音与晨钟相闻，呈现独特的海岛禅林气象。",
    highlights: "代表空间：普济禅寺海印池、法雨禅寺九龙殿、紫竹林",
    image: sceneImages.buddhistGuanyinHall,
    sourceNote: "资料来源：普陀山志与公开历史文化资料",
  },
  {
    id: "emei",
    name: "峨眉山报国寺与万年寺",
    tradition: "buddhist",
    categoryLabel: "中国佛教四大名山之一",
    location: "中国 · 四川省乐山市",
    summary:
      "峨眉山传统尊为普贤菩萨道场，山势雄秀、云海苍茫。其中万年寺无梁砖殿与清音阁等建筑巧妙顺应山地地貌，见证巴蜀佛教与自然山水的交融。",
    highlights: "代表空间：报国寺、万年寺明代无梁砖殿、洗象池",
    image: sceneImages.buddhistPureland,
    sourceNote: "资料来源：峨眉山志与世界文化与自然遗产公开简介",
  },
  {
    id: "jiuhua",
    name: "九华山化城寺与肉身宝殿",
    tradition: "buddhist",
    categoryLabel: "中国佛教四大名山之一",
    location: "中国 · 安徽省池州市",
    summary:
      "九华山传统尊为地藏菩萨道场。唐代新罗僧金乔觉卓锡于此，留存下深厚的孝亲报恩与悲愿精神，徽派寺院白墙黛瓦与苍翠山峰相映成趣。",
    highlights: "代表空间：化城寺、肉身宝殿、百岁宫",
    image: sceneImages.buddhistDizangHall,
    sourceNote: "资料来源：九华山志与公开佛教历史资料",
  },
  {
    id: "wudang",
    name: "武当山古建筑群",
    tradition: "daoist",
    categoryLabel: "中国道教名山 · 著名宫观",
    location: "中国 · 湖北省十堰市",
    summary:
      "武当山是中国道教著名圣地，现存规模宏大的明代皇家道教建筑群，严格依照真武修道神话与天人合一理念顺山势营建，被列入世界文化遗产。",
    highlights: "代表宫观：紫霄宫、南岩宫、天柱峰金顶太和宫",
    image: sceneImages.daoistMountain,
    sourceNote: "资料来源：世界文化遗产武当山古建筑群公开档案",
  },
  {
    id: "qingcheng",
    name: "青城山建福宫与天师洞",
    tradition: "daoist",
    categoryLabel: "中国道教发祥地之一",
    location: "中国 · 四川省成都市都江堰",
    summary:
      "青城山素有“青城天下幽”之誉，林木深秀，为中国早期正一道重要发祥地之一。山中宫观多以木构筑于幽谷古树之间，体现道法自然的朴素之美。",
    highlights: "代表宫观：建福宫、天师洞（常道观）、上清宫",
    image: sceneImages.daoistGate,
    sourceNote: "资料来源：青城山志与公开道教文化文献",
  },
  {
    id: "longhu",
    name: "龙虎山嗣汉天师府与上清宫",
    tradition: "daoist",
    categoryLabel: "道教正一派祖庭",
    location: "中国 · 江西省鹰潭市",
    summary:
      "丹霞碧水环绕的龙虎山是中国道教正一派祖庭，保留了传统道教府观建筑规制、仪典音乐传承与丰富碑刻文物。",
    highlights: "代表宫观：上清宫、嗣汉天师府、正一观",
    image: sceneImages.daoistSanqingInterior,
    sourceNote: "资料来源：龙虎山志与地方文化公开史料",
  },
  {
    id: "louguantai",
    name: "楼观台宗圣宫与说经台",
    tradition: "daoist",
    categoryLabel: "道教文化圣地",
    location: "中国 · 陕西省西安市周至县",
    summary:
      "依终南山北麓而建，传统文献记载老子曾于此讲授《道德经》五千言，因此被道教史籍视为“天下第一福地”之一，保存众多历代石碑。",
    highlights: "代表空间：说经台、宗圣宫遗址、老子文化碑林",
    image: sceneImages.daoistLaojunSanctuary,
    sourceNote: "资料来源：关中地方志与道教宫观史料公开整理",
  },
];
