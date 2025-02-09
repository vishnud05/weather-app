'use client';

import { useState } from 'react';
import { WeatherData } from '@/types/weather';
import { Sun, Moon, Wind, Droplets, ArrowDown, ArrowUp } from 'lucide-react';
import { format } from 'date-fns';

interface WeatherCardProps {
  data: WeatherData;
  onToggleUnit: () => void;
  isCelsius: boolean;
}

export default function WeatherCard({ data, onToggleUnit, isCelsius }: WeatherCardProps) {
  const convertTemp = (temp: number) => isCelsius ? temp : (temp * 9/5) + 32;
  const formatTemp = (temp: number) => `${Math.round(convertTemp(temp))}°${isCelsius ? 'C' : 'F'}`;

  const getTimeFromUnix = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'h:mm a');
  };

  const getWeatherGradient = (weatherId: number) => {
    if (weatherId >= 200 && weatherId < 300) return 'from-gray-700 to-gray-900'; // Thunderstorm
    if (weatherId >= 300 && weatherId < 400) return 'from-blue-400 to-gray-600'; // Drizzle
    if (weatherId >= 500 && weatherId < 600) return 'from-blue-500 to-gray-700'; // Rain
    if (weatherId >= 600 && weatherId < 700) return 'from-blue-100 to-gray-200'; // Snow
    if (weatherId >= 700 && weatherId < 800) return 'from-yellow-200 to-gray-400'; // Atmosphere
    if (weatherId === 800) return 'from-blue-400 to-blue-600'; // Clear
    return 'from-blue-300 to-gray-400'; // Clouds
  };

  return (
    <div className={`relative overflow-hidden rounded-xl backdrop-blur-md bg-white/10 p-6 shadow-lg 
      ${getWeatherGradient(data.weather[0].id)} transition-all duration-500`}>
      <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-br opacity-30" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">{data.name}</h2>
            <p className="text-lg text-white/80 capitalize">{data.weather[0].description}</p>
          </div>
          <button
            onClick={onToggleUnit}
            className="px-3 py-1 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            °{isCelsius ? 'C' : 'F'}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-white">
              {formatTemp(data.main.temp)}
            </p>
            <p className="text-white/80 mt-2">Feels like {formatTemp(data.main.feels_like)}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-white/80">
              <ArrowUp className="w-4 h-4" />
              <span>{formatTemp(data.main.temp_max)}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <ArrowDown className="w-4 h-4" />
              <span>{formatTemp(data.main.temp_min)}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Wind className="w-4 h-4" />
              <span>{Math.round(data.wind.speed)} m/s</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Droplets className="w-4 h-4" />
              <span>{data.main.humidity}%</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center text-white/80">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            <span>{getTimeFromUnix(data.sys.sunrise)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            <span>{getTimeFromUnix(data.sys.sunset)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}