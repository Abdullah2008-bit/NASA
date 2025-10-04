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

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
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
export function throttle<T extends (...args: any[]) => any>(
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
