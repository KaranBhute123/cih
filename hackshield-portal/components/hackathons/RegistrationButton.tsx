'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Loader2, Users, Code, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import RegistrationForm from './RegistrationForm';

interface RegistrationButtonProps {
  hackathonId: string;
  hackathonTitle: string;
  minTeamSize?: number;
  maxTeamSize?: number;
}

export default function RegistrationButton({ 
  hackathonId, 
  hackathonTitle,
  minTeamSize = 1,
  maxTeamSize = 4 
}: RegistrationButtonProps) {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [canRegister, setCanRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);

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
        setHasCredentials(data.hasIdeCredentials || false);
      }
    } catch (error) {
      console.error('Failed to check registration status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleRegister = () => {
    setShowRegistrationForm(true);
  };

  const handleRegistrationSuccess = () => {
    setIsRegistered(true);
    checkRegistrationStatus();
    setMessage('Successfully registered! Access IDE after receiving credentials.');
    setTimeout(() => setMessage(''), 5000);
  };

  const handleAccessIDE = () => {
    router.push(`/dashboard/hackathons/${hackathonId}/ide-access`);
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
      <div className="flex items-center gap-2 px-4 py-3 bg-dark-800 rounded-lg border border-dark-700">
        <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
        <span className="text-sm text-dark-300">Checking registration status...</span>
      </div>
    );
  }

  return (
    <>
      {showRegistrationForm && (
        <RegistrationForm
          hackathonId={hackathonId}
          hackathonTitle={hackathonTitle}
          minTeamSize={minTeamSize}
          maxTeamSize={maxTeamSize}
          onClose={() => setShowRegistrationForm(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}
      
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {isRegistered ? (
            <button
              onClick={handleUnregister}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-red-600/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserMinus className="w-5 h-5" />
              )}
              <span>Unregister</span>
            </button>
          ) : (
            <button
              onClick={handleRegister}
              disabled={isLoading || !canRegister}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:from-dark-700 disabled:to-dark-700 hover:shadow-lg hover:shadow-primary-500/30"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              <span className="font-semibold">{canRegister ? 'Register Now' : 'Registration Closed'}</span>
            </button>
          )}

          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-800 rounded-lg border border-dark-700">
            <Users className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-dark-200">
              {totalParticipants} registered
            </span>
          </div>
        </div>

        {message && (
          <div className={`text-sm px-4 py-2.5 rounded-lg border font-medium ${
            message.includes('✅') 
              ? 'bg-green-900/20 border-green-700 text-green-400' 
              : 'bg-red-900/20 border-red-700 text-red-400'
          }`}>
            {message}
          </div>
        )}

        {isRegistered && !message && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-900/20 px-4 py-2.5 rounded-lg border border-green-700">
              <span className="text-lg">✓</span>
              <span className="font-medium">You are registered for this hackathon</span>
            </div>
            
            {hasCredentials && (
              <button
                onClick={handleAccessIDE}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white rounded-lg transition-all font-medium hover:shadow-lg hover:shadow-accent-500/30"
              >
                <Code className="w-5 h-5" />
                <span className="font-semibold">Access IDE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
