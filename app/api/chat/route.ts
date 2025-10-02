import { NextRequest, NextResponse } from 'next/server';
import { ChatResponse } from '@/types';
import { detectLanguage, Language } from '@/utils/translation';

export async function POST(request: NextRequest) {
  try {
    const { text, location = 'Tokyo' } = await request.json();
    
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

    // Fetch weather data
    let weatherData = null;
    try {
      const weatherResponse = await fetch(
        `${request.nextUrl.origin}/api/weather?q=${encodeURIComponent(location)}`
      );
      if (weatherResponse.ok) {
        weatherData = await weatherResponse.json();
      }
    } catch (error) {
      console.warn('Could not fetch weather data:', error);
    }

    // Detect the language of the input text
    const detectedLanguage = detectLanguage(text);
    
    // Build language-specific prompts
    const prompts = {
      ja: {
        systemPrompt: `あなたは親しみやすい天気予報アシスタントです。ユーザーの質問に対して、天気情報を使って役立つアドバイスを日本語で返してください。`,
        weatherInfo: `現在の天気情報:`,
        noWeather: '天気情報を取得できませんでした。',
        userQuestion: 'ユーザーの質問:',
        responseFormat: `回答は必ず以下のJSON形式で返してください。JSONの前後に余計なテキストは追加せず、純粋なJSONのみを返してください:
{
  "reply": "180語以内の日本語での親しみやすい回答",
  "bullets": ["短い提案1", "短い提案2", "短い提案3"],
  "outfit": "服装に関する具体的なアドバイス",
  "safety": "安全に関する注意点",
  "actions": [
    {"label": "アクション名", "detail": "詳細説明"},
    {"label": "アクション名", "detail": "詳細説明"}
  ]
}`,
        jsonNote: '必ず有効なJSONフォーマットで回答してください。マークダウンのコードブロックや説明文は含めないでください。'
      },
      en: {
        systemPrompt: `You are a friendly weather forecast assistant. Please provide helpful advice using weather information in English.`,
        weatherInfo: `Current weather information:`,
        noWeather: 'Weather information could not be retrieved.',
        userQuestion: 'User question:',
        responseFormat: `Please respond in the following JSON format. Return only pure JSON without any additional text or markdown code blocks:
{
  "reply": "Friendly response in English within 180 words",
  "bullets": ["Short suggestion 1", "Short suggestion 2", "Short suggestion 3"],
  "outfit": "Specific clothing advice",
  "safety": "Safety considerations",
  "actions": [
    {"label": "Action name", "detail": "Detailed description"},
    {"label": "Action name", "detail": "Detailed description"}
  ]
}`,
        jsonNote: 'Please ensure valid JSON format. Do not include markdown code blocks or explanatory text.'
      },
      hi: {
        systemPrompt: `आप एक मित्रवत मौसम पूर्वानुमान सहायक हैं। कृपया मौसम की जानकारी का उपयोग करके हिंदी में सहायक सलाह प्रदान करें।`,
        weatherInfo: `वर्तमान मौसम की जानकारी:`,
        noWeather: 'मौसम की जानकारी प्राप्त नहीं की जा सकी।',
        userQuestion: 'उपयोगकर्ता का प्रश्न:',
        responseFormat: `कृपया निम्नलिखित JSON प्रारूप में उत्तर दें। केवल शुद्ध JSON वापस करें, बिना किसी अतिरिक्त टेक्स्ट या मार्कडाउन कोड ब्लॉक के:
{
  "reply": "180 शब्दों के भीतर हिंदी में मित्रवत उत्तर",
  "bullets": ["छोटा सुझाव 1", "छोटा सुझाव 2", "छोटा सुझाव 3"],
  "outfit": "कपड़ों की विशिष्ट सलाह",
  "safety": "सुरक्षा संबंधी विचार",
  "actions": [
    {"label": "कार्य का नाम", "detail": "विस्तृत विवरण"},
    {"label": "कार्य का नाम", "detail": "विस्तृत विवरण"}
  ]
}`,
        jsonNote: 'कृपया वैध JSON प्रारूप सुनिश्चित करें। मार्कडाउन कोड ब्लॉक या व्याख्यात्मक टेक्स्ट शामिल न करें।'
      }
    };

    const currentPrompt = prompts[detectedLanguage];
    
    // Build the prompt for Gemini
    const prompt = `${currentPrompt.systemPrompt}

${currentPrompt.weatherInfo}
${weatherData ? `
- ${detectedLanguage === 'ja' ? '場所' : detectedLanguage === 'en' ? 'Location' : 'स्थान'}: ${weatherData.name}
- ${detectedLanguage === 'ja' ? '天気' : detectedLanguage === 'en' ? 'Weather' : 'मौसम'}: ${weatherData.description}
- ${detectedLanguage === 'ja' ? '気温' : detectedLanguage === 'en' ? 'Temperature' : 'तापमान'}: ${weatherData.temp_c}°C (${detectedLanguage === 'ja' ? '体感' : detectedLanguage === 'en' ? 'Feels like' : 'महसूस होता है'}: ${weatherData.feels_like_c}°C)
- ${detectedLanguage === 'ja' ? '湿度' : detectedLanguage === 'en' ? 'Humidity' : 'आर्द्रता'}: ${weatherData.humidity}%
- ${detectedLanguage === 'ja' ? '風速' : detectedLanguage === 'en' ? 'Wind speed' : 'हवा की गति'}: ${weatherData.wind_speed}m/s
` : currentPrompt.noWeather}

${currentPrompt.userQuestion} ${text}

${currentPrompt.responseFormat}

${currentPrompt.jsonNote}`;

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

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
              maxOutputTokens: 500,
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
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!content) {
          throw new Error('No content in Gemini response');
        }

        // Clean and parse the JSON response
        let parsedResponse: ChatResponse;
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
          
          // Parse the cleaned JSON
          parsedResponse = JSON.parse(cleanContent);
          
          // Validate and clean the parsed response
          if (parsedResponse.reply) {
            parsedResponse.reply = parsedResponse.reply.trim();
          }
          
          // Ensure all required fields exist
          if (!parsedResponse.reply) {
            parsedResponse.reply = "天気情報をお伝えします。";
          }
          if (!parsedResponse.bullets || !Array.isArray(parsedResponse.bullets)) {
            parsedResponse.bullets = ["天気を確認しましょう", "適切な服装を選びましょう"];
          }
          if (!parsedResponse.outfit) {
            parsedResponse.outfit = "今日の天気に合った服装をお選びください";
          }
          if (!parsedResponse.safety) {
            parsedResponse.safety = "外出時は天気の変化にご注意ください";
          }
          if (!parsedResponse.actions || !Array.isArray(parsedResponse.actions)) {
            parsedResponse.actions = [
              { label: "天気確認", detail: "最新の天気予報をチェック" },
              { label: "準備", detail: "外出に必要なものを準備" }
            ];
          }
          
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError, 'Raw content:', content);
          
          // If JSON parsing fails, create a language-appropriate fallback response
          const fallbacks = {
            ja: {
              bullets: ['天気を確認しましょう', '適切な服装を選びましょう'],
              outfit: '今日の天気に合った服装をお選びください',
              safety: '外出時は天気の変化にご注意ください',
              actions: [
                { label: '天気確認', detail: '最新の天気予報をチェック' },
                { label: '準備', detail: '外出に必要なものを準備' }
              ]
            },
            en: {
              bullets: ['Check the weather', 'Choose appropriate clothing'],
              outfit: 'Please choose clothing suitable for today\'s weather',
              safety: 'Please be careful of weather changes when going out',
              actions: [
                { label: 'Weather Check', detail: 'Check the latest weather forecast' },
                { label: 'Preparation', detail: 'Prepare what you need for going out' }
              ]
            },
            hi: {
              bullets: ['मौसम की जांच करें', 'उपयुक्त कपड़े चुनें'],
              outfit: 'कृपया आज के मौसम के अनुकूल कपड़े चुनें',
              safety: 'बाहर जाते समय मौसम के बदलाव से सावधान रहें',
              actions: [
                { label: 'मौसम जांच', detail: 'नवीनतम मौसम पूर्वानुमान देखें' },
                { label: 'तैयारी', detail: 'बाहर जाने के लिए आवश्यक चीजें तैयार करें' }
              ]
            }
          };
          
          const fallback = fallbacks[detectedLanguage];
          parsedResponse = {
            reply: content.substring(0, 180),
            bullets: fallback.bullets,
            outfit: fallback.outfit,
            safety: fallback.safety,
            actions: fallback.actions
          };
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

          const fallbackResponse: ChatResponse = {
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