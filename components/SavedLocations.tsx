'use client';

import { SavedLocation } from '@/types/weather';
import { MapPin, X } from 'lucide-react';

interface SavedLocationsProps {
  locations: SavedLocation[];
  onLocationSelect: (location: SavedLocation) => void;
  onLocationRemove: (id: string) => void;
}

export default function SavedLocations({
  locations,
  onLocationSelect,
  onLocationRemove,
}: SavedLocationsProps) {
  if (locations.length === 0) return null;

  return (
    <div className="w-full max-w-md">
      <h3 className="text-white/80 mb-2 font-medium">Saved Locations</h3>
      <div className="space-y-2">
        {locations.map((location) => (
          <div
            key={location.id}
            className="flex items-center justify-between px-4 py-2 bg-white/10 
              backdrop-blur-md rounded-lg border border-white/20"
          >
            <button
              onClick={() => onLocationSelect(location)}
              className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>
                {location.name}, {location.country}
              </span>
            </button>
            <button
              onClick={() => onLocationRemove(location.id)}
              className="text-white/50 hover:text-white/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}