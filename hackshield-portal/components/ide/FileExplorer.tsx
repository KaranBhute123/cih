'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Plus, Trash2, Edit2 } from 'lucide-react';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
}

interface FileExplorerProps {
  files: FileNode[];
  expandedFolders: Set<string>;
  activeFile: string;
  onFileSelect: (path: string) => void;
  onFolderToggle: (path: string) => void;
  onNewFile: (parentPath: string) => void;
  onNewFolder: (parentPath: string) => void;
  onDelete: (path: string) => void;
  onRename: (path: string, newName: string) => void;
  teamMembers?: Array<{ id: string; name: string; currentFile?: string; avatar?: string }>;
}

export default function FileExplorer({
  files,
  expandedFolders,
  activeFile,
  onFileSelect,
  onFolderToggle,
  onNewFile,
  onNewFolder,
  onDelete,
  onRename,
  teamMembers = []
}: FileExplorerProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      'js': '📜', 'jsx': '⚛️', 'ts': '📘', 'tsx': '⚛️',
      'html': '🌐', 'css': '🎨', 'json': '📋',
      'py': '🐍', 'java': '☕', 'cpp': '⚙️',
      'md': '📝', 'txt': '📄', 'yml': '⚙️', 'yaml': '⚙️',
      'png': '🖼️', 'jpg': '🖼️', 'svg': '🎨',
    };
    return iconMap[ext || ''] || '📄';
  };

  const getActiveEditor = (path: string) => {
    return teamMembers.find(m => m.currentFile === path);
  };

  const handleContextMenu = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, path });
  };

  const handleRename = (path: string, currentName: string) => {
    setRenamingPath(path);
    setRenameValue(currentName);
    setContextMenu(null);
  };

  const confirmRename = (path: string) => {
    if (renameValue.trim() && renameValue !== path.split('/').pop()) {
      onRename(path, renameValue.trim());
    }
    setRenamingPath(null);
    setRenameValue('');
  };

  const renderNode = (node: FileNode, depth: number = 0): JSX.Element => {
    const isExpanded = expandedFolders.has(node.path);
    const isActive = activeFile === node.path;
    const activeEditor = node.type === 'file' ? getActiveEditor(node.path) : null;
    const isRenaming = renamingPath === node.path;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-dark-700 cursor-pointer group ${
            isActive ? 'bg-primary-500/20 border-l-2 border-primary-500' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              onFolderToggle(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node.path)}
        >
          {node.type === 'folder' ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-dark-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-dark-400" />
            )
          ) : (
            <span className="w-4" />
          )}
          
          {node.type === 'folder' ? (
            <Folder className="w-4 h-4 text-yellow-400" />
          ) : (
            <span className="text-sm">{getFileIcon(node.name)}</span>
          )}

          {isRenaming ? (
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => confirmRename(node.path)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmRename(node.path);
                if (e.key === 'Escape') {
                  setRenamingPath(null);
                  setRenameValue('');
                }
              }}
              autoFocus
              className="flex-1 bg-dark-800 text-white text-sm px-1 rounded border border-primary-500 outline-none"
            />
          ) : (
            <>
              <span className={`flex-1 text-sm truncate ${isActive ? 'text-white font-medium' : 'text-dark-300'}`}>
                {node.name}
              </span>
              {activeEditor && (
                <div className="flex items-center gap-1" title={`${activeEditor.name} is editing`}>
                  {activeEditor.avatar ? (
                    <img src={activeEditor.avatar} alt={activeEditor.name} className="w-4 h-4 rounded-full ring-1 ring-green-500" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-dark-900 border-r border-dark-700 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-dark-700">
        <span className="text-sm font-medium text-white">EXPLORER</span>
        <div className="flex gap-1">
          <button
            onClick={() => onNewFile('/')}
            className="p-1 hover:bg-dark-700 rounded"
            title="New File"
          >
            <Plus className="w-4 h-4 text-dark-400" />
          </button>
          <button
            onClick={() => onNewFolder('/')}
            className="p-1 hover:bg-dark-700 rounded"
            title="New Folder"
          >
            <Folder className="w-4 h-4 text-dark-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {files.map((node) => renderNode(node, 0))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-dark-800 border border-dark-600 rounded-lg shadow-xl py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                handleRename(contextMenu.path, contextMenu.path.split('/').pop() || '');
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-dark-700 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Rename
            </button>
            <button
              onClick={() => {
                onDelete(contextMenu.path);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-dark-700 flex items-center gap-2 text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
