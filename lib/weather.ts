import { LocationSuggestion } from "@/types/weather";

export const fetchWeatherData = async (
  lat: number,
  lon: number
): Promise<any> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
    );

    if (!response.ok) {
      throw new Error("Weather data fetch failed");
    }

    const data = await response.json();

    // Transform Open-Meteo data to match our WeatherData interface
    return {
      main: {
        temp: data.current.temperature_2m,
        feels_like: data.current.apparent_temperature,
        temp_min: data.daily.temperature_2m_min[0],
        temp_max: data.daily.temperature_2m_max[0],
        humidity: data.current.relative_humidity_2m,
      },
      weather: [
        {
          id: data.current.weather_code,
          main: getWeatherDescription(data.current.weather_code),
          description: getWeatherDescription(data.current.weather_code),
          icon: getWeatherIcon(data.current.weather_code),
        },
      ],
      wind: {
        speed: data.current.wind_speed_10m,
        deg: data.current.wind_direction_10m,
      },
      sys: {
        sunrise: new Date(data.daily.sunrise[0]).getTime() / 1000,
        sunset: new Date(data.daily.sunset[0]).getTime() / 1000,
      },
      name: "", // Will be set by geocoding
      cod: 200,
    };
  } catch (error) {
    console.error("Weather API Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch weather data"
    );
  }
};

export const searchLocations = async (
  query: string
): Promise<LocationSuggestion[]> => {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query
      )}&count=5&language=en&format=json`
    );

    if (!response.ok) {
      throw new Error("Location search failed");
    }

    const data = await response.json();

    if (!data.results) {
      return [];
    }

    return data.results.map((location: any) => ({
      name: location.name,
      country: location.country,
      lat: location.latitude,
      lon: location.longitude,
    }));
  } catch (error) {
    console.error("Location API Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to search locations"
    );
  }
};

// Weather code mapping functions
function getWeatherDescription(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return weatherCodes[code] || "Unknown";
}

function getWeatherIcon(code: number): string {
  // Map WMO codes to similar conditions for our existing UI
  if (code === 0) return "01d"; // Clear sky
  if (code === 1) return "02d"; // Mainly clear
  if (code === 2) return "03d"; // Partly cloudy
  if (code === 3) return "04d"; // Overcast
  if (code >= 45 && code <= 48) return "50d"; // Fog
  if (code >= 51 && code <= 55) return "09d"; // Drizzle
  if (code >= 61 && code <= 65) return "10d"; // Rain
  if (code >= 71 && code <= 77) return "13d"; // Snow
  if (code >= 80 && code <= 82) return "09d"; // Rain showers
  if (code >= 85 && code <= 86) return "13d"; // Snow showers
  if (code >= 95) return "11d"; // Thunderstorm
  return "50d"; // Default
}
