'use client';

import { useState, useEffect } from 'react';
import { Message, MessageMeta } from '@/types';
import { speakText, cancelSpeech } from '@/utils/tts';
import { translateText, translateCompleteMessage, Language, getLanguageFlag, getTTSLanguage, detectLanguage } from '@/utils/translation';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.isUser;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [originalLanguage, setOriginalLanguage] = useState<Language>('ja');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ja');
  const [translatedText, setTranslatedText] = useState(message.text);
  const [translatedMeta, setTranslatedMeta] = useState<MessageMeta | undefined>(message.meta);
  const [isTranslating, setIsTranslating] = useState(false);

  // Detect the original language of the message when component mounts
  useEffect(() => {
    const detected = detectLanguage(message.text);
    setOriginalLanguage(detected);
    setCurrentLanguage(detected);
  }, [message.text]);

  const handleSpeak = () => {
    if (isSpeaking) {
      cancelSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const languageCode = getTTSLanguage(currentLanguage);
      speakText(translatedText, languageCode, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    if (newLanguage === currentLanguage) return;
    
    setIsTranslating(true);
    try {
      // If switching back to original language, show original content
      if (newLanguage === originalLanguage) {
        setTranslatedText(message.text);
        setTranslatedMeta(message.meta);
        setCurrentLanguage(newLanguage);
      } else {
        // Check if translation already exists
        if (message.translations?.[newLanguage]) {
          setTranslatedText(message.translations[newLanguage].text);
          setTranslatedMeta(message.translations[newLanguage].meta);
          setCurrentLanguage(newLanguage);
        } else {
          // Show loading state immediately
          setTranslatedText('Translating...');
          
          // For AI messages with metadata, translate everything
          if (!isUser && message.meta) {
            const { text, meta } = await translateCompleteMessage(message.text, message.meta, newLanguage);
            setTranslatedText(text);
            setTranslatedMeta(meta);
            
            // Store translation in message for future use
            if (!message.translations) {
              message.translations = {};
            }
            message.translations[newLanguage] = { text, meta };
          } else {
            // For user messages, just translate the text
            const translated = await translateText(message.text, newLanguage);
            setTranslatedText(translated);
            
            // Store translation in message for future use
            if (!message.translations) {
              message.translations = {};
            }
            message.translations[newLanguage] = { text: translated };
          }
          
          setCurrentLanguage(newLanguage);
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
      // Show error message in the target language
      const errorMessages = {
        en: 'Translation failed. Please try again.',
        hi: 'अनुवाद असफल। कृपया पुनः प्रयास करें।',
        ja: '翻訳に失敗しました。もう一度お試しください।'
      };
      setTranslatedText(errorMessages[newLanguage] || errorMessages.en);
      setCurrentLanguage(newLanguage);
    } finally {
      setIsTranslating(false);
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
          {/* Message text with loading state */}
          <div className="flex items-start justify-between gap-2">
            <p className="whitespace-pre-wrap break-words flex-1">
              {isTranslating ? (
                <span className="text-gray-500 italic">Translating...</span>
              ) : (
                translatedText
              )}
            </p>
            
            {/* TTS Button */}
            <button
              onClick={handleSpeak}
              className={`flex-shrink-0 p-1.5 rounded-full transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 ${
                isSpeaking ? 'bg-blue-500 text-white' : 'text-gray-500 dark:text-gray-400'
              }`}
              title={isSpeaking ? 'Stop reading' : 'Read aloud'}
              disabled={isTranslating}
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

          {/* Language Selection Buttons */}
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Language:</span>
            {(['ja', 'en', 'hi'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-2 py-1 rounded-full text-xs transition-all duration-200 ${
                  currentLanguage === lang
                    ? 'bg-blue-500 text-white'
                    : originalLanguage === lang
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                disabled={isTranslating}
                title={`${originalLanguage === lang ? 'Original language - ' : ''}Translate to ${lang.toUpperCase()}`}
              >
                {getLanguageFlag(lang)} {lang.toUpperCase()}
                {originalLanguage === lang && <span className="ml-1 text-xs">•</span>}
              </button>
            ))}
          </div>
        </div>
        
        {/* Show metadata for bot messages - use translated metadata */}
        {!isUser && translatedMeta && (
          <div className="mt-3 pt-3 border-t border-gray-600/50 space-y-3">
            {translatedMeta.bullets && translatedMeta.bullets.length > 0 && (
              <div className="bg-gray-800/30 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2 text-blue-400 flex items-center">
                  <span className="mr-1">💡</span> Suggestions
                </h4>
                <ul className="text-sm space-y-1">
                  {translatedMeta.bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-cyan-400 mr-2">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {translatedMeta.outfit && (
              <div className="bg-gray-800/30 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1 text-green-400 flex items-center">
                  <span className="mr-1">👕</span> Outfit
                </h4>
                <p className="text-sm">{translatedMeta.outfit}</p>
              </div>
            )}
            
            {translatedMeta.safety && (
              <div className="bg-gray-800/30 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1 text-yellow-400 flex items-center">
                  <span className="mr-1">⚠️</span> Safety
                </h4>
                <p className="text-sm">{translatedMeta.safety}</p>
              </div>
            )}
            
            {translatedMeta.actions && translatedMeta.actions.length > 0 && (
              <div className="bg-gray-800/30 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2 text-purple-400 flex items-center">
                  <span className="mr-1">📋</span> Actions
                </h4>
                <div className="space-y-2">
                  {translatedMeta.actions.map((action, index) => (
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