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
  {
    name: "Los Angeles",
    country: "United States",
    lat: 34.0522,
    lon: -118.2437,
  },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074 },
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
  {
    name: "Johannesburg",
    country: "South Africa",
    lat: -26.2041,
    lon: 28.0473,
  },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332 },
  { name: "Toronto", country: "Canada", lat: 43.65107, lon: -79.347015 },
  { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173 },
  { name: "Delhi", country: "India", lat: 28.6139, lon: 77.209 },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.978 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
  {
    name: "Dubai",
    country: "United Arab Emirates",
    lat: 25.2048,
    lon: 55.2708,
  },
  { name: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964 },
  { name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038 },
  // Pakistan
  { name: "Karachi", country: "Pakistan", lat: 24.8607, lon: 67.0011 },
  { name: "Lahore", country: "Pakistan", lat: 31.5204, lon: 74.3587 },
  { name: "Islamabad", country: "Pakistan", lat: 33.6844, lon: 73.0479 },
  { name: "Faisalabad", country: "Pakistan", lat: 31.418, lon: 73.0791 },
  { name: "Peshawar", country: "Pakistan", lat: 34.0151, lon: 71.5249 },
  { name: "Quetta", country: "Pakistan", lat: 30.1798, lon: 66.975 },
  { name: "Multan", country: "Pakistan", lat: 30.1575, lon: 71.5249 },
];

export const COUNTRIES = Array.from(
  new Set(CITIES.map((c) => c.country))
).sort();
