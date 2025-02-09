export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
  };
  name: string;
  cod: number;
}

export interface SavedLocation {
  id: string;
  name: string;
  country: string;
}

export interface LocationSuggestion {
  name: string;
  country: string;
  lat: number;
  lon: number;
}