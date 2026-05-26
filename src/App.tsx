import React, { useState, useEffect } from 'react';
import { Project, StructureType } from './types';
import { INITIAL_PROJECTS } from './initialData';
import ProjectList from './components/ProjectList';
import EditorBasicInfo from './components/EditorBasicInfo';
import EditorCharacters from './components/EditorCharacters';
import EditorSettings from './components/EditorSettings';
import EditorPlotBeats from './components/EditorPlotBeats';
import PromptExporter from './components/PromptExporter';
import { 
  BookMarked, 
  Settings, 
  Users, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  Menu, 
  X, 
  BookOpen,
  CloudLightning,
  PenTool,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'novel_plotter_projects_v1';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'characters' | 'settings' | 'beats' | 'export'>('basic');
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);
  const [lastNotice, setLastNotice] = useState<string>('常時ローカル自動保存完了');

  // Load projects from local storage or seed initial samples
  useEffect(() => {
    // Force clean up of any legacy light-theme class
    document.body.classList.remove('light-theme');
    localStorage.removeItem('theme_mode');

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Project[];
        if (parsed.length > 0) {
          setProjects(parsed);
          setActiveProjectId(parsed[0].id);
        } else {
          // Fallback if parsed array is empty
          setProjects(INITIAL_PROJECTS);
          setActiveProjectId(INITIAL_PROJECTS.length > 0 ? INITIAL_PROJECTS[0].id : null);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
        }
      } catch (err) {
        setProjects(INITIAL_PROJECTS);
        setActiveProjectId(INITIAL_PROJECTS.length > 0 ? INITIAL_PROJECTS[0].id : null);
      }
    } else {
      // First turn seed
      setProjects(INITIAL_PROJECTS);
      setActiveProjectId(INITIAL_PROJECTS.length > 0 ? INITIAL_PROJECTS[0].id : null);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
    }
  }, []);

  // Sync projects state to localstorage with brief visual notices
  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
    
    // Quick save stamp notice
    const now = new Date();
    setLastNotice(`ローカル保存: ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
  };

  const getActiveProject = () => {
    return projects.find(p => p.id === activeProjectId) || null;
  };

  const handleCreateProject = () => {
    const newProjId = `project-${Date.now()}`;
    const newProj: Project = {
      id: newProjId,
      title: '新しい小説プロット',
      genre: 'ファンタジー / 異世界転生 / 青春群像劇',
      theme: '',
      keywords: [],
      logline: '',
      targetAudience: '',
      desiredLength: '',
      tone: '',
      structureType: 'kishotenketsu',
      characters: [],
      settings: [],
      beats: [],
      lastSaved: new Date().toISOString(),
      episodeWordCountMin: 3500,
      episodeWordCountMax: 5000,
      publishServices: ['小説家になろう', 'カクヨム'],
      publishAgeRatings: [],
      publishSynopsis: '',
      publishKeywords: [],
      publishSchedule: '毎週金曜日 18:00 更新'
    };

    const nextList = [newProj, ...projects];
    saveProjects(nextList);
    setActiveProjectId(newProjId);
    setActiveTab('basic');
    setShowMobileSidebar(false);
  };

  const handleDeleteProject = (id: string) => {
    const nextList = projects.filter(p => p.id !== id);
    saveProjects(nextList);
    if (activeProjectId === id) {
      setActiveProjectId(nextList.length > 0 ? nextList[0].id : null);
    }
  };

  const handleDuplicateProject = (id: string) => {
    const target = projects.find(p => p.id === id);
    if (!target) return;

    const dupProj: Project = {
      ...JSON.parse(JSON.stringify(target)), // deep clone
      id: `project-dup-${Date.now()}`,
      title: `${target.title} (コピー)` ,
      lastSaved: new Date().toISOString()
    };

    const nextList = [dupProj, ...projects];
    saveProjects(nextList);
    setActiveProjectId(dupProj.id);
  };

  const handleImportSingleProject = (importedProj: Project) => {
    // Generate a secure unique ID to prevent conflicts
    const prepared: Project = {
      ...importedProj,
      id: `project-import-${Date.now()}`,
      lastSaved: new Date().toISOString()
    };

    const nextList = [prepared, ...projects];
    saveProjects(nextList);
    setActiveProjectId(prepared.id);
    setActiveTab('basic');
    setShowMobileSidebar(false);
  };

  const handleUpdateActiveProject = (fields: Partial<Project>) => {
    if (!activeProjectId) return;
    const nextList = projects.map(p => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          ...fields,
          lastSaved: new Date().toISOString()
        };
      }
      return p;
    });
    saveProjects(nextList);
  };

  const activeProject = getActiveProject();

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-stone-200" id="main-app-container" style={{ fontFamily: "'Yu Gothic', 'Hiragino Kaku Gothic ProN', sans-serif" }}>
      {/* Top Main Bar */}
      <header className="bg-[#0f0f0f] text-stone-200 py-3.5 px-4 md:px-6 flex items-center justify-between border-b border-stone-800 shadow-md z-30" id="primary-header">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger directory trigger */}
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="lg:hidden p-1.5 rounded-md hover:bg-stone-800 transition-colors text-white"
            title="プロット一覧を開く"
            id="mobile-menu-trigger"
          >
            <Menu className="w-5 h-5 text-stone-350" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 flex items-center justify-center bg-stone-900 border border-stone-800 rounded-lg shadow-inner">
              <span className="text-[#c5a059] font-serif text-lg font-bold">筆</span>
            </div>
            <div>
              <h1 className="font-serif text-sm md:text-base font-bold tracking-widest flex items-center gap-1.5 text-stone-100">
                小説プロット書斎箱 PLOTFORGE
                <span className="text-[9px] font-sans font-normal border border-[#c5a059] text-[#c5a059] px-1 py-0.25 rounded tracking-normal">
                  v1.0 / OFFLINE MODE
                </span>
              </h1>
              <p className="text-[9px] text-stone-500 uppercase tracking-[0.2em] md:block hidden">
                Novel Plotting Architecture
              </p>
            </div>
          </div>
        </div>

        {/* Sync Indicator Info */}
        <div className="flex items-center gap-3 text-xs" id="header-sync-info">
          <div className="md:flex items-center gap-1.5 bg-stone-900 border border-stone-800 py-1 px-3 rounded text-[10px] hidden text-stone-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{lastNotice}</span>
          </div>
          <span className="text-[9.5px] text-stone-500 md:block hidden tracking-wide">
            データはブラウザに自動保存されます
          </span>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative" id="layout-body">
        
        {/* Desktop Left Sidebar: Project selection (Fixed width 300px or 340px) */}
        <aside className="hidden lg:block w-[300px] xl:w-[330px] flex-shrink-0" id="desktop-sidebar">
          <ProjectList
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={(id) => {
              setActiveProjectId(id);
              setActiveTab('basic');
            }}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onImportProjects={handleImportSingleProject}
          />
        </aside>

        {/* Mobile Left Sidebar: Sliding Drawer Panel overlay */}
        <AnimatePresence>
          {showMobileSidebar && (
            <>
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40 lg:hidden"
                onClick={() => setShowMobileSidebar(false)}
                id="drawer-backdrop"
              />
              {/* Drawer core */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-150%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed top-0 bottom-0 left-0 w-[280px] bg-[#0f0f0f] z-50 shadow-2xl lg:hidden flex flex-col border-r border-stone-800"
                id="mobile-drawer"
              >
                {/* Close handle inside drawer */}
                <div className="p-3 bg-stone-900 flex items-center justify-between border-b border-stone-800">
                  <span className="text-xs font-bold text-stone-300">書斎設定</span>
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    className="p-1 rounded hover:bg-stone-800"
                    id="btn-close-drawer"
                  >
                    <X className="w-4 h-4 text-stone-400" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
                  <ProjectList
                    projects={projects}
                    activeProjectId={activeProjectId}
                    onSelectProject={(id) => {
                      setActiveProjectId(id);
                      setActiveTab('basic');
                      setShowMobileSidebar(false);
                    }}
                    onCreateProject={handleCreateProject}
                    onDeleteProject={handleDeleteProject}
                    onDuplicateProject={handleDuplicateProject}
                    onImportProjects={handleImportSingleProject}
                  />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main active project workspace panel */}
        <main className="flex-1 overflow-y-auto bg-[#0a0a0a] flex flex-col" id="workspace-primary">
          {activeProject ? (
            <div className="flex-grow p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full flex flex-col space-y-5" id="workspace-internal">
              
              {/* Active Book header info bar */}
              <div className="bg-[#141414] border border-stone-800 rounded-xl p-4 md:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4" id="active-book-banner">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#c5a059] flex-shrink-0" />
                    <h2 className="font-serif text-lg md:text-xl font-bold text-stone-100">
                      {activeProject.title || '無題の小説プロット'}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-400 flex-wrap">
                    {activeProject.genre && (
                      <span className="font-bold border border-stone-800 text-[#c5a059] bg-stone-900/40 px-1.5 py-0.25 rounded text-[10px]">
                        {activeProject.genre}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] text-stone-400">
                      <Users className="w-3.5 h-3.5 text-[#c5a059]" />
                      登場人物: <b className="text-stone-200">{activeProject.characters.length}</b> 人
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-stone-400">
                      <Layers className="w-3.5 h-3.5 text-[#c5a059]" />
                      章割り: <b className="text-stone-200">{activeProject.beats.length}</b> 章
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 md:text-right flex items-center md:justify-end gap-1 font-mono">
                  <Clock className="w-3 h-3 text-[#c5a059]" />
                  最終更新日: {new Date(activeProject.lastSaved).toLocaleString('ja-JP')}
                </div>
              </div>

              {/* Master Tab Switches Navigation bar */}
              <nav className="flex border-b border-stone-800 overflow-x-auto gap-1 no-scrollbar pt-1 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-10" id="workspace-nav-tabs">
                {[
                  { id: 'basic', label: '① 基本情報設定', icon: PenTool },
                  { id: 'characters', label: '② 登場人物像', icon: Users },
                  { id: 'settings', label: '③ 世界観・設定', icon: Settings },
                  { id: 'beats', label: '④ 起伏・章割り', icon: Layers },
                  { id: 'export', label: '⑤ AI出力プロンプト', icon: Sparkles, highlight: true }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 md:px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-t border-x whitespace-nowrap -mb-px ${
                        isSelected
                          ? tab.highlight
                            ? 'bg-[#c5a059] text-black border-[#c5a059] font-bold shadow-[0_0_15px_rgba(197,160,89,0.35)]'
                            : 'bg-[#141414] text-[#c5a059] border-stone-800 border-b-[#141414] font-bold'
                          : tab.highlight
                            ? 'bg-stone-900/60 text-[#c5a059] border-stone-850 hover:bg-stone-800/40 text-[11px]'
                            : 'bg-transparent text-stone-400 hover:text-stone-250 border-transparent hover:bg-stone-900/60'
                      }`}
                      id={`workspace-tab-btn-${tab.id}`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'scale-110' : ''}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Workspace workspace content switchboard with animations */}
              <div className="flex-grow min-y-[400px]" id="workspace-tab-contents">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.14 }}
                    id={`active-tab-motion-view-${activeTab}`}
                  >
                    {activeTab === 'basic' && (
                      <EditorBasicInfo 
                        project={activeProject} 
                        onUpdateProject={handleUpdateActiveProject} 
                      />
                    )}
                    {activeTab === 'characters' && (
                      <EditorCharacters 
                        project={activeProject} 
                        onUpdateProject={handleUpdateActiveProject} 
                      />
                    )}
                    {activeTab === 'settings' && (
                      <EditorSettings 
                        project={activeProject} 
                        onUpdateProject={handleUpdateActiveProject} 
                      />
                    )}
                    {activeTab === 'beats' && (
                      <EditorPlotBeats 
                        project={activeProject} 
                        onUpdateProject={handleUpdateActiveProject} 
                      />
                    )}
                    {activeTab === 'export' && (
                      <PromptExporter 
                        project={activeProject} 
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-stone-500" id="no-projects-master-fallback">
              <BookOpen className="w-16 h-16 text-stone-700 mb-3 animate-bounce" />
              <h2 className="font-serif text-lg font-bold text-stone-300 mb-1">
                プロットが一件もありません
              </h2>
              <p className="text-xs text-stone-500 mb-4 max-w-sm">
                新しい作品の構想を開始しましょう。ローカルセーブが動作します。
              </p>
              <button
                onClick={handleCreateProject}
                className="px-6 py-2 bg-[#c5a059] hover:bg-[#b48e48] text-black font-bold text-xs rounded transition-colors shadow-[0_0_15px_rgba(197,160,89,0.3)]"
                id="btn-create-fallback"
              >
                新規作品プロットの作成
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
