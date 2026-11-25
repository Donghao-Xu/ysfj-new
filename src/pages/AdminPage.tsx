import {
  ArrowLeft,
  BookOpen,
  Building2,
  CloudUpload,
  Compass,
  FileUp,
  Music,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/context/AppContext";
import type {
  ChantingTrack,
  Gathering,
  ParkBuilding,
  ParkSlug,
  Scripture,
} from "@/data/parks";
import { ADMIN_EMAIL } from "@/lib/firebase";

type AdminTab = "buildings" | "scriptures" | "audios" | "gatherings" | "parks";

export function AdminPage() {
  const navigate = useNavigate();
  const {
    authReady,
    isAdmin,
    parks,
    buildings,
    scriptures,
    gatherings,
    chantingTracks,
    cloudSynced,
    seedDefaultContentToCloud,
    saveBuilding,
    deleteBuilding,
    saveScripture,
    deleteScripture,
    saveGathering,
    deleteGathering,
    saveParkIntro,
    saveChantingTrack,
    deleteChantingTrack,
  } = useAppState();

  const [tab, setTab] = useState<AdminTab>("buildings");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  // Building form state
  const [bPark, setBPark] = useState<ParkSlug>("buddhist");
  const [bTitle, setBTitle] = useState("");
  const [bSubtitle, setBSubtitle] = useState("");
  const [bDesc, setBDesc] = useState("");
  const [bScene, setBScene] = useState("");

  // Scripture form state
  const [sTitle, setSTitle] = useState("");
  const [sTradition, setSTradition] = useState("佛教 · 经典");
  const [sPark, setSPark] = useState<ParkSlug>("buddhist");
  const [sExcerpt, setSExcerpt] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sFullText, setSFullText] = useState("");

  // Gathering form state
  const [gDay, setGDay] = useState("每周");
  const [gTime, setGTime] = useState("晚间共读");
  const [gTitle, setGTitle] = useState("");
  const [gDesc, setGDesc] = useState("");

  // Park intro edit state
  const [selectedParkSlug, setSelectedParkSlug] = useState<ParkSlug>("buddhist");
  const [parkIntroText, setParkIntroText] = useState(
    parks.buddhist?.introduction || "",
  );

  // Chanting audio track state
  const [aPark, setAPark] = useState<ParkSlug>("buddhist");
  const [aScriptureId, setAScriptureId] = useState("heart");
  const [aTitle, setATitle] = useState("");
  const [aDuration, setADuration] = useState("05:00");
  const [aUrl, setAUrl] = useState("");

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f0e5] text-[13px] text-[#857362]">
        正在核验管理员权限…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f0e5] px-6 text-center">
        <div className="max-w-sm rounded-[20px] border border-[#e4d8c3] bg-[#fffaf1] p-6">
          <ShieldCheck size={32} className="mx-auto text-[#922e25]" />
          <h1 className="mt-3 text-[18px] font-bold text-[#39251d]">
            仅限管理员访问
          </h1>
          <p className="mt-2 text-[12px] leading-5 text-[#563b2c]">
            此管理后台仅供产品所有者账号（{ADMIN_EMAIL}）登录并完成邮箱验证后使用。
          </p>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => navigate("/sign-in")}
              className="flex-1 rounded-[20px] bg-[#922e25] py-2.5 text-[12px] font-bold text-[#fff8eb] cursor-pointer"
            >
              前往登录
            </button>
            <button
              type="button"
              onClick={() => navigate("/mine")}
              className="flex-1 rounded-[20px] bg-[#eadfc9] py-2.5 text-[12px] font-semibold text-[#563b2c] cursor-pointer"
            >
              返回我的
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSeed = async () => {
    setBusy(true);
    setNotice("");
    try {
      await seedDefaultContentToCloud();
      setNotice("默认园区、建筑、经典与共修资料已成功写入云端数据库！");
    } catch {
      setNotice("写入云端失败，请检查网络连接或每日免费额度。");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateBuilding = async (e: FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim() || !bDesc.trim()) return;
    setBusy(true);
    setNotice("");
    const park = parks[bPark];
    const firstCategory = park?.categories[0]?.id || `${bPark}-architecture`;
    const newItem: ParkBuilding = {
      id: `${bPark}-${Date.now()}`,
      parkSlug: bPark,
      title: bTitle,
      subtitle: bSubtitle || `${park?.title || ""}空间`,
      description: bDesc,
      scene: bScene || bDesc,
      categoryIds: [firstCategory],
      icon: bPark === "buddhist" ? "home" : bPark === "daoist" ? "sun" : "book",
    };
    try {
      await saveBuilding(newItem);
      setBTitle("");
      setBSubtitle("");
      setBDesc("");
      setBScene("");
      setNotice(`已发布新建筑「${newItem.title}」到云端数据库！`);
    } catch {
      setNotice("发布建筑失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  };

  const decodeTextBuffer = (buffer: ArrayBuffer): { text: string; encoding: string } => {
    const bytes = new Uint8Array(buffer);
    if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
      return { text: new TextDecoder("utf-8").decode(bytes), encoding: "UTF-8" };
    }
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
      return { text: new TextDecoder("utf-16le").decode(bytes), encoding: "UTF-16LE" };
    }
    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
      return { text: new TextDecoder("utf-16be").decode(bytes), encoding: "UTF-16BE" };
    }
    try {
      return {
        text: new TextDecoder("utf-8", { fatal: true }).decode(bytes),
        encoding: "UTF-8",
      };
    } catch {
      try {
        return {
          text: new TextDecoder("gb18030", { fatal: true }).decode(bytes),
          encoding: "GBK / GB18030",
        };
      } catch {
        try {
          return {
            text: new TextDecoder("big5", { fatal: true }).decode(bytes),
            encoding: "Big5",
          };
        } catch {
          return {
            text: new TextDecoder("gb18030").decode(bytes),
            encoding: "GB18030",
          };
        }
      }
    }
  };

  const handleScriptureFileImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    setBusy(true);
    setNotice(isPdf ? "正在解析 PDF 中的经文文字，请稍候…" : "");

    try {
      let rawText = "";
      let detectedEncoding = "";
      if (isPdf) {
        const [pdfjsLib, workerMod] = await Promise.all([
          import("pdfjs-dist"),
          import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
        ]);
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerMod.default;

        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
          .promise;
        const pageTexts: string[] = [];
        let totalLen = 0;

        for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 200); pageNum += 1) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const lines: string[] = [];
          let currentLine = "";

          for (const item of content.items) {
            if ("str" in item) {
              currentLine += item.str;
              if (item.hasEOL) {
                lines.push(currentLine.trim());
                currentLine = "";
              }
            }
          }
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
          const pageStr = lines.filter(Boolean).join("\n");
          if (pageStr) {
            pageTexts.push(pageStr);
            totalLen += pageStr.length;
          }
          if (totalLen >= 52000) break;
        }
        rawText = pageTexts.join("\n\n");
      } else {
        const buffer = await file.arrayBuffer();
        const decoded = decodeTextBuffer(buffer);
        rawText = decoded.text;
        detectedEncoding = decoded.encoding;
      }

      const cleaned = rawText.replace(/\r\n/g, "\n").trim();
      if (!cleaned) {
        setNotice(
          isPdf
            ? "这份 PDF 中没有提取到可选文字（可能是纯图片/扫描版 PDF）。目前仅支持文字版 PDF，扫描版需先做文字识别或转为 .txt 后再导入。"
            : "所选文件为空，请换一个包含经文正文的 .txt / .md / .pdf 文件。",
        );
        return;
      }

      const fileTitle = file.name.replace(/\.(txt|md|text|pdf)$/i, "").trim();
      if (!sTitle.trim() && fileTitle) {
        setSTitle(fileTitle.slice(0, 80));
      }

      const firstLine = cleaned
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line.length > 0);
      if (!sExcerpt.trim() && firstLine) {
        setSExcerpt(firstLine.slice(0, 120));
      }

      const truncated = cleaned.length > 50000;
      const encodingTag = detectedEncoding ? `（${detectedEncoding} 编码）` : "";
      setSFullText(cleaned.slice(0, 50000));
      setNotice(
        truncated
          ? `已从「${file.name}」${encodingTag}提取文字，因超过单篇 5 万字上限已自动截取前 5 万字。`
          : `已成功从「${file.name}」${encodingTag}读取经书正文（共 ${cleaned.length} 字），核对后点击下方发布即可！`,
      );
    } catch {
      setNotice(
        isPdf
          ? "PDF 解析失败，请确认文件未加密且未损坏，或先转为 .txt 文件导入。"
          : "读取文本文件失败，请确认文件未损坏。",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCreateScripture = async (e: FormEvent) => {
    e.preventDefault();
    if (!sTitle.trim() || !sExcerpt.trim() || !sFullText.trim()) return;
    setBusy(true);
    setNotice("");
    const newItem: Scripture = {
      id: `scripture-${Date.now()}`,
      title: sTitle,
      tradition: sTradition,
      parkSlug: sPark,
      description: sDesc || sExcerpt,
      excerpt: sExcerpt,
      fullText: sFullText,
      icon: "book-open",
    };
    try {
      await saveScripture(newItem);
      setSTitle("");
      setSExcerpt("");
      setSDesc("");
      setSFullText("");
      setNotice(`已发布新经典「${newItem.title}」到云端数据库！`);
    } catch {
      setNotice("发布经典失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateAudioTrack = async (e: FormEvent) => {
    e.preventDefault();
    if (!aTitle.trim() || !aUrl.trim()) return;
    if (!aUrl.trim().startsWith("https://")) {
      setNotice("音频链接请使用 https:// 开头的安全网络地址。");
      return;
    }
    setBusy(true);
    setNotice("");
    const newTrack: ChantingTrack = {
      id: `track-${Date.now()}`,
      title: aTitle,
      parkSlug: aPark,
      scriptureId: aScriptureId,
      durationLabel: aDuration || "05:00",
      audioUrl: aUrl,
    };
    try {
      await saveChantingTrack(newTrack);
      setATitle("");
      setAUrl("");
      setNotice(`已发布诵经音频「${newTrack.title}」到云端！`);
    } catch {
      setNotice("发布音频失败，请确认链接以 https:// 开头并检查网络。");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateGathering = async (e: FormEvent) => {
    e.preventDefault();
    if (!gTitle.trim() || !gDesc.trim()) return;
    setBusy(true);
    setNotice("");
    const newItem: Gathering = {
      id: `gathering-${Date.now()}`,
      day: gDay,
      time: gTime,
      title: gTitle,
      description: gDesc,
      icon: "users",
    };
    try {
      await saveGathering(newItem);
      setGTitle("");
      setGDesc("");
      setNotice(`已发布新共修活动「${newItem.title}」到云端数据库！`);
    } catch {
      setNotice("发布共修失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f0e5] pb-16 text-[#39251d]">
      <header className="sticky top-0 z-20 border-b border-[#e4d8c3] bg-[#f6f0e5]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[580px] items-center justify-between px-4">
          <button
            type="button"
            onClick={() => navigate("/mine")}
            className="flex items-center gap-1 text-[13px] font-medium text-[#39251d] cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>返回</span>
          </button>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-[#922e25]" />
            <h1 className="text-[15px] font-bold text-[#39251d]">
              管理员内容后台
            </h1>
          </div>
          <span className="rounded-[10px] bg-[#eadfc9] px-2 py-0.5 text-[10px] font-semibold text-[#563b2c]">
            本人专用
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[580px] px-4 pt-5">
        {/* Cloud Sync / Seed Card */}
        <section className="rounded-[16px] border border-[#c59a53]/60 bg-[#fffaf1] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-bold text-[#39251d]">
                云端内容库状态：{cloudSynced ? "已接入云端" : "尚未初始化默认内容"}
              </p>
              <p className="mt-0.5 text-[11px] text-[#857362]">
                管理员账号：{ADMIN_EMAIL}
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={handleSeed}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[18px] bg-[#922e25] px-3.5 py-2 text-[11px] font-bold text-[#fff8eb] cursor-pointer disabled:opacity-50"
            >
              <CloudUpload size={14} />
              <span>{busy ? "同步中…" : "同步默认数据到云端"}</span>
            </button>
          </div>
        </section>

        {notice && (
          <div className="mt-3 rounded-[12px] bg-[#eadfc9] px-4 py-2.5 text-[12px] font-medium text-[#39251d]">
            {notice}
          </div>
        )}

        {/* Section Tabs */}
        <div className="mt-4 grid grid-cols-5 gap-1 rounded-[14px] bg-[#eadfc9] p-1">
          {[
            { id: "buildings" as const, label: "建筑", icon: Building2 },
            { id: "scriptures" as const, label: "经典", icon: BookOpen },
            { id: "audios" as const, label: "音频", icon: Music },
            { id: "gatherings" as const, label: "共修", icon: Users },
            { id: "parks" as const, label: "园区", icon: Compass },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex items-center justify-center gap-1 rounded-[11px] py-2 text-[11px] font-bold transition-colors cursor-pointer ${
                  active
                    ? "bg-[#922e25] text-[#fff8eb]"
                    : "text-[#563b2c]"
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Buildings Tab */}
        {tab === "buildings" && (
          <div className="mt-4 space-y-4">
            <form
              onSubmit={handleCreateBuilding}
              className="space-y-3 rounded-[16px] border border-[#e4d8c3] bg-[#fffaf1] p-4"
            >
              <h2 className="text-[14px] font-bold text-[#39251d]">
                新增园区建筑
              </h2>
              <select
                value={bPark}
                onChange={(e) => setBPark(e.target.value as ParkSlug)}
                className="w-full rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
              >
                <option value="buddhist">佛教寺院</option>
                <option value="daoist">道教宫观</option>
                <option value="culture">中华传统文化馆</option>
              </select>
              <input
                type="text"
                maxLength={80}
                value={bTitle}
                onChange={(e) => setBTitle(e.target.value)}
                placeholder="建筑名称（如：钟鼓楼）"
                className="w-full rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
              />
              <input
                type="text"
                maxLength={120}
                value={bSubtitle}
                onChange={(e) => setBSubtitle(e.target.value)}
                placeholder="副标题（如：晨钟暮鼓空间）"
                className="w-full rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
              />
              <textarea
                rows={3}
                maxLength={1500}
                value={bDesc}
                onChange={(e) => setBDesc(e.target.value)}
                placeholder="建筑介绍（必填）"
                className="w-full rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
              />
              <textarea
                rows={2}
                maxLength={1500}
                value={bScene}
                onChange={(e) => setBScene(e.target.value)}
                placeholder="空间导览描述（可选）"
                className="w-full rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
              />
              <button
                type="submit"
                disabled={busy || !bTitle.trim() || !bDesc.trim()}
                className="flex w-full items-center justify-center gap-1.5 rounded-[20px] bg-[#922e25] py-2.5 text-[12px] font-bold text-[#fff8eb] cursor-pointer disabled:opacity-50"
              >
                <Plus size={15} />
                <span>发布建筑到云端</span>
              </button>
            </form>

            <div className="space-y-2">
              <h3 className="text-[13px] font-bold text-[#39251d]">
                当前建筑列表（{buildings.length}）
              </h3>
              {buildings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] px-3.5 py-2.5"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate text-[13px] font-bold text-[#39251d]">
                      {b.title}
                    </p>
                    <p className="truncate text-[10px] text-[#857362]">
                      {parks[b.parkSlug]?.title} · {b.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`删除${b.title}`}
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      await deleteBuilding(b.id);
                      setNotice(`已删除「${b.title}」`);
                      setBusy(false);
                    }}
                    className="rounded-full p-2 text-[#ef4444] hover:bg-[#eadfc9] cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scriptures Tab */}
        {tab === "scriptures" && (
          <div className="mt-4 space-y-4">
            <form
              onSubmit={handleCreateScripture}
              className="space-y-3 rounded-[16px] border border-[#e4d8c3] bg-[#fffaf1] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[14px] font-bold text-[#39251d]">
                  发布新经典内容
                </h2>
                <label className="inline-flex items-center gap-1.5 rounded-[14px] bg-[#eadfc9] px-3 py-1.5 text-[11px] font-bold text-[#922e25] hover:opacity-90 cursor-pointer">
                  <FileUp size={13} />
                  <span>导入文件 (.txt / .md / .pdf)</span>
                  <input
                    type="file"
                    accept=".txt,.md,.text,.pdf,text/plain,application/pdf"
                    onChange={handleScriptureFileImport}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[11px] leading-4 text-[#857362]">
                支持选择 .txt、.md 或文字版 .pdf 经书文件自动提取正文（单篇最多 5 万字）；扫描图片版 PDF 无法直接识别文字。
              </p>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={sPark}
                  onChange={(e) => setSPark(e.target.value as ParkSlug)}
                  className="rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
                >
                  <option value="buddhist">佛教经典</option>
                  <option value="daoist">道教经典</option>
                  <option value="culture">传统文化典籍</option>
                </select>
                <input
                  type="text"
                  maxLength={80}
                  value={sTradition}
                  onChange={(e) => setSTradition(e.target.value)}
                  placeholder="所属分类（如：佛教 · 禅宗）"
                  className="rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
                />
              </div>
              <input
                type="text"
                maxLength={80}
                value={sTitle}
                onChange={(e) => setSTitle(e.target.value)}
                placeholder="经典名称（如：金刚经选段）"
                className="w-full rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
              />
              <input
                type="text"
                maxLength={500}
                value={sExcerpt}
                onChange={(e) => setSExcerpt(e.target.value)}
                placeholder="核心名句摘录（如：应无所住而生其心。）"
                className="w-full rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
              />
              <input
                type="text"
                maxLength={1000}
                value={sDesc}
                onChange={(e) => setSDesc(e.target.value)}
                placeholder="导读简介"
                className="w-full rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
              />
              <textarea
                rows={5}
                maxLength={50000}
                value={sFullText}
                onChange={(e) => setSFullText(e.target.value)}
                placeholder="完整经典正文（必填，可通过上方按钮导入 .txt / .md 文件）"
                className="w-full rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
              />
              <button
                type="submit"
                disabled={
                  busy || !sTitle.trim() || !sExcerpt.trim() || !sFullText.trim()
                }
                className="flex w-full items-center justify-center gap-1.5 rounded-[20px] bg-[#922e25] py-2.5 text-[12px] font-bold text-[#fff8eb] cursor-pointer disabled:opacity-50"
              >
                <Plus size={15} />
                <span>发布经典到云端</span>
              </button>
            </form>

            <div className="space-y-2">
              <h3 className="text-[13px] font-bold text-[#39251d]">
                当前经典列表（{scriptures.length}）
              </h3>
              {scriptures.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] px-3.5 py-2.5"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate text-[13px] font-bold text-[#39251d]">
                      {s.title}
                    </p>
                    <p className="truncate text-[10px] text-[#857362]">
                      {s.tradition}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`删除${s.title}`}
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      await deleteScripture(s.id);
                      setNotice(`已删除「${s.title}」`);
                      setBusy(false);
                    }}
                    className="rounded-full p-2 text-[#ef4444] hover:bg-[#eadfc9] cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audios Tab */}
        {tab === "audios" && (
          <div className="mt-4 space-y-4">
            <div className="rounded-[14px] border border-[#c59a53]/50 bg-[#eadfc9]/70 p-3.5 text-[11px] leading-5 text-[#563b2c]">
              <p className="font-bold text-[#39251d]">
                关于诵经音频上传的说明（免费测试期）
              </p>
              <p className="mt-1">
                大体积 MP3 音频需存放在专用文件存储空间（如 Firebase Storage、阿里云 OSS 或 Cloudflare R2）。当前为免付费测试期，暂未绑定外部文件存储：您可在下方直接填写 <span className="font-semibold">https://</span> 开头的音频链接发布给全球用户；等后续接好外部存储后，即可把上传生成的音频地址填入此处或升级为一键上传。
              </p>
            </div>

            <form
              onSubmit={handleCreateAudioTrack}
              className="space-y-3 rounded-[16px] border border-[#e4d8c3] bg-[#fffaf1] p-4"
            >
              <h2 className="text-[14px] font-bold text-[#39251d]">
                添加云端诵经音频
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={aPark}
                  onChange={(e) => setAPark(e.target.value as ParkSlug)}
                  className="rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
                >
                  <option value="buddhist">佛教寺院</option>
                  <option value="daoist">道教宫观</option>
                  <option value="culture">中华传统文化馆</option>
                </select>
                <select
                  value={aScriptureId}
                  onChange={(e) => setAScriptureId(e.target.value)}
                  className="rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
                >
                  <option value="general">通用静心音频</option>
                  {scriptures.map((s) => (
                    <option key={s.id} value={s.id}>
                      关联：{s.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  maxLength={80}
                  value={aTitle}
                  onChange={(e) => setATitle(e.target.value)}
                  placeholder="音频名称（如：心经念诵）"
                  className="col-span-2 rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
                />
                <input
                  type="text"
                  maxLength={40}
                  value={aDuration}
                  onChange={(e) => setADuration(e.target.value)}
                  placeholder="时长 05:00"
                  className="rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
                />
              </div>
              <input
                type="url"
                maxLength={1000}
                value={aUrl}
                onChange={(e) => setAUrl(e.target.value)}
                placeholder="音频直链地址（必须以 https:// 开头，支持 .mp3 / .m4a / .ogg）"
                className="w-full rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
              />
              <button
                type="submit"
                disabled={busy || !aTitle.trim() || !aUrl.trim()}
                className="flex w-full items-center justify-center gap-1.5 rounded-[20px] bg-[#922e25] py-2.5 text-[12px] font-bold text-[#fff8eb] cursor-pointer disabled:opacity-50"
              >
                <Plus size={15} />
                <span>发布音频到云端</span>
              </button>
            </form>

            <div className="space-y-2">
              <h3 className="text-[13px] font-bold text-[#39251d]">
                当前云端诵经音频（{chantingTracks.length}）
              </h3>
              {chantingTracks.length === 0 ? (
                <p className="rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] p-4 text-center text-[11px] text-[#857362]">
                  暂无云端音频；用户也可在「诵经」页直接选择本地 MP3 试听。
                </p>
              ) : (
                chantingTracks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] px-3.5 py-2.5"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate text-[13px] font-bold text-[#39251d]">
                        {t.title}
                      </p>
                      <p className="truncate text-[10px] text-[#857362]">
                        {parks[t.parkSlug]?.title} · {t.durationLabel} · {t.audioUrl}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`删除${t.title}`}
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        await deleteChantingTrack(t.id);
                        setNotice(`已删除「${t.title}」`);
                        setBusy(false);
                      }}
                      className="rounded-full p-2 text-[#ef4444] hover:bg-[#eadfc9] cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Gatherings Tab */}
        {tab === "gatherings" && (
          <div className="mt-4 space-y-4">
            <form
              onSubmit={handleCreateGathering}
              className="space-y-3 rounded-[16px] border border-[#e4d8c3] bg-[#fffaf1] p-4"
            >
              <h2 className="text-[14px] font-bold text-[#39251d]">
                发布新共修安排
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  maxLength={40}
                  value={gDay}
                  onChange={(e) => setGDay(e.target.value)}
                  placeholder="周期（如：每日）"
                  className="rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
                />
                <input
                  type="text"
                  maxLength={60}
                  value={gTime}
                  onChange={(e) => setGTime(e.target.value)}
                  placeholder="时段（如：晚间 20:00）"
                  className="rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
                />
              </div>
              <input
                type="text"
                maxLength={80}
                value={gTitle}
                onChange={(e) => setGTitle(e.target.value)}
                placeholder="活动标题（如：晚间静心抄经）"
                className="w-full rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
              />
              <textarea
                rows={2}
                maxLength={500}
                value={gDesc}
                onChange={(e) => setGDesc(e.target.value)}
                placeholder="活动说明"
                className="w-full rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
              />
              <button
                type="submit"
                disabled={busy || !gTitle.trim() || !gDesc.trim()}
                className="flex w-full items-center justify-center gap-1.5 rounded-[20px] bg-[#922e25] py-2.5 text-[12px] font-bold text-[#fff8eb] cursor-pointer disabled:opacity-50"
              >
                <Plus size={15} />
                <span>发布共修到云端</span>
              </button>
            </form>

            <div className="space-y-2">
              <h3 className="text-[13px] font-bold text-[#39251d]">
                当前共修安排（{gatherings.length}）
              </h3>
              {gatherings.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-[12px] border border-[#e4d8c3] bg-[#fffaf1] px-3.5 py-2.5"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate text-[13px] font-bold text-[#39251d]">
                      {g.title}
                    </p>
                    <p className="truncate text-[10px] text-[#857362]">
                      {g.day} · {g.time}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`删除${g.title}`}
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      await deleteGathering(g.id);
                      setNotice(`已删除「${g.title}」`);
                      setBusy(false);
                    }}
                    className="rounded-full p-2 text-[#ef4444] hover:bg-[#eadfc9] cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parks Intro Tab */}
        {tab === "parks" && (
          <div className="mt-4 rounded-[16px] border border-[#e4d8c3] bg-[#fffaf1] p-4 space-y-3">
            <h2 className="text-[14px] font-bold text-[#39251d]">
              修改园区介绍文字
            </h2>
            <select
              value={selectedParkSlug}
              onChange={(e) => {
                const slug = e.target.value as ParkSlug;
                setSelectedParkSlug(slug);
                setParkIntroText(parks[slug]?.introduction || "");
              }}
              className="w-full rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px]"
            >
              <option value="buddhist">佛教寺院</option>
              <option value="daoist">道教宫观</option>
              <option value="culture">中华传统文化馆</option>
            </select>
            <textarea
              rows={4}
              maxLength={1000}
              value={parkIntroText}
              onChange={(e) => setParkIntroText(e.target.value)}
              className="w-full rounded-[10px] border border-[#e4d8c3] bg-[#f6f0e5] px-3 py-2 text-[12px] leading-5"
            />
            <button
              type="button"
              disabled={busy || !parkIntroText.trim()}
              onClick={async () => {
                setBusy(true);
                await saveParkIntro(selectedParkSlug, parkIntroText);
                setNotice(`已更新「${parks[selectedParkSlug].title}」园区介绍！`);
                setBusy(false);
              }}
              className="w-full rounded-[20px] bg-[#922e25] py-2.5 text-[12px] font-bold text-[#fff8eb] cursor-pointer disabled:opacity-50"
            >
              保存园区介绍
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
