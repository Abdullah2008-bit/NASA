"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCitySearch } from "@/hooks/useCitySearch";
import { debounce } from "@/lib/utils";

interface CitySearchProps {
  onSelect: (city: { name: string; lat: number; lon: number; country?: string }) => void;
  compact?: boolean;
  allowCountry?: boolean;
}

export const CitySearch: React.FC<CitySearchProps> = ({ onSelect, compact = false, allowCountry = true }) => {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [internalQuery, setInternalQuery] = useState("");

  const { cities, isLoading, isError } = useCitySearch(internalQuery, country || undefined);

  // Stable debounced setter
  const debouncedRef = useRef<(val: string) => void | null>(null);
  if (!debouncedRef.current) {
    debouncedRef.current = debounce((val: string) => setInternalQuery(val), 300);
  }
  useEffect(() => {
    debouncedRef.current!(query);
  }, [query]);

  return (
    <div className={`space-y-3 ${compact ? "p-0" : "p-4"}`}>
      <div className={`flex gap-2 ${compact ? "flex-col" : "flex-row"}`}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city name..."
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        {allowCountry && (
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0,2))}
            placeholder="CC"
            maxLength={2}
            className="w-16 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 text-center focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            title="2-letter country code"
          />
        )}
      </div>
      <div className="relative">
        <div className="max-h-72 overflow-auto rounded-lg border border-white/10 bg-black/40 divide-y divide-white/5 backdrop-blur-xl">
          <AnimatePresence mode="popLayout">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 text-sm text-white/50"
              >
                Loading...
              </motion.div>
            )}
            {isError && !isLoading && (
              <div className="p-4 text-sm text-red-400">Error loading cities</div>
            )}
            {!isLoading && !isError && cities.length === 0 && (
              <div className="p-4 text-sm text-white/40">No results</div>
            )}
            {!isLoading && !isError && cities.map((c) => (
              <motion.button
                key={`${c.id}-${c.lat}-${c.lon}`}
                onClick={() => onSelect({ name: c.name || c.city || "Unknown", lat: c.lat, lon: c.lon, country: c.country })}
                className="w-full text-left px-4 py-2 hover:bg-white/10 text-sm text-white flex items-center justify-between"
                whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                <span className="truncate pr-4">{c.name || c.city}</span>
                <span className="text-white/40 text-xs">{c.country}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
