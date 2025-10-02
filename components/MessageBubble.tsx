'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/types';
import { speakText, cancelSpeech } from '@/utils/tts';
import { detectLanguage, getTTSLanguage, Language } from '@/utils/translation';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.isUser;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<Language>('ja');

  // Detect the language of the message when component mounts
  useEffect(() => {
    const detected = detectLanguage(message.text);
    setDetectedLanguage(detected);
  }, [message.text]);

  const handleSpeak = () => {
    if (isSpeaking) {
      cancelSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const languageCode = getTTSLanguage(detectedLanguage);
      speakText(message.text, languageCode, () => {
        setIsSpeaking(false);
      });
    }
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl backdrop-blur-sm ${
        isUser 
          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white ml-auto' 
          : 'bg-gray-700/50 text-gray-100 border border-gray-600/30'
      }`}>
        {!isUser && (
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mr-2">
              <span className="text-xs">🤖</span>
            </div>
            <span className="text-xs text-gray-400">AI Companion</span>
          </div>
        )}
        <div className="space-y-2">
          {/* Message text */}
          <div className="flex items-start justify-between gap-2">
            <p className="whitespace-pre-wrap break-words flex-1">
              {message.text}
            </p>
            
            {/* TTS Button */}
            <button
              onClick={handleSpeak}
              className={`flex-shrink-0 p-1.5 rounded-full transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 ${
                isSpeaking ? 'bg-blue-500 text-white' : 'text-gray-500 dark:text-gray-400'
              }`}
              title={isSpeaking ? 'Stop reading' : 'Read aloud'}
            >
              {isSpeaking ? (
                <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Show metadata for bot messages */}
        {!isUser && message.meta && (
          <div className="mt-3 pt-3 border-t border-gray-600/50 space-y-3">
            {message.meta.bullets && message.meta.bullets.length > 0 && (
              <div className="bg-gray-800/30 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2 text-blue-400 flex items-center">
                  <span className="mr-1">💡</span> Suggestions
                </h4>
                <ul className="text-sm space-y-1">
                  {message.meta.bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-cyan-400 mr-2">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {message.meta.outfit && (
              <div className="bg-gray-800/30 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1 text-green-400 flex items-center">
                  <span className="mr-1">👕</span> Outfit
                </h4>
                <p className="text-sm">{message.meta.outfit}</p>
              </div>
            )}
            
            {message.meta.safety && (
              <div className="bg-gray-800/30 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1 text-yellow-400 flex items-center">
                  <span className="mr-1">⚠️</span> Safety
                </h4>
                <p className="text-sm">{message.meta.safety}</p>
              </div>
            )}
            
            {message.meta.actions && message.meta.actions.length > 0 && (
              <div className="bg-gray-800/30 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2 text-purple-400 flex items-center">
                  <span className="mr-1">📋</span> Actions
                </h4>
                <div className="space-y-2">
                  {message.meta.actions.map((action, index) => (
                    <div key={index} className="text-sm bg-gray-700/50 rounded p-2">
                      <span className="font-medium text-cyan-300">{action.label}:</span> 
                      <span className="ml-1">{action.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="text-xs opacity-60 mt-2 text-right">
          {message.timestamp.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}