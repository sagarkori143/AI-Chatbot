'use client';

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Message } from '@/types';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-y-auto scroll-smooth"
    >
      {messages.length === 0 && !isLoading ? (
        // Welcome Screen
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="mb-8">
            {/* Animated Bot Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl shadow-blue-500/25">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center shadow-inner">
                  <div className="text-3xl animate-bounce">🤖</div>
                </div>
              </div>
              {/* Floating dots animation */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-2 -left-3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '0.8s' }}></div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            AI Companion - Weather Intelligence Based Chatbot
          </h1>
          
          <p className="text-xl text-gray-400 mb-8">
            Welcome! Have a question? Ask me!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2 text-blue-400">🎙️ Voice Input</h3>
              <p className="text-gray-300 text-sm">Speak in Japanese using the microphone button</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2 text-green-400">🌦️ Weather Data</h3>
              <p className="text-gray-300 text-sm">Get real-time weather information and forecasts</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2 text-purple-400">🤖 AI Suggestions</h3>
              <p className="text-gray-300 text-sm">Intelligent recommendations based on weather</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">🗣️ Text-to-Speech</h3>
              <p className="text-gray-300 text-sm">Hear responses in natural Japanese voice</p>
            </div>
          </div>
        </div>
      ) : (
        // Messages
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700/50 rounded-lg p-3 max-w-xs animate-fade-in backdrop-blur-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-typing" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-typing" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-typing" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}