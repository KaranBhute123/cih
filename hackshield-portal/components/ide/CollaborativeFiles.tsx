'use client';

import { useState, useEffect } from 'react';
import { File, Folder, Users, Edit2, Eye, Clock, User, ChevronRight, ChevronDown } from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  currentEditor?: {
    userId: string;
    userName: string;
    color: string;
  };
  lastModified: Date;
  lastModifiedBy: string;
  content?: string;
  locked?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  color: string;
  avatar: string;
  currentFile?: string;
}

interface CollaborativeFilesProps {
  teamId: string;
  currentUserId: string;
  onFileSelect?: (file: FileNode) => void;
  onFileCreate?: (name: string, type: 'file' | 'folder', parentPath: string) => void;
}

export default function CollaborativeFiles({
  teamId,
  currentUserId,
  onFileSelect,
  onFileCreate
}: CollaborativeFilesProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Simulated team members
  useEffect(() => {
    setTeamMembers([
      {
        id: '1',
        name: 'You',
        color: '#3b82f6',
        avatar: '👤',
        currentFile: '/src/App.tsx'
      },
      {
        id: '2',
        name: 'Alice Johnson',
        color: '#10b981',
        avatar: '👩',
        currentFile: '/src/components/Header.tsx'
      },
      {
        id: '3',
        name: 'Bob Smith',
        color: '#f59e0b',
        avatar: '👨',
        currentFile: '/src/utils/api.ts'
      }
    ]);

    // Simulated file structure
    setFiles([
      {
        id: 'root',
        name: 'Team Project',
        type: 'folder',
        path: '/',
        children: [
          {
            id: 'src',
            name: 'src',
            type: 'folder',
            path: '/src',
            children: [
              {
                id: 'app-tsx',
                name: 'App.tsx',
                type: 'file',
                path: '/src/App.tsx',
                currentEditor: {
                  userId: '1',
                  userName: 'You',
                  color: '#3b82f6'
                },
                lastModified: new Date(),
                lastModifiedBy: 'You'
              },
              {
                id: 'components',
                name: 'components',
                type: 'folder',
                path: '/src/components',
                children: [
                  {
                    id: 'header-tsx',
                    name: 'Header.tsx',
                    type: 'file',
                    path: '/src/components/Header.tsx',
                    currentEditor: {
                      userId: '2',
                      userName: 'Alice Johnson',
                      color: '#10b981'
                    },
                    lastModified: new Date(Date.now() - 300000),
                    lastModifiedBy: 'Alice Johnson'
                  },
                  {
                    id: 'footer-tsx',
                    name: 'Footer.tsx',
                    type: 'file',
                    path: '/src/components/Footer.tsx',
                    lastModified: new Date(Date.now() - 600000),
                    lastModifiedBy: 'Bob Smith'
                  }
                ],
                lastModified: new Date(),
                lastModifiedBy: 'Alice Johnson'
              },
              {
                id: 'utils',
                name: 'utils',
                type: 'folder',
                path: '/src/utils',
                children: [
                  {
                    id: 'api-ts',
                    name: 'api.ts',
                    type: 'file',
                    path: '/src/utils/api.ts',
                    currentEditor: {
                      userId: '3',
                      userName: 'Bob Smith',
                      color: '#f59e0b'
                    },
                    lastModified: new Date(Date.now() - 120000),
                    lastModifiedBy: 'Bob Smith'
                  }
                ],
                lastModified: new Date(Date.now() - 120000),
                lastModifiedBy: 'Bob Smith'
              }
            ],
            lastModified: new Date(),
            lastModifiedBy: 'You'
          },
          {
            id: 'public',
            name: 'public',
            type: 'folder',
            path: '/public',
            children: [
              {
                id: 'index-html',
                name: 'index.html',
                type: 'file',
                path: '/public/index.html',
                lastModified: new Date(Date.now() - 900000),
                lastModifiedBy: 'You'
              }
            ],
            lastModified: new Date(Date.now() - 900000),
            lastModifiedBy: 'You'
          },
          {
            id: 'package-json',
            name: 'package.json',
            type: 'file',
            path: '/package.json',
            lastModified: new Date(Date.now() - 1800000),
            lastModifiedBy: 'You'
          },
          {
            id: 'readme-md',
            name: 'README.md',
            type: 'file',
            path: '/README.md',
            lastModified: new Date(Date.now() - 3600000),
            lastModifiedBy: 'Alice Johnson'
          }
        ],
        lastModified: new Date(),
        lastModifiedBy: 'You'
      }
    ]);
  }, [teamId]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'folder') {
      toggleFolder(file.id);
    } else {
      setSelectedFile(file.id);
      onFileSelect?.(file);
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const renderFileTree = (nodes: FileNode[], depth: number = 0): JSX.Element[] => {
    return nodes.map(node => (
      <div key={node.id}>
        <div
          onClick={() => handleFileClick(node)}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-800 transition-colors ${
            selectedFile === node.id ? 'bg-gray-800 border-l-2 border-blue-500' : ''
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          {/* Folder expand/collapse */}
          {node.type === 'folder' && (
            <div className="flex-shrink-0">
              {expandedFolders.has(node.id) ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>
          )}

          {/* Icon */}
          <div className="flex-shrink-0">
            {node.type === 'folder' ? (
              <Folder className="w-4 h-4 text-yellow-400" />
            ) : (
              <File className="w-4 h-4 text-blue-400" />
            )}
          </div>

          {/* File/Folder name */}
          <span className="flex-1 text-sm text-gray-200 truncate">{node.name}</span>

          {/* Current editor indicator */}
          {node.currentEditor && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Edit2 className="w-3 h-3" style={{ color: node.currentEditor.color }} />
              <span className="text-xs" style={{ color: node.currentEditor.color }}>
                {node.currentEditor.userName}
              </span>
            </div>
          )}

          {/* Last modified time */}
          {node.type === 'file' && !node.currentEditor && (
            <span className="text-xs text-gray-500 flex-shrink-0">
              {getRelativeTime(node.lastModified)}
            </span>
          )}
        </div>

        {/* Render children if folder is expanded */}
        {node.type === 'folder' && node.children && expandedFolders.has(node.id) && (
          <div>{renderFileTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-yellow-400" />
          <h3 className="font-semibold">Team Files</h3>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-full text-xs">
          <Users className="w-3 h-3 text-green-400" />
          <span>{teamMembers.length} active</span>
        </div>
      </div>

      {/* Team Members Working Status */}
      <div className="p-3 border-b border-gray-700 bg-gray-800/50">
        <div className="text-xs font-semibold text-gray-400 mb-2">Team Activity</div>
        <div className="space-y-2">
          {teamMembers.map(member => (
            <div key={member.id} className="flex items-center gap-2 text-xs">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: member.color }}
              />
              <span className="text-gray-300 truncate flex-1">{member.name}</span>
              {member.currentFile && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Edit2 className="w-3 h-3" />
                  <span className="truncate max-w-[100px]">{member.currentFile.split('/').pop()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {renderFileTree(files)}
      </div>

      {/* File Statistics */}
      <div className="p-3 border-t border-gray-700 bg-gray-800/50">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-gray-400">Files</div>
            <div className="font-semibold text-white">12</div>
          </div>
          <div>
            <div className="text-gray-400">Editing</div>
            <div className="font-semibold text-green-400">3</div>
          </div>
          <div>
            <div className="text-gray-400">Synced</div>
            <div className="font-semibold text-blue-400">100%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
