import React from 'react';
import { Project, PlotBeat, Character } from '../types';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  User, 
  Layers, 
  LineChart, 
  Compass, 
  Eye, 
  FolderSync,
  CheckCircle2,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EditorPlotBeatsProps {
  project: Project;
  onUpdateProject: (fields: Partial<Project>) => void;
}

export default function EditorPlotBeats({ project, onUpdateProject }: EditorPlotBeatsProps) {
  
  // Reorder index helper
  const moveBeat = (index: number, direction: 'up' | 'down') => {
    const newBeats = [...project.beats];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBeats.length) return;
    
    // Swap
    const temp = newBeats[index];
    newBeats[index] = newBeats[targetIndex];
    newBeats[targetIndex] = temp;
    onUpdateProject({ beats: newBeats });
  };

  const handleAddField = () => {
    const newBeat: PlotBeat = {
      id: `beat-${Date.now()}`,
      title: `第${project.beats.length + 1}章：新たな展開`,
      description: '',
      tension: 50,
      keyCharacters: []
    };
    onUpdateProject({
      beats: [...project.beats, newBeat]
    });
  };

  const handleUpdateBeat = (id: string, fields: Partial<PlotBeat>) => {
    const updated = project.beats.map(b => {
      if (b.id === id) {
        return { ...b, ...fields };
      }
      return b;
    });
    onUpdateProject({ beats: updated });
  };

  const handleDeleteBeat = (id: string) => {
    onUpdateProject({
      beats: project.beats.filter(b => b.id !== id)
    });
  };

  const toggleCharacterInBeat = (beatId: string, charId: string) => {
    const updated = project.beats.map(b => {
      if (b.id === beatId) {
        const index = b.keyCharacters.indexOf(charId);
        let newKeys = [...b.keyCharacters];
        if (index > -1) {
          newKeys.splice(index, 1);
        } else {
          newKeys.push(charId);
        }
        return { ...b, keyCharacters: newKeys };
      }
      return b;
    });
    onUpdateProject({ beats: updated });
  };

  // Generate Recommended Templates
  const handleLoadStructureTemplate = () => {
    let templateBeats: Omit<PlotBeat, 'id'>[] = [];
    
    if (project.structureType === 'kishotenketsu') {
      templateBeats = [
        {
          title: '【起】日常と物語の導入',
          description: '主人公の平穏な、あるいは満たされない日常を描きます。主要キャラクターが登場し、読者に世界観の前提条件を自然に提示します。最後に、日常を破壊する、あるいは冒険へ引きずり出す「最初のきっかけ」が起こります。',
          tension: 30,
          keyCharacters: project.characters.slice(0, 1).map(c => c.id)
        },
        {
          title: '【承】事件の本格化と進展',
          description: '主人公が物語の目的を設定し、本格的な行動を開始。仲間と出会い、様々な困難や日常との違いに戸惑いながらも、目標へ向かって成長するプロセスを描き出します。徐々に障害が深刻になっていきます。',
          tension: 60,
          keyCharacters: project.characters.slice(0, 2).map(c => c.id)
        },
        {
          title: '【転】予期せぬ転換とクライマックス',
          description: '物語最大のサプライズ、予期せぬ裏切り、真実の発覚、または敵の圧倒的な大攻勢が起こり、ストーリーの進路が大きく歪みます。主人公は窮地に立たされ、最大の覚悟をもって最終決戦に挑みます。',
          tension: 90,
          keyCharacters: project.characters.map(c => c.id)
        },
        {
          title: '【結】伏線回収と結末',
          description: '事件の完全な収束を描きます。ラスボスへの決着、謎の氷解、主人公が何を得て何を失ったかを明確にし、新たな平穏な日常、あるいは次のステップに向けて旅立つ輝かしいフィナーレを描きます。',
          tension: 40,
          keyCharacters: project.characters.slice(0, 2).map(c => c.id)
        }
      ];
    } else if (project.structureType === 'three_act') {
      templateBeats = [
        {
          title: '第1幕：日常と事件への誘い（セットアップ〜プロットポイント1）',
          description: '主人公を取り巻く世界。行動喚起となる事件（インサイティング・インシデント）が起き、一度は躊躇するものの、退路を断たれて新世界へと旅立つ決意を固める（プロットポイント1）。全体の4分の1相当。',
          tension: 30,
          keyCharacters: project.characters.slice(0, 1).map(c => c.id)
        },
        {
          title: '第2幕前半：障害と中間評価（対立 A：ピンチ〜ミッドポイント）',
          description: '新世界の探索、新しい仲間や能力。徐々に牙をむく敵との小競り合い。最終目的の核に触れるショッキングな真実・あるいは仮初の成功を収め、物語の折り返し地点となる「ミッドポイント」を通過。',
          tension: 55,
          keyCharacters: project.characters.slice(0, 2).map(c => c.id)
        },
        {
          title: '第2幕後半：最大の挫折と闇夜（対立 B：プロットポイント2）',
          description: 'ミッドポイントの反動。敵の本格的包囲網。大切な仲間の喪失や自身の正体の発覚、退路も目的も見失う「魂の暗い夜（オール・イズ・ロスト、プロットポイント2）」を経て、真の決意を固める。',
          tension: 85,
          keyCharacters: project.characters.map(c => c.id)
        },
        {
          title: '第3幕：怒涛の反撃と大団円（解決：フィナーレ〜エピローグ）',
          description: '敵の本拠地への突入。蓄えたすべての絆、力を解き放つ大決戦（クライマックス）。対立の終結と、以前とはどこか精神的に大きく成長した穏やかで成熟した新たな日常への帰還。',
          tension: 100,
          keyCharacters: project.characters.slice(0, 2).map(c => c.id)
        }
      ];
    } else if (project.structureType === 'johakyu') {
      templateBeats = [
        {
          title: '【序】物語の導入（静かに始まる前提提示）',
          description: '物語の速度は遅く、静かに厳かに始まります。観客、読者に最低限の環境や人間を認知させ、一瞬訪れる不穏な違和感によって次の変化への足がかりを設置します。',
          tension: 25,
          keyCharacters: project.characters.slice(0, 1).map(c => c.id)
        },
        {
          title: '【破】事件の急加速と激化（変化・破調・怒涛のイベント）',
          description: 'ここからスピード感が倍増し、次々と想定外の事態が起こります。主人公は立ち止まる暇もなく対応を強いられ、様々な立場との対立や戦闘が勃発。緊張が一気に極限までビルドアップされます。',
          tension: 70,
          keyCharacters: project.characters.map(c => c.id)
        },
        {
          title: '【急】一気呵成の決着（爆発的なクライマックス）',
          description: '高まりきったエネルギーをフルスピードで炸裂させます。因縁 of 対決、世界の命運を分ける一瞬。一切の迷いなく勝負を決め、最高密度の余韻を残したまま急転直下で一気に締めくくります。',
          tension: 100,
          keyCharacters: project.characters.slice(0, 2).map(c => c.id)
        }
      ];
    } else {
      // Custom generic starting structures
      templateBeats = [
        {
          title: 'プロローグ',
          description: '物語の発端、主要なお知らせやインパクト。',
          tension: 40,
          keyCharacters: []
        },
        {
          title: '第1章',
          description: '事件の始まりを詳細に描き込みます。',
          tension: 60,
          keyCharacters: []
        },
        {
          title: '中間部・クライマックス',
          description: '最も盛り上がりを見せる攻防サスペンス。',
          tension: 95,
          keyCharacters: []
        },
        {
          title: 'エピローグ',
          description: '解決、すべての後日談と美しい光景。',
          tension: 20,
          keyCharacters: []
        }
      ];
    }

    const compiled: PlotBeat[] = templateBeats.map((b, i) => ({
      ...b,
      id: `beat-tpl-${Date.now()}-${i}`
    }));

    onUpdateProject({ beats: compiled });
  };

  // Build beautiful SVG tension chart points
  const drawTensionChart = () => {
    if (project.beats.length < 2) return null;
    const padding = 20;
    const width = 600;
    const height = 110;
    
    const stepX = (width - padding * 2) / (project.beats.length - 1);
    
    let pathD = '';
    const dots: { x: number; y: number; tension: number; name: string }[] = [];
 
    project.beats.forEach((beat, index) => {
      const x = padding + index * stepX;
      // standard range in svg is 0 (top) to height (bottom). We want 100% tension to be AT THE TOP, so inverted:
      const y = height - padding - (beat.tension / 100) * (height - padding * 2);
      
      if (index === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        // Curve connection using cubic/quadratic control points for smoothness
        const prevX = padding + (index - 1) * stepX;
        const prevY = height - padding - (project.beats[index - 1].tension / 100) * (height - padding * 2);
        const cpX1 = prevX + stepX / 2;
        const cpY1 = prevY;
        const cpX2 = prevX + stepX / 2;
        const cpY2 = y;
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
      }
      dots.push({ x, y, tension: beat.tension, name: beat.title });
    });
 
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-[#c5a059]" preserveAspectRatio="none">
        {/* Underlay Gradient */}
        <defs>
          <linearGradient id="chart-tension-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c5a059" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#c5a059" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Render area path with double close paths */}
        {project.beats.length > 1 && (
          <path
            d={`${pathD} L ${dots[dots.length - 1].x} ${height} L ${dots[0].x} ${height} Z`}
            fill="url(#chart-tension-grad)"
          />
        )}
 
        {/* Tension guide grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#2d2d2d" strokeDasharray="3,3" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#282828" strokeDasharray="3,3" />
 
        {/* Pure Line */}
        <path d={pathD} fill="none" stroke="#c5a059" strokeWidth="2.5" strokeLinecap="round" />
 
        {/* Dots */}
        {dots.map((dot, i) => (
          <g key={i} className="group/dot cursor-pointer">
            <circle cx={dot.x} cy={dot.y} r="5" fill="#1e1e1e" stroke="#c5a059" strokeWidth="2" />
            <circle cx={dot.x} cy={dot.y} r="10" fill="transparent" />
            {/* tooltip */}
            <text x={dot.x} y={dot.y - 12} textAnchor="middle" className="text-[9px] font-sans font-extrabold fill-[#c5a059]">
              {dot.tension}%
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const getStructureJapaneseName = () => {
    switch (project.structureType) {
      case 'kishotenketsu': return '起承転結 (4幕構成)';
      case 'three_act': return '三幕構成 (4ステップ制御)';
      case 'johakyu': return '序破急 (能楽3構成)';
      case 'custom': return '自由構成';
    }
  };

  return (
    <div className="space-y-6" id="editor-plot-beats-tab">
      
      {/* Structural Re-initializer & Tension Chart panel */}
      <div className="bg-[#141414] border border-stone-800 rounded-xl p-5 shadow-sm space-y-4" id="beats-overview-card">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3" id="beats-header-controls">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#c5a059]" />
              <span className="font-serif font-bold text-stone-200 text-sm">
                展開プロット・起伏・章割りの設計
              </span>
            </div>
            <p className="text-xs text-stone-550">
              設定中の構成フレーム: <span className="font-bold text-[#c5a059]">{getStructureJapaneseName()}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleLoadStructureTemplate}
              className="px-3 py-1.5 bg-stone-850 hover:bg-stone-800 border border-stone-750 text-xs font-semibold text-stone-200 hover:text-[#c5a059] transition-colors rounded-md flex items-center gap-1.5 shadow-xs"
              id="btn-load-struct-tpl"
            >
              <FolderSync className="w-3.5 h-3.5" />
              構成立て直し（テンプレート適用）
            </button>
            <button
              onClick={handleAddField}
              className="px-3.5 py-1.5 bg-[#c5a059] hover:bg-[#b48e48] text-black text-xs font-semibold rounded-md flex items-center gap-1.5 shadow-xs font-bold"
              id="btn-add-beat-top"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              新しい章の追加
            </button>
          </div>
        </div>

        {/* Story Blueprint Quick References */}
        <div className="bg-[#111] p-3 rounded-lg border border-stone-850 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs" id="story-pillars-ref">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-550"></span>
              📌 コアテーマ (伝えたい本質)
            </span>
            <div className="text-stone-350 font-serif font-bold pl-2.5 border-l border-stone-800 min-h-[1.5rem] flex items-center">
              {project.theme ? (
                <span>{project.theme}</span>
              ) : (
                <span className="text-stone-605 text-[11px] italic">未設定（「作品情報」タブで詳しく設定できます）</span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-550"></span>
              🏷️ 中心キーワード参照
            </span>
            <div className="pl-2.5 border-l border-stone-800 min-h-[1.5rem] flex flex-wrap gap-1 items-center">
              {project.keywords && project.keywords.length > 0 ? (
                project.keywords.map((word, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-[#181816] text-[#c5a059] border border-[#c5a059]/15 text-[10px] font-semibold">
                    #{word}
                  </span>
                ))
              ) : (
                <span className="text-stone-605 text-[11px] italic">設定なし（「作品情報」タブで自在に追加・消去できます）</span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Tension Chart visualizer */}
        {project.beats.length > 1 ? (
          <div className="border border-stone-850 bg-stone-900 rounded-lg p-3" id="tension-chart-panel">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1">
                <LineChart className="w-3.5 h-3.5 text-stone-500" />
                物語の劇的テンション・感情 起伏アーク（AIプロンプト添付用）
              </span>
              <span className="text-[10px] text-stone-500">
                100%: 最大盛り上がり、0%: 日常・静寂
              </span>
            </div>
            <div className="h-[120px] w-full" id="svg-chart-workspace">
              {drawTensionChart()}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-xs font-serif text-[#c5a059]/80 bg-stone-900 rounded border border-dashed border-stone-800" id="tension-chart-fallback">
            2つ以上の章を構成すると、ここに起伏グラフ（テンションマーク）が自動構築されます。上の「構成立て直し」ボタンからお勧めのあらすじ骨格を瞬時にインプットするのがお勧めです。
          </div>
        )}
      </div>

      {/* Beats Cards Scroller Section */}
      <div className="space-y-4" id="beats-cards-container">
        <AnimatePresence mode="popLayout">
          {project.beats.map((beat, index) => {
            return (
              <motion.div
                key={beat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="bg-[#141414] border border-stone-850 rounded-xl p-5 shadow-sm hover:border-stone-750 transition-colors relative"
                id={`beat-node-${beat.id}`}
              >
                {/* Reordering & Deleting utility zone */}
                <div className="absolute top-4 right-4 flex items-center gap-1 z-10" id={`beat-util-row-${beat.id}`}>
                  {/* Up */}
                  <button
                    disabled={index === 0}
                    onClick={() => moveBeat(index, 'up')}
                    className={`p-1 rounded border transition-colors ${
                      index === 0 
                        ? 'text-stone-600 bg-stone-950/20 cursor-not-allowed border-stone-850' 
                        : 'text-stone-300 hover:text-[#c5a059] hover:bg-stone-800 bg-stone-900 border-stone-750'
                    }`}
                    title="この章を前に移動"
                    id={`btn-move-up-${beat.id}`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  {/* Down */}
                  <button
                    disabled={index === project.beats.length - 1}
                    onClick={() => moveBeat(index, 'down')}
                    className={`p-1 rounded border transition-colors ${
                      index === project.beats.length - 1 
                        ? 'text-stone-600 bg-stone-950/20 cursor-not-allowed border-stone-850' 
                        : 'text-stone-300 hover:text-[#c5a059] hover:bg-stone-800 bg-stone-900 border-stone-750'
                    }`}
                    title="この章を後ろに移動"
                    id={`btn-move-down-${beat.id}`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {/* trash */}
                  <button
                    onClick={() => handleDeleteBeat(beat.id)}
                    className="p-1 rounded border border-stone-800 text-stone-500 hover:text-red-400 hover:bg-red-950/40 hover:border-red-900/50 bg-[#141414] transition-colors ml-1.5"
                    title="この章を消去"
                    id={`btn-delete-beat-${beat.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id={`beat-content-grid-${beat.id}`}>
                  {/* Left Column: Title / Tension Slider / Dynamic Character Tags */}
                  <div className="md:col-span-4 space-y-4" id={`beat-left-pane-${beat.id}`}>
                    <div className="space-y-1">
                      <span className="text-[10px] font-sans font-extrabold text-stone-500 uppercase tracking-widest block">
                        STAGE {index + 1}
                      </span>
                      <input
                        type="text"
                        value={beat.title}
                        onChange={(e) => handleUpdateBeat(beat.id, { title: e.target.value })}
                        className="bg-transparent border-b border-stone-800 hover:border-[#c5a059] focus:border-[#c5a059] text-[#c5a059] outline-none font-serif font-bold text-sm py-1.5 w-full transition-colors"
                        placeholder="章の名前（例：第1章：旅立ち）"
                        id={`input-beat-title-${beat.id}`}
                      />
                    </div>

                    {/* Slider for dramatic tension */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-stone-900 border border-stone-850" id={`beat-tension-row-${beat.id}`}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-stone-300 flex items-center gap-1">
                          登場人物の感情 / 盛り上がり度
                        </span>
                        <span className="font-mono font-extrabold text-xs text-[#c5a059]">
                          {beat.tension}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={beat.tension}
                        onChange={(e) => handleUpdateBeat(beat.id, { tension: Number(e.target.value) })}
                        className="w-full accent-[#c5a059] cursor-pointer h-1.5 bg-stone-850 rounded-lg appearance-none"
                        id={`input-beat-tension-${beat.id}`}
                      />
                      <div className="flex justify-between text-[9px] text-stone-550 font-sans">
                        <span>0% (日常・平和)</span>
                        <span>50% (事件)</span>
                        <span>100% (極限頂点)</span>
                      </div>
                    </div>

                    {/* Key Characters in Scene */}
                    <div className="space-y-1.5" id={`beat-chars-row-${beat.id}`}>
                      <span className="text-xs font-bold text-stone-300 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#c5a059]" />
                        出演キャラクター
                      </span>
                      {project.characters.length === 0 ? (
                        <p className="text-[10px] text-stone-500 italic">
                          先にキャラクター設定タブで登場人物を追加してください
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1" id={`beat-chars-toggles-${beat.id}`}>
                          {project.characters.map(char => {
                            const isTagged = beat.keyCharacters.includes(char.id);
                            return (
                              <button
                                key={char.id}
                                onClick={() => toggleCharacterInBeat(beat.id, char.id)}
                                className={`text-[10px] font-semibold px-2 py-1 rounded transition-all border ${
                                  isTagged
                                    ? 'bg-[#c5a059] border-[#c5a059] text-black shadow-xs font-bold'
                                    : 'bg-stone-900 hover:bg-stone-800 border-stone-800 text-stone-300'
                                }`}
                                id={`btn-tag-char-${beat.id}-${char.id}`}
                              >
                                {char.name || '無名氏'}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Scene Description text-area */}
                  <div className="md:col-span-8 flex flex-col justify-between space-y-2" id={`beat-right-pane-${beat.id}`}>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center flex-wrap gap-1">
                        <label className="text-xs font-bold text-stone-300 block">
                          この章であらすじに含める出来事、セリフ、重要なアクション（詳細に）
                        </label>
                        <span className="text-[10px] text-stone-500 font-mono">
                          構成詳細: <b className="text-[#c5a059]">{beat.description.length}</b> 文字
                        </span>
                      </div>
                      <textarea
                        rows={6}
                        value={beat.description}
                        onChange={(e) => handleUpdateBeat(beat.id, { description: e.target.value })}
                        className="w-full text-xs p-3 border border-stone-800 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] rounded-xl text-stone-200 outline-none leading-relaxed resize-y bg-stone-900 focus:bg-stone-950 transition-colors font-serif"
                        placeholder="例：アルクが村の外郭の古代遺跡に潜り込んだ際、光り輝く石板ペンダントを拾い上げる。追ってきた遺跡警報用古代ゴーレムと戦闘になりながらも脱出。しかし、森の中で全身銀装束を着た謎の少女、魔導師シェラが氷の中から眠りから目を覚ますのを目撃し、ゴーレムから身を挺して彼女を助ける決意を固める。シェラは目覚め冷たい一瞥をくれるが、空腹のため崩れ落ち、アルクは携帯食料の干し肉を差し出す..."
                        id={`input-beat-desc-${beat.id}`}
                      />
                    </div>

                    {/* Telemetry and target advice indicator */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[10px] bg-stone-950/60 p-2.5 rounded-lg border border-stone-850" id={`beat-advice-${beat.id}`}>
                      {/* Left advice */}
                      <div className="flex items-start gap-1.5 border-r border-stone-850/80 pr-2">
                        {beat.description.length < 25 ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span className="text-stone-450 leading-relaxed">
                              あらすじが短すぎます。セリフや舞台装置、感情展開を増強すると、外部AIでの執筆精度が爆発的に高まります。
                            </span>
                          </>
                        ) : beat.description.length < 110 ? (
                          <>
                            <BookOpen className="w-3.5 h-3.5 text-[#c5a059] flex-shrink-0 mt-0.5" />
                            <span className="text-stone-350 leading-relaxed">
                              バランスの良いあらすじです。お気に入りのセリフや主人公の決意を1言追加すると、完璧な仕上がりになります！
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-emerald-500 font-bold leading-relaxed">
                              卓越したプロット詳細！これだけ書き込まれていれば、外部AIはブレずに圧倒的な臨場感を持つ章を執筆できます。
                            </span>
                          </>
                        )}
                      </div>

                      {/* Right word guide alignment */}
                      <div className="flex flex-col justify-center pl-1 space-y-1">
                        <div className="flex items-center justify-between text-stone-400">
                          <span>1話の想定ドラフト文字数:</span>
                          <span className="font-mono text-[#c5a059] font-bold">
                            {project.episodeWordCountMin || 3500}〜{project.episodeWordCountMax || 5000}文字
                          </span>
                        </div>
                        <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-[#c5a059] to-emerald-500 h-full transition-all duration-300" 
                            style={{ width: `${Math.min(100, Math.max(10, (beat.description.length / 150) * 100))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-stone-550">
                          <span>情報量目安</span>
                          <span>{beat.description.length >= 110 ? '極めて良好' : '詳細書き込み中'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {project.beats.length > 0 && (
          <div className="flex justify-center pt-2" id="beats-bottom-controls">
            <button
              onClick={handleAddField}
              className="px-5 py-2.5 bg-[#c5a059] hover:bg-[#b48e48] text-black text-xs font-bold rounded-lg flex items-center gap-2 shadow-md transition-all cursor-pointer"
              id="btn-add-beat-bottom"
            >
              <Plus className="w-4 h-4 text-black" />
              新しい章の追加 (末尾)
            </button>
          </div>
        )}
      </div>

      {project.beats.length === 0 && (
        <div className="text-center py-20 border border-dashed border-stone-800 rounded-xl bg-[#141414] text-stone-500 text-sm flex flex-col justify-center items-center" id="beats-empty-fallback">
          <Layers className="w-12 h-12 text-stone-700 mb-2 animate-pulse" />
          <p className="font-semibold text-stone-300 font-serif">章立て構成(プロット)がありません</p>
          <div className="flex gap-2.5 mt-4">
            <button
              onClick={handleLoadStructureTemplate}
              className="px-4 py-2 bg-[#c5a059] hover:bg-[#b48e48] text-black font-semibold rounded text-xs shadow-xs font-bold font-serif"
              id="btn-empty-load-template"
            >
              おすすめの骨格テンプレートを適用
            </button>
            <button
              onClick={handleAddField}
              className="px-4 py-2 bg-stone-850 hover:bg-stone-800 border border-stone-750 text-stone-350 rounded text-xs font-medium shadow-xs"
              id="btn-empty-add-manual"
            >
              手動で新しい空の章を追加
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
