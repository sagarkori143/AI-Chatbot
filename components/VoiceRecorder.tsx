'use client';

import { useState, useRef, useCallback } from 'react';
import { SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '@/types';

interface VoiceRecorderProps {
  onResult: (transcript: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ 
  onResult, 
  isRecording, 
  setIsRecording, 
  disabled = false 
}: VoiceRecorderProps) {
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startFallbackRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        try {
          const response = await fetch('/api/stt', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            onResult(data.text);
          } else {
            console.error('STT API error:', response.statusText);
          }
        } catch (error) {
          console.error('Error uploading audio:', error);
        }

        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('マイクへのアクセスができませんでした。');
      setIsRecording(false);
    }
  }, [onResult, setIsRecording]);

  const startWebSpeechAPI = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      startFallbackRecording();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
      
      if (finalTranscript) {
        onResult(finalTranscript);
        recognition.stop();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert('マイクへのアクセスが拒否されました。設定を確認してください。');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult, setIsRecording, startFallbackRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
  }, [setIsRecording]);

  const handleClick = () => {
    if (disabled) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startWebSpeechAPI();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`relative p-2 rounded-full transition-all duration-200 flex items-center justify-center min-w-[36px] min-h-[36px] ${
        isRecording
          ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
          : disabled
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-gray-600 hover:bg-gray-500 text-gray-300 hover:text-white'
      }`}
      title={isRecording ? 'Stop recording' : 'Start voice input'}
    >
      {isRecording && (
        <div className="absolute inset-0 rounded-full bg-red-400 animate-pulse-ring opacity-30" />
      )}
      
      <svg
        className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        {isRecording ? (
          <rect x="6" y="6" width="12" height="12" rx="2" />
        ) : (
          <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2M19 12V14C19 18.4 15.4 22 11 22H13C13.6 22 14 22.4 14 23S13.6 24 13 24H11C10.4 24 10 23.6 10 23S10.4 22 11 22C6.6 22 3 18.4 3 14V12C3 11.4 3.4 11 4 11S5 11.4 5 12V14C5 17.3 7.7 20 11 20S17 17.3 17 14V12C17 11.4 17.4 11 18 11S19 11.4 19 12Z" />
        )}
      </svg>

      {transcript && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap max-w-48 truncate border border-gray-600 shadow-lg">
          {transcript}
        </div>
      )}
    </button>
  );
}