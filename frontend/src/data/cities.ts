// Canonical list of major cities (sample subset) including Pakistan entries
// Expandable: add more cities or replace with backend-driven list later.

export interface CityMeta {
  name: string;
  country: string; // ISO country name (display) or code
  lat: number;
  lon: number;
}

export const CITIES: CityMeta[] = [
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.006 },
  { name: "Los Angeles", country: "United States", lat: 34.0522, lon: -118.2437 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074 },
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  // Pakistan
  { name: "Karachi", country: "Pakistan", lat: 24.8607, lon: 67.0011 },
  { name: "Lahore", country: "Pakistan", lat: 31.5204, lon: 74.3587 },
  { name: "Islamabad", country: "Pakistan", lat: 33.6844, lon: 73.0479 },
  { name: "Faisalabad", country: "Pakistan", lat: 31.418, lon: 73.0791 },
  { name: "Peshawar", country: "Pakistan", lat: 34.0151, lon: 71.5249 },
  { name: "Quetta", country: "Pakistan", lat: 30.1798, lon: 66.975 },
  { name: "Multan", country: "Pakistan", lat: 30.1575, lon: 71.5249 },
];

export const COUNTRIES = Array.from(new Set(CITIES.map(c => c.country))).sort();
