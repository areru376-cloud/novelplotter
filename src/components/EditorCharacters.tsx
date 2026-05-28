import React, { useState } from 'react';
import { Project, Character } from '../types';
import { 
  Plus, 
  Trash2, 
  User, 
  UserPlus, 
  Tag, 
  Eye, 
  Heart, 
  EyeOff, 
  Flame, 
  ChevronRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EditorCharactersProps {
  project: Project;
  onUpdateProject: (fields: Partial<Project>) => void;
}

const ROLE_LABELS: Record<Character['role'], { label: string; color: string; bg: string }> = {
  protagonist: { label: '主人公', color: 'text-amber-400 border-amber-900/50', bg: 'bg-amber-950/50' },
  deuteragonist: { label: '相棒 / ヒロイン', color: 'text-indigo-400 border-indigo-900/50', bg: 'bg-indigo-950/50' },
  antagonist: { label: '宿敵 / ライバル', color: 'text-red-400 border-red-900/50', bg: 'bg-red-950/50' },
  mentor: { label: '師匠 / 指導者', color: 'text-emerald-400 border-emerald-900/50', bg: 'bg-emerald-950/50' },
  supporting: { label: '主要脇役', color: 'text-sky-400 border-sky-900/50', bg: 'bg-sky-950/50' },
  other: { label: 'その他設定', color: 'text-stone-400 border-stone-800', bg: 'bg-stone-900' },
};

export default function EditorCharacters({ project, onUpdateProject }: EditorCharactersProps) {
  const [selectedCharId, setSelectedCharId] = useState<string | null>(
    project.characters.length > 0 ? project.characters[0].id : null
  );

  const activeChar = project.characters.find(c => c.id === selectedCharId) || null;

  const handleAddCharacter = () => {
    const newId = `char-${Date.now()}`;
    const newChar: Character = {
      id: newId,
      name: '新しいキャラクター',
      role: 'supporting',
      age: '',
      gender: '',
      appearance: '',
      personality: '',
      motivation: '',
      secrets: '',
      specialSkills: '',
      pastEvents: '',
    };
    onUpdateProject({
      characters: [...project.characters, newChar]
    });
    setSelectedCharId(newId);
  };

  const handleDeleteCharacter = (id: string) => {
    const remaining = project.characters.filter(c => c.id !== id);
    onUpdateProject({ characters: remaining });
    if (selectedCharId === id) {
      setSelectedCharId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleUpdateCharacter = (id: string, fields: Partial<Character>) => {
    const updated = project.characters.map(c => {
      if (c.id === id) {
        return { ...c, ...fields };
      }
      return c;
    });
    onUpdateProject({ characters: updated });
  };

  const handleGenerateTemplate = (templateType: 'knight' | 'genius' | 'secret_agent') => {
    if (!activeChar) return;
    
    const templates = {
      knight: {
        name: 'レイモンド',
        role: 'protagonist' as const,
        age: '24歳',
        gender: '男性',
        appearance: '端正に切り揃えられた金髪と忠誠を誓うような碧い眼。騎士団の白銀의軽甲冑を着用し、柄に赤い魔晶石が埋め込まれた家伝の細剣を誇らしげに佩いている。',
        personality: '規律正しく、正義を絶対視している。やや融通が利かないのが弱点だが、困った人を見捨てられない高潔な精神。目上の者には「〜であります」と丁寧。',
        motivation: '滅ぼされた王国の再興と、虐げられている領民に再び平和な法のもとの暮らしを取り戻すため。',
        secrets: '実は亡国の主君を売った裏切り者の息子であり、自らの手で偉大な功績を残し、その血の罪を雪ぎたいという強い強迫観念を抱える。',
        specialSkills: '馬術、家伝の神速の三連突き、簡単な治癒エーテル魔術。重い鎧を着たまま無音で歩く技術。',
        pastEvents: '幼少の折、王宮守護騎士だった父が汚名を着せられて処刑され、家門は没落。幼き従姉妹とともに行商人に連れられ辛うじて生き延びる。',
      },
      genius: {
        name: 'クロエ',
        role: 'deuteragonist' as const,
        age: '16歳',
        gender: '女性',
        appearance: '丸いレンズの風防眼鏡を頭に掛け、乱雑な栗色のツインテール。煤汚れのある作業用の茶色いレザーつなぎ。ポケットには無数の小さなネジが溢れている。',
        personality: '明朗快活で口が達者。自分の発明品について語り始めると熱中しすぎて周囲が見えなくなる。皮肉や絶望には興味がなく、常に「なんとかなるさ！」が口癖。',
        motivation: 'かつて幻とされた伝説のエーテル永久推進機関を作り上げ、空飛ぶ自分の機械で世界の秘境を踏破すること。',
        secrets: '実は自分の寿命が不治のエーテル脈異常により残り僅かであることを知っている。死を恐れる暇がないほどに世界に光を残そうともがいている。',
        specialSkills: 'ガラクタ細工・分解修理、あらゆる機械錠の高速ピッキング、直感的な熱効率・気流解析。',
        pastEvents: '12才のとき魔導工房の爆発事故を起こし、その際にエーテル結晶の破片が心臓近くに突き刺さり、それが今も余命を課される原因となっている。'
      },
      secret_agent: {
        name: '影狼 (カゲロウ)',
        role: 'antagonist' as const,
        age: '32歳',
        gender: 'その他',
        appearance: '顔の半分を覆う灰色の布仮面。暗闇に溶け込む漆黒の忍び装束で、影の塊のよう。左右の帯には刃の潰れた数十本の本物のクナイが仕込まれている。',
        personality: '言葉数が極力少なく、相手を値踏みするような声音。死に対しても恐怖や躊躇がなく、すべてを「任務」と割り切る不気味な合理性を持つ。',
        motivation: '主君が決めた世界の絶対的な破壊命令に従うこと。裏に隠された因縁を絶つ唯一の道だと信じている。',
        secrets: 'かつて主人公の父親によって命を救われたことがあり、本心では主人公を殺したくない。主人公が自分を倒すための道標になって立ちはだかっている。',
        specialSkills: '影に溶け込む縮地歩法、気配の完全遮断、声帯の筋肉模写（変声術）、毒草の鑑定と調合。',
        pastEvents: '戦災孤児として秘密暗殺組織に拾われ、感情なき兵器として育てられる。三年前に一度だけ人質救出任務で主人公の肉親と交わした密約がある。'
      }
    };

    const chosen = templates[templateType];
    handleUpdateCharacter(activeChar.id, chosen);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="editor-characters-tab">
      {/* Left pane: Characters list */}
      <div className="col-span-1 md:col-span-4 space-y-3" id="character-pane-list">
        <div className="flex items-center justify-between bg-stone-900 p-2.5 rounded-lg border border-stone-800" id="pane-list-info">
          <span className="text-xs font-bold text-stone-300">配置キャラ一覧</span>
          <button
            onClick={handleAddCharacter}
            className="flex items-center gap-1 xl:gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[#c5a059] hover:text-[#b48e48] rounded text-xs font-semibold transition-colors shadow-xs"
            id="btn-add-character"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#c5a059]" />
            キャラ追加
          </button>
        </div>

        {project.characters.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-stone-800 rounded-lg text-stone-500 text-xs" id="no-characters-fallback">
            <User className="w-8 h-8 mx-auto mb-2 text-stone-600" />
            まだキャラクターがいません。上のボタンから追加してください。
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1" id="character-card-list">
            {project.characters.map((char) => {
              const isSelected = char.id === selectedCharId;
              const meta = ROLE_LABELS[char.role];
              return (
                <div
                  key={char.id}
                  onClick={() => setSelectedCharId(char.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#1a1a1a] border-[#c5a059] border-l-2 shadow-md shadow-[#c5a059]/5'
                      : 'bg-stone-900 hover:bg-stone-850 border-stone-850 hover:border-stone-800'
                  }`}
                  id={`char-list-item-${char.id}`}
                >
                  <div className="min-w-0 pr-2">
                    <div className={`font-serif text-sm font-bold truncate ${isSelected ? 'text-[#c5a059]' : 'text-stone-200'}`}>
                      {char.name || '名前未入力'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded border ${meta.bg} ${meta.color}`}>
                        {meta.label}
                      </span>
                      {char.age && <span className="text-[10px] text-stone-500">{char.age}</span>}
                      {char.gender && <span className="text-[10px] text-stone-500">{char.gender}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <ChevronRight className={`w-4 h-4 text-stone-500 transition-transform ${isSelected ? 'translate-x-0.5 text-[#c5a059]' : ''}`} />
                  </div>
                </div>
              );
            })}

            {project.characters.length > 0 && (
              <button
                onClick={handleAddCharacter}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-stone-900 hover:bg-stone-850 border border-dashed border-stone-800 hover:border-[#c5a059]/40 text-[#c5a059] hover:text-[#b48e48] rounded-lg text-xs font-bold transition-all mt-3 cursor-pointer shadow-xs"
                id="btn-add-character-bottom"
              >
                <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
                新しいキャラの追加 (末尾)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right pane: Detailed Character Editor */}
      <div className="col-span-1 md:col-span-8" id="character-pane-edit">
        <AnimatePresence mode="wait">
          {activeChar ? (
            <motion.div
              key={activeChar.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="bg-[#141414] border border-stone-800 rounded-xl p-5 shadow-sm space-y-4 relative"
              id="character-detailed-form"
            >
              {/* Header inside form */}
              <div className="flex justify-between items-center border-b border-stone-800 pb-3" id="char-form-header">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#c5a059]" />
                  <span className="font-serif text-base font-bold text-[#c5a059]">
                    設定の深掘り / 彫刻
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteCharacter(activeChar.id)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/80 px-2 py-1 rounded transition-colors font-medium border border-red-900/40"
                  id={`btn-del-char-${activeChar.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  退場（削除）
                </button>
              </div>

              {/* Template generator buttons if character is empty */}
              {!activeChar.appearance && !activeChar.personality && !activeChar.motivation && (
                <div className="bg-[#1a1917] border border-[#c5a059]/30 p-3 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-stone-300" id="template-helper-box">
                  <div className="flex gap-2">
                    <Sparkles className="w-4 h-4 text-[#c5a059] mt-0.5 flex-shrink-0 animate-pulse" />
                    <div>
                      <span className="font-bold text-stone-250">プロット用ひな形インプット：</span>
                      迷ったら物語を動かしやすい行動パターンを展開できます。
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleGenerateTemplate('knight')}
                      className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 font-semibold rounded text-[10px] transition-colors shadow-xs"
                      id="btn-char-tpl-knight"
                    >
                      不屈の騎士
                    </button>
                    <button
                      onClick={() => handleGenerateTemplate('genius')}
                      className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 font-semibold rounded text-[10px] transition-colors shadow-xs"
                      id="btn-char-tpl-genius"
                    >
                      飄々とした天才
                    </button>
                    <button
                      onClick={() => handleGenerateTemplate('secret_agent')}
                      className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 font-semibold rounded text-[10px] transition-colors shadow-xs"
                      id="btn-char-tpl-agent"
                    >
                      仮面ノ暗殺者
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4" id="char-inputs-grid">
                {/* Name */}
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-xs font-bold text-stone-300">名前 (ふりがな)</label>
                  <input
                    type="text"
                    value={activeChar.name}
                    onChange={(e) => handleUpdateCharacter(activeChar.id, { name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded border border-stone-800 focus:border-[#c5a059] bg-stone-900 text-stone-200 outline-none focus:ring-1 focus:ring-[#c5a059] transition-all"
                    placeholder="例：アルク"
                    id="input-char-name"
                  />
                </div>

                {/* Role dropdown */}
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-xs font-bold text-stone-300">物語上の配役</label>
                  <select
                    value={activeChar.role}
                    onChange={(e) => handleUpdateCharacter(activeChar.id, { role: e.target.value as Character['role'] })}
                    className="w-full text-xs px-2 py-2 rounded border border-stone-800 focus:border-[#c5a059] bg-stone-900 text-stone-200 outline-none transition-all"
                    id="select-char-role"
                  >
                    <option value="protagonist">主人公 (物語を牽引する)</option>
                    <option value="deuteragonist">相棒 / ヒロイン / 親友</option>
                    <option value="antagonist">宿敵 / 対立ライバル</option>
                    <option value="mentor">師匠 / 先輩 / 導き手</option>
                    <option value="supporting">主要脇役 / 協力者</option>
                    <option value="other">その他 / モブ・敵兵</option>
                  </select>
                </div>

                {/* Age */}
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-xs font-bold text-stone-300">年齢・種族など</label>
                  <input
                    type="text"
                    value={activeChar.age}
                    onChange={(e) => handleUpdateCharacter(activeChar.id, { age: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded border border-stone-800 focus:border-[#c5a059] bg-stone-900 text-stone-200 outline-none focus:ring-1 focus:ring-[#c5a059] transition-all"
                    placeholder="例：24歳 / 人間(エルフ混血)"
                    id="input-char-age"
                  />
                </div>

                {/* Gender */}
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-xs font-bold text-stone-300">性別 / 戸籍</label>
                  <input
                    type="text"
                    value={activeChar.gender}
                    onChange={(e) => handleUpdateCharacter(activeChar.id, { gender: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded border border-stone-800 focus:border-[#c5a059] bg-stone-900 text-stone-200 outline-none focus:ring-1 focus:ring-[#c5a059] transition-all"
                    placeholder="例：女性 / 帝国第一皇女"
                    id="input-char-gender"
                  />
                </div>
              </div>

              {/* Textarea fields with clear psychological / storytelling helper guides */}
              <div className="space-y-4 pt-1" id="char-textareas-container">
                {/* Motivation (Most important for AI plot continuity) */}
                <div className="space-y-1 bg-stone-950/45 p-3 rounded-lg border border-stone-850">
                  <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    強い行動モチベーション (本源的欲求)
                  </label>
                  <p className="text-[10px] text-stone-550">
                    なぜこのキャラは危険を犯すのか？「愛のため」「復讐」「世界の真真」など。AIが一番気にするキャラクターの一貫性のコア。
                  </p>
                  <textarea
                    rows={2}
                    value={activeChar.motivation}
                    onChange={(e) => handleUpdateCharacter(activeChar.id, { motivation: e.target.value })}
                    className="w-full text-xs mt-1.5 p-2 rounded border border-stone-800 bg-stone-900 text-stone-200 focus:border-[#c5a059] outline-none transition-all"
                    placeholder="例：故郷を焼いた正体不明の男『真紅の双剣』を見つけだし、死んだ弟の仇を討つことが生存理由。"
                    id="input-char-motivation"
                  />
                </div>

                {/* Secrets / inner conflict */}
                <div className="space-y-1 bg-stone-950/45 p-3 rounded-lg border border-stone-850">
                  <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
                    秘密、心の陰 (葛藤・心の弱点)
                  </label>
                  <p className="text-[10px] text-stone-550">
                    読者を引き付ける二面性。本人すら目を背けたい本物の弱点、隠している過去、内なる恐怖。
                  </p>
                  <textarea
                    rows={2}
                    value={activeChar.secrets}
                    onChange={(e) => handleUpdateCharacter(activeChar.id, { secrets: e.target.value })}
                    className="w-full text-xs mt-1.5 p-2 rounded border border-stone-800 bg-stone-900 text-stone-200 focus:border-[#c5a059] outline-none transition-all"
                    placeholder="例：かつて自分の臆病さから仲間をその場に置き去りにして見殺しにしてしまった罪の記憶。暗闇に入ると極度のパニックに陥る。"
                    id="input-char-secrets"
                  />
                </div>

                {/* Appearance */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#c5a059]" />
                    外見・持ち物・印象
                  </label>
                  <textarea
                    rows={2}
                    value={activeChar.appearance}
                    onChange={(e) => handleUpdateCharacter(activeChar.id, { appearance: e.target.value })}
                    className="w-full text-xs p-2 rounded border border-stone-800 bg-stone-900 text-stone-200 focus:border-[#c5a059] outline-none transition-all"
                    placeholder="例：漆黒のコート。左頬に大きな引っかき傷跡。一見冷たそうだが、手袋は丁寧にはめ直している。家紋が描かれた特異なデザインの剣を持つ。"
                    id="input-char-appearance"
                  />
                </div>

                {/* Personality & Tone of voice */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#c5a059]" />
                    性格・口調・対人態度
                  </label>
                  <textarea
                    rows={2}
                    value={activeChar.personality}
                    onChange={(e) => handleUpdateCharacter(activeChar.id, { personality: e.target.value })}
                    className="w-full text-xs p-2 rounded border border-stone-800 bg-stone-900 text-stone-200 focus:border-[#c5a059] outline-none transition-all"
                    placeholder="例：基本的にはぶっきらぼうで合理的な物言いを好むが、親しい者を命懸けで守る人情がある。一人称は『俺』、二人称は『お前/名前』。口癖：『…無駄だ』。"
                    id="input-char-personality"
                  />
                </div>

                {/* Special Skills / Abilities */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    特技・固有能力 (スキル・得意分野)
                  </label>
                  <textarea
                    rows={2}
                    value={activeChar.specialSkills || ''}
                    onChange={(e) => handleUpdateCharacter(activeChar.id, { specialSkills: e.target.value })}
                    className="w-full text-xs p-2 rounded border border-stone-800 bg-stone-900 text-stone-200 focus:border-[#c5a059] outline-none transition-all"
                    placeholder="例：家伝の神速の三連突き、暗闇でものを識別する超感覚、あらゆる鍵を数秒で解錠する技術。"
                    id="input-char-skills"
                  />
                </div>

                {/* Past Events / Backstory */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    過去の出来事・生い立ち (バックストーリー)
                  </label>
                  <textarea
                    rows={2}
                    value={activeChar.pastEvents || ''}
                    onChange={(e) => handleUpdateCharacter(activeChar.id, { pastEvents: e.target.value })}
                    className="w-full text-xs p-2 rounded border border-stone-800 bg-stone-900 text-stone-200 focus:border-[#c5a059] outline-none transition-all"
                    placeholder="例：幼少期に滅ぼされた帝国の生き残りであり、一族の血脈を証明する紋章入りの細剣を持つ。その素性は誰にも明かしていない。"
                    id="input-char-events"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#141414] border border-stone-800 rounded-xl p-8 text-center text-stone-500 min-h-[300px] flex flex-col justify-center items-center" id="character-pane-edit-fallback">
              <User className="w-10 h-10 text-stone-700 mb-3" />
              <p className="font-serif font-bold text-stone-300 mb-1">
                キャラクターが選択されていません
              </p>
              <p className="text-xs text-stone-500">
                左側の一覧から選択するか、新しく追加してください。
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
