// Test city extraction function
function extractCityFromText(text) {
  // Common patterns for city mentions
  const cityPatterns = [
    /(?:weather in|weather at|weather for|how is the weather in|what's the weather in|what is the weather in)\s+([a-zA-Z\s,]+?)(?:\?|$|today|tomorrow|now)/i,
    /(?:temperature in|temperature at|temperature for|how hot is it in|how cold is it in)\s+([a-zA-Z\s,]+?)(?:\?|$|today|tomorrow|now)/i,
    /(?:forecast for|forecast in|forecast at)\s+([a-zA-Z\s,]+?)(?:\?|$|today|tomorrow|now)/i,
    /([a-zA-Z\s,]+?)(?:\s+weather|\s+temperature|\s+forecast)(?:\?|$|today|tomorrow|now)/i,
    // Japanese patterns
    /([あ-んア-ン一-龯\s]+?)(?:の天気|の気温|の予報)/,
    /(?:の天気|の気温|の予報).*?([あ-んア-ン一-龯\s]+)/,
    // Hindi patterns  
    /([अ-ह\s]+?)(?:\s+में\s+मौसम|\s+का\s+मौसम)/,
    /(?:मौसम|तापमान).*?([अ-ह\s]+?)(?:\s+में|$)/
  ];

  for (const pattern of cityPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let city = match[1].trim();
      // Clean up common words and non-city phrases
      city = city.replace(/\b(today|tomorrow|now|please|कृपया|お願いします|the|about|me|tell)\b/gi, '').trim();
      // Only accept valid looking city names (letters, spaces, some punctuation)
      if (city.length > 2 && city.length < 50 && /^[a-zA-Zあ-んア-ン一-龯अ-ह\s,.-]+$/.test(city)) {
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
    if (text.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }
  
  // Default fallback
  return 'Tokyo';
}

// Test cases
const testCases = [
  "What's the weather in London?",
  "How is the weather in New York today?",
  "Tell me about the weather in Paris",
  "Tokyo weather forecast",
  "tell me about the weather", // This should fallback to Tokyo
  "weather in Delhi",
  "Mumbai temperature",
  "東京の天気は？",
  "दिल्ली में मौसम कैसा है?"
];

console.log("City Detection Test Results:");
testCases.forEach(test => {
  const result = extractCityFromText(test);
  console.log(`"${test}" -> "${result}"`);
});