# AI Companion Weather Bot 🌤️🤖🌐

A sophisticated multi-language weather chatbot powered by Next.js 14+, featuring automatic language detection, AI-powered translations, and intelligent weather suggestions in Japanese, English, and Hindi.

## ✨ Key Features

### 🌐 **Multi-Language Intelligence**
- **Automatic Language Detection**: Detects input language and responds in the same language
- **AI-Powered Translation**: Complete message translation using Google Gemini API
- **Translation Caching**: Smart caching system for instant language switching
- **Supported Languages**: Japanese (🇯🇵), English (🇺🇸), Hindi (🇮🇳)

### 🎙️ **Advanced Voice Features**
- **Multi-Language Voice Input**: Web Speech API with fallback to OpenAI Whisper STT
- **Multi-Language TTS**: Text-to-speech in all supported languages with proper pronunciation
- **Voice Recognition**: Optimized for Japanese, English, and Hindi speech patterns

### 🤖 **AI-Powered Intelligence**
- **Google Gemini Integration**: Latest Gemini 2.5 Flash model for superior responses
- **Language-Aware Responses**: AI responds in the detected input language
- **Contextual Weather Advice**: Intelligent suggestions based on weather conditions
- **Structured Responses**: Organized suggestions for outfit, safety, and actions

### 🌦️ **Weather Intelligence**
- **Real-time Weather Data**: OpenWeatherMap API integration
- **Multi-Language Weather Display**: Weather information in user's preferred language
- **Contextual Suggestions**: Location and weather-aware recommendations

### 💬 **Enhanced User Experience**
- **Dark Theme UI**: Modern SkyCheck-inspired interface with smooth animations
- **Language Switching**: Instant translation of any message to any supported language
- **Translation Memory**: Previously translated content loads instantly
- **Loading States**: Smooth UX with proper loading indicators

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript with full type safety
- **Styling**: Tailwind CSS with custom animations
- **AI APIs**: Google Gemini 2.5 Flash, OpenAI Whisper STT
- **Weather API**: OpenWeatherMap with normalized responses
- **Speech APIs**: Web Speech API (recognition & synthesis)
- **Translation**: AI-powered with intelligent caching
- **Deployment**: Vercel-ready with environment configuration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API key (for AI chat and translations)
- OpenAI API key (for voice-to-text fallback)
- OpenWeatherMap API key (for weather data)

### Installation

1. **Clone and setup**:
   ```bash
   git clone <your-repo-url>
   cd ai-companion
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env.local
   ```

3. **Configure API keys** in `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   NEXT_PUBLIC_APP_NAME=AI Companion Weather Bot
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**: Navigate to [http://localhost:3000](http://localhost:3000)

### Getting API Keys

- **Google Gemini**: Get your free API key at [aistudio.google.com](https://aistudio.google.com/app/apikey)
- **OpenAI**: Get your key at [platform.openai.com](https://platform.openai.com/api-keys) (for voice fallback)
- **OpenWeatherMap**: Sign up at [openweathermap.org](https://openweathermap.org/api) (free tier available)

## 💬 Multi-Language Usage Examples

### Japanese 🇯🇵
- "今日の天気はどうですか？" (How's the weather today?)
- "雨が降りそうですか？" (Is it going to rain?)
- "何を着ればいいですか？" (What should I wear?)
- "外出しても大丈夫ですか？" (Is it safe to go outside?)

### English 🇺🇸
- "What's the weather like today?"
- "Should I bring an umbrella?"
- "What should I wear for this weather?"
- "Is it safe to go outside?"

### Hindi 🇮🇳
- "आज का मौसम कैसा है?" (How's the weather today?)
- "क्या बारिश होगी?" (Will it rain?)
- "मुझे क्या पहनना चाहिए?" (What should I wear?)
- "क्या बाहर जाना सुरक्षित है?" (Is it safe to go outside?)

The AI will automatically detect your language and respond in the same language!

## 🏗️ Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/          # Gemini AI chat endpoint with language detection
│   │   ├── translate/     # AI-powered translation endpoint
│   │   ├── weather/       # Weather data endpoint with multi-language support
│   │   └── stt/           # Speech-to-text endpoint (OpenAI Whisper)
│   ├── globals.css        # Global styles with dark theme
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Main chat interface with voice input
├── components/
│   ├── ChatWindow.tsx     # Welcome screen and message container
│   ├── MessageBubble.tsx  # Messages with translation & TTS controls
│   ├── VoiceRecorder.tsx  # Multi-language voice input
│   └── LanguageInstructions.tsx  # Feature guide popup
├── utils/
│   ├── tts.ts            # Multi-language text-to-speech
│   ├── translation.ts    # AI translation with caching
│   └── weather.ts        # Weather API with normalized responses
├── types/
│   └── index.ts          # TypeScript definitions for multi-language
├── .env.example          # Environment template with all API keys
└── .gitignore           # Git ignore configuration
```

