'use client';

import { useState } from 'react';

export default function LanguageInstructions() {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-full text-sm shadow-lg transition-all duration-200 z-50"
      >
        🌐 Language Guide
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-xl p-4 max-w-sm shadow-xl z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center">
          <span className="mr-2">🌐</span>
          Multi-Language Support
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs text-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-green-400">✓</span>
          <span>AI responds in the same language as your input</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-blue-400">🎵</span>
          <span>Click 🔊 to hear messages in any language</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-purple-400">🔄</span>
          <span>Complete message translation including suggestions & advice</span>
        </div>
        
        <div className="mt-3 p-2 bg-gray-700/50 rounded text-xs">
          <strong>Supported Languages:</strong>
          <div className="flex gap-2 mt-1">
            <span className="bg-blue-500/20 px-2 py-1 rounded">🇯🇵 Japanese</span>
            <span className="bg-blue-500/20 px-2 py-1 rounded">🇺🇸 English</span>
            <span className="bg-blue-500/20 px-2 py-1 rounded">🇮🇳 Hindi</span>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <span className="text-cyan-400 text-xs">Try asking in any language!</span>
        </div>
      </div>
    </div>
  );
}