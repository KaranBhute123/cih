'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Settings,
  Maximize2,
  Minimize2,
  ScreenShare,
  ScreenShareOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
}

interface TeamVideoChatProps {
  teamId: string;
  currentUserId: string;
  currentUserName: string;
  onClose?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export default function TeamVideoChat({
  teamId,
  currentUserId,
  currentUserName,
  onClose,
  isMinimized,
  onToggleMinimize
}: TeamVideoChatProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  // Mock participants for demo
  const [participants, setParticipants] = useState<Participant[]>([
    { id: currentUserId, name: currentUserName, videoEnabled: false, audioEnabled: true, isScreenSharing: false, isSpeaking: false },
    { id: '2', name: 'Alice Chen', videoEnabled: true, audioEnabled: true, isScreenSharing: false, isSpeaking: false },
    { id: '3', name: 'Bob Kumar', videoEnabled: false, audioEnabled: false, isScreenSharing: false, isSpeaking: true },
  ]);

  useEffect(() => {
    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCall = async () => {
    setIsConnecting(true);
    
    try {
      // Request media permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsConnected(true);
      toast.success('Connected to team call!');
      
      // Update participant status
      setParticipants(prev =>
        prev.map(p =>
          p.id === currentUserId
            ? { ...p, videoEnabled: isVideoEnabled, audioEnabled: isAudioEnabled }
            : p
        )
      );
    } catch (error: any) {
      console.error('Error starting call:', error);
      toast.error(error.message || 'Failed to access camera/microphone');
    } finally {
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    setIsConnected(false);
    setIsVideoEnabled(false);
    setIsAudioEnabled(true);
    setIsScreenSharing(false);
    
    toast.success('Left the call');
  };

  const toggleVideo = async () => {
    if (!isConnected) {
      setIsVideoEnabled(!isVideoEnabled);
      return;
    }

    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      } else if (!isVideoEnabled) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          const newVideoTrack = stream.getVideoTracks()[0];
          localStreamRef.current.addTrack(newVideoTrack);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          
          setIsVideoEnabled(true);
        } catch (error) {
          toast.error('Failed to enable video');
        }
      }
    }

    setParticipants(prev =>
      prev.map(p =>
        p.id === currentUserId ? { ...p, videoEnabled: !isVideoEnabled } : p
      )
    );
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    } else {
      setIsAudioEnabled(!isAudioEnabled);
    }

    setParticipants(prev =>
      prev.map(p =>
        p.id === currentUserId ? { ...p, audioEnabled: !isAudioEnabled } : p
      )
    );
  };

  const toggleScreenShare = async () => {
    if (!isConnected) return;

    if (isScreenSharing) {
      // Stop screen sharing
      setIsScreenSharing(false);
      setParticipants(prev =>
        prev.map(p =>
          p.id === currentUserId ? { ...p, isScreenSharing: false } : p
        )
      );
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Handle when user stops sharing via browser UI
      screenStream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        setParticipants(prev =>
          prev.map(p =>
            p.id === currentUserId ? { ...p, isScreenSharing: false } : p
          )
        );
      };

      setIsScreenSharing(true);
      setParticipants(prev =>
        prev.map(p =>
          p.id === currentUserId ? { ...p, isScreenSharing: true } : p
        )
      );
      
      toast.success('Screen sharing started');
    } catch (error) {
      console.error('Screen share error:', error);
    }
  };

  if (isMinimized) {
    return (
      <div
        onClick={onToggleMinimize}
        className="flex items-center gap-2 px-3 py-2 bg-dark-800 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors"
      >
        <Users className="w-4 h-4 text-green-400" />
        <span className="text-sm">{participants.length} in call</span>
        <Maximize2 className="w-4 h-4 text-dark-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-dark-900 rounded-lg border border-dark-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-400" />
          <span className="font-medium">Team Call</span>
          {isConnected && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Connected
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded hover:bg-dark-800 transition-colors"
          >
            <Settings className="w-4 h-4 text-dark-400" />
          </button>
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-1.5 rounded hover:bg-dark-800 transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-dark-400" />
            </button>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-hidden">
        {!isConnected ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-4">
              <Video className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Join Team Call</h3>
            <p className="text-dark-400 text-sm mb-6 text-center">
              Connect with your teammates via video call
            </p>
            
            {/* Pre-call settings */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  isVideoEnabled ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400'
                }`}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  isAudioEnabled ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400'
                }`}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={startCall}
              disabled={isConnecting}
              className="btn-primary px-8 py-3 disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Join Call'}
            </button>
          </div>
        ) : (
          <div className="h-full grid grid-cols-2 gap-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`relative rounded-lg overflow-hidden bg-dark-800 ${
                  participant.isSpeaking ? 'ring-2 ring-green-400' : ''
                }`}
              >
                {participant.videoEnabled ? (
                  participant.id === currentUserId ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
                      {/* Simulated video placeholder */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-2xl font-bold">
                        {participant.name[0]}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-2xl font-bold">
                      {participant.name[0]}
                    </div>
                  </div>
                )}
                
                {/* Participant info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-dark-950/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {participant.name}
                      {participant.id === currentUserId && ' (You)'}
                    </span>
                    <div className="flex items-center gap-1">
                      {!participant.audioEnabled && (
                        <MicOff className="w-4 h-4 text-red-400" />
                      )}
                      {participant.isScreenSharing && (
                        <ScreenShare className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      {isConnected && (
        <div className="flex items-center justify-center gap-3 p-4 border-t border-dark-800">
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoEnabled ? 'bg-dark-800 hover:bg-dark-700' : 'bg-red-500/20 text-red-400'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              isAudioEnabled ? 'bg-dark-800 hover:bg-dark-700' : 'bg-red-500/20 text-red-400'
            }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full transition-colors ${
              isScreenSharing ? 'bg-green-500/20 text-green-400' : 'bg-dark-800 hover:bg-dark-700'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            {isScreenSharing ? <ScreenShareOff className="w-5 h-5" /> : <ScreenShare className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            className={`p-3 rounded-full transition-colors ${
              isSpeakerMuted ? 'bg-red-500/20 text-red-400' : 'bg-dark-800 hover:bg-dark-700'
            }`}
            title={isSpeakerMuted ? 'Unmute speaker' : 'Mute speaker'}
          >
            {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            title="Leave call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
