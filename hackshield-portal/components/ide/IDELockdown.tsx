'use client';

import { useEffect, useState } from 'react';
import { Lock, AlertTriangle, Clock, Shield } from 'lucide-react';

interface IDELockdownProps {
  hackathonId: string;
  startTime: Date;
  endTime: Date;
  isLocked: boolean;
  onLockdownActive?: (locked: boolean) => void;
}

export default function IDELockdown({
  hackathonId,
  startTime,
  endTime,
  isLocked,
  onLockdownActive
}: IDELockdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showWarning, setShowWarning] = useState(false);
  const [attemptedLeave, setAttemptedLeave] = useState(false);

  useEffect(() => {
    if (!isLocked) return;

    // Update time remaining
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(endTime);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Hackathon Ended');
        onLockdownActive?.(false);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, isLocked, onLockdownActive]);

  useEffect(() => {
    if (!isLocked) return;

    // Prevent page navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You are in lockdown mode. Leaving will be recorded as a violation!';
      setAttemptedLeave(true);
      logViolationAttempt('navigation');
      return e.returnValue;
    };

    // Prevent back button
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      setShowWarning(true);
      setAttemptedLeave(true);
      logViolationAttempt('back_button');
      window.history.pushState(null, '', window.location.href);
    };

    // Detect tab visibility change (switching tabs)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setAttemptedLeave(true);
        logViolationAttempt('tab_switch');
        setShowWarning(true);
      }
    };

    // Detect focus loss (switching windows)
    const handleBlur = () => {
      setAttemptedLeave(true);
      logViolationAttempt('focus_loss');
      setShowWarning(true);
    };

    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Disable Ctrl+Shift+I (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      // Disable Ctrl+W (Close tab)
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        setShowWarning(true);
        return false;
      }
      // Disable Alt+F4 (Close window)
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        setShowWarning(true);
        return false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Push initial state to prevent back navigation
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLocked, hackathonId]);

  const logViolationAttempt = async (type: string) => {
    try {
      await fetch('/api/hackathons/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hackathonId,
          violationType: type,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to log violation:', error);
    }
  };

  if (!isLocked) return null;

  return (
    <>
      {/* Lockdown Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 animate-pulse" />
          <div>
            <div className="font-bold text-sm">🔒 LOCKDOWN MODE ACTIVE</div>
            <div className="text-xs opacity-90">You cannot leave until the hackathon ends</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {attemptedLeave && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-700 rounded-full text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Violation Detected</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 px-4 py-1.5 bg-red-700 rounded-lg">
            <Clock className="w-4 h-4" />
            <div>
              <div className="text-xs opacity-75">Time Remaining</div>
              <div className="font-mono font-bold">{timeRemaining}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border-2 border-red-500 rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold text-white">⚠️ Lockdown Violation</h2>
                <p className="text-sm text-red-100">Attempting to leave detected</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                <p className="text-white font-semibold mb-2">YOU ARE IN LOCKDOWN MODE</p>
                <p className="text-gray-300 text-sm">
                  During the hackathon, you must remain in the IDE. Attempting to leave or switch applications is a violation.
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-red-400">❌</span>
                  <span>Closing this tab/window</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400">❌</span>
                  <span>Switching to another browser tab</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400">❌</span>
                  <span>Minimizing the browser</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400">❌</span>
                  <span>Opening DevTools or other applications</span>
                </div>
              </div>

              <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                <p className="text-yellow-200 font-semibold mb-1">⚠️ Consequences:</p>
                <ul className="text-sm text-yellow-100 space-y-1 list-disc list-inside">
                  <li>All violations are logged and reported</li>
                  <li>Multiple violations may lead to disqualification</li>
                  <li>Your team will be notified</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800 rounded p-3">
                <Clock className="w-4 h-4" />
                <span>Time remaining: <strong className="text-white">{timeRemaining}</strong></span>
              </div>

              <button
                onClick={() => setShowWarning(false)}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                I Understand - Return to IDE
              </button>

              <p className="text-xs text-gray-500 text-center">
                This violation has been recorded and sent to organizers
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Invisible overlay to capture clicks outside IDE */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <div className="absolute inset-0 border-4 border-red-500 animate-pulse"></div>
      </div>
    </>
  );
}