## 🎯 Advanced Features Deep Dive

### 🧠 Multi-Language Intelligence System
- **Language Detection**: Automatic detection using character sets and keyword analysis
- **Response Matching**: AI responds in the same language as input
- **Translation Engine**: Gemini-powered translations with pattern matching fallbacks
- **Memory System**: Intelligent caching for instant re-translation
- **Error Recovery**: Graceful fallbacks with language-appropriate error messages

### 🎙️ Advanced Voice Input System
- **Multi-Language Recognition**: Web Speech API for Japanese, English, Hindi
- **Smart Fallback**: Audio recording → OpenAI Whisper API for unsupported browsers
- **Language Auto-Switch**: Automatic language detection from voice input
- **Visual Feedback**: Animated recording states with language indicators

### 🌐 Complete Translation System
- **Full Message Translation**: Translates entire responses including outfit, safety, and actions
- **AI-Powered**: Uses Gemini API for natural, contextual translations
- **Smart Caching**: Stores translations to avoid redundant API calls
- **Instant Switching**: Previously translated content appears immediately
- **Context Preservation**: Maintains meaning and weather context across languages

### 🗣️ Multi-Language Text-to-Speech
- **Language-Specific Voices**: Proper pronunciation for each supported language
- **Individual Controls**: TTS button for each message with language detection
- **Global TTS**: Read the last AI response in any language
- **Voice Selection**: Optimized voice selection per language (ja-JP, en-US, hi-IN)

### 🤖 Enhanced AI Response System
- **Model**: Google Gemini 2.5 Flash for superior multilingual capabilities
- **Language-Aware Prompts**: Different prompts for each language with cultural context
- **JSON Validation**: Robust parsing with automatic error recovery
- **Structured Output**: Categorized suggestions with complete translations
- **Rate Limiting**: Built-in exponential backoff and retry logic

### 🌦️ Intelligent Weather Integration
- **Multi-Language Display**: Weather data presented in user's language
- **Contextual Advice**: Culture and language-specific weather recommendations
- **Location Support**: Default Tokyo with expandable location detection
- **Normalized Data**: Consistent weather format across all languages

### Response Categories (All Translatable)
- **Reply**: Main conversational response (≤180 words) in detected language
- **Bullets**: Quick actionable suggestions translated to target language
- **Outfit**: Clothing recommendations with cultural context
- **Safety**: Weather-related safety tips in appropriate language
- **Actions**: Structured action items with localized details

## 📱 Enhanced User Interface

### Modern Chat Interface
- **Dark Theme**: SkyCheck-inspired design with gradient backgrounds
- **Animated Messages**: Smooth slide-up animations with fade-in effects
- **Language Indicators**: Visual markers for original and current message languages
- **Loading States**: Elegant loading animations for translations and AI responses
- **Responsive Design**: Optimized for desktop and mobile with touch-friendly controls

### Multi-Language Controls
- **Language Buttons**: Easy switching between Japanese, English, and Hindi
- **Original Language Markers**: Green highlighting and dot indicators for source language
- **Translation Status**: Loading states and error handling for translation requests
- **TTS Controls**: Individual and global text-to-speech buttons with language detection

### Advanced Input Methods
- **Multi-Language Text**: Auto-detecting textarea with language-aware placeholders
- **Voice Input**: Language-specific voice recognition with visual feedback
- **Rate Limiting**: Built-in protection with countdown timers
- **Keyboard Shortcuts**: Enter to send, Ctrl+Enter for newline, Esc to cancel

### Interactive Elements
- **Language Guide**: Floating instruction panel explaining multi-language features
- **Message Metadata**: Expandable sections for outfit, safety, and action suggestions
- **Translation Memory**: Instant switching between previously translated versions
- **Error Recovery**: User-friendly error messages in appropriate languages

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables in Vercel**:
   - `GEMINI_API_KEY` (primary AI model)
   - `OPENAI_API_KEY` (voice fallback)
   - `OPENWEATHER_API_KEY` (weather data)
   - `NEXT_PUBLIC_APP_NAME` (app branding)

### Manual Deployment

```bash
npm run build
npm start
```

## 🎬 Multi-Language Demo Script (90 seconds)

1. **Opening** (0-15s): "AI Companion - Multi-language weather chatbot with automatic language detection"
2. **Japanese Demo** (15-30s): Voice input "今日の天気はどうですか？", show AI response in Japanese
3. **Translation Demo** (30-45s): Click language buttons to translate response to English and Hindi
4. **English Demo** (45-60s): Type "What should I wear today?", show AI responds in English
5. **TTS Demo** (60-75s): Demonstrate text-to-speech in different languages
6. **Features Summary** (75-90s): "Automatic language detection, AI translations, multi-language TTS, complete weather intelligence"

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Organization

