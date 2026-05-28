import React, { useState, useMemo } from 'react';
import { Project, PromptMode, Character } from '../types';
import { 
  ClipboardCheck, 
  Copy, 
  Sparkles, 
  BookOpen, 
  Construction, 
  HelpCircle, 
  MessageSquareCode, 
  Sliders, 
  AlignLeft, 
  ListRestart,
  Volume2,
  LayoutList,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PromptExporterProps {
  project: Project;
  onUpdateProject: (fields: Partial<Project>) => void;
}

export default function PromptExporter({ project, onUpdateProject }: PromptExporterProps) {
  const [promptMode, setPromptMode] = useState<PromptMode>('novel_full');
  const [selectedBeatId, setSelectedBeatId] = useState<string>(
    project.beats.length > 0 ? project.beats[0].id : ''
  );
  const [selectedCharId, setSelectedCharId] = useState<string>(
    project.characters.length > 0 ? project.characters[0].id : ''
  );
  const [writingStyle, setWritingStyle] = useState<string>('entertainment'); // entertainment, heavy, deep_lyric, suspense
  const [aiPerspective, setAiPerspective] = useState<string>('third_person'); // third_person, first_person, restricted
  const [copied, setCopied] = useState<boolean>(false);

  // Helper for appending prompt critique recommendations
  const handleAppendTemplate = (template: string) => {
    const current = project.aiCritiqueInstructions || '';
    const updated = current ? `${current}\n\n${template}` : template;
    onUpdateProject({ aiCritiqueInstructions: updated });
  };

  const styleOptions = [
    { value: 'entertainment', label: '王道エンタメ風', desc: 'テンポよく読みやすく、ライトノベルや漫画原作に向いた文体' },
    { value: 'heavy', label: '重厚・純文学風', desc: '精緻な情景描写と人間の心理描写に注力した、読みごたえのある語り口' },
    { value: 'deep_lyric', label: '抒情的・センチメンタル', desc: '詩的な風景表現、切ない感情、独特の余韻を残すエモーショナルな文体' },
    { value: 'suspense', label: 'サスペンス風', desc: 'スピード感あふれる構成、短い一文、謎が謎を呼ぶ緊迫した文体' },
  ];

  // Helper dictionary
  const charMap = useMemo(() => {
    return new Map(project.characters.map(c => [c.id, c.name]));
  }, [project.characters]);

  // Construct whole Prompt base on parameters
  const generatedPrompt = useMemo(() => {
    const esc = (text: string) => text || '未設定';

    // 1. Build project settings details in MD
    let basicMarkdown = `
# 小説の基本設定
* **仮タイトル:** ${esc(project.title)}
* **ジャンル:** ${esc(project.genre)}
* **コアテーマ:** ${esc(project.theme)}
* **重要キーワード:** ${esc(project.keywords?.join('、'))}
* **ターゲット読者:** ${esc(project.targetAudience)}
* **想定される分量:** ${esc(project.desiredLength)}
* **トーン・作風:** ${esc(project.tone)}
* **物語構成フレーム:** ${esc(project.structureType)}
`;

    if (project.publishServices && project.publishServices.length > 0) {
      let webPublishingMD = `
## Web掲載ターゲット・公開設定
* **掲載予定サービス:** ${project.publishServices.join('、')}
* **1話あたりの想定文字数:** 最低 ${project.episodeWordCountMin ?? 3500} 文字 〜 最高 ${project.episodeWordCountMax ?? 5000} 文字
* **更新頻度・スケジュール予定:** ${esc(project.publishSchedule)}
* **自主規制・閲覧警告タグ:** ${esc(project.publishAgeRatings?.join('、') || '全年齢・制限対象外')}
* **Web小説ポータル用検索タグ:** ${esc(project.publishKeywords?.join('、'))}
* **Web公開用の特化あらすじ (カクヨム・なろう最適化):**
  ${esc(project.publishSynopsis)}
`;
      basicMarkdown += webPublishingMD;
    }

    basicMarkdown += `
# ログライン（一言あらすじ）
${esc(project.logline)}
`;

    // 2. Build Characters profiles
    let charactersMarkdown = `
# 登場人物設定
`;
    if (project.characters.length === 0) {
      charactersMarkdown += '(登録されている登場人物はありません)\n';
    } else {
      project.characters.forEach((char) => {
        const roleLabel = char.role === 'protagonist' ? '主人公' 
                        : char.role === 'deuteragonist' ? '相棒/ヒロイン'
                        : char.role === 'antagonist' ? '宿敵/ライバル'
                        : char.role === 'mentor' ? '指導者'
                        : char.role === 'supporting' ? '主要脇役'
                        : 'その他脇役';
                        
        charactersMarkdown += `
## ■ ${char.name || '名前未入力'} （役割: ${roleLabel}）
* **基本情報:** 年齢: ${esc(char.age)} / 性別: ${esc(char.gender)}
* **特技・固有能力:** ${esc(char.specialSkills)}
* **過去の出来事・生い立ち:** ${esc(char.pastEvents)}
* **外見・持ち物:** ${esc(char.appearance)}
* **人物像・口調:** ${esc(char.personality)}
* **行動原理・強い欲求:** ${esc(char.motivation)}
* **内なる弱さ・隠された葛藤:** ${esc(char.secrets)}
------------------------------`;
      });
    }

    // 3. World Building lists
    let worldMarkdown = `
# 世界観・設定情報
`;
    if (project.settings.length === 0) {
      worldMarkdown += '(登録されている世界観設定はありません)\n';
    } else {
      // Group by category
      const categoriesGroup: Record<string, string[]> = {};
      project.settings.forEach(s => {
        if (!categoriesGroup[s.category]) {
          categoriesGroup[s.category] = [];
        }
        categoriesGroup[s.category].push(`### ◆ ${s.title}\n${s.content}`);
      });

      Object.entries(categoriesGroup).forEach(([cat, lines]) => {
        worldMarkdown += `\n## 【${cat}】\n${lines.join('\n\n')}\n`;
      });
    }

    // 4. Chapter details (Beats)
    let beatsMarkdown = `
# 全体構成・章割りプロット（盛り上がり・緊張度の軌跡）
`;
    if (project.beats.length === 0) {
      beatsMarkdown += '(登録されている章立てプロットはありません)\n';
    } else {
      project.beats.forEach((beat, index) => {
        const involvedCharNames = beat.keyCharacters
          .map(id => charMap.get(id))
          .filter(Boolean)
          .join(', ') || '主要キャスト全員';

        beatsMarkdown += `
## [章 ${index + 1}] ${beat.title}
* **この章のあらすじ・キーアクション:**
  ${esc(beat.description)}
* **主要な登場人物:** ${involvedCharNames}
* **劇的情調テンション（緊張感・盛り上がり度）:** ${beat.tension}% / 100%
------------------------------`;
      });
    }

    // 5. Goal Intent section base on the promptMode
    let directiveMarkdown = '';
    const styleLabel = styleOptions.find(o => o.value === writingStyle)?.label || '王道エンタメ風';
    const povLabel = aiPerspective === 'third_person' ? '客観的な三人称視点（神の視点）'
                     : aiPerspective === 'first_person' ? '主人公から見た一人称視点「俺/私」'
                     : '特定の対象人物に固定した限定三人称視点';

    if (promptMode === 'novel_full') {
      const targetBeat = project.beats.find(b => b.id === selectedBeatId);
      const targetBeatTitle = targetBeat ? targetBeat.title : '第一章';
      const targetBeatDesc = targetBeat ? targetBeat.description : '';

      directiveMarkdown = `
# あなた（AI）への指示（ミッション）
あなたはプロの受賞経歴を持つ、極めて実力のある実力派小説家です。
上記の「基本設定」「キャラクター資料」「世界設定」を脳内に完璧にインストールした上で、以下のあらすじをもとに、極上の【小説本文執筆】を開始して下さい。

## 今回執筆してほしい小説の条件
1. **今回の対象章:** 【${esc(targetBeatTitle)}】
2. **この章であらすじとして指定されている内容:**
   - ${esc(targetBeatDesc)}
3. **文体の雰囲気:** 【${styleLabel}】
   - 単なる状況説明で終わらせず、五感（視覚、触覚、聴覚、嗅覚、味覚）に訴えかける豊かな比喩表現や情景描写を盛り込み、人物の息遣いを感じられる文章を書いてください。
4. **視点:** 【${povLabel}】
5. **対話とテンポ:**
   - 登場人物の「人物像・口調」「行動原理」「秘密」を反映した、説得力のあるリアルな生きた対話を書いてください。口調の一貫性を100%厳守してください。
   - 劇的情調テンション（この章はテンション：${targetBeat ? targetBeat.tension : 50}%です）に対応した盛り上がり方・語り急ぎのなさを意識してください。
6. **文字数ボリューム:**
   - 薄っぺらい要約は禁止します。上記の設定を肉付けし、読者がそのシーンの中に立ち会っているかのような臨場感で、指定ボリューム（最低 ${project.episodeWordCountMin ?? 3500} 字 〜 最高 ${project.episodeWordCountMax ?? 5000} 字程度）の読み応えのある小説として、最初のシーンから重厚に、セリフや行動を伴って執筆してください。途中で「以下省略」「など」で要約することは絶対に不許可です。
   - なろう・カクヨムに即日投稿できる、完成度が極めて高い1話完結分の原稿として最適化して構成してください。
   - AIがこれらを段階的に出力できるように、各文脈でテンポを損なわぬよう極めて深い心理記述と情景描写を含めてください。

それでは、執筆を開始してください。
`;
    } else if (promptMode === 'critique') {
      directiveMarkdown = `
# あなた（AI）への指示（ミッション）
あなたは極めて優秀で冷徹、かつ愛に満ちた「文芸誌のチーフ編集者」兼「プロットドクター」です。
上記の小説の基本設計・キャラクターの掘り下げ・独自ルール設定・全章のストーリープロット・劇的アークを読み込み、作品としての完成度を【超一流の小説にするための徹底批判チェック】を行ってください。

## フィードバックしてほしい観点
1. **ロジックバグ及び整合性の検証:**
   - 世界観の特殊ルールが破綻していないか？
   - キャラクターの「行動原理」と「あらすじでの実際の選択」に矛盾やブレがないか？
   - 登場人物の秘密や葛藤が、ただの設定だけで終わらず物語の展開（特に後半）にきちんと機能・爆発しているか？
2. **ストーリーアーク・構成の緩急:**
   - 盛り上がり度（テンション％）の遷移を読み解き、平坦すぎる部分や、クライマックスへのビルドアップが足りない箇所はないか？
   - いわゆる「中だるみ」や「解決が急ぎ足すぎる部分」を客観的に見つけて指摘してください。
3. **読者層への訴求力:**
   - ターゲット読者（設定：${esc(project.targetAudience)}）に対して、ジャンル（設定：${esc(project.genre)}）的魅力は十分担保されているか？
4. **具体的な改善案・アイデア（ブレスト）:**
   - 「どこをどう修正すれば、さらに涙を誘う展開、あるいは一気読みさせる緊迫したミステリーになるか」のアイデアを最低3つ、具体例を伴って提示してください。

厳しいながらも、作者の創作モチベーションが最大に跳ね上がるような、批評アドバイスを詳細にお願いします。
`;
    } else if (promptMode === 'dialogue_preview') {
      const selectedChar = project.characters.find(c => c.id === selectedCharId);
      const selectedCharName = selectedChar ? selectedChar.name : '指定キャラクター';
      const roleLabel = selectedChar ? (selectedChar.role === 'protagonist' ? '主人公' : '主要キャスト') : '役職';

      directiveMarkdown = `
# あなた（AI）への指示（ミッション）
あなたは「声優」および「小説の会話執筆の最高スペシャリスト」です。
上記の登場人物設定、および世界観情報をしっかりと読み込み、特に指定キャラクター【${esc(selectedCharName)}】の【キャラクター専用の口調サンプル・対話サンドボックス】を生成してください。

## 出力内容の要求事項
1. **口調・言動・思考パターンの解説:**
   - このキャラクターの特徴的な言い回し、一人称・二人称、感情の起伏に伴うトーンの変化を詳しく推察して整理してください。
2. **セリフサンプル集（ボイス集）の作成:**
   - 以下のシチュエーションにおける、このキャラクターの放つリアルな対話（セリフ）の具体例（各100文字〜200文字程度の小説セリフ＋状況描写付き）を作成してください。
     - **① 誰もいない静かな場所での静かな独白** (心の内なる葛藤や秘密：${selectedChar ? esc(selectedChar.secrets) : 'なし'} が垣間見えるような)
     - **② 仲間/信頼する相手との何気ない日常の会話**
     - **③ 強大な敵や理不尽な状況に対抗するときの、魂を絞るようなセリフ** (キャラクターのモチベーション：${selectedChar ? esc(selectedChar.motivation) : 'なし'} が爆発する瞬間)
     - **④ 疲れ切っている相手を、自分の流儀で不器用ながら励ます、または慰めるときのセリフ**
3. **会話表現の禁止事項:**
   - このキャラクターが「絶対に言ってはならない単語」「性格と乖離する態度」を明文化して定義し、作者が執筆中に出してしまわないようにアドバイスしてください。

他の登場人物との会話シーンの練習用に、口癖が120%活きるように書いてください。
`;
    } else if (promptMode === 'scene_expansion') {
      const targetBeat = project.beats.find(b => b.id === selectedBeatId);
      const targetBeatTitle = targetBeat ? targetBeat.title : '指定章';
      const targetBeatDesc = targetBeat ? targetBeat.description : '';

      directiveMarkdown = `
# あなた（AI）への指示（ミッション）
あなたは天才構成作家（ストリー・エディター）です。
作者がプロットを作成した部分のうち、【${esc(targetBeatTitle)}】をさらに映画のように臨場感があるシーンへ肉付け・拡張するための【シーン詳細設計図・コンテ・演出案】を作成してください。

## 渡されたプロット詳細
- ${esc(targetBeatDesc)}

## あなたへのオーダー（分析して、提案してほしいこと）
1. **シーンを細分化した『絵コンテ風アクション解説』 (細分ビート):**
   - この短いあらすじをそのまま小説にすると説明的になります。そのため、シーンを4〜5つの細かい秒単位のアクション・カットに切り分け、それぞれで「誰がどう動き、何が置かれているか」の映画的な絵作りを提案してください。
2. **サブテキスト（セリフの裏の意味）の設計:**
   - 登場人物たちが喋っているセリフの裏に隠されている「本音」や「葛藤」を分析し、より複雑な感情の行間（アイコンタクトや手のしぐさ）で表現するための演出方法を提案してください。
3. **シーン特有の五感的フック演出:**
   - このシーンの空気感（光の差し込み方、衣服の擦れる音、漂う匂い、温度など）を読者へ触覚・視覚的に伝えるための、とっておきの環境ギミックやセッティングを考えてください。
    （例：雨が雫になり、オルゴールの埃を濡らす様子、冷たい呼吸の白い煙など）
4. **盛り上がりを引き出すための会話のラリー:**
   - この章におけるもっともエモーショナルになる箇所の「会話のラリー（台詞の往復）」の叩き台案（約5往復分以上）を目を見張るクオリティで作ってください。

これらを読んで、著者がこの章を書き進めるのが楽しみになるような刺激的な内容を記述してください。
`;
    }

    let critiqueInstructionsMarkdown = '';
    if (project.aiCritiqueInstructions?.trim()) {
      critiqueInstructionsMarkdown = `
# 前回までの批評・指摘ずみ懸念点＆改善指示（最優先・必須修正クリア要件）
※以下は過去のAI批評および著者によってストックされた、物語がクリアすべき懸念点・修正・改善要求です。
今回の執筆や構成の提案においては、以下の改善要素・課題が設定およびストーリー展開上で100%解決・クリアされるよう、絶対条件の最優先事項としてすべて反映・統合してください。
--------------------------------------------------
${project.aiCritiqueInstructions.trim()}
--------------------------------------------------
`;
    }

    return `
=========================================
小説プロット連携・執筆支援統合プロンプト
=========================================

${basicMarkdown}

${charactersMarkdown}

${worldMarkdown}

${beatsMarkdown}
${critiqueInstructionsMarkdown ? `\n${critiqueInstructionsMarkdown}\n` : ''}
${directiveMarkdown}
`;
  }, [project, promptMode, selectedBeatId, selectedCharId, writingStyle, aiPerspective]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }).catch(err => {
      alert('クリップボードへのコピーに失敗しました。手動で選択してコピーしてください。');
    });
  };

  const getActiveBeat = () => {
    return project.beats.find(b => b.id === selectedBeatId);
  };

  const currentModeDetails = () => {
    switch (promptMode) {
      case 'novel_full':
        return {
          title: '小説本文の連続執筆',
          desc: '指定された特定の章の詳細なあらすじ、登場人物の口調や性格を完全に遵守し、いきなり本格的な小説本文を大ボリューム（3000~5000字程度）でAIに書き上げさせます。'
        };
      case 'critique':
        return {
          title: 'プロットの徹底批評/構成バグ検証',
          desc: 'AIを極めて辛口かつ客観的な文芸チーフ編集者へと切り替え、プロット内の設定破綻、中だるみ、整合性ミスを探し出し、より面白くするための改善案を絞り出させます。'
        };
      case 'dialogue_preview':
        return {
          title: 'キャラなりきり会話テスト・口調サンプル',
          desc: '特定のキャラクターの思考パターン、口調ルールを検証。喜び・悲しみ・怒りの具体的なセリフを自動ロールプレイで吐かせ、一貫性をチェックします。'
        };
      case 'scene_expansion':
        return {
          title: 'シーン演出強化・カット割詳細提案',
          desc: '1つの章を映画のようにハイクオリティに仕上げるために、あらすじを極細かいコンテ・カットに切り分け、サブテキストや最適な会話のラリー案をブレストします。'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="prompt-exporter-tab">
      
      {/* Left Column: Output Settings & Fine Tuning Engine */}
      <div className="lg:col-span-5 space-y-5" id="exporter-left-panel">
        <div className="bg-[#141414] border border-stone-800 rounded-xl p-5 shadow-sm space-y-4" id="export-engine-card">
          <h3 className="font-serif text-base font-bold text-stone-100 flex items-center gap-1.5 border-b border-stone-800 pb-2">
            <Sparkles className="w-5 h-5 text-[#c5a059] animate-pulse" />
            1. プロンプト生成タスクの選択
          </h3>

          {/* Quick Engine Switcher Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5" id="engine-toggles-grid">
            <button
              onClick={() => setPromptMode('novel_full')}
              className={`p-3 text-left rounded-lg border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                promptMode === 'novel_full'
                  ? 'bg-[#2c4c38] hover:bg-[#1f3828] text-white border-[#2c4c38]'
                  : 'bg-stone-900 hover:bg-stone-850 text-stone-300 border-stone-800'
              }`}
              id="btn-engine-novel"
            >
              <div className="font-bold flex items-center gap-1.5 text-[12px]">
                <BookOpen className="w-3.5 h-3.5" />
                小説本文を執筆させる
              </div>
              <p className={`text-[10px] leading-relaxed ${promptMode === 'novel_full' ? 'text-stone-200' : 'text-stone-450'}`}>
                あらすじを指定して、読みもの（本文）に自動変換させます。
              </p>
            </button>

            <button
              onClick={() => setPromptMode('critique')}
              className={`p-3 text-left rounded-lg border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                promptMode === 'critique'
                  ? 'bg-[#2c4c38] hover:bg-[#1f3828] text-white border-[#2c4c38]'
                  : 'bg-stone-900 hover:bg-stone-850 text-stone-300 border-stone-800'
              }`}
              id="btn-engine-critique"
            >
              <div className="font-bold flex items-center gap-1.5 text-[12px]">
                <Construction className="w-3.5 h-3.5" />
                プロットにツッコミ・批評を依頼する
              </div>
              <p className={`text-[10px] leading-relaxed ${promptMode === 'critique' ? 'text-stone-200' : 'text-stone-450'}`}>
                構成の矛盾探しや、中だるみ防止の改善点を編集者目線で検証させます。
              </p>
            </button>

            <button
              onClick={() => setPromptMode('dialogue_preview')}
              className={`p-3 text-left rounded-lg border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                promptMode === 'dialogue_preview'
                  ? 'bg-[#2c4c38] hover:bg-[#1f3828] text-white border-[#2c4c38]'
                  : 'bg-stone-900 hover:bg-stone-850 text-stone-300 border-stone-800'
              }`}
              id="btn-engine-dialogue"
            >
              <div className="font-bold flex items-center gap-1.5 text-[12px]">
                <MessageSquareCode className="w-3.5 h-3.5" />
                特定キャラの口調・台詞をテストする
              </div>
              <p className={`text-[10px] leading-relaxed ${promptMode === 'dialogue_preview' ? 'text-stone-200' : 'text-stone-450'}`}>
                指定キャラのプロフィールを基に、なりきり独白や会話をロールプレイ。
              </p>
            </button>

            <button
              onClick={() => setPromptMode('scene_expansion')}
              className={`p-3 text-left rounded-lg border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                promptMode === 'scene_expansion'
                  ? 'bg-[#2c4c38] hover:bg-[#1f3828] text-white border-[#2c4c38]'
                  : 'bg-stone-900 hover:bg-stone-850 text-stone-300 border-stone-800'
              }`}
              id="btn-engine-expansion"
            >
              <div className="font-bold flex items-center gap-1.5 text-[12px]">
                <Sliders className="w-3.5 h-3.5" />
                この章の演出・ラリー構成を深掘りする
              </div>
              <p className={`text-[10px] leading-relaxed ${promptMode === 'scene_expansion' ? 'text-stone-200' : 'text-stone-450'}`}>
                シーンの細分化ビート、サブテキスト演出、会話の応酬例をブレストします。
              </p>
            </button>
          </div>
        </div>

        {/* 2. Style & Adjust parameters (Specific variables per engine) */}
        <div className="bg-[#141414] border border-stone-800 rounded-xl p-5 shadow-sm space-y-4" id="export-params-card">
          <h3 className="font-serif text-base font-bold text-stone-100 flex items-center gap-1.5 border-b border-stone-800 pb-2">
            <Sliders className="w-5 h-5 text-[#c5a059]" />
            2. 出力される文体・オプション調整
          </h3>

          <div className="space-y-4" id="params-inputs">
            {/* Conditional control A: Specific chapter select for Novel writer / Scene expander */}
            {(promptMode === 'novel_full' || promptMode === 'scene_expansion') && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">対象にする章を選択</label>
                {project.beats.length === 0 ? (
                  <p className="text-[10px] text-red-650 bg-red-50 p-2 rounded border border-red-100">
                    構成・あらすじタブに章がありません。まずはそちらでプロットを作成してください。
                  </p>
                ) : (
                  <select
                    value={selectedBeatId}
                    onChange={(e) => setSelectedBeatId(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-stone-200 bg-white"
                    id="select-active-beat"
                  >
                    {project.beats.map((el, i) => (
                      <option key={el.id} value={el.id}>
                        第{i+1}章：{el.title}
                      </option>
                    ))}
                  </select>
                )}
                {getActiveBeat() && (
                  <p className="text-[10px] text-stone-400 line-clamp-2 italic bg-[#1a1917] p-2 rounded border border-stone-800 mt-1">
                    あらすじ: {getActiveBeat()?.description || '(あらすじ未記入)'}
                  </p>
                )}
              </div>
            )}

            {/* Conditional control B: Character selection for Dialogue Sandbox */}
            {promptMode === 'dialogue_preview' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">対象にするキャラクターを選択</label>
                {project.characters.length === 0 ? (
                  <p className="text-[10px] text-red-650 bg-red-50 p-2 rounded border border-red-100">
                    キャラクター設定タブにキャラがありません。追加してください。
                  </p>
                ) : (
                  <select
                    value={selectedCharId}
                    onChange={(e) => setSelectedCharId(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-stone-200 bg-white auto-cols-auto"
                    id="select-active-char"
                  >
                    {project.characters.map(char => (
                      <option key={char.id} value={char.id}>
                        {char.name} ({char.role})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Writing Style */}
            {promptMode === 'novel_full' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">文体・タッチの指定</label>
                  <select
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-stone-200 bg-white"
                    id="select-writing-style"
                  >
                    {styleOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[9px] text-stone-450 block mt-0.5 whitespace-normal">
                    {styleOptions.find(o => o.value === writingStyle)?.desc}
                  </span>
                </div>

                {/* Perspective POV */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">視点 (POV) 設定</label>
                  <select
                    value={aiPerspective}
                    onChange={(e) => setAiPerspective(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-stone-200 bg-white"
                    id="select-pov-mode"
                  >
                    <option value="third_person">客観三人称視点（標準）</option>
                    <option value="first_person">主人公（第1主人公）による一人称「俺・私」視点</option>
                    <option value="restricted">三人称一元化（特定の人物に寄り添い、心情を独占追尾）</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. AI批評・ツッコミ・修正要望の追加メモ */}
        <div className="bg-[#141414] border border-stone-800 rounded-xl p-5 shadow-sm space-y-4 animate-in fade-in" id="ai-critique-instructions-card">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <h3 className="font-serif text-base font-bold text-stone-100 flex items-center gap-1.5">
              <Construction className="w-5 h-5 text-[#c5a059]" />
              3. AI批評から得た「指摘された懸念点・改善策」メモ
            </h3>
            {project.aiCritiqueInstructions?.trim() && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('メモした指摘履歴をすべてクリアしますか？')) {
                    onUpdateProject({ aiCritiqueInstructions: '' });
                  }
                }}
                className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                title="すべての修正要望・ツッコミメモを消去"
              >
                <Trash2 className="w-3.5 h-3.5" />
                クリア
              </button>
            )}
          </div>
          
          <p className="text-[10px] text-stone-400 leading-relaxed">
            AIチーフ編集者等へのツッコミ・批評で得られた「矛盾点」「中だるみの懸念」「改善アイデア」をここにコピペ、または追記してください。
            ここに蓄積されたフィードバックは、<strong>次回プロンプト出力時に【最優先修正必須事項】として自動的に差し込まれ</strong>、それ以降のAI執筆において矛盾が修正されます。
          </p>

          <div className="space-y-3" id="critique-memo-editor">
            {/* クイックテンプーレート挿入 */}
            <div className="flex flex-wrap gap-1.5" id="critique-memo-helpers">
              <button
                type="button"
                onClick={() => handleAppendTemplate('■ [AI指摘の懸念・指摘点]\n・ \n\n■ [解決・修正方針]\n・ ')}
                className="text-[9px] px-2 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded font-medium transition-all hover:border-[#c5a059]/30"
              >
                + 懸念＆解決策の型
              </button>
              <button
                type="button"
                onClick={() => handleAppendTemplate('■ [キャラクター言動ルール・キャラブレの修正指示]\n・ 「」という発言や態度は避ける\n・ ')}
                className="text-[9px] px-2 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded font-medium transition-all hover:border-[#c5a059]/30"
              >
                + キャラブレ防止の型
              </button>
              <button
                type="button"
                onClick={() => handleAppendTemplate('■ [展開・ペース配分の指示]\n・ \n・ ')}
                className="text-[9px] px-2 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded font-medium transition-all hover:border-[#c5a059]/30"
              >
                + ペース配分の型
              </button>
            </div>

            {/* 新しい内容 / 改善案入力 */}
            <div className="space-y-1">
              <textarea
                value={project.aiCritiqueInstructions || ''}
                onChange={(e) => onUpdateProject({ aiCritiqueInstructions: e.target.value })}
                placeholder="AIが提案してくれた改善策や、矛盾のツッコミ内容（懸念点＋修正指示）をここにそのままコピペ、または自由に追記してください..."
                className="w-full h-44 text-xs p-2.5 rounded border border-stone-800 bg-stone-900 text-stone-100 outline-none focus:border-[#c5a059] font-mono leading-relaxed"
                id="textarea-critique-instructions"
              />
            </div>

            {/* 連動ステータス告知 */}
            {project.aiCritiqueInstructions?.trim() ? (
              <div 
                className="p-2.5 rounded bg-[#2c4c38]/10 border border-[#2c4c38]/30 flex items-start gap-2 animate-pulse" 
                id="critique-linker-status"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-[10px] text-emerald-300 leading-normal">
                  現在、こちらの懸念点と解決方針は<strong>プロンプトに統合中</strong>です。右側で生成されるプロンプト末尾に「最優先・必須修正クリア要件」として自動連携されています。
                </span>
              </div>
            ) : (
              <div 
                className="p-2.5 rounded bg-stone-950/40 border border-stone-800/60 flex items-start gap-2" 
                id="critique-linker-status-empty"
              >
                <AlertCircle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <span className="text-[9.5px] text-stone-500 leading-normal">
                  ツッコミ/改善案メモが未入力です（空欄の場合は追加プロンプト条件なし）。AI編集者から出てきた懸念や改善指示をコピペして、対話式のアップデートを体験しましょう。
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Prompt Output Terminal View */}
      <div className="lg:col-span-7 flex flex-col space-y-3" id="exporter-prompt-preview">
        {/* Engine header descriptor */}
        <div className="bg-[#2c4c38]/10 p-3 rounded-lg border border-[#2c4c38]/30 flex items-center justify-between" id="engine-header-descriptor">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-[#c5a059] tracking-wider block">アクティブ・プロファイリング</span>
            <h4 className="font-serif font-bold text-stone-200 text-xs">
              {currentModeDetails().title}
            </h4>
            <p className="text-[10px] text-stone-500 leading-relaxed md:block hidden max-w-md">
              {currentModeDetails().desc}
            </p>
          </div>
        </div>

        {/* Raw generated code text-box ready to copy */}
        <div className="flex-1 min-h-[400px] bg-stone-900 rounded-xl p-4 text-stone-100 font-mono text-xs flex flex-col relative shadow-lg" id="prompt-terminal">
          
          {/* Controls line bar */}
          <div className="flex justify-between items-center bg-stone-800/80 p-2 rounded-lg border border-stone-700/80 mb-3" id="prompt-terminal-topbar">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-stone-300 font-bold tracking-wider">GENERATE PROMPT PREVIEW</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-stone-400">
                総文字数: {generatedPrompt.length} 字
              </span>
              <button
                onClick={handleCopyToClipboard}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#2c4c38] hover:bg-[#1f3828] text-white rounded text-[11px] font-bold transition-all shadow-sm active:scale-95"
                id="btn-copy-prompt"
              >
                {copied ? (
                  <>
                    <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                    コピー成功！
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    プロンプトを全てコピー
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Copy Success Inline Toast Banner inside terminal */}
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 bg-emerald-600 border border-emerald-420 text-white font-serif px-6 py-2.5 rounded-lg text-xs font-bold text-center shadow-lg z-20 flex items-center gap-2"
                id="copy-toast-banner"
              >
                <ClipboardCheck className="w-4 h-4 text-white animate-bounce" />
                コピーに成功しました！このまま外部のGemini等にペーストして下さい。
              </motion.div>
            )}
          </AnimatePresence>

          {/* Textarea representation displaying complete data ready for copier */}
          <textarea
            readOnly
            value={generatedPrompt}
            className="flex-1 bg-transparent/10 text-stone-200 outline-none border-none resize-none leading-relaxed font-mono w-full text-xs p-1"
            placeholder="ここに全プロンプトが表示されます。上のコピーボタンを押してください。"
            id="prompt-result-textarea"
          />

          <div className="bg-[#2a2928]/40 p-2.5 rounded-lg border border-[#484542]/40 text-[10px] text-stone-400 mt-2 hover:text-stone-300 transition-colors leading-relaxed" id="prompt-tip-subcard">
            <span className="font-bold text-amber-400">💡 外部AIで執筆させるコツ：</span>
            上記のフルビルドプロンプトには、プロット内の相関図や世界設定が一括同梱されています。Gemini等のAIモデルのチャットにそのままペーストすれば、設定破綻や口調崩れの非常に少ない、極めてクオリティの高い日本語の展開シーンが秒速で書き出されます。
          </div>
        </div>
      </div>
    </div>
  );
}
