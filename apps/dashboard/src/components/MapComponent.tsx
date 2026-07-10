"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in React Leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const OSM_CATEGORY_MAPPING: Record<string, string> = {
  "Plumbers": "craft=plumber",
  "Real Estate Agents": "office=estate_agent",
  "Software Companies": "office=it",
  "Restaurants": "amenity=restaurant",
  "Dentists": "amenity=dentist",
  "Lawyers": "office=lawyer",
  "Hospitals": "amenity=hospital",
  "Schools": "amenity=school",
  "Gyms & Fitness Centers": "leisure=fitness_centre",
  "Beauty Salons": "shop=beauty",
  "Car Dealerships": "shop=car",
  "Pharmacies": "amenity=pharmacy",
  "Marketing Agencies": "office=advertising_agency",
  "Hotels": "tourism=hotel",
  "Banks & Credit Unions": "amenity=bank",
  "Supermarkets": "shop=supermarket",
};

// Component to dynamically update map center
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface MapComponentProps {
  locationQuery: string;
  keywordQuery: string;
}

export default function MapComponent({ locationQuery, keywordQuery }: MapComponentProps) {
  const [center, setCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NY
  const [zoom, setZoom] = useState(13);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [markers, setMarkers] = useState<{lat: number, lon: number, name: string}[]>([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!locationQuery || locationQuery.trim().length < 3) return;

    const geocodeLocation = async () => {
      setIsGeocoding(true);
      try {
        // Step 1: Always get the location bounding box via Nominatim
        const locationRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=1`);
        if (!locationRes.ok) {
          console.warn(`Nominatim HTTP error! status: ${locationRes.status}`);
          setMarkers([]);
          return;
        }
        const locationText = await locationRes.text();
        const locationData = JSON.parse(locationText);

        if (locationData && locationData.length > 0) {
          const loc = locationData[0];
          const bb = loc.boundingbox; // [south, north, west, east]
          setCenter([parseFloat(loc.lat), parseFloat(loc.lon)]);
          setZoom(12);

          setMarkers([]);
        }
      } catch (error) {
        console.warn("Failed to geocode location:", error);
      } finally {
        setIsGeocoding(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      geocodeLocation();
    }, 1000); // 1s debounce to avoid API spam

    return () => clearTimeout(debounceTimer);
  }, [locationQuery, keywordQuery]);

  if (!mounted) {
    return <div className="w-full h-full bg-bg-secondary animate-pulse rounded-3xl border border-border-color shadow-sm"></div>;
  }

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-sm border border-border-color">
      {isGeocoding && (
        <div className="absolute top-4 right-4 z-[1000] bg-white text-accent-primary px-3 py-1 rounded-full shadow-md text-xs font-bold animate-pulse flex items-center gap-2">
          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Searching Map...
        </div>
      )}
      

      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {markers.length > 0 ? (
          markers.map((marker, i) => (
            <Marker key={i} position={[marker.lat, marker.lon]} icon={icon}>
              <Popup>{marker.name}</Popup>
            </Marker>
          ))
        ) : (
          <Marker position={center} icon={icon}>
            <Popup>
              {keywordQuery ? `Targeting: ${keywordQuery} in ${locationQuery}` : locationQuery ? `Target Area: ${locationQuery}` : 'Target Area'}
            </Popup>
          </Marker>
        )}
        
        <MapUpdater center={center} zoom={zoom} />
      </MapContainer>
    </div>
  );
}