- **Client Components**: React components with 'use client'
- **Server Components**: API routes and server-side logic
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive error boundaries

## 🐛 Troubleshooting

### Common Issues

**Gemini API Errors**:
- Verify `GEMINI_API_KEY` is correctly set in environment variables
- Ensure API key has proper permissions at [aistudio.google.com](https://aistudio.google.com)
- Check for model availability (using `gemini-2.5-flash`)
- Review browser console for detailed error messages

**Translation Not Working**:
- Check if translation API endpoint is responding (`/api/translate`)
- Verify network connectivity for AI translation requests
- Fallback to pattern-based translation is automatic
- Clear cache if translations seem stuck

**Multi-Language Voice Input Issues**:
- Check microphone permissions in browser settings
- Ensure HTTPS in production for Web Speech API
- Test different languages (Japanese, English, Hindi support)
- Fallback to OpenAI Whisper if Web Speech API fails

**Language Detection Problems**:
- Mixed language text defaults to English
- Single words may not detect correctly (requires context)
- Japanese characters (Hiragana, Katakana, Kanji) are detected reliably
- Hindi Devanagari script detection is accurate

**API Rate Limits**:
- **Gemini API**: Generous free tier, much higher than OpenAI
- **OpenAI Whisper**: 3 requests/minute (voice fallback only)
- **OpenWeatherMap**: 1,000 calls/day, 60 calls/minute
- Built-in rate limiting: 3-second minimum between chat requests

**Build/Runtime Errors**:
- Run `npm install` to ensure all dependencies
- Check TypeScript errors with `npm run lint`
- Verify all API keys are set in `.env.local`
- Ensure Node.js version 18+ compatibility

### Rate Limiting & API Information

**Google Gemini API (Free Tier)**:
- Much more generous than OpenAI free tier
- Used for: Main chat responses and AI translations
- Automatic retry logic with exponential backoff

**OpenAI API (Fallback Only)**:
- Whisper STT: Used only when Web Speech API fails
- Minimal usage due to Web Speech API preference

**Translation Caching**:
- Client-side translation cache reduces API calls
- Previously translated content loads instantly
- Cache persists during session for better performance

**Built-in Protection Features**:
- Client-side: 3-second minimum between requests
- Server-side: Exponential backoff retry logic
- Graceful degradation: Fallback responses when APIs fail
- Language-appropriate error messages

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🌟 Key Improvements & Latest Updates

### v2.0 - Multi-Language Intelligence Update
- **🌐 Complete Multi-Language Support**: Japanese, English, and Hindi
- **🧠 Automatic Language Detection**: AI detects input language and responds accordingly
- **🔄 AI-Powered Translation**: Full message translation including metadata (outfit, safety, actions)
- **💾 Translation Caching**: Smart caching system for instant language switching
- **🎙️ Multi-Language TTS**: Proper pronunciation in all supported languages
- **🎨 Enhanced UI**: Dark theme with language indicators and smooth animations

### v1.5 - Gemini Integration Update
- **⚡ Google Gemini API**: Migrated from OpenAI to Gemini 2.5 Flash for better performance
- **📊 Improved Response Quality**: More natural and contextual weather advice
- **🔧 Better Error Handling**: Robust error recovery with language-appropriate messages
- **🚀 Higher Rate Limits**: More generous API limits compared to OpenAI free tier

### v1.0 - Core Features
- **🎙️ Voice Input**: Web Speech API with OpenAI Whisper fallback
- **🌦️ Weather Integration**: Real-time weather data with OpenWeatherMap
- **💬 Chat Interface**: Modern chat UI with typing animations
- **🗣️ Text-to-Speech**: Browser-based TTS for AI responses

## 📚 Learn More

### APIs & Documentation
- [Google Gemini API](https://ai.google.dev/docs) - Primary AI model documentation
- [Next.js Documentation](https://nextjs.org/docs) - Framework documentation
- [OpenWeatherMap API](https://openweathermap.org/api) - Weather data API
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - Voice recognition & synthesis

### Development Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type safety best practices
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling framework
- [Vercel Deployment](https://vercel.com/docs) - Deployment platform documentation

## 🔮 Future Roadmap

- **📍 Location Detection**: Automatic user location for local weather
- **🌍 More Languages**: Expand to Spanish, French, German, and more
- **🎨 Theme Customization**: Light/dark theme toggle with custom colors
- **📱 PWA Support**: Progressive Web App for mobile installation
- **🔊 Voice Commands**: Voice-controlled language switching and actions
- **📈 Analytics**: Usage analytics and performance monitoring

---

Built with ❤️ using Next.js 14+, TypeScript, Google Gemini AI, and modern web technologies

**Star ⭐ this repo if you found it helpful!**