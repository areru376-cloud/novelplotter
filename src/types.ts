export type StructureType = 'kishotenketsu' | 'three_act' | 'johakyu' | 'custom';

export interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'deuteragonist' | 'antagonist' | 'mentor' | 'supporting' | 'other';
  age: string;
  gender: string;
  appearance: string;
  personality: string;
  motivation: string;
  secrets: string;
  specialSkills: string; // 特技
  pastEvents: string;    // 過去の出来事
}

export interface SettingField {
  id: string;
  category: string;
  title: string;
  content: string;
}

export interface PlotBeat {
  id: string;
  title: string;
  description: string;
  tension: number; // 0 to 100
  keyCharacters: string[]; // Character IDs
}

export interface Project {
  id: string;
  title: string;
  genre: string;
  logline: string;
  theme: string;
  keywords: string[]; // 中心キーワード
  targetAudience: string;
  desiredLength: string;
  tone: string;
  structureType: StructureType;
  characters: Character[];
  settings: SettingField[];
  beats: PlotBeat[];
  lastSaved: string;
  
  // 新規追加：Web小説サービス環境設定＆執筆メタ情報
  episodeWordCountMin?: number; // 規定値: 3500
  episodeWordCountMax?: number; // 規定値: 5000
  publishServices?: string[];   // なろう、カクヨム、アルファポリス等
  publishAgeRatings?: string[]; // R15, 残酷描写, ボーイズラブ, ガールズラブ等
  publishSynopsis?: string;     // 各サービス用のあらすじ紹介文
  publishKeywords?: string[];   // 登録タグ (ざまぁ, 異世界転生, 悪役令嬢等)
  publishSchedule?: string;     // 投稿予定 (例: 毎週金曜20:00更新)
}

export type PromptMode = 'novel_full' | 'critique' | 'dialogue_preview' | 'scene_expansion';
