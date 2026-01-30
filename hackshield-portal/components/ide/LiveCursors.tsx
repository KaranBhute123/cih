'use client';

import { useState, useEffect, useCallback } from 'react';

interface Cursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  line: number;
  column: number;
  isTyping: boolean;
  lastUpdate: number;
}

interface LiveCursorsProps {
  currentUserId: string;
  currentUserName: string;
  editorRef: any;
  teamMembers: { id: string; name: string }[];
}

// Predefined colors for team members
const cursorColors = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export default function LiveCursors({
  currentUserId,
  currentUserName,
  editorRef,
  teamMembers
}: LiveCursorsProps) {
  const [cursors, setCursors] = useState<Map<string, Cursor>>(new Map());
  const [decorations, setDecorations] = useState<string[]>([]);

  // Assign colors to team members
  const getMemberColor = useCallback((memberId: string) => {
    const index = teamMembers.findIndex(m => m.id === memberId);
    return cursorColors[index % cursorColors.length];
  }, [teamMembers]);

  // Simulate cursor movements for demo
  useEffect(() => {
    if (!editorRef?.current) return;

    // Initialize cursors for other team members
    const otherMembers = teamMembers.filter(m => m.id !== currentUserId);
    const initialCursors = new Map<string, Cursor>();

    otherMembers.forEach((member, index) => {
      initialCursors.set(member.id, {
        id: member.id,
        name: member.name,
        color: getMemberColor(member.id),
        x: 0,
        y: 0,
        line: Math.floor(Math.random() * 20) + 1,
        column: Math.floor(Math.random() * 40) + 1,
        isTyping: false,
        lastUpdate: Date.now()
      });
    });

    setCursors(initialCursors);

    // Simulate cursor movements
    const interval = setInterval(() => {
      setCursors(prev => {
        const updated = new Map(prev);
        
        updated.forEach((cursor, id) => {
          // Random chance to move cursor
          if (Math.random() > 0.7) {
            const newLine = Math.max(1, Math.min(50, cursor.line + Math.floor(Math.random() * 5) - 2));
            const newColumn = Math.max(1, Math.min(80, cursor.column + Math.floor(Math.random() * 10) - 5));
            
            updated.set(id, {
              ...cursor,
              line: newLine,
              column: newColumn,
              isTyping: Math.random() > 0.7,
              lastUpdate: Date.now()
            });
          }
        });

        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentUserId, teamMembers, getMemberColor, editorRef]);

  // Apply cursor decorations to Monaco editor
  useEffect(() => {
    if (!editorRef?.current) return;

    const editor = editorRef.current;
    const monaco = (window as any).monaco;
    
    if (!monaco) return;

    // Create decorations for each cursor
    const newDecorations: any[] = [];

    cursors.forEach((cursor) => {
      // Cursor line decoration
      newDecorations.push({
        range: new monaco.Range(cursor.line, cursor.column, cursor.line, cursor.column + 1),
        options: {
          className: 'remote-cursor',
          beforeContentClassName: 'remote-cursor-caret',
          hoverMessage: { value: `**${cursor.name}**` },
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        }
      });

      // Username label decoration
      newDecorations.push({
        range: new monaco.Range(cursor.line, 1, cursor.line, 1),
        options: {
          className: 'remote-cursor-label',
          glyphMarginClassName: 'remote-cursor-glyph',
          glyphMarginHoverMessage: { value: cursor.name }
        }
      });
    });

    // Apply decorations
    const ids = editor.deltaDecorations(decorations, newDecorations);
    setDecorations(ids);

    // Cleanup
    return () => {
      if (editor && ids.length > 0) {
        editor.deltaDecorations(ids, []);
      }
    };
  }, [cursors, editorRef, decorations]);

  // Render cursor labels overlay
  return (
    <>
      {/* CSS for cursor styling */}
      <style jsx global>{`
        .remote-cursor {
          background-color: rgba(59, 130, 246, 0.3);
        }
        
        .remote-cursor-caret::before {
          content: '';
          position: absolute;
          width: 2px;
          height: 18px;
          background-color: #3b82f6;
          animation: blink 1s ease-in-out infinite;
        }
        
        .remote-cursor-label::after {
          content: attr(data-name);
          position: absolute;
          left: 0;
          top: -20px;
          padding: 2px 6px;
          background-color: #3b82f6;
          color: white;
          font-size: 11px;
          border-radius: 3px;
          white-space: nowrap;
          z-index: 100;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>

      {/* Cursor indicators overlay */}
      <div className="absolute top-12 right-4 z-10 space-y-2">
        {Array.from(cursors.values()).map(cursor => (
          <div
            key={cursor.id}
            className="flex items-center gap-2 px-2 py-1 rounded bg-dark-800/80 backdrop-blur-sm text-xs"
          >
            <div
              className={`w-2 h-2 rounded-full ${cursor.isTyping ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: cursor.color }}
            />
            <span className="text-dark-300">{cursor.name}</span>
            <span className="text-dark-500">
              L{cursor.line}:{cursor.column}
            </span>
            {cursor.isTyping && (
              <span className="text-green-400 animate-pulse">typing...</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// Hook for broadcasting cursor position
export function useLiveCursor(
  editorRef: any,
  userId: string,
  userName: string,
  onCursorMove?: (position: { line: number; column: number }) => void
) {
  useEffect(() => {
    if (!editorRef?.current) return;

    const editor = editorRef.current;
    
    // Listen to cursor position changes
    const disposable = editor.onDidChangeCursorPosition((e: any) => {
      const position = {
        line: e.position.lineNumber,
        column: e.position.column
      };
      
      // Broadcast cursor position (would send to WebSocket in production)
      onCursorMove?.(position);
    });

    return () => disposable.dispose();
  }, [editorRef, userId, userName, onCursorMove]);
}
