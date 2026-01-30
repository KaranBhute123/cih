'use client';

import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  X, 
  Monitor, 
  Moon, 
  Sun, 
  Type, 
  Palette, 
  Volume2, 
  Eye, 
  Keyboard,
  Bell,
  Shield
} from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  // Internal state for settings
  const [settings, setSettings] = useState({
    theme: 'dark' as 'dark' | 'light' | 'high-contrast',
    fontSize: 14,
    fontFamily: 'monospace',
    colorblindMode: false,
    voiceControlEnabled: false,
    soundEnabled: true,
    notificationsEnabled: true,
    tabSize: 2,
    lineNumbers: true,
    minimap: true,
    wordWrap: false
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const themes = [
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'high-contrast', label: 'High Contrast', icon: Monitor }
  ];

  const fontSizes = [10, 12, 14, 16, 18, 20, 22, 24];
  const fontFamilies = [
    'Fira Code',
    'Monaco',
    'Consolas',
    'Courier New',
    'Source Code Pro',
    'JetBrains Mono'
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Settings Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-dark-900 border-l border-dark-700 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-bold">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Theme Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-primary-400" />
              <h3 className="font-medium">Theme</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleSettingChange('theme', value)}
                  className={`p-3 rounded-lg border ${
                    settings.theme === value
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-700 bg-dark-800 hover:border-dark-600'
                  } transition-colors`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs text-center">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Settings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-primary-400" />
              <h3 className="font-medium">Font</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-dark-300 mb-1 block">Font Size</label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none"
                >
                  {fontSizes.map(size => (
                    <option key={size} value={size}>{size}px</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-dark-300 mb-1 block">Font Family</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none"
                >
                  {fontFamilies.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Editor Settings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4 text-primary-400" />
              <h3 className="font-medium">Editor</h3>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 bg-dark-800 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors">
                <span className="text-sm">Line Numbers</span>
                <input
                  type="checkbox"
                  checked={settings.lineNumbers}
                  onChange={(e) => handleSettingChange('lineNumbers', e.target.checked)}
                  className="w-5 h-5 rounded accent-primary-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-dark-800 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors">
                <span className="text-sm">Minimap</span>
                <input
                  type="checkbox"
                  checked={settings.minimap}
                  onChange={(e) => handleSettingChange('minimap', e.target.checked)}
                  className="w-5 h-5 rounded accent-primary-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-dark-800 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors">
                <span className="text-sm">Word Wrap</span>
                <input
                  type="checkbox"
                  checked={settings.wordWrap}
                  onChange={(e) => handleSettingChange('wordWrap', e.target.checked)}
                  className="w-5 h-5 rounded accent-primary-500"
                />
              </label>

              <div className="p-3 bg-dark-800 rounded-lg">
                <label className="text-sm text-dark-300 mb-2 block">Tab Size</label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="2"
                  value={settings.tabSize}
                  onChange={(e) => handleSettingChange('tabSize', parseInt(e.target.value))}
                  className="w-full accent-primary-500"
                />
                <div className="text-xs text-center text-dark-400 mt-1">{settings.tabSize} spaces</div>
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-primary-400" />
              <h3 className="font-medium">Accessibility</h3>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 bg-dark-800 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors">
                <div>
                  <div className="text-sm font-medium">Colorblind Mode</div>
                  <div className="text-xs text-dark-400">Enhanced color contrast</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.colorblindMode}
                  onChange={(e) => handleSettingChange('colorblindMode', e.target.checked)}
                  className="w-5 h-5 rounded accent-primary-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-dark-800 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors">
                <div>
                  <div className="text-sm font-medium">Voice Control</div>
                  <div className="text-xs text-dark-400">Control with voice commands</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.voiceControlEnabled}
                  onChange={(e) => handleSettingChange('voiceControlEnabled', e.target.checked)}
                  className="w-5 h-5 rounded accent-primary-500"
                />
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-primary-400" />
              <h3 className="font-medium">Notifications</h3>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 bg-dark-800 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors">
                <span className="text-sm">Sound Effects</span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  className="w-5 h-5 rounded accent-primary-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-dark-800 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors">
                <span className="text-sm">Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                  className="w-5 h-5 rounded accent-primary-500"
                />
              </label>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-yellow-400 mb-1">
                  Lockdown Mode Active
                </div>
                <div className="text-xs text-yellow-300">
                  Tab switching and copy-paste are monitored. Stay in fullscreen for best experience.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-700 bg-dark-800">
          <button
            onClick={onClose}
            className="w-full btn-primary py-2.5"
          >
            Save & Close
          </button>
        </div>
      </div>
    </>
  );
}
