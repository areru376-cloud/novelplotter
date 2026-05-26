import React, { useState } from 'react';
import { Project, SettingField } from '../types';
import { 
  Compass, 
  MapPin, 
  History, 
  Settings, 
  Lightbulb, 
  Plus, 
  Trash2, 
  BookOpen,
  HelpCircle,
  FolderPlus,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EditorSettingsProps {
  project: Project;
  onUpdateProject: (fields: Partial<Project>) => void;
}

const CATEGORIES = [
  { value: '地理・舞台設定', icon: MapPin, desc: '国、街、洋館、ダンジョンなど物語の中心フィールド' },
  { value: '歴史・背景世界観', icon: History, desc: '世界が現在に至った要因、神話、戦争、文明史' },
  { value: '魔法体系・独自ルール', icon: Settings, desc: '超科学、魔法、魔物。AIに守らせるべき一貫した世界法則' },
  { value: 'キーアイテム・重要概念', icon: Bookmark, desc: '伝説の剣、失われたペンダント、アリバイ崩しの鍵となる楽譜等' },
  { value: 'その他・メモ', icon: Lightbulb, desc: 'アイデア段階のもの、年表や時制、覚書など何でも' }
];

export default function EditorSettings({ project, onUpdateProject }: EditorSettingsProps) {
  const [activeCategory, setActiveCategory] = useState<string>('地理・舞台設定');

  const handleAddField = () => {
    const newField: SettingField = {
      id: `set-${Date.now()}`,
      category: activeCategory,
      title: `${activeCategory}の項目`,
      content: '',
    };
    onUpdateProject({
      settings: [...project.settings, newField]
    });
  };

  const handleUpdateField = (id: string, fields: Partial<SettingField>) => {
    const updated = project.settings.map(s => {
      if (s.id === id) {
        return { ...s, ...fields };
      }
      return s;
    });
    onUpdateProject({ settings: updated });
  };

  const handleDeleteField = (id: string) => {
    onUpdateProject({
      settings: project.settings.filter(s => s.id !== id)
    });
  };

  const handleApplyPreset = (presetType: 'location' | 'rules' | 'item') => {
    const presets = {
      location: {
        category: '地理・舞台設定',
        title: '首都オルフェウス / 蒸気と歯車の街',
        content: '常に黒い煤煙に覆われた縦型の要塞都市。上層は貴族や政治の中枢。下層は蒸気機関の熱気に喘ぐ労働者の密集街区。中央を貫く超巨大エレベーター「バベルの楔」で物流が管理されている。'
      },
      rules: {
        category: '魔法体系・独自ルール',
        title: '血脈結合契約（ブラッド・コーディング）',
        content: '古代魔素兵器（ギア）を稼働させるため、生体血液に特別な触媒を注入する儀式。これにより術者とその武器は「宿命接続」され、武器から直接魔力を受給可能になる。ただし激しい戦闘後は肉体が蝕まれ、血液凝固に似た結晶化が発生する。'
      },
      item: {
        category: 'キーアイテム・重要概念',
        title: 'アリアドネの青い羅針盤',
        content: '持ち主の「最も心の奥底で求めている居場所」に向けて静かに青白い針を指し示す呪物。論理的な地図と連動せず、精神状態やエーテルの乱れによって極端に進路を変える。'
      }
    };

    const chosen = presets[presetType];
    const newField: SettingField = {
      id: `set-${Date.now()}`,
      ...chosen
    };
    onUpdateProject({
      settings: [...project.settings, newField]
    });
    setActiveCategory(chosen.category);
  };

  const filteredFields = project.settings.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-6" id="editor-settings-tab">
      {/* Overview & Quick Presets */}
      <div className="bg-[#141414] border border-stone-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4" id="presets-lore-box">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-serif font-bold text-stone-200 text-sm">
            <Compass className="w-4 h-4 text-[#c5a059]" />
            世界設定の管理
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            小説の背景や法則、重要な物。これらを詳細に入力することで、AIは整合性の取れたリアルな描写（伏線・世界設定）を行えます。
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap" id="presets-buttons-container">
          <span className="text-[10px] font-bold text-stone-500">簡単プリセット挿入:</span>
          <button
            onClick={() => handleApplyPreset('location')}
            className="px-2 py-1 bg-stone-850 hover:bg-stone-800 text-[10px] font-semibold text-[#c5a059] border border-stone-750 rounded transition-colors shadow-xs"
            id="btn-settings-preset-location"
          >
            不思議な要塞街
          </button>
          <button
            onClick={() => handleApplyPreset('rules')}
            className="px-2 py-1 bg-stone-850 hover:bg-stone-800 text-[10px] font-semibold text-[#c5a059] border border-stone-750 rounded transition-colors shadow-xs"
            id="btn-settings-preset-rules"
          >
            血統・制約魔法システム
          </button>
          <button
            onClick={() => handleApplyPreset('item')}
            className="px-2 py-1 bg-stone-850 hover:bg-stone-800 text-[10px] font-semibold text-[#c5a059] border border-stone-750 rounded transition-colors shadow-xs"
            id="btn-settings-preset-item"
          >
            奇妙なコンパス
          </button>
        </div>
      </div>

      {/* Main split tab layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="settings-main-split">
        {/* Left categories navigation switcher */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-1" id="settings-category-nav">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.value;
            const count = project.settings.filter(s => s.category === cat.value).length;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`p-3 rounded-lg text-left transition-all border flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#1a1a1a] border-[#c5a059] text-[#c5a059] shadow-xs'
                    : 'bg-stone-900 hover:bg-stone-850 border-stone-850 text-stone-300'
                }`}
                id={`cat-nav-btn-${cat.value}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#c5a059]' : 'text-stone-500'}`} />
                  <div className="truncate">
                    <div className="text-xs font-bold">{cat.value}</div>
                    <div className="text-[10px] text-stone-500 truncate md:hidden xl:block">
                      {cat.desc}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-[#c5a059] text-black' : 'bg-stone-800 text-stone-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Fields Creator & Inputs */}
        <div className="col-span-1 md:col-span-8 space-y-4" id="settings-fields-content">
          <div className="flex justify-between items-center bg-stone-900 p-2.5 rounded-lg border border-stone-800" id="fields-content-control">
            <span className="text-xs font-bold text-stone-300 font-serif">
              {activeCategory}の項目一覧
            </span>
            <button
              onClick={handleAddField}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#c5a059] hover:bg-[#b48e48] text-black font-semibold rounded text-xs transition-colors shadow-sm"
              id="btn-add-setting-field"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              項目を追加
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredFields.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 border rounded-xl bg-stone-900/40 border-dashed border-stone-800 text-stone-500 text-xs flex flex-col justify-center items-center"
                id="no-settings-placeholder"
              >
                <BookOpen className="w-10 h-10 text-stone-700 mb-2" />
                <p className="font-semibold text-stone-300">このカテゴリには設定がまだ登録されていません</p>
                <p className="text-[11px] text-stone-500 mt-0.5">「項目を追加」ボタンを押して新しい設定情報を追加しましょう。</p>
              </motion.div>
            ) : (
              <div className="space-y-4" id="settings-fields-scroller">
                {filteredFields.map((field, idx) => {
                  return (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, scale: 0.98, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15, delay: idx * 0.03 }}
                      className="bg-[#141414] border border-stone-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative"
                      id={`setting-editor-card-${field.id}`}
                    >
                      <button
                        title="この項目を削除"
                        onClick={() => handleDeleteField(field.id)}
                        className="absolute top-4 right-4 p-1 rounded hover:bg-red-950/40 text-stone-500 hover:text-red-400 transition-colors"
                        id={`btn-del-setting-${field.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-3" id={`setting-editor-inputs-${field.id}`}>
                        {/* Setting Title */}
                        <div className="pr-8">
                          <input
                            type="text"
                            value={field.title}
                            onChange={(e) => handleUpdateField(field.id, { title: e.target.value })}
                            className="bg-transparent border-b border-dashed border-stone-800 hover:border-stone-700 focus:border-[#c5a059] focus:outline-none font-serif font-bold text-[#c5a059] text-sm py-0.5 px-1 w-full"
                            placeholder="設定名を入力（例：星紡ぎの碑文）"
                            id={`input-setting-title-${field.id}`}
                          />
                        </div>

                        {/* Setting content */}
                        <div>
                          <textarea
                            rows={3}
                            value={field.content}
                            onChange={(e) => handleUpdateField(field.id, { content: e.target.value })}
                            className="w-full text-xs p-2.5 rounded-lg border border-stone-800 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none leading-relaxed resize-y bg-stone-900 focus:bg-stone-950 text-stone-200 transition-colors"
                            placeholder="具体的な設定内容を書き出して下さい。AIが参照しやすいように物語に出てくる特殊効果や制限ルールなどを明確に箇条書きなどで細かく肉付けると効果的です。"
                            id={`input-setting-content-${field.id}`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
