import { NextRequest, NextResponse } from 'next/server';
import { ChatResponse } from '@/types';
import { detectLanguage, Language } from '@/utils/translation';

// Helper function to extract city name from user text
function extractCityFromText(text: string): string {
    console.log('DEBUG: Extracting city from:', text);  // Common patterns for city mentions
  const cityPatterns = [
    /(?:weather in|weather at|weather for|how is the weather in|what's the weather in|what is the weather in)\s+([a-zA-Z\s,]+?)(?:\?|$|today|tomorrow|now)/i,
    /(?:temperature in|temperature at|temperature for|how hot is it in|how cold is it in)\s+([a-zA-Z\s,]+?)(?:\?|$|today|tomorrow|now)/i,
    /(?:forecast for|forecast in|forecast at)\s+([a-zA-Z\s,]+?)(?:\?|$|today|tomorrow|now)/i,
    /([a-zA-Z\s,]+?)(?:\s+weather|\s+temperature|\s+forecast)(?:\?|$|today|tomorrow|now)/i,
    // Japanese patterns - fixed to be more specific
    /([あ-んア-ン一-龯]+)の(?:天気|気温|予報)/,
    // Hindi patterns  
    /([अ-ह\s]+?)(?:\s+में\s+मौसम|\s+का\s+मौसम)/,
    /(?:मौसम|तापमान).*?([अ-ह\s]+?)(?:\s+में|$)/
  ];

  for (const pattern of cityPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let city = match[1].trim();
      console.log('Pattern matched city:', city);
      
      // Clean up common words and non-city phrases
      city = city.replace(/\b(today|tomorrow|now|please|कृपया|お願いします|the|about|me|tell|はどう|どう|について)\b/gi, '').trim();
      // Only accept valid looking city names (letters, spaces, some punctuation)
      if (city.length > 1 && city.length < 50 && /^[a-zA-Zあ-んア-ン一-龯अ-ह\s,.-]+$/.test(city)) {
        console.log('Returning extracted city:', city);
        return city;
      }
    }
  }
  
  // Check if the text mentions specific well-known cities directly
  const knownCities = [
    'Tokyo', 'London', 'Paris', 'New York', 'Delhi', 'Mumbai', 'Berlin', 'Rome', 'Madrid', 'Moscow',
    'Beijing', 'Shanghai', 'Seoul', 'Bangkok', 'Singapore', 'Sydney', 'Melbourne', 'Toronto', 'Vancouver',
    '東京', '大阪', '京都', '名古屋', '横浜', '福岡', '札幌', 'दिल्ली', 'मुंबई', 'कोलकाता', 'चेन्नई', 'बेंगलुरु'
  ];
  
  for (const city of knownCities) {
    if (text.includes(city)) {
      console.log('Found known city:', city);
      return city;
    }
  }
  
  console.log('No city found, defaulting to Tokyo');
  // Default fallback
  return 'Tokyo';
}

// Function to normalize city names for weather API
function normalizeCityForWeatherAPI(city: string): string {
  const cityMappings: { [key: string]: string } = {
    '東京': 'Tokyo',
    '大阪': 'Osaka', 
    '京都': 'Kyoto',
    '名古屋': 'Nagoya',
    '横浜': 'Yokohama',
    '福岡': 'Fukuoka',
    '札幌': 'Sapporo',
    'दिल्ली': 'Delhi',
    'मुंबई': 'Mumbai',
    'कोलकाता': 'Kolkata',
    'चेन्नई': 'Chennai',
    'बेंगलुरु': 'Bangalore'
  };
  
  return cityMappings[city] || city;
}

