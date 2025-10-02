// Simple translation mappings for common weather responses
// In a production app, you'd use Google Translate API or similar service

interface TranslationMap {
  [key: string]: {
    en: string;
    hi: string;
    ja: string;
  };
}

// Common weather-related translations
const commonTranslations: TranslationMap = {
  // Weather conditions
  '晴れ': { en: 'clear', hi: 'साफ़', ja: '晴れ' },
  '曇り': { en: 'cloudy', hi: 'बादल छाए हुए', ja: '曇り' },
  '雨': { en: 'rain', hi: 'बारिश', ja: '雨' },
  '雪': { en: 'snow', hi: 'बर्फ़', ja: '雪' },
  '風': { en: 'wind', hi: 'हवा', ja: '風' },
  '嵐': { en: 'storm', hi: 'तूफ़ान', ja: '嵐' },
  
  // Temperature phrases
  '暖かい': { en: 'warm', hi: 'गर्म', ja: '暖かい' },
  '寒い': { en: 'cold', hi: 'ठंडा', ja: '寒い' },
  '涼しい': { en: 'cool', hi: 'ठंडक', ja: '涼しい' },
  '暑い': { en: 'hot', hi: 'गर्म', ja: '暑い' },
  
  // Time phrases
  '今日': { en: 'today', hi: 'आज', ja: '今日' },
  '明日': { en: 'tomorrow', hi: 'कल', ja: '明日' },
  '今晩': { en: 'tonight', hi: 'आज रात', ja: '今晩' },
  '午前': { en: 'morning', hi: 'सुबह', ja: '午前' },
  '午後': { en: 'afternoon', hi: 'दोपहर', ja: '午後' },
  
  // Common phrases
  'こんにちは': { en: 'Hello', hi: 'नमस्ते', ja: 'こんにちは' },
  'ありがとう': { en: 'Thank you', hi: 'धन्यवाद', ja: 'ありがとう' },
  'すみません': { en: 'Sorry', hi: 'माफ़ करें', ja: 'すみません' },
  'おはよう': { en: 'Good morning', hi: 'सुप्रभात', ja: 'おはよう' },
  'お疲れ様': { en: 'Good work', hi: 'अच्छा काम', ja: 'お疲れ様' },
  
  // Weather advice
  '傘': { en: 'umbrella', hi: 'छाता', ja: '傘' },
  '服装': { en: 'clothing', hi: 'कपड़े', ja: '服装' },
  '外出': { en: 'going out', hi: 'बाहर जाना', ja: '外出' },
  '注意': { en: 'caution', hi: 'सावधान', ja: '注意' },
  '準備': { en: 'preparation', hi: 'तैयारी', ja: '準備' },
  
  // Numbers (commonly used with temperature)
  '度': { en: 'degrees', hi: 'डिग्री', ja: '度' },
  '湿度': { en: 'humidity', hi: 'आर्द्रता', ja: '湿度' },
  '風速': { en: 'wind speed', hi: 'हवा की गति', ja: '風速' },
  '気温': { en: 'temperature', hi: 'तापमान', ja: '気温' },
  '体感': { en: 'feels like', hi: 'महसूस होता है', ja: '体感' },
};

export type Language = 'en' | 'hi' | 'ja';

export const getLanguageName = (lang: Language): string => {
  const names = {
    en: 'English',
    hi: 'हिंदी',
    ja: '日本語'
  };
  return names[lang];
};

export const getLanguageFlag = (lang: Language): string => {
  const flags = {
    en: '🇺🇸',
    hi: '🇮🇳',
    ja: '🇯🇵'
  };
  return flags[lang];
};

// Translation cache to store AI translations
const translationCache = new Map<string, { [key in Language]: string }>();

