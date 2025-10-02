export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  meta?: MessageMeta;
  translations?: {
    [key in Language]?: {
      text: string;
      meta?: MessageMeta;
    };
  };
}

export interface MessageMeta {
  bullets?: string[];
  outfit?: string;
  safety?: string;
  actions?: Array<{
    label: string;
    detail: string;
  }>;
}

export interface WeatherData {
  name: string;
  weather_main: string;
  description: string;
  temp_c: number;
  feels_like_c: number;
  humidity: number;
  wind_speed: number;
}

export interface ChatResponse {
  reply: string;
  bullets: string[];
  outfit: string;
  safety: string;
  actions: Array<{
    label: string;
    detail: string;
  }>;
}

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export type Language = 'en' | 'hi' | 'ja';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}