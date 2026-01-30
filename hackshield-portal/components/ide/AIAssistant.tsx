'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Loader2,
  Code2,
  Lightbulb,
  Bug,
  Sparkles,
  Copy,
  Check,
  Minimize2,
  Maximize2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlocks?: { language: string; code: string }[];
}

interface AIAssistantProps {
  onClose?: () => void;
  currentCode?: string;
  currentFile?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const quickPrompts = [
  { icon: Bug, label: 'Debug this code', prompt: 'Can you help me debug this code? What might be causing issues?' },
  { icon: Lightbulb, label: 'Explain code', prompt: 'Can you explain what this code does step by step?' },
  { icon: Code2, label: 'Optimize', prompt: 'How can I optimize this code for better performance?' },
  { icon: Sparkles, label: 'Add features', prompt: 'What features could I add to improve this project?' },
];

export default function AIAssistant({
  onClose,
  currentCode,
  currentFile,
  isMinimized,
  onToggleMinimize
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI coding assistant. I can help you debug, explain, optimize code, or answer any programming questions. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (message?: string) => {
    const query = message || input;
    if (!query.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Include current code context in the request
      const context = currentCode ? `\n\nCurrent code (${currentFile}):\n\`\`\`\n${currentCode}\n\`\`\`` : '';
      
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query + context,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response || generateMockResponse(query),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback to mock response if API fails
        const mockResponse = generateMockResponse(query);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: mockResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      // Fallback to mock response
      const mockResponse = generateMockResponse(query);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Detect and block project idea / innovative thinking requests
    if (
      lowerQuery.includes('project idea') ||
      lowerQuery.includes('what should i build') ||
      lowerQuery.includes('innovative') ||
      lowerQuery.includes('unique feature') ||
      lowerQuery.includes('creative solution') ||
      lowerQuery.includes('what to make') ||
      lowerQuery.includes('suggest a project') ||
      lowerQuery.includes('hackathon idea')
    ) {
      return `🚫 **I cannot help with project ideas or innovative thinking.**

That's the core challenge of the hackathon - your team needs to come up with creative solutions!

**I can only help with:**
✅ Technical implementation
✅ Debugging code
✅ Syntax and APIs
✅ Code optimization
✅ Library recommendations
✅ Best practices

**I cannot help with:**
❌ Project concepts
❌ Innovative features
❌ Creative solutions
❌ "What should we build"

Please ask me a technical coding question instead!`;
    }
    
    if (lowerQuery.includes('debug') || lowerQuery.includes('error') || lowerQuery.includes('bug')) {
      return `Looking at your code, here are some potential issues to check:

1. **Check for undefined variables** - Make sure all variables are properly initialized before use.

2. **Async/await handling** - If you're using async functions, ensure you're properly awaiting promises.

3. **Type mismatches** - Verify that the data types match what your functions expect.

Here's an example of proper error handling:
\`\`\`javascript
try {
  const result = await fetchData();
  if (!result) {
    throw new Error('No data received');
  }
  // Process result
} catch (error) {
  console.error('Error:', error.message);
  // Handle error appropriately
}
\`\`\`

Would you like me to look at a specific part of your code?`;
    }
    
    if (lowerQuery.includes('explain')) {
      return `I'd be happy to explain! Here's a breakdown:

**Code Structure:**
- The code follows a modular pattern, separating concerns into distinct functions
- Each function has a single responsibility, making it easier to test and maintain

**Key Concepts:**
1. **State management** - The component uses React hooks (useState, useEffect) to manage local state
2. **Event handlers** - Functions that respond to user interactions
3. **Conditional rendering** - Different UI based on application state

**Flow:**
1. Component mounts → Initial state is set
2. User interacts → Event handler fires
3. State updates → Component re-renders
4. Side effects run → Data fetching, etc.

Want me to explain any specific part in more detail?`;
    }
    
    if (lowerQuery.includes('optimize') || lowerQuery.includes('performance')) {
      return `Here are some optimization suggestions:

**1. Memoization**
\`\`\`javascript
const memoizedValue = useMemo(() => 
  expensiveCalculation(data), [data]
);
\`\`\`

**2. Lazy Loading**
\`\`\`javascript
const HeavyComponent = lazy(() => 
  import('./HeavyComponent')
);
\`\`\`

**3. Debouncing Input**
\`\`\`javascript
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);
\`\`\`

**4. Virtual Lists** for large datasets - consider react-virtualized or react-window

**5. Code Splitting** - Break your app into smaller chunks

Would you like me to apply any of these optimizations to your specific code?`;
    }
    
    if (lowerQuery.includes('feature') || lowerQuery.includes('add')) {
      return `Great question! Here are some feature ideas for your hackathon project:

**User Experience:**
- 🔔 Push notifications for real-time updates
- 🌙 Dark/Light mode toggle
- ♿ Accessibility improvements (ARIA labels, keyboard navigation)
- 🌐 Internationalization (i18n) support

**Functionality:**
- 📊 Analytics dashboard
- 🔍 Search with filters
- 📤 Export/Import data
- 🔄 Undo/Redo functionality

**Technical:**
- 🔐 Two-factor authentication
- 📱 Progressive Web App (PWA) support
- 🚀 Server-side rendering
- 📈 Performance monitoring

**For Hackathon Impact:**
- 🤖 AI-powered features (recommendations, predictions)
- 🔗 Blockchain integration for transparency
- 🌱 Sustainability metrics

Which of these interests you? I can help you implement it!`;
    }
    
    return `That's a great question! Here's my response:

Based on your query, here are some key points to consider:

1. **Best Practices** - Always follow coding conventions and use meaningful variable names.

2. **Documentation** - Add comments to explain complex logic, but don't over-comment obvious code.

3. **Testing** - Write unit tests for critical functions to catch bugs early.

4. **Version Control** - Make frequent, small commits with descriptive messages.

Here's a helpful code pattern:
\`\`\`javascript
// Example pattern
const handleAction = async (data) => {
  try {
    setLoading(true);
    const result = await processData(data);
    setSuccess(true);
    return result;
  } catch (error) {
    setError(error.message);
    throw error;
  } finally {
    setLoading(false);
  }
};
\`\`\`

Is there anything specific you'd like me to elaborate on?`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard!');
  };

  const renderMessageContent = (content: string, messageId: string) => {
    // Split by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).split('\n');
        const language = lines[0] || 'javascript';
        const code = lines.slice(1).join('\n');
        const codeId = `${messageId}-${index}`;
        
        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden bg-dark-950">
            <div className="flex items-center justify-between px-3 py-2 bg-dark-900 border-b border-dark-800">
              <span className="text-xs text-dark-400">{language}</span>
              <button
                onClick={() => copyToClipboard(code, codeId)}
                className="p-1 rounded hover:bg-dark-800 transition-colors"
              >
                {copiedId === codeId ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-dark-400" />
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-sm">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      
      // Parse markdown-style formatting
      const formattedPart = part
        .split('\n')
        .map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return <strong key={i} className="block mt-2 text-white">{line.slice(2, -2)}</strong>;
          }
          if (line.startsWith('- ') || line.startsWith('• ')) {
            return <li key={i} className="ml-4 text-dark-300">{line.slice(2)}</li>;
          }
          if (line.match(/^\d+\.\s/)) {
            return <li key={i} className="ml-4 text-dark-300">{line}</li>;
          }
          return <span key={i}>{line}<br /></span>;
        });
      
      return <div key={index}>{formattedPart}</div>;
    });
  };

  if (isMinimized) {
    return (
      <div
        onClick={onToggleMinimize}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform z-50"
      >
        <Bot className="w-7 h-7 text-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-dark-900 rounded-lg border border-dark-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-sm">AI Coding Assistant</div>
            <div className="text-xs text-dark-400">Powered by HackShield</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-1.5 rounded hover:bg-dark-800 transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-dark-400" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-dark-800 transition-colors"
            >
              <X className="w-4 h-4 text-dark-400" />
            </button>
          )}
        </div>
      </div>

      {/* Restriction Notice */}
      <div className="mx-4 mt-3 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-yellow-200">
          <strong>Coding Help Only:</strong> AI cannot help with project ideas or innovative thinking. Only technical coding assistance.
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-2 p-3 overflow-x-auto border-b border-dark-800">
        {quickPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handleSend(prompt.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-800 hover:bg-dark-700 text-xs whitespace-nowrap transition-colors"
          >
            <prompt.icon className="w-3 h-3 text-primary-400" />
            {prompt.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary-500/20 text-white'
                  : 'bg-dark-800 text-dark-200'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="text-sm">{renderMessageContent(message.content, message.id)}</div>
              ) : (
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              )}
              <div className="text-xs text-dark-500 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-dark-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                <span className="text-sm text-dark-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-dark-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask me anything about code..."
            className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-500"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="btn-primary p-2 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
