'use client';

import { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, RotateCw, ExternalLink, AlertCircle } from 'lucide-react';

interface LivePreviewProps {
  code: string;
  language?: string;
  htmlContent?: string;
  cssContent?: string;
  jsContent?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export default function LivePreview({
  code,
  language = 'javascript',
  htmlContent = '',
  cssContent = '',
  jsContent = '',
  isMinimized = false,
  onToggleMinimize
}: LivePreviewProps) {
  const [key, setKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const refresh = () => {
    setKey(prev => prev + 1);
    setError(null);
    setConsoleOutput([]);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const openInNewTab = () => {
    const blob = new Blob([generateHTML()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const generateHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0a0e1a;
      color: white;
    }
    ${cssContent}
  </style>
</head>
<body>
  ${htmlContent || '<div id="root"></div>'}
  
  <script>
    // Intercept console.log for display
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    window.addEventListener('message', (event) => {
      if (event.data.type === 'console') {
        originalLog(...event.data.args);
      }
    });
    
    console.log = (...args) => {
      originalLog(...args);
      window.parent.postMessage({ type: 'console', level: 'log', args }, '*');
    };
    
    console.error = (...args) => {
      originalError(...args);
      window.parent.postMessage({ type: 'console', level: 'error', args }, '*');
    };
    
    console.warn = (...args) => {
      originalWarn(...args);
      window.parent.postMessage({ type: 'console', level: 'warn', args }, '*');
    };
    
    // Error handling
    window.addEventListener('error', (e) => {
      console.error('Runtime Error:', e.message);
      window.parent.postMessage({ 
        type: 'error', 
        message: e.message, 
        line: e.lineno, 
        column: e.colno 
      }, '*');
    });
    
    try {
      ${jsContent}
    } catch (error) {
      console.error('Execution Error:', error.message);
      window.parent.postMessage({ 
        type: 'error', 
        message: error.message 
      }, '*');
    }
  </script>
</body>
</html>`;
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        const output = `[${event.data.level.toUpperCase()}] ${event.data.args.join(' ')}`;
        setConsoleOutput(prev => [...prev, output]);
      } else if (event.data.type === 'error') {
        setError(event.data.message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (isMinimized) {
    return (
      <div className="bg-dark-800 border-t border-dark-700 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-medium">Live Preview</span>
        </div>
        <button
          onClick={onToggleMinimize}
          className="p-1 hover:bg-dark-700 rounded"
        >
          <Maximize2 className="w-4 h-4 text-dark-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-dark-900 border-l border-dark-700 flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-dark-700 bg-dark-800">
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-medium">Live Preview</span>
          {isLoading && (
            <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={refresh}
            className="p-1.5 hover:bg-dark-700 rounded"
            title="Refresh"
          >
            <RotateCw className="w-4 h-4 text-dark-300" />
          </button>
          <button
            onClick={openInNewTab}
            className="p-1.5 hover:bg-dark-700 rounded"
            title="Open in New Tab"
          >
            <ExternalLink className="w-4 h-4 text-dark-300" />
          </button>
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-1.5 hover:bg-dark-700 rounded"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4 text-dark-300" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium text-red-400">Runtime Error</div>
            <div className="text-xs text-red-300 mt-1">{error}</div>
          </div>
        </div>
      )}

      <div className="flex-1 bg-white relative overflow-hidden">
        <iframe
          key={key}
          ref={iframeRef}
          sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
          srcDoc={generateHTML()}
          className="w-full h-full border-none"
          title="Live Preview"
        />
      </div>

      {consoleOutput.length > 0 && (
        <div className="border-t border-dark-700 bg-dark-900 max-h-32 overflow-y-auto">
          <div className="px-3 py-1.5 text-xs font-medium text-dark-400 border-b border-dark-700 bg-dark-800">
            Console Output
          </div>
          <div className="p-2 space-y-1">
            {consoleOutput.map((output, index) => (
              <div
                key={index}
                className={`text-xs font-mono ${
                  output.includes('[ERROR]') ? 'text-red-400' :
                  output.includes('[WARN]') ? 'text-yellow-400' :
                  'text-green-400'
                }`}
              >
                {output}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
