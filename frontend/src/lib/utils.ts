import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes efficiently
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get AQI color based on value
 * @param aqi Air Quality Index value (0-500)
 * @returns Color class for AQI level
 */
export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "text-green-500"; // Good
  if (aqi <= 100) return "text-yellow-500"; // Moderate
  if (aqi <= 150) return "text-orange-500"; // Unhealthy for Sensitive Groups
  if (aqi <= 200) return "text-red-500"; // Unhealthy
  if (aqi <= 300) return "text-purple-500"; // Very Unhealthy
  return "text-maroon-500"; // Hazardous
}

/**
 * Get AQI level description
 */
export function getAQILevel(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

/**
 * Get AQI background gradient
 */
export function getAQIGradient(aqi: number): string {
  if (aqi <= 50) return "from-green-400 to-green-600";
  if (aqi <= 100) return "from-yellow-400 to-yellow-600";
  if (aqi <= 150) return "from-orange-400 to-orange-600";
  if (aqi <= 200) return "from-red-400 to-red-600";
  if (aqi <= 300) return "from-purple-400 to-purple-600";
  return "from-red-700 to-red-900";
}

// Basic AQI calculation (simplified) using PM2.5, O3 (8h proxy), NO2 if available.
// This is a heuristic placeholder until backend provides authoritative AQI.
// Returns integer AQI.
export function computeAQI(p: {
  pm25?: number;
  o3?: number;
  no2?: number;
  hcho?: number;
}): number {
  const subIndices: number[] = [];
  // PM2.5 (µg/m3) EPA breakpoints simplified
  if (p.pm25 != null) {
    const v = p.pm25;
    if (v <= 12) subIndices.push((50 / 12) * v);
    else if (v <= 35.4) subIndices.push(50 + (v - 12.1) * (50 / (35.4 - 12.1)));
    else if (v <= 55.4)
      subIndices.push(100 + (v - 35.5) * (50 / (55.4 - 35.5)));
    else if (v <= 150.4)
      subIndices.push(150 + (v - 55.5) * (50 / (150.4 - 55.5)));
    else if (v <= 250.4)
      subIndices.push(200 + (v - 150.5) * (100 / (250.4 - 150.5)));
    else subIndices.push(300 + (v - 250.5) * (100 / (350.4 - 250.5)));
  }
  // O3 (ppb) simplified (assuming 8h) breakpoints
  if (p.o3 != null) {
    const v = p.o3;
    if (v <= 54) subIndices.push((50 / 54) * v);
    else if (v <= 70) subIndices.push(50 + (v - 55) * (50 / (70 - 55)));
    else if (v <= 85) subIndices.push(100 + (v - 71) * (50 / (85 - 71)));
    else if (v <= 105) subIndices.push(150 + (v - 86) * (50 / (105 - 86)));
    else if (v <= 200) subIndices.push(200 + (v - 106) * (100 / (200 - 106)));
  }
  // NO2 (ppb) rough scaling up to moderate levels
  if (p.no2 != null) {
    const v = p.no2;
    if (v <= 53) subIndices.push((50 / 53) * v);
    else if (v <= 100) subIndices.push(50 + (v - 54) * (50 / (100 - 54)));
    else if (v <= 360) subIndices.push(100 + (v - 101) * (50 / (360 - 101)));
    else if (v <= 649) subIndices.push(150 + (v - 361) * (50 / (649 - 361)));
  }
  if (!subIndices.length) return 0;
  return Math.round(Math.max(...subIndices));
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
