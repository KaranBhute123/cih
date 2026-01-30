'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Loader2, Users } from 'lucide-react';

interface RegistrationButtonProps {
  hackathonId: string;
  hackathonTitle: string;
}

export default function RegistrationButton({ hackathonId, hackathonTitle }: RegistrationButtonProps) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [canRegister, setCanRegister] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkRegistrationStatus();
  }, [hackathonId]);

  const checkRegistrationStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const response = await fetch(`/api/hackathons/${hackathonId}/register`);
      const data = await response.json();

      if (response.ok) {
        setIsRegistered(data.isRegistered);
        setTotalParticipants(data.totalParticipants);
        setCanRegister(data.canRegister && !data.registrationDeadlinePassed);
      }
    } catch (error) {
      console.error('Failed to check registration status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      setMessage('');

      const response = await fetch(`/api/hackathons/${hackathonId}/register`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setIsRegistered(true);
        setTotalParticipants(data.totalParticipants);
        setMessage('✅ Successfully registered!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${data.error}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('❌ Failed to register. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!confirm('Are you sure you want to unregister from this hackathon?')) {
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');

      const response = await fetch(`/api/hackathons/${hackathonId}/register`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setIsRegistered(false);
        setTotalParticipants(prev => Math.max(0, prev - 1));
        setMessage('✅ Successfully unregistered');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${data.error}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('❌ Failed to unregister. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Checking status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {isRegistered ? (
          <button
            onClick={handleUnregister}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserMinus className="w-4 h-4" />
            )}
            <span>Unregister</span>
          </button>
        ) : (
          <button
            onClick={handleRegister}
            disabled={isLoading || !canRegister}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{canRegister ? 'Register Now' : 'Registration Closed'}</span>
          </button>
        )}

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {totalParticipants} registered
          </span>
        </div>
      </div>

      {message && (
        <div className="text-sm px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">
          {message}
        </div>
      )}

      {isRegistered && (
        <div className="text-sm text-green-600 dark:text-green-400">
          ✓ You are registered for this hackathon
        </div>
      )}
    </div>
  );
}
