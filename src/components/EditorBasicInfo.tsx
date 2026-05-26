import React, { useState } from 'react';
import { Project, StructureType } from '../types';
import { 
  FileEdit, 
  HelpCircle, 
  Layers, 
  Tag, 
  Eye, 
  PenTool, 
  AlignLeft,
  Minimize2,
  Plus,
  X,
  Sparkles,
  Globe,
  Calendar,
  ShieldAlert,
  Hash,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface EditorBasicInfoProps {
  project: Project;
  onUpdateProject: (fields: Partial<Project>) => void;
}

// Offline Suggestion Engine Database
const ASSOCIATIVE_KEYWORDS: Record<string, string[]> = {
  fantasy: ["剣と魔法", "失われた王権", "魔導コア", "古代帝国の秘宝", "異種族の盟約", "封印されし魔物", "星の導き", "精霊のささやき", "忘却の契約", "竜帝の涙", "伝説の魔導書", "聖なる儀式"],
  mystery: ["密室の謎", "アリバイ証言の矛盾", "交錯する嘘", "偽装された遺体", "第二の殺人予告", "歪んだ復讐心", "警察内部の協力者", "封印された過去の証拠", "血塗られたコイン", "最後の容疑者", "ダイイングメッセージ", "時計台の謀略"],
  scifi: ["時空の歪み", "AIの覚醒", "サイバネティクス", "ナノマシン侵蝕", "オルタナティブ・アース", "ディストピア管理局", "量子共鳴装置", "自我を持つアンドロイド", "移民船団の陰謀", "事象の地平線", "次元跳躍ゲート", "サイバースペース"],
  romance: ["すれ違う運命", "すれ違いの嘘", "幼馴染との再会", "身分違いの恋情", "秘密の同居生活", "かりそめの婚約", "雨の日の約束", "交錯するアプローチ", "ライバルの出現", "不器用な優しさ", "告白の放課後", "奇跡の再会"],
  battle: ["宿命の決闘", "リミット解除", "能力の代償", "誓いの刻印", "裏切りと覚醒", "地下格闘結社", "継承されし意志", "不殺の信念", "限界突破", "闇の軍勢", "ライバルとの共闘", "覚醒のトリガー"]
};

const POPULAR_WEB_TAGS = ["異世界転生", "異世界転移", "ざまぁ", "チート・最強", "悪役令嬢", "婚約破棄", "学園ラブコメ", "ダンジョン配信", "VRMMO", "追放・スキル", "ほのぼの・日常", "現代ファンタジー", "魔王・勇者", "主人公最強", "ハッピーエンド"];
const POPULAR_PLATFORMS = ["小説家になろう", "カクヨム", "アルファポリス", "pixiv小説", "エブリスタ", "ノベルアップ＋"];
const AGE_RATINGS_POOL = ["R15", "残酷な描写あり", "ボーイズラブ (BL)", "ガールズラブ (GL)"];

export default function EditorBasicInfo({ project, onUpdateProject }: EditorBasicInfoProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const [newWebTag, setNewWebTag] = useState('');

  const structureOptions: { value: StructureType; label: string; desc: string }[] = [
    { 
      value: 'three_act', 
      label: '三幕構成 (Three-Act)', 
      desc: '映画やハリウッド脚本の王道。設定・対立・解決の3ステップで物語の起伏（ミッドポイントなど）を完璧に制御します。' 
    },
    { 
      value: 'kishotenketsu', 
      label: '起承転結 (Kishōtenketsu)', 
      desc: '日本の伝統的な4コマ・物語構成。はじめに設定を提示、そこから膨らませ、大きな変化（転）を与え、きれいに結びます。' 
    },
    { 
      value: 'johakyu', 
      label: '序破急 (Jo-ha-kyū)', 
      desc: '能楽発祥の3幕スタイル。静かに始まり（序）、変化を重ねて加速し（破）、一気に急転・激化して爆発的に終わる（急）構成。' 
    },
    { 
      value: 'custom', 
      label: '自由構成 (Custom)', 
      desc: '独自の章・展開。テンプレートにとらわれず、思い描いた独自のシチュエーションや連作短編のプロットを構築します。' 
    }
  ];

  const handleFieldChange = (key: keyof Project, val: any) => {
    onUpdateProject({ [key]: val });
  };

  const handleAddKeyword = (kw: string) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    const currentList = project.keywords || [];
    if (currentList.includes(trimmed)) return;
    handleFieldChange('keywords', [...currentList, trimmed]);
  };

  const handleRemoveKeyword = (indexToRemove: number) => {
    const currentList = project.keywords || [];
    handleFieldChange('keywords', currentList.filter((_, idx) => idx !== indexToRemove));
  };

  // Generate offline recommendations based on current genre matching
  const getOfflineSuggestions = (): string[] => {
    const genreNormalized = (project.genre || '').toLowerCase();
    const current = project.keywords || [];
    let pool: string[] = [];

    if (genreNormalized.includes('ファンタジー') || genreNormalized.includes('幻想') || genreNormalized.includes('魔法') || genreNormalized.includes('異世界') || genreNormalized.includes('fantasy')) {
      pool = [...pool, ...ASSOCIATIVE_KEYWORDS.fantasy];
    }
    if (genreNormalized.includes('ミステリ') || genreNormalized.includes('推理') || genreNormalized.includes('探偵') || genreNormalized.includes('謎') || genreNormalized.includes('事件') || genreNormalized.includes('mystery')) {
      pool = [...pool, ...ASSOCIATIVE_KEYWORDS.mystery];
    }
    if (genreNormalized.includes('sf') || genreNormalized.includes('宇宙') || genreNormalized.includes('ロボ') || genreNormalized.includes('機械') || genreNormalized.includes('未来') || genreNormalized.includes('scifi')) {
      pool = [...pool, ...ASSOCIATIVE_KEYWORDS.scifi];
    }
    if (genreNormalized.includes('恋愛') || genreNormalized.includes('ラブ') || genreNormalized.includes('学園') || genreNormalized.includes('青春') || genreNormalized.includes('恋') || genreNormalized.includes('romance')) {
      pool = [...pool, ...ASSOCIATIVE_KEYWORDS.romance];
    }
    if (genreNormalized.includes('バトル') || genreNormalized.includes('戦闘') || genreNormalized.includes('アクション') || genreNormalized.includes('異能') || genreNormalized.includes('戦記') || genreNormalized.includes('battle')) {
      pool = [...pool, ...ASSOCIATIVE_KEYWORDS.battle];
    }

    // Default global pool if no direct genre matches
    if (pool.length === 0) {
      pool = [
        ...ASSOCIATIVE_KEYWORDS.fantasy.slice(0, 4), 
        ...ASSOCIATIVE_KEYWORDS.mystery.slice(0, 4), 
        ...ASSOCIATIVE_KEYWORDS.romance.slice(0, 4)
      ];
    }

    // Filter out already added ones
    return Array.from(new Set(pool)).filter(kw => !current.includes(kw)).slice(0, 8);
  };

  const activeSuggestions = getOfflineSuggestions();

  return (
    <div className="space-y-6" id="editor-basic-info-tab">
      {/* Title section with styling */}
      <div className="bg-[#141414] border border-stone-800 rounded-xl p-5 shadow-sm" id="section-core-details">
        <h3 className="font-serif text-base font-bold text-[#c5a059] mb-4 flex items-center gap-1.5 border-b border-stone-800 pb-2">
          <PenTool className="w-5 h-5 text-[#c5a059]" />
          基本設計図 (ログラインとテーマ)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 block flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
              作品名 / 仮タイトル
            </label>
            <input
              type="text"
              value={project.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="例：星紡ぎのクロニクル"
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-stone-800 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none transition-all bg-stone-900 text-stone-200"
              id="input-title"
            />
          </div>

          {/* Genre input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 block flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
              ジャンル
            </label>
            <input
              type="text"
              value={project.genre}
              onChange={(e) => handleFieldChange('genre', e.target.value)}
              placeholder="例：ハイファンタジー / 冒険譚、本格ミステリー"
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-stone-800 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none transition-all bg-stone-900 text-stone-200"
              id="input-genre"
            />
          </div>

          {/* Theme input */}
          <div className="col-span-1 md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-stone-300 block flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
              コアテーマ / 本質（この物語で一番伝えたいこと）
            </label>
            <input
              type="text"
              value={project.theme}
              onChange={(e) => handleFieldChange('theme', e.target.value)}
              placeholder="例：宿命からの脱却、失った家族の再生、嘘で塗り固められた愛"
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-stone-800 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none transition-all bg-stone-900 text-stone-200"
              id="input-theme"
            />
          </div>

          {/* Key Words Manager */}
          <div className="col-span-1 md:col-span-2 space-y-2 border-t border-stone-850/60 pt-4 mt-1">
            <label className="text-xs font-bold text-[#c5a059] block flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#c5a059]" />
              物語の中心キーワード (作品を象徴する単語)
            </label>
            <p className="text-[10px] text-stone-500 leading-relaxed">
              物語の展開、ギミック、主要なモチーフを登録します。登録されたキーワードは、隣の「展開プロット」作成画面ですぐ参照でき、全体の芯がぶれない創作をサポートします。
            </p>

            {/* Keyword Input Box */}
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword(keywordInput);
                    setKeywordInput('');
                  }
                }}
                placeholder="新しいキーワードを入力してEnter、または右のボタンで追加"
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-stone-800 bg-stone-900 text-stone-200 outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-all"
                id="input-keyword"
              />
              <button
                type="button"
                onClick={() => {
                  handleAddKeyword(keywordInput);
                  setKeywordInput('');
                }}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 border border-[#c5a059]/20 text-[#c5a059] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                id="btn-add-keyword"
              >
                <Plus className="w-3.5 h-3.5" />
                追加
              </button>
            </div>

            {/* Existing Keyword Badges List */}
            <div className="flex flex-wrap gap-1.5 py-1" id="basic-keywords-list">
              {(project.keywords || []).length > 0 ? (
                (project.keywords || []).map((word, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-[#181816] border border-[#c5a059]/20 text-[#c5a059]"
                    id={`kw-badge-${idx}`}
                  >
                    #{word}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(idx)}
                      className="text-stone-500 hover:text-red-400 focus:outline-none ml-1 transition-colors cursor-pointer"
                      id={`kw-btn-del-${idx}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-stone-550 italic">登録されたキーワードがありません。下の提案枠から選ぶか、自分で入力して追加してください。</span>
              )}
            </div>

            {/* Auto Suggestions Panel */}
            {activeSuggestions.length > 0 && (
              <div className="bg-[#181816]/60 border border-[#c5a059]/10 p-3 rounded-lg space-y-2 mt-2" id="suggestion-engine-panel">
                <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 animate-pulse" />
                  💡 お勧め連想キーワード (現在のジャンルに基づき抽出した連動アイデア)
                </span>
                <div className="flex flex-wrap gap-1.5 pl-1">
                  {activeSuggestions.map((kw, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => handleAddKeyword(kw)}
                      className="text-[10px] px-2 py-1 rounded bg-[#20201d]/80 hover:bg-[#c5a059]/15 text-stone-300 hover:text-[#c5a059] border border-stone-800 hover:border-[#c5a059]/30 transition-all font-medium cursor-pointer"
                      id={`btn-suggest-kw-${i}`}
                    >
                      +{kw}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logline input */}
          <div className="col-span-1 md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-stone-300 block flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                ログライン / 一言あらすじ (100〜200字前後)
              </span>
              <span className="text-[10px] text-stone-500">AIに全体像を教える要となります</span>
            </label>
            <textarea
              rows={3}
              value={project.logline}
              onChange={(e) => handleFieldChange('logline', e.target.value)}
              placeholder="例：記憶なき少年兵と、世界の終焉を司る魔導師が、真実の星へと至る旅路。道中さまざまな人々を助けながら、崩壊した星のコアを活性化する旅へと駒を進める。"
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-stone-800 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none transition-all resize-y bg-stone-900 text-stone-200 leading-relaxed"
              id="input-logline"
            />
          </div>
        </div>
      </div>

      {/* Target & Tone Section */}
      <div className="bg-[#141414] border border-stone-800 rounded-xl p-5 shadow-sm space-y-4" id="section-target-tone">
        <h3 className="font-serif text-base font-bold text-[#c5a059] flex items-center gap-1.5 border-b border-stone-800 pb-2">
          <Eye className="w-5 h-5 text-[#c5a059]" />
          読者層とトーン・スタイル設定
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target Audience */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 block">ターゲット読者</label>
            <input
              type="text"
              value={project.targetAudience}
              onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
              placeholder="例：20代〜30代のSFミステリファン"
              className="w-full text-xs px-3 py-2 rounded-lg border border-stone-800 focus:border-[#c5a059] bg-stone-900 text-stone-200 outline-none select-none transition-all"
              id="input-target"
            />
          </div>

          {/* Desired Length */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 block">想定される分量</label>
            <input
              type="text"
              value={project.desiredLength}
              onChange={(e) => handleFieldChange('desiredLength', e.target.value)}
              placeholder="例：ライトノベル1巻(10万〜12万字)"
              className="w-full text-xs px-3 py-2 rounded-lg border border-stone-800 focus:border-[#c5a059] bg-stone-900 text-stone-200 outline-none select-none transition-all"
              id="input-length"
            />
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 block">作品の文体・作風・温度感</label>
            <input
              type="text"
              value={project.tone}
              onChange={(e) => handleFieldChange('tone', e.target.value)}
              placeholder="例：三人称、抒情的で情緒的な表現、緊張感高め"
              className="w-full text-xs px-3 py-2 rounded-lg border border-stone-800 focus:border-[#c5a059] bg-stone-900 text-stone-200 outline-none select-none transition-all"
              id="input-tone"
            />
          </div>
        </div>
      </div>

      {/* Web Novel Platforms & Publishing Console */}
      <div className="bg-[#141414] border border-stone-800 rounded-xl p-5 shadow-sm space-y-5" id="section-web-novel-console">
        <div className="border-b border-stone-800 pb-2.5 flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-serif text-sm md:text-base font-bold text-[#c5a059] flex items-center gap-1.5 text-stone-100">
            <Globe className="w-5 h-5 text-[#c5a059]" />
            「小説家になろう」「カクヨム」等 Web小説投稿・連載設定
          </h3>
          <span className="text-[10px] bg-[#c5a059]/10 text-[#c5a059] px-2 py-0.5 rounded border border-[#c5a059]/20 font-bold flex items-center gap-1 animate-pulse" id="badge-pacing-indicator">
            <Sparkles className="w-3 h-3 text-amber-500" />
            3,500〜5,000文字自動連動推奨
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Target Platforms Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 block flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              掲載対象のWebサービス (複数選択可)
            </label>
            <p className="text-[10px] text-stone-500">投稿プラットフォームにあわせて章構成のアドバイスが変わります。</p>
            <div className="flex flex-wrap gap-1.5" id="web-platforms-picker">
              {POPULAR_PLATFORMS.map((plat) => {
                const currentServices = project.publishServices || [];
                const isSelected = currentServices.includes(plat);
                return (
                  <button
                    type="button"
                    key={plat}
                    onClick={() => {
                      const next = isSelected 
                        ? currentServices.filter(s => s !== plat)
                        : [...currentServices, plat];
                      handleFieldChange('publishServices', next);
                    }}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
                      isSelected
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-[#c5a059]'
                        : 'bg-stone-900/60 border-stone-800 text-stone-455 hover:border-[#c5a059]/30 hover:text-stone-200'
                    }`}
                    id={`btn-plat-opt-${plat}`}
                  >
                    {plat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Word Count Guidelines & Target */}
          <div className="space-y-3 bg-stone-900/60 p-3.5 rounded-lg border border-stone-850" id="word-count-limits-panel">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <AlignLeft className="w-4 h-4 text-[#c5a059]" />
                1話あたりの目標文字数設定
              </span>
              <span className="text-[10px] font-mono font-bold text-[#c5a059]">推奨限界: 3,500〜5,000文字</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-stone-505 uppercase block">最低（文字以上）</span>
                <input
                  type="number"
                  value={project.episodeWordCountMin ?? 3500}
                  onChange={(e) => handleFieldChange('episodeWordCountMin', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-xs px-2.5 py-1.5 rounded bg-stone-950 border border-stone-800 text-stone-200 text-center focus:border-[#c5a059] outline-none"
                  min={0}
                  step={100}
                  id="input-wordcount-min"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-stone-505 uppercase block">最高（文字以下）</span>
                <input
                  type="number"
                  value={project.episodeWordCountMax ?? 5000}
                  onChange={(e) => handleFieldChange('episodeWordCountMax', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-xs px-2.5 py-1.5 rounded bg-stone-950 border border-stone-800 text-stone-200 text-center focus:border-[#c5a059] outline-none"
                  min={0}
                  step={100}
                  id="input-wordcount-max"
                />
              </div>
            </div>

            {/* Warning logic on target length limit */}
            {((project.episodeWordCountMin ?? 3500) < 3000 || (project.episodeWordCountMax ?? 5000) > 6000) ? (
              <div className="flex items-start gap-2 bg-amber-550/10 text-amber-500 border border-amber-550/20 p-2 rounded text-[10px] leading-relaxed" id="pacing-len-warning">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                <span>
                  現在の設定文字数はWeb小説において離脱率が上がる可能性があります。3,500〜5,000文字は「隙間読書（通勤・休憩時間）」に最も適し、スクロール負担を軽減できる実証済みの推奨ボリュームです。
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-1.5 bg-emerald-500/5 text-emerald-550 border border-emerald-500/10 p-2 rounded text-[10px]" id="pacing-len-success">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>推奨文字数（3500〜5000字）に合致しています。起伏・章割りの文字数チェックで高スコアになります！</span>
              </div>
            )}
          </div>

          {/* Update frequency & Pacing */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-200 block flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#c5a059]" />
              連載・更新スケジュール予定
            </label>
            <input
              type="text"
              value={project.publishSchedule ?? ''}
              onChange={(e) => handleFieldChange('publishSchedule', e.target.value)}
              placeholder="例：毎週金曜日・土曜日の 18:00 更新（週2回）"
              className="w-full text-xs px-3 py-2 rounded-lg border border-stone-800 bg-stone-900 text-stone-200 outline-none focus:border-[#c5a059] transition-all"
              id="input-publish-schedule"
            />
            <p className="text-[10px] text-stone-500 leading-normal">
              定期的な更新（曜日と時間の固定）は、Web小説において固定ファンを獲得し、日間／週間ランキングを駆け上る基本戦略です。
            </p>
          </div>

          {/* Age Rating checks */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-200 block flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#c5a059]" />
              作品に必要な閲覧確認用タグ (自主規制警告タグ)
            </label>
            <div className="flex flex-wrap gap-1.5" id="age-rating-badges">
              {AGE_RATINGS_POOL.map((rating) => {
                const currentRatings = project.publishAgeRatings || [];
                const isSelected = currentRatings.includes(rating);
                return (
                  <button
                    type="button"
                    key={rating}
                    onClick={() => {
                      const next = isSelected 
                        ? currentRatings.filter(r => r !== rating)
                        : [...currentRatings, rating];
                      handleFieldChange('publishAgeRatings', next);
                    }}
                    className={`text-[10px] px-2.5 py-1.5 rounded-md border cursor-pointer font-bold transition-all ${
                      isSelected
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                        : 'bg-stone-900/40 border-stone-800 text-stone-450 hover:border-stone-750'
                    }`}
                    id={`btn-rating-opt-${rating}`}
                  >
                    {isSelected ? '✓ ' : ''}{rating}
                  </button>
                );
              })}
            </div>
            <p className="text-[9px] text-stone-500">※ 各サイトへの登録時に必須の警告設定です（例：ネット小説大賞、カクヨムコンテスト等の掲載規定対応用）。</p>
          </div>

          {/* Web Novel Tag Manager */}
          <div className="col-span-1 md:col-span-2 space-y-2 border-t border-stone-850/60 pt-3.5">
            <label className="text-xs font-bold text-[#c5a059] block flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-[#c5a059]" />
              掲載用の検索タグ・キーワード設定 (なろう／カクヨム連動タグ)
            </label>
            <p className="text-[10px] text-stone-500">
              Web小説の検索ヒット傾向を高め、ランキング圏内に入りやすくする人気のキーワードタグを割り振ります。
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newWebTag}
                onChange={(e) => setNewWebTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!newWebTag.trim()) return;
                    const prev = project.publishKeywords || [];
                    if (!prev.includes(newWebTag.trim())) {
                      handleFieldChange('publishKeywords', [...prev, newWebTag.trim()]);
                    }
                    setNewWebTag('');
                  }
                }}
                placeholder="オリジナルの検索タグを入力してEnter"
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-900 text-stone-200 outline-none focus:border-[#c5a059] transition-all"
                id="input-web-tag"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newWebTag.trim()) return;
                  const prev = project.publishKeywords || [];
                  if (!prev.includes(newWebTag.trim())) {
                    handleFieldChange('publishKeywords', [...prev, newWebTag.trim()]);
                  }
                  setNewWebTag('');
                }}
                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 rounded-lg text-xs font-semibold cursor-pointer"
                id="btn-add-web-tag"
              >
                追加
              </button>
            </div>

            {/* Predefined Click-to-Add tags recommendation panel */}
            <div className="bg-stone-950/60 p-2.5 rounded-lg border border-stone-850 text-[10px] space-y-1.5 shadow-inner" id="presets-web-tags-panel">
              <span className="text-stone-450 block font-bold">🎯 推奨・人気のタグをタップして簡単追加:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_WEB_TAGS.map((tag) => {
                  const currentTags = project.publishKeywords || [];
                  const isAdded = currentTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => {
                        const next = isAdded
                          ? currentTags.filter(t => t !== tag)
                          : [...currentTags, tag];
                        handleFieldChange('publishKeywords', next);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-medium border cursor-pointer transition-all ${
                        isAdded
                          ? 'bg-[#c5a059]/15 border-[#c5a059]/40 text-[#c5a059]'
                          : 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-400'
                      }`}
                      id={`btn-quick-tag-${tag}`}
                    >
                      {isAdded ? '✓ ' : '+'}{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List of active keywords */}
            <div className="flex flex-wrap gap-1.5 py-1" id="active-web-tags-list">
              {(project.publishKeywords || []).length > 0 ? (
                (project.publishKeywords || []).map((word, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-[#1d1d1b] border border-emerald-500/20 text-[#c5a059]"
                    id={`active-web-tag-badge-${word}`}
                  >
                    #{word}
                    <button
                      type="button"
                      onClick={() => {
                        const next = (project.publishKeywords || []).filter((_, i) => i !== idx);
                        handleFieldChange('publishKeywords', next);
                      }}
                      className="text-stone-500 hover:text-rose-450 focus:outline-none ml-1 transition-colors cursor-pointer"
                      id={`active-web-tag-delete-btn-${word}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-stone-550 italic">設定された検索タグがありません。上の人気一覧からお選びください。</span>
              )}
            </div>
          </div>

          {/* Web novel custom Synopsis wrapper */}
          <div className="col-span-1 md:col-span-2 space-y-2 border-t border-stone-850/60 pt-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-stone-300 block flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                Web公開用の紹介あらすじ文設定 (カクヨム・なろう最適化)
              </label>
              <div className="text-[10px] text-stone-500 font-mono">
                文字数: <b className="text-stone-300">{(project.publishSynopsis || '').length}</b> / 10,000 文字
              </div>
            </div>
            <p className="text-[10px] text-stone-500 leading-relaxed">
              通常書籍のあらすじとは異なり、Web小説の紹介あらすじは「読者のストレスにならず、1文目でチート・動機がすぐ伝わる」ようにキャッチフレーズを上部に並べると読者が劇的に流入します。
            </p>
            <textarea
              rows={4}
              value={project.publishSynopsis ?? ''}
              onChange={(e) => handleFieldChange('publishSynopsis', e.target.value)}
              placeholder="【1行目キャッチ例：チート無双、婚約破棄された、ざまぁ、スローライフなどの魅力ワード】&#10;&#10;紹介文：&#10;ここに魅力的なストーリー要約や、なろう・カクヨム向けのキャラクター口調セリフによる宣伝メッセージを注入します。"
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-800 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none transition-all resize-y bg-stone-900 text-stone-200 leading-relaxed font-serif"
              id="input-web-synopsis"
            />
          </div>
        </div>
      </div>

      {/* Narrative Structure Selector */}
      <div className="bg-[#141414] border border-stone-800 rounded-xl p-5 shadow-sm space-y-4" id="section-structure">
        <h3 className="font-serif text-base font-bold text-[#c5a059] flex items-center gap-1.5 border-b border-stone-800 pb-2">
          <Layers className="w-5 h-5 text-[#c5a059]" />
          構成フレーム（選択により出力プロンプトが最適化されます）
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="structure-grid">
          {structureOptions.map((opt) => {
            const isSelected = project.structureType === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => onUpdateProject({ structureType: opt.value })}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#c5a059] bg-[#1a1a1a] ring-1 ring-[#c5a059]'
                    : 'border-stone-800 hover:border-stone-750 bg-stone-900/40 text-stone-300'
                }`}
                id={`structure-opt-${opt.value}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-200">{opt.label}</span>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#c5a059]' : 'border-stone-700'}`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-450 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