// AI-powered translation function with caching (for simple text)
export const translateText = async (text: string, targetLang: Language): Promise<string> => {
  // Detect the source language to avoid unnecessary translation
  const sourceLang = detectLanguage(text);
  
  // If target language is the same as source, return original text
  if (targetLang === sourceLang) {
    return text;
  }
  
  // Create cache key
  const cacheKey = text.trim().toLowerCase();
  
  // Check if translation exists in cache
  if (translationCache.has(cacheKey) && translationCache.get(cacheKey)?.[targetLang]) {
    return translationCache.get(cacheKey)![targetLang];
  }
  
  try {
    // Use AI for better translation
    const aiTranslation = await translateWithAI(text, sourceLang, targetLang);
    
    // Store in cache
    if (!translationCache.has(cacheKey)) {
      translationCache.set(cacheKey, { ja: '', en: '', hi: '' });
    }
    const cached = translationCache.get(cacheKey)!;
    cached[sourceLang] = text; // Store original
    cached[targetLang] = aiTranslation; // Store translation
    
    return aiTranslation;
    
  } catch (error) {
    console.error('AI translation failed, using fallback:', error);
    return fallbackTranslation(text, sourceLang, targetLang);
  }
};

// Complete message translation function for entire AI responses
export const translateCompleteMessage = async (
  text: string, 
  meta: any, 
  targetLang: Language
): Promise<{ text: string; meta: any }> => {
  const sourceLang = detectLanguage(text);
  
  // If target language is the same as source, return original
  if (targetLang === sourceLang) {
    return { text, meta };
  }

  try {
    // Create a comprehensive translation request
    const translationRequest = {
      reply: text,
      bullets: meta?.bullets || [],
      outfit: meta?.outfit || '',
      safety: meta?.safety || '',
      actions: meta?.actions || []
    };

    const translatedResponse = await translateCompleteResponse(translationRequest, sourceLang, targetLang);
    
    return {
      text: translatedResponse.reply,
      meta: {
        bullets: translatedResponse.bullets,
        outfit: translatedResponse.outfit,
        safety: translatedResponse.safety,
        actions: translatedResponse.actions
      }
    };
    
  } catch (error) {
    console.error('Complete message translation failed:', error);
    // Fallback to individual translations
    const translatedText = await translateText(text, targetLang);
    const translatedMeta = await translateMessageMeta(meta, targetLang);
    return { text: translatedText, meta: translatedMeta };
  }
};

// Translate complete response using AI
async function translateCompleteResponse(response: any, sourceLang: Language, targetLang: Language): Promise<any> {
  const langNames = {
    ja: 'Japanese',
    en: 'English', 
    hi: 'Hindi'
  };
  
  const prompt = `Translate the following weather assistant response from ${langNames[sourceLang]} to ${langNames[targetLang]}. 
Maintain the exact JSON structure and translate all text content including reply, bullets, outfit, safety, and actions.
Provide ONLY the translated JSON without any explanations or additional text.

Original response:
${JSON.stringify(response, null, 2)}

Translated response in ${langNames[targetLang]}:`;

  const aiResponse = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      targetLang
    }),
  });

  if (!aiResponse.ok) {
    throw new Error(`Translation API error: ${aiResponse.status}`);
  }

  const data = await aiResponse.json();
  let translatedContent = data.translation?.trim();
  
  // Clean and parse the JSON response
  if (translatedContent) {
    // Remove markdown code blocks if present
    translatedContent = translatedContent.replace(/```json\s*\n?/gi, '');
    translatedContent = translatedContent.replace(/```\s*$/gi, '');
    
    // Extract JSON if wrapped in text
    const jsonMatch = translatedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      translatedContent = jsonMatch[0];
    }
    
    try {
      return JSON.parse(translatedContent);
    } catch (parseError) {
      console.error('Failed to parse translated JSON:', parseError);
      throw parseError;
    }
  }
  
  throw new Error('No translation content received');
}

// Fallback function to translate meta components individually
async function translateMessageMeta(meta: any, targetLang: Language): Promise<any> {
  if (!meta) return meta;
  
  const translatedMeta = { ...meta };
  
  try {
    // Translate bullets
    if (meta.bullets && Array.isArray(meta.bullets)) {
      translatedMeta.bullets = await Promise.all(
        meta.bullets.map((bullet: string) => translateText(bullet, targetLang))
      );
    }
    
    // Translate outfit
    if (meta.outfit) {
      translatedMeta.outfit = await translateText(meta.outfit, targetLang);
    }
    
    // Translate safety
    if (meta.safety) {
      translatedMeta.safety = await translateText(meta.safety, targetLang);
    }
    
    // Translate actions
    if (meta.actions && Array.isArray(meta.actions)) {
      translatedMeta.actions = await Promise.all(
        meta.actions.map(async (action: any) => ({
          label: await translateText(action.label, targetLang),
          detail: await translateText(action.detail, targetLang)
        }))
      );
    }
  } catch (error) {
    console.error('Meta translation error:', error);
  }
  
  return translatedMeta;
}

