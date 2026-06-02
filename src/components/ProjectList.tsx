import React, { useState, useRef } from 'react';
import { Project } from '../types';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  FileText, 
  BookMarked,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectListProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onImportProjects: (imported: Project) => void;
}

export default function ProjectList({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onDuplicateProject,
  onImportProjects,
}: ProjectListProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };

  const handleExportAll = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `novel-plotter-all-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSingle = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = JSON.stringify(project, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title || '無題のプロット'}-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          json.forEach(proj => {
            if (proj.title && proj.id && Array.isArray(proj.characters) && Array.isArray(proj.beats)) {
              onImportProjects(proj);
            }
          });
        } else if (json.title && json.id && Array.isArray(json.characters) && Array.isArray(json.beats)) {
          onImportProjects(json);
        } else {
          alert('無効なプロットファイルです。フォーマットを確認してください。');
        }
      } catch (err) {
        alert('ファイルの読み込みに失敗しました。正しいJSONファイルを選択してください。');
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] border-r border-stone-800" id="project-list-container">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-stone-800 bg-[#141414] flex items-center justify-between" id="sidebar-header">
        <div className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-[#c5a059]" />
          <h2 className="font-serif text-base font-bold text-stone-100 tracking-wider">
            小説一覧
            <span className="text-xs font-sans font-normal text-stone-500 ml-1.5">
              ({projects.length})
            </span>
          </h2>
        </div>
        <button
          onClick={onCreateProject}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-stone-800 text-stone-200 hover:bg-stone-700 transition-colors border border-stone-700 shadow-sm"
          id="btn-new-project"
        >
          <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
          新規作成
        </button>
      </div>

      {/* Projects Scroller */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2" id="project-items-scroller">
        <AnimatePresence initial={false}>
          {projects.map((project) => {
            const isActive = project.id === activeProjectId;
            return (
              <motion.div
                key={project.id}
                layoutId={`project-card-${project.id}`}
                className={`relative group p-3.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#1a1a1a] border-[#c5a059] border-l-2 shadow-md shadow-[#c5a059]/5'
                    : 'bg-stone-900 hover:bg-stone-850 border-stone-800 hover:border-stone-750'
                }`}
                onClick={() => onSelectProject(project.id)}
                id={`project-card-${project.id}`}
              >
                <div className="flex justify-between items-start gap-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <FileText className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#c5a059]' : 'text-stone-500'}`} />
                      <h3 className={`font-serif text-xs font-bold truncate leading-tight ${isActive ? 'text-[#c5a059]' : 'text-stone-300'}`}>
                        {project.title || '無題のプロット'}
                      </h3>
                    </div>
                    {project.genre && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] bg-stone-950 border border-stone-800 text-[#c5a059] rounded">
                        {project.genre}
                      </span>
                    )}
                    {project.logline && (
                      <p className="text-[11px] text-stone-550 line-clamp-2 mt-1 italic tracking-wide">
                        {project.logline}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-[9.5px] text-stone-500 mt-2">
                      <Clock className="w-3 h-3 text-[#c5a059]" />
                      <span>{formatDate(project.lastSaved)}</span>
                      <span className="mx-1">•</span>
                      <span>人:{project.characters?.length || 0}</span>
                      <span>章:{project.beats?.length || 0}</span>
                    </div>
                  </div>

                  {/* Quick actions shown on hover or when active */}
                  <div className={`flex items-center gap-1 transition-opacity ml-2 shrink-0 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'}`}>
                    <button
                      title="この小説をバックアップ保存"
                      onClick={(e) => handleExportSingle(project, e)}
                      className="p-1 rounded text-stone-500 hover:text-[#c5a059] hover:bg-stone-800 transition-colors"
                      id={`btn-export-single-${project.id}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="複製する"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateProject(project.id);
                      }}
                      className="p-1 rounded text-stone-500 hover:text-[#c5a059] hover:bg-stone-800 transition-colors"
                      id={`btn-dup-${project.id}`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="削除する"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowConfirmDelete(project.id);
                      }}
                      className="p-1 rounded text-stone-500 hover:text-red-500 hover:bg-stone-800 transition-colors"
                      id={`btn-del-request-${project.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Confirm inline delete panel */}
                {showConfirmDelete === project.id && (
                  <div 
                    className="absolute inset-0 bg-stone-950/95 rounded-lg border border-red-900/50 z-10 flex flex-col items-center justify-center p-2 text-center"
                    onClick={(e) => e.stopPropagation()}
                    id={`confirm-del-panel-${project.id}`}
                  >
                    <div className="flex items-center gap-1 text-red-450 font-bold text-[11px] mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      本当に削除しますか？
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onDeleteProject(project.id);
                          setShowConfirmDelete(null);
                        }}
                        className="px-2.5 py-0.5 bg-red-800 hover:bg-red-700 text-stone-100 rounded text-[9px] font-medium"
                        id={`btn-del-confirm-${project.id}`}
                      >
                        はい
                      </button>
                      <button
                        onClick={() => setShowConfirmDelete(null)}
                        className="px-2.5 py-0.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[9px]"
                        id={`btn-del-cancel-${project.id}`}
                      >
                        いいえ
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Drag and Drop JSON Import Zone */}
      <div className="p-3 border-t border-stone-800 bg-[#0f0f0f]" id="import-export-zone">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
          id="file-import-input"
        />
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`p-3 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#c5a059] bg-stone-900'
              : 'border-stone-800 hover:border-stone-700 bg-stone-900/40 hover:bg-stone-900/80 text-stone-400'
          }`}
          id="drag-and-drop-zone"
        >
          <Upload className={`w-5 h-5 mx-auto mb-1 ${isDragging ? 'text-[#c5a059] animate-bounce' : 'text-[#c5a059]/70'}`} />
          <div className="text-[11px] font-medium text-stone-300">
            {isDragging ? 'ここにドラッグ！' : 'ファイルをここにドラッグ＆ドロップ'}
          </div>
          <div className="text-[9.5px] text-stone-500 mt-0.5">
            またはクリックしてバックアップを読み込み
          </div>
        </div>

        {projects.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-2">
            {activeProjectId && (() => {
              const activeProj = projects.find(p => p.id === activeProjectId);
              if (!activeProj) return null;
              return (
                <button
                  type="button"
                  onClick={(e) => handleExportSingle(activeProj, e)}
                  className="w-full py-1.5 px-3 border border-stone-800 hover:border-[#c5a059] text-stone-200 hover:text-[#c5a059] rounded text-xs font-semibold transition-all bg-[#141414] hover:bg-stone-850 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  id="btn-export-active"
                >
                  <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                  「{activeProj.title || '無題'}」を単体で保存
                </button>
              );
            })()}
            <button
              type="button"
              onClick={handleExportAll}
              className="w-full py-1 px-3 border border-stone-850 hover:border-stone-700 text-stone-450 hover:text-stone-300 rounded text-[10.5px] font-medium transition-all bg-stone-950 hover:bg-stone-900 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              id="btn-export-all"
            >
              <Download className="w-3 h-3 text-stone-500" />
              全小説を一括で保存する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