export async function POST(request: NextRequest) {
  try {
    const { text, location } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Extract city from user text or use provided location
    const extractedCity = location || extractCityFromText(text);
    const cityToQuery = normalizeCityForWeatherAPI(extractedCity);
    console.log('City to query weather API:', cityToQuery, '(from:', extractedCity, ')');

    // Fetch weather data
    let weatherData = null;
    try {
      const weatherResponse = await fetch(
        `${request.nextUrl.origin}/api/weather?q=${encodeURIComponent(cityToQuery)}`
      );
      if (weatherResponse.ok) {
        weatherData = await weatherResponse.json();
        console.log('Weather data retrieved for:', cityToQuery);
      } else {
        console.warn('Weather API returned non-OK status:', weatherResponse.status);
      }
    } catch (error) {
      console.warn('Could not fetch weather data:', error);
    }

    // Detect the language of the input text
    const detectedLanguage = detectLanguage(text);
    
    // Enhanced system prompt for single-language response  
    const languageInstructions = {
      ja: "日本語で回答してください。親しみやすく会話調で、天気に関する実用的なアドバイスを含めてください。",
      en: "Respond in English. Be conversational and friendly, including practical weather advice and precautions.", 
      hi: "हिंदी में उत्तर दें। बातचीत के अंदाज़ में मित्रवत हों और व्यावहारिक मौसम सलाह शामिल करें।"
    };

    const systemPrompt = `You are a conversational weather assistant who ONLY discusses weather topics. Provide helpful advice with safety precautions.

RULES:
1. ONLY weather topics - politely redirect non-weather questions back to weather discussion
2. Be conversational and engaging, not just informational
3. Always include practical precautions and safety advice
4. Give specific clothing recommendations based on weather
5. Keep responses concise but comprehensive
6. NEVER mention sports, activities like cricket, or unrelated topics unless the user specifically asks about weather for that activity
7. Focus strictly on weather conditions, temperatures, precipitation, and related advice

IMPORTANT: ${languageInstructions[detectedLanguage] || languageInstructions.en}`;
    
    // Build the comprehensive prompt for Gemini
    const weatherInfo = weatherData ? `
Current weather information for ${weatherData.name}:
- Weather: ${weatherData.description}
- Temperature: ${weatherData.temp_c}°C (Feels like: ${weatherData.feels_like_c}°C)
- Humidity: ${weatherData.humidity}%
- Wind speed: ${weatherData.wind_speed}m/s
` : `Weather information could not be retrieved for the requested location.`;

    const prompt = `${systemPrompt}

${weatherInfo}

User question: ${text}

JSON format:
{
  "reply": "Conversational response with weather advice and precautions",
  "bullets": ["practical suggestion 1", "practical suggestion 2", "practical suggestion 3"],
  "outfit": "Specific clothing recommendations based on weather",
  "safety": "Safety precautions and weather warnings",
  "actions": [
    {"label": "Action name", "detail": "Practical weather-related action"},
    {"label": "Action name", "detail": "Practical weather-related action"}
  ]
}

Return ONLY valid JSON with no markdown formatting.`;

    let retries = 0;
    const maxRetries = 2;
    
    while (retries <= maxRetries) {
      try {
        // Add delay for rate limiting - exponential backoff
        if (retries > 0) {
          const delay = Math.pow(2, retries) * 1000; // 2s, 4s, etc.
          console.log(`Waiting ${delay}ms before retry ${retries}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 3000,
            }
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`Gemini API error (${response.status}):`, errorData);
          
          // Handle specific error types
          if (response.status === 429) {
            throw new Error(`Rate limit exceeded. Please wait before making another request.`);
          } else if (response.status === 400) {
            throw new Error(`Invalid API key. Please check your Gemini API key.`);
          } else if (response.status === 403) {
            throw new Error(`API access denied. Please check your Gemini API key permissions.`);
          } else {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
          }
        }

        const data = await response.json();
        console.log('Gemini API response:', JSON.stringify(data, null, 2));
        
        let content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        // Handle MAX_TOKENS case - use partial content if available
        if (!content && data.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
          console.warn('Response truncated due to token limit. Attempting to use partial content.');
          // Sometimes partial content is still available even when marked as MAX_TOKENS
          content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
        
        if (!content) {
          console.error('No content found in Gemini response. Full response:', data);
          // Check if there's an error in the response
          if (data.error) {
            throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
          }
          if (data.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
            throw new Error(`Response was cut off due to token limit. Increase maxOutputTokens in the request.`);
          }
          if (data.candidates?.[0]?.finishReason) {
            throw new Error(`Gemini response finished with reason: ${data.candidates[0].finishReason}`);
          }
          throw new Error('No content in Gemini response');
        }

        // Clean and parse the JSON response
        let parsedResponse: any;
        try {
          // Clean the content by removing markdown code blocks and extra text
          let cleanContent = content.trim();
          
          // Remove markdown code block markers
          cleanContent = cleanContent.replace(/```json\s*\n?/gi, '');
          cleanContent = cleanContent.replace(/```\s*$/gi, '');
          cleanContent = cleanContent.replace(/^```\s*/gi, '');
          
          // Extract JSON from the response if it's wrapped in text
          const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanContent = jsonMatch[0];
          }
          
          // Fix common JSON issues from incomplete responses
          // Add missing closing brackets if needed
          let openBraces = (cleanContent.match(/\{/g) || []).length;
          let closeBraces = (cleanContent.match(/\}/g) || []).length;
          while (closeBraces < openBraces) {
            cleanContent += '}';
            closeBraces++;
          }
          
          // Fix incomplete arrays
          cleanContent = cleanContent.replace(/,\s*$/, '');
          cleanContent = cleanContent.replace(/,(\s*[}\]])/g, '$1');
          
          // Parse the cleaned JSON
          parsedResponse = JSON.parse(cleanContent);
          
          // Validate and clean the parsed response
          if (parsedResponse.reply) {
            parsedResponse.reply = parsedResponse.reply.trim();
          }
          
          // Ensure all required fields exist with language-appropriate fallbacks
          const fallbacks = {
            ja: {
              reply: "天気情報をお伝えします。現在の天気を確認して、適切な対策を取りましょう。",
              bullets: ["天気を確認しましょう", "適切な服装を選びましょう", "安全に注意しましょう"],
              outfit: "今日の天気に合った服装をお選びください",
              safety: "外出時は天気の変化にご注意ください",
              actions: [
                { label: "天気確認", detail: "最新の天気予報をチェック" },
                { label: "準備", detail: "外出に必要なものを準備" }
              ]
            },
            en: {
              reply: "Let me share the weather information with you. Let's check the current weather and take appropriate measures.",
              bullets: ["Check the weather", "Choose appropriate clothing", "Stay safe"],
              outfit: "Please choose clothing suitable for today's weather",
              safety: "Please be careful of weather changes when going out",
              actions: [
                { label: "Weather Check", detail: "Check the latest weather forecast" },
                { label: "Preparation", detail: "Prepare what you need for going out" }
              ]
            },
            hi: {
              reply: "मैं आपके साथ मौसम की जानकारी साझा करता हूं। आइए वर्तमान मौसम की जांच करें और उचित उपाय करें।",
              bullets: ["मौसम की जांच करें", "उपयुक्त कपड़े चुनें", "सुरक्षित रहें"],
              outfit: "कृपया आज के मौसम के अनुकूल कपड़े चुनें",
              safety: "बाहर जाते समय मौसम के बदलाव से सावधान रहें",
              actions: [
                { label: "मौसम जांच", detail: "नवीनतम मौसम पूर्वानुमान देखें" },
                { label: "तैयारी", detail: "बाहर जाने के लिए आवश्यक चीजें तैयार करें" }
              ]
            }
          };

          const fallback = fallbacks[detectedLanguage] || fallbacks.ja;
          
          if (!parsedResponse.reply) {
            parsedResponse.reply = fallback.reply;
          }
          if (!parsedResponse.bullets || !Array.isArray(parsedResponse.bullets)) {
            parsedResponse.bullets = fallback.bullets;
          }
          if (!parsedResponse.outfit) {
            parsedResponse.outfit = fallback.outfit;
          }
          if (!parsedResponse.safety) {
            parsedResponse.safety = fallback.safety;
          }
          if (!parsedResponse.actions || !Array.isArray(parsedResponse.actions)) {
            parsedResponse.actions = fallback.actions;
          }
          
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError, 'Raw content:', content);
          
          // If JSON parsing fails, create a simple fallback response
          const fallbacks = {
            ja: {
              reply: content.substring(0, 180) || '天気情報をお伝えします。現在の天気を確認して、適切な対策を取りましょう。',
              bullets: ['天気を確認しましょう', '適切な服装を選びましょう', '安全に注意しましょう'],
              outfit: '今日の天気に合った服装をお選びください',
              safety: '外出時は天気の変化にご注意ください',
              actions: [
                { label: '天気確認', detail: '最新の天気予報をチェック' },
                { label: '準備', detail: '外出に必要なものを準備' }
              ]
            },
            en: {
              reply: content.substring(0, 180) || 'Let me share the weather information. Let\'s check the current weather and take appropriate measures.',
              bullets: ['Check the weather', 'Choose appropriate clothing', 'Stay safe'],
              outfit: 'Please choose clothing suitable for today\'s weather',
              safety: 'Please be careful of weather changes when going out',
              actions: [
                { label: 'Weather Check', detail: 'Check the latest weather forecast' },
                { label: 'Preparation', detail: 'Prepare what you need for going out' }
              ]
            },
            hi: {
              reply: content.substring(0, 180) || 'मैं मौसम की जानकारी साझा करता हूं। आइए वर्तमान मौसम की जांच करें और उचित उपाय करें।',
              bullets: ['मौसम की जांच करें', 'उपयुक्त कपड़े चुनें', 'सुरक्षित रहें'],
              outfit: 'कृपया आज के मौसम के अनुकूल कपड़े चुनें',
              safety: 'बाहर जाते समय मौसम के बदलाव से सावधान रहें',
              actions: [
                { label: 'मौसम जांच', detail: 'नवीनतम मौसम पूर्वानुमान देखें' },
                { label: 'तैयारी', detail: 'बाहर जाने के लिए आवश्यक चीजें तैयार करें' }
              ]
            }
          };
          
          parsedResponse = fallbacks[detectedLanguage] || fallbacks.ja;
        }

        // Validate required fields
        if (!parsedResponse.reply || !Array.isArray(parsedResponse.bullets)) {
          throw new Error('Invalid response format');
        }

        return NextResponse.json(parsedResponse);

      } catch (error) {
        console.error(`Chat API attempt ${retries + 1} failed:`, error);
        retries++;
        
        if (retries > maxRetries) {
          // Language-specific error messages
          const errorMessages = {
            ja: {
              general: 'すみません、現在システムに問題が発生しています。しばらくしてから再度お試しください。',
              rateLimit: 'Gemini APIの利用制限に達しました。少し時間をおいてから再度お試しください。',
              invalidKey: 'Gemini API設定に問題があります。APIキーを確認してください。',
              apiError: 'Gemini APIでエラーが発生しました。現在は天気データのみでお答えします。',
              generalSuggestions: ['後でもう一度試してください', '天気アプリで確認してください'],
              rateLimitSuggestions: ['30秒〜1分待ってから再試行してください', '別の質問をしてみてください'],
              invalidKeySuggestions: ['Gemini APIキーの設定を確認してください', 'https://aistudio.google.com でAPIキーを取得してください'],
              apiErrorSuggestions: ['しばらく待ってから再試行してください', '今は天気情報のみ利用可能です']
            },
            en: {
              general: 'Sorry, there is currently a system problem. Please try again later.',
              rateLimit: 'Gemini API rate limit reached. Please wait a moment before trying again.',
              invalidKey: 'There is a problem with the Gemini API settings. Please check your API key.',
              apiError: 'An error occurred with the Gemini API. Only weather data is currently available.',
              generalSuggestions: ['Please try again later', 'Check a weather app'],
              rateLimitSuggestions: ['Wait 30 seconds to 1 minute before retrying', 'Try asking a different question'],
              invalidKeySuggestions: ['Please check your Gemini API key settings', 'Get an API key at https://aistudio.google.com'],
              apiErrorSuggestions: ['Please wait and try again', 'Only weather information is available now']
            },
            hi: {
              general: 'खुशी है, वर्तमान में सिस्टम में समस्या है। कृपया बाद में फिर से कोशिश करें।',
              rateLimit: 'Gemini API दर सीमा पहुंच गई। कृपया फिर से कोशिश करने से पहले थोड़ा इंतज़ार करें।',
              invalidKey: 'Gemini API सेटिंग्स में समस्या है। कृपया अपनी API कुंजी जांचें।',
              apiError: 'Gemini API में त्रुटि हुई। वर्तमान में केवल मौसम डेटा उपलब्ध है।',
              generalSuggestions: ['कृपया बाद में फिर से कोशिश करें', 'मौसम ऐप देखें'],
              rateLimitSuggestions: ['फिर से कोशिश करने से पहले 30 सेकंड से 1 मिनट प्रतीक्षा करें', 'एक अलग प्रश्न पूछने की कोशिश करें'],
              invalidKeySuggestions: ['कृपया अपनी Gemini API कुंजी सेटिंग्स जांचें', 'https://aistudio.google.com पर API कुंजी प्राप्त करें'],
              apiErrorSuggestions: ['कृपया प्रतीक्षा करें और फिर से कोशिश करें', 'अब केवल मौसम की जानकारी उपलब्ध है']
            }
          };
          
          const messages = errorMessages[detectedLanguage];
          let fallbackMessage = messages.general;
          let suggestions = messages.generalSuggestions;
          
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('Rate limit exceeded')) {
            fallbackMessage = messages.rateLimit;
            suggestions = messages.rateLimitSuggestions;
          } else if (errorMessage.includes('Invalid API key') || errorMessage.includes('API access denied')) {
            fallbackMessage = messages.invalidKey;
            suggestions = messages.invalidKeySuggestions;
          } else {
            fallbackMessage = messages.apiError;
            suggestions = messages.apiErrorSuggestions;
          }
          
          // Enhanced weather-based response when API is unavailable
          let weatherBasedReply = fallbackMessage;
          if (weatherData) {
            const weatherDescriptions = {
              ja: `${weatherData.name}の現在の天気: ${weatherData.description}、気温${weatherData.temp_c}°C（体感${weatherData.feels_like_c}°C）、湿度${weatherData.humidity}%です。Gemini APIでエラーが発生しているため、AIによる詳細な提案はできませんが、基本的な天気情報をお提供します。`,
              en: `Current weather in ${weatherData.name}: ${weatherData.description}, temperature ${weatherData.temp_c}°C (feels like ${weatherData.feels_like_c}°C), humidity ${weatherData.humidity}%. Due to Gemini API error, detailed AI suggestions are not available, but basic weather information is provided.`,
              hi: `${weatherData.name} में वर्तमान मौसम: ${weatherData.description}, तापमान ${weatherData.temp_c}°C (महसूस होता है ${weatherData.feels_like_c}°C), आर्द्रता ${weatherData.humidity}%। Gemini API त्रुटि के कारण, विस्तृत AI सुझाव उपलब्ध नहीं हैं, लेकिन बुनियादी मौसम जानकारी प्रदान की गई है।`
            };
            weatherBasedReply = weatherDescriptions[detectedLanguage];
          }

          const outfitAdvice = {
            ja: weatherData ? `${weatherData.temp_c}°Cなので、季節に応じた服装をお選びください` : '季節に応じた服装をお選びください',
            en: weatherData ? `It's ${weatherData.temp_c}°C, so please choose clothing appropriate for the season` : 'Please choose clothing appropriate for the season',
            hi: weatherData ? `यह ${weatherData.temp_c}°C है, इसलिए कृपया मौसम के अनुकूल कपड़े चुनें` : 'कृपया मौसम के अनुकूल कपड़े चुनें'
          };

          const safetyAdvice = {
            ja: weatherData ? `${weatherData.description}の天気です。外出時はご注意ください` : '外出時は天気の変化にご注意ください',
            en: weatherData ? `The weather is ${weatherData.description}. Please be careful when going out` : 'Please be careful of weather changes when going out',
            hi: weatherData ? `मौसम ${weatherData.description} है। बाहर जाते समय सावधान रहें` : 'बाहर जाते समय मौसम के बदलाव से सावधान रहें'
          };

          const actions = {
            ja: [
              { label: 'API設定', detail: 'Gemini APIキーの設定を確認' },
              { label: '天気確認', detail: `${weatherData?.name || '東京'}の天気: ${weatherData?.description || '情報なし'}` }
            ],
            en: [
              { label: 'API Settings', detail: 'Check Gemini API key configuration' },
              { label: 'Weather Check', detail: `Weather in ${weatherData?.name || 'Tokyo'}: ${weatherData?.description || 'No information'}` }
            ],
            hi: [
              { label: 'API सेटिंग्स', detail: 'Gemini API कुंजी कॉन्फ़िगरेशन जांचें' },
              { label: 'मौसम जांच', detail: `${weatherData?.name || 'टोक्यो'} में मौसम: ${weatherData?.description || 'कोई जानकारी नहीं'}` }
            ]
          };

          const fallbackResponse = {
            reply: weatherBasedReply,
            bullets: suggestions,
            outfit: outfitAdvice[detectedLanguage],
            safety: safetyAdvice[detectedLanguage],
            actions: actions[detectedLanguage]
          };
          
          return NextResponse.json(fallbackResponse);
        }
      }
    }

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}