'use client';

import { useState, useRef, useEffect } from 'react';
import ChatWindow from '@/components/ChatWindow';
import VoiceRecorder from '@/components/VoiceRecorder';
import LanguageInstructions from '@/components/LanguageInstructions';
import { Message } from '@/types';
import { speakText, cancelSpeech } from '@/utils/tts';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Simple rate limiting - prevent requests more than once every 3 seconds
    const now = Date.now();
    if (now - lastRequestTime < 3000) {
      const waitTime = Math.ceil((3000 - (now - lastRequestTime)) / 1000);
      const rateLimitMessage: Message = {
        id: Date.now().toString(),
        text: `少し待ってください。あと${waitTime}秒後に質問できます。⏱️`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, rateLimitMessage]);
      return;
    }

    setLastRequestTime(now);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: text.trim(),
          location: 'Tokyo' // Default location, could be made dynamic
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        isUser: false,
        timestamp: new Date(),
        meta: {
          bullets: data.bullets,
          outfit: data.outfit,
          safety: data.safety,
          actions: data.actions,
        },
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorText = 'すみません、エラーが発生しました。もう一度お試しください。';
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
          errorText = 'APIの利用制限に達しました。30秒ほど待ってから再度お試しください。🕒';
        } else if (error.message.includes('401')) {
          errorText = 'API認証エラーが発生しました。設定を確認してください。';
        } else if (error.message.includes('500')) {
          errorText = 'サーバーエラーが発生しました。しばらく待ってから再度お試しください。';
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
        meta: {
          bullets: ['少し時間をおいてから再試行してください', '別の質問を試してみてください'],
          outfit: '基本的な季節の服装をお選びください',
          safety: '外出時は天気予報をご確認ください',
          actions: [
            { label: '待機', detail: '30秒〜1分待ってから再度質問' },
            { label: '確認', detail: 'ブラウザのコンソールでエラー詳細を確認' }
          ]
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setInputText(transcript);
    if (transcript.trim()) {
      sendMessage(transcript);
    }
  };

  const handleReadLastMessage = () => {
    const lastBotMessage = messages.slice().reverse().find(msg => !msg.isUser);
    if (lastBotMessage) {
      if (isSpeaking) {
        cancelSpeech();
        setIsSpeaking(false);
      } else {
        setIsSpeaking(true);
        speakText(lastBotMessage.text, 'ja-JP', () => {
          setIsSpeaking(false);
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-gray-900">🤖</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">AI Companion</h1>
            <p className="text-sm text-gray-400">AI-Powered Weather Chatbot</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">日本語</span>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-80px)]">
        <div className="flex-1 overflow-hidden">
          <ChatWindow messages={messages} isLoading={isLoading} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 bg-gray-700/50 rounded-full p-2 backdrop-blur-sm border border-gray-600/30">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the weather..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none border-none outline-none px-4 py-2 text-sm max-h-32"
                rows={1}
                disabled={isLoading}
              />
              
              <VoiceRecorder
                onResult={handleVoiceResult}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
                disabled={isLoading}
              />

              {/* Global TTS Button */}
              <button
                type="button"
                onClick={handleReadLastMessage}
                disabled={isLoading || !messages.some(msg => !msg.isUser)}
                className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center min-w-[36px] min-h-[36px] ${
                  isSpeaking
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 disabled:from-gray-600 disabled:to-gray-700 text-white'
                }`}
                title={isSpeaking ? '読み上げを停止' : '最後のメッセージを読み上げ'}
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
              
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading || (Date.now() - lastRequestTime < 3000)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-600 text-white p-2 rounded-full transition-all duration-200 flex items-center justify-center min-w-[36px] min-h-[36px]"
                title={
                  Date.now() - lastRequestTime < 3000 
                    ? `Wait ${Math.ceil((3000 - (Date.now() - lastRequestTime)) / 1000)}s`
                    : 'Send'
                }
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
          
          <div className="flex justify-center mt-2 text-xs text-gray-400 space-x-4">
            <span>🎤 Voice Input</span>
            <span>🔊 Read Aloud</span>
            <span>📤 Send</span>
          </div>
        </div>
      </div>
      
      {/* Language Instructions Component */}
      <LanguageInstructions />
    </div>
  );
}