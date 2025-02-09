"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { fetchWeatherData } from "@/lib/weather";
import {
  WeatherData,
  SavedLocation,
  LocationSuggestion,
} from "@/types/weather";
import WeatherCard from "@/components/WeatherCard";
import SearchBar from "@/components/SearchBar";
import SavedLocations from "@/components/SavedLocations";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [savedLocations, setSavedLocations] = useLocalStorage<SavedLocation[]>(
    "savedLocations",
    []
  );

  const handleLocationSelect = async (location: LocationSuggestion) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherData(location.lat, location.lon);
      data.name = location.name;
      setWeatherData(data);

      const locationId = `${location.lat}-${location.lon}`;
      if (!savedLocations.some((loc) => loc.id === locationId)) {
        const recentLocations = savedLocations.slice(-4);
        setSavedLocations([
          ...recentLocations,
          {
            id: locationId,
            name: location.name,
            country: location.country,
          },
        ]);
      } else {
        const updatedLocations = savedLocations
          .filter((loc) => loc.id !== locationId)
          .concat({
            id: locationId,
            name: location.name,
            country: location.country,
          });
        setSavedLocations(updatedLocations);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch weather data. Please try again."
      );
      console.error("Weather fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationRemove = (id: string) => {
    setSavedLocations(savedLocations.filter((location) => location.id !== id));
  };

  const handleSavedLocationSelect = async (location: SavedLocation) => {
    const [lat, lon] = location.id.split("-").map(Number);
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherData(lat, lon);
      data.name = location.name;
      setWeatherData(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch weather data. Please try again."
      );
      console.error("Weather fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentLocation = async (position: GeolocationPosition) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(
        position.coords.latitude,
        position.coords.longitude
      );
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&format=json`
        );
        const locationData = await response.json();
        if (locationData.results?.[0]) {
          data.name = locationData.results[0].name;
        } else {
          data.name = "Current Location";
        }
      } catch (error) {
        data.name = "Current Location";
      }
      setWeatherData(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch weather data. Please try again."
      );
      console.error("Weather fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!weatherData && navigator.geolocation) {
      setError(null);
      navigator.geolocation.getCurrentPosition(fetchCurrentLocation, (err) => {
        console.error("Geolocation error:", err);
        if (!weatherData) {
          setError(
            "Unable to get your location. Please search for a city manually."
          );
        }
      });
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-500 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col items-center space-y-6">
          <SearchBar
            onLocationSelect={handleLocationSelect}
            isLoading={isLoading}
          />

          <SavedLocations
            locations={savedLocations}
            onLocationSelect={handleSavedLocationSelect}
            onLocationRemove={handleLocationRemove}
          />

          {error && (
            <div className="w-full max-w-md p-4 bg-red-500/20 backdrop-blur-md rounded-lg border border-red-500/20 text-white text-center">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : weatherData ? (
            <WeatherCard
              data={weatherData}
              onToggleUnit={() => setIsCelsius(!isCelsius)}
              isCelsius={isCelsius}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
