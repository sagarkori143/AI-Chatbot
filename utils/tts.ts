export const speakText = (text: string, language: string = 'ja-JP', onEnd?: () => void): void => {
  // Cancel any ongoing speech
  cancelSpeech();

  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configure for the specified language
  utterance.lang = language;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 0.8;

  // Try to find a voice for the specified language
  const voices = speechSynthesis.getVoices();
  const targetVoice = voices.find(voice => 
    voice.lang.startsWith(language.split('-')[0]) || 
    voice.name.toLowerCase().includes(language.split('-')[0])
  );
  
  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  // Error handling
  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event.error);
    onEnd?.();
  };

  utterance.onend = () => {
    console.log('Speech synthesis completed');
    onEnd?.();
  };

  speechSynthesis.speak(utterance);
};

// Keep the original function for backward compatibility
export const speakJapanese = (text: string, onEnd?: () => void): void => {
  speakText(text, 'ja-JP', onEnd);
};

export const cancelSpeech = (): void => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
};

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!('speechSynthesis' in window)) {
    return [];
  }
  
  return speechSynthesis.getVoices().filter(voice => 
    voice.lang.startsWith('ja')
  );
};

// Load voices (sometimes they load asynchronously)
export const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    let voices = speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Wait for voices to load
    const handleVoicesChanged = () => {
      voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(voices);
      }
    };

    speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    
    // Fallback timeout
    setTimeout(() => {
      speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(speechSynthesis.getVoices());
    }, 3000);
  });
};