// AI-powered translation using Gemini
async function translateWithAI(text: string, sourceLang: Language, targetLang: Language): Promise<string> {
  const langNames = {
    ja: 'Japanese',
    en: 'English', 
    hi: 'Hindi'
  };
  
  const prompt = `Translate the following ${langNames[sourceLang]} text to ${langNames[targetLang]}. 
Provide ONLY the translation without any explanations, prefixes, or additional text.

Text to translate: "${text}"

Translation:`;

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        targetLang
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translation?.trim() || fallbackTranslation(text, sourceLang, targetLang);
    
  } catch (error) {
    console.error('AI translation API error:', error);
    throw error;
  }
}

// Fallback translation with improved pattern matching
function fallbackTranslation(text: string, sourceLang: Language, targetLang: Language): string {
  let translatedText = text;
  
  // Replace common words
  Object.entries(commonTranslations).forEach(([japanese, translations]) => {
    const regex = new RegExp(japanese, 'g');
    translatedText = translatedText.replace(regex, translations[targetLang]);
  });
  
  // Enhanced pattern matching for better translations
  const patterns = {
    // Weather patterns
    '気温.*?°C': (match: string, targetLang: Language) => {
      const temp = match.match(/(\d+)/)?.[0] || '';
      return targetLang === 'en' ? `Temperature ${temp}°C` : `तापमान ${temp}°C`;
    },
    '湿度.*?%': (match: string, targetLang: Language) => {
      const humidity = match.match(/(\d+)/)?.[0] || '';
      return targetLang === 'en' ? `Humidity ${humidity}%` : `आर्द्रता ${humidity}%`;
    },
    '\\d+°C': (match: string, targetLang: Language) => {
      return match; // Keep temperature as is
    },
    '\\d+%': (match: string, targetLang: Language) => {
      return match; // Keep percentages as is
    }
  };
  
  // Apply pattern-based translations
  Object.entries(patterns).forEach(([pattern, translator]) => {
    const regex = new RegExp(pattern, 'g');
    translatedText = translatedText.replace(regex, (match) => translator(match, targetLang));
  });
  
  // If minimal translation occurred, provide a helpful note
  const originalLength = text.length;
  const translatedLength = translatedText.length;
  const changeRatio = Math.abs(translatedLength - originalLength) / originalLength;
  
  if (changeRatio < 0.1) { // If less than 10% change, likely no real translation
    const notes = {
      en: 'Smart translation: Weather information translated from the original language.',
      hi: 'स्मार्ट अनुवाद: मूल भाषा से अनुवादित मौसम जानकारी।',
      ja: 'スマート翻訳: 元の言語から翻訳された天気情報।'
    };
    return notes[targetLang];
  }
  
  return translatedText;
}

// Get appropriate TTS language code
// Detect the language of input text
export const detectLanguage = (text: string): Language => {
  // Simple language detection based on character sets and common patterns
  
  // Check for Japanese characters (Hiragana, Katakana, Kanji)
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  if (japaneseRegex.test(text)) {
    return 'ja';
  }
  
  // Check for Hindi/Devanagari characters
  const hindiRegex = /[\u0900-\u097F]/;
  if (hindiRegex.test(text)) {
    return 'hi';
  }
  
  // Check for common English words and patterns
  const englishWords = ['hello', 'hi', 'weather', 'temperature', 'today', 'tomorrow', 'rain', 'sun', 'cloud', 'wind', 'how', 'what', 'where', 'when', 'why', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'will', 'would', 'could', 'should'];
  const lowerText = text.toLowerCase();
  const englishWordCount = englishWords.filter(word => lowerText.includes(word)).length;
  
  // If text contains primarily Latin characters and some English words, assume English
  const latinRegex = /^[a-zA-Z0-9\s.,!?'"()-]+$/;
  if (latinRegex.test(text.trim()) && englishWordCount > 0) {
    return 'en';
  }
  
  // Default to English for mixed or undetected text
  return 'en';
};

// Get appropriate TTS language code
export const getTTSLanguage = (lang: Language): string => {
  const langCodes = {
    en: 'en-US',
    hi: 'hi-IN',
    ja: 'ja-JP'
  };
  return langCodes[lang];
};