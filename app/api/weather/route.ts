import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenWeather API key not configured' },
      { status: 500 }
    );
  }

  let apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
  const params = new URLSearchParams({
    appid: apiKey,
    units: 'metric',
    lang: 'ja'
  });

  if (lat && lon) {
    params.append('lat', lat);
    params.append('lon', lon);
  } else if (q) {
    params.append('q', q);
  } else {
    return NextResponse.json(
      { error: 'Either q (city name) or lat&lon coordinates are required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${apiUrl}?${params.toString()}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Location not found' },
          { status: 404 }
        );
      }
      throw new Error(`OpenWeather API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Normalize the response to our expected format
    const normalizedData = {
      name: data.name,
      weather_main: data.weather[0].main,
      description: data.weather[0].description,
      temp_c: data.main.temp,
      feels_like_c: data.main.feels_like,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
    };

    return NextResponse.json(normalizedData);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}