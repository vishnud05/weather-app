'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { LocationSuggestion } from '@/types/weather';
import { searchLocations } from '@/lib/weather';

interface SearchBarProps {
  onLocationSelect: (location: LocationSuggestion) => void;
  isLoading: boolean;
}

export default function SearchBar({ onLocationSelect, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      setSearchError(null);
      return;
    }

    clearTimeout(debounceTimer.current);
    setIsSearching(true);
    setSearchError(null);

    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
        if (results.length === 0) {
          setSearchError('No locations found');
        }
      } catch (error) {
        setSearchError('Failed to search locations. Please try again.');
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a city..."
          className="w-full px-4 py-2 pl-10 bg-white/10 backdrop-blur-md rounded-lg 
            border border-white/20 text-white placeholder-white/50 focus:outline-none 
            focus:ring-2 focus:ring-white/30"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isLoading || isSearching ? (
            <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-white/50" />
          )}
        </div>
      </div>

      {searchError && (
        <div className="absolute w-full mt-2 px-4 py-2 bg-red-500/20 backdrop-blur-md rounded-lg 
          border border-red-500/20 text-white text-sm">
          {searchError}
        </div>
      )}

      {suggestions.length > 0 && !searchError && (
        <div className="absolute w-full mt-2 bg-white/10 backdrop-blur-md rounded-lg 
          border border-white/20 overflow-hidden z-50">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.name}-${suggestion.country}-${index}`}
              onClick={() => {
                onLocationSelect(suggestion);
                setQuery('');
                setSuggestions([]);
                setSearchError(null);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-white/20 
                transition-colors border-b border-white/10 last:border-b-0"
            >
              {suggestion.name}, {suggestion.country}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}