import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, targetLang } = await request.json();
    
    if (!prompt || !targetLang) {
      return NextResponse.json(
        { error: 'Prompt and target language are required' },
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
          temperature: 0.3, // Lower temperature for more consistent translations
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 300,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Gemini translation API error (${response.status}):`, errorData);
      return NextResponse.json(
        { error: 'Translation failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      return NextResponse.json(
        { error: 'No translation content received' },
        { status: 500 }
      );
    }

    // Clean the translation response
    let translation = content.trim();
    
    // Remove any unwanted prefixes or explanations
    translation = translation.replace(/^(Translation:|Translated text:|Answer:)/i, '').trim();
    translation = translation.replace(/^["']|["']$/g, ''); // Remove quotes
    
    return NextResponse.json({ translation });

  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}