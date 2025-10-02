import { WeatherData } from '@/types';

export const buildWeatherRequest = (query: string): { url: string; params: URLSearchParams } => {
  const baseUrl = '/api/weather';
  const params = new URLSearchParams();

  // Check if query looks like coordinates (lat,lon)
  const coordMatch = query.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  
  if (coordMatch) {
    params.append('lat', coordMatch[1]);
    params.append('lon', coordMatch[2]);
  } else {
    params.append('q', query);
  }

  return { url: baseUrl, params };
};

export const fetchWeatherFromAPI = async (location: string): Promise<WeatherData | null> => {
  try {
    const { url, params } = buildWeatherRequest(location);
    const response = await fetch(`${url}?${params.toString()}`);
    
    if (!response.ok) {
      console.error('Weather API error:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data as WeatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};

export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°C`;
};

export const formatWeatherDescription = (weather: WeatherData): string => {
  return `${weather.name}の天気は${weather.description}、気温は${formatTemperature(weather.temp_c)}（体感${formatTemperature(weather.feels_like_c)}）、湿度${weather.humidity}%、風速${weather.wind_speed}m/sです。`;
};

export const getWeatherEmoji = (weatherMain: string): string => {
  const weatherEmojis: { [key: string]: string } = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '🌨️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️',
    'Dust': '💨',
    'Sand': '💨',
    'Smoke': '🌫️',
    'Squall': '💨',
    'Tornado': '🌪️',
  };
  
  return weatherEmojis[weatherMain] || '🌤️';
};