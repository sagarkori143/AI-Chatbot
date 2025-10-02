'use client';

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Message, Language } from '@/types';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  uiLanguage: Language;
}

// Welcome screen translations
const welcomeTranslations = {
  en: {
    title: "AI Companion - Weather Intelligence Based Chatbot",
    subtitle: "Welcome! Have a question? Ask me!",
    features: {
      voiceInput: {
        title: "🎙️ Voice Input",
        description: "Speak in your preferred language using the microphone button"
      },
      weatherData: {
        title: "🌦️ Weather Data", 
        description: "Get real-time weather information and forecasts"
      },
      aiSuggestions: {
        title: "🤖 AI Suggestions",
        description: "Intelligent recommendations based on weather"
      },
      textToSpeech: {
        title: "🗣️ Text-to-Speech",
        description: "Hear responses in natural voice"
      }
    }
  },
  ja: {
    title: "AI コンパニオン - 天気予報インテリジェント チャットボット",
    subtitle: "ようこそ！質問はありますか？聞いてください！",
    features: {
      voiceInput: {
        title: "🎙️ 音声入力",
        description: "マイクボタンを使って日本語で話してください"
      },
      weatherData: {
        title: "🌦️ 天気データ",
        description: "リアルタイムの天気情報と予報を取得"
      },
      aiSuggestions: {
        title: "🤖 AI提案",
        description: "天気に基づくインテリジェントな推奨事項"
      },
      textToSpeech: {
        title: "🗣️ 読み上げ",
        description: "自然な日本語音声で応答を聞く"
      }
    }
  },
  hi: {
    title: "AI साथी - मौसम इंटेलिजेंस आधारित चैटबॉट",
    subtitle: "स्वागत है! कोई सवाल है? मुझसे पूछें!",
    features: {
      voiceInput: {
        title: "🎙️ आवाज़ इनपुट",
        description: "माइक्रोफ़ोन बटन का उपयोग करके हिंदी में बोलें"
      },
      weatherData: {
        title: "🌦️ मौसम डेटा",
        description: "वास्तविक समय मौसम जानकारी और पूर्वानुमान प्राप्त करें"
      },
      aiSuggestions: {
        title: "🤖 AI सुझाव",
        description: "मौसम के आधार पर बुद्धिमान सिफारिशें"
      },
      textToSpeech: {
        title: "🗣️ पाठ-से-भाषण",
        description: "प्राकृतिक आवाज़ में जवाब सुनें"
      }
    }
  }
};

export default function ChatWindow({ messages, isLoading, uiLanguage = 'ja' }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Get current translations with fallback
  const currentTranslations = welcomeTranslations[uiLanguage] || welcomeTranslations['ja'];

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
            {currentTranslations.title}
          </h1>
          
          <p className="text-xl text-gray-400 mb-8">
            {currentTranslations.subtitle}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2 text-blue-400">{currentTranslations.features.voiceInput.title}</h3>
              <p className="text-gray-300 text-sm">{currentTranslations.features.voiceInput.description}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2 text-green-400">{currentTranslations.features.weatherData.title}</h3>
              <p className="text-gray-300 text-sm">{currentTranslations.features.weatherData.description}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2 text-purple-400">{currentTranslations.features.aiSuggestions.title}</h3>
              <p className="text-gray-300 text-sm">{currentTranslations.features.aiSuggestions.description}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">{currentTranslations.features.textToSpeech.title}</h3>
              <p className="text-gray-300 text-sm">{currentTranslations.features.textToSpeech.description}</p>
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