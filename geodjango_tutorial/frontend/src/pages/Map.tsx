import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet-minimap';
import 'leaflet-minimap/dist/Control.MiniMap.min.js';
import 'leaflet-minimap/dist/Control.MiniMap.min.css';

// Extend L.Control to include MiniMap
declare module 'leaflet' {
  namespace Control {
    class MiniMap extends Control {
      constructor(layer: Layer, options?: any);
    }
  }
}

interface MapPageProps {
  updateLocationUrl: string;
}

const MapPage: React.FC<MapPageProps> = ({ updateLocationUrl }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);

  // Fetch CSRF Token
  const fetchCSRFToken = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/csrf_token/');
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

  // Fix Leaflet Marker Icon Issue
  const customIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Render Markers
  const renderMarkers = (data: Hospital[]) => {
    if (!mapRef.current) return;

    if (markersRef.current) {
      markersRef.current.clearLayers(); // Clear existing markers
    } else {
      markersRef.current = L.markerClusterGroup();
    }

    data.forEach((hospital: Hospital) => {
      const coordinates: [number, number] = hospital.geometry.coordinates;
      const { name, address1, eircode } = hospital.properties;

      const marker = L.marker([coordinates[1], coordinates[0]], { icon: customIcon });
      marker.bindPopup(`<strong>${name}</strong><br>${address1}<br>${eircode}`);
      markersRef.current?.addLayer(marker);
    });

    mapRef.current.addLayer(markersRef.current);
  };

  // Fetch Hospitals
  const fetchHospitals = async () => {
    if (!mapRef.current) return;

    try {
      const response = await fetch('http://localhost:8001/hospital/api/hospitals/');
      const data = await response.json();

      if (data.features) {
        setHospitals(data.features);
        setFilteredHospitals(data.features);
        renderMarkers(data.features);
      } else {
        console.error('No hospital features found');
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  // Search Hospitals
  interface Hospital {
    geometry: {
      coordinates: [number, number];
    };
    properties: {
      name: string;
      address1: string;
      eircode: string;
    };
  }

  const handleSearch = (query: string) => {
    const filtered = hospitals.filter((hospital: Hospital) =>
      hospital.properties.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredHospitals(filtered);
    renderMarkers(filtered);
  };

  // Fetch User Location
  const fetchUserLocation = () => {
    if (!mapRef.current) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          const userIcon = L.icon({
            iconUrl: 'https://cdn2.iconfinder.com/data/icons/map-and-navigation-12/48/53-512.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });

          L.marker([latitude, longitude], { icon: userIcon }).addTo(mapRef.current!);
          L.circle([latitude, longitude], { radius: accuracy, color: 'blue' }).addTo(mapRef.current!);
          mapRef.current!.setView([latitude, longitude], 13);

          fetch(updateLocationUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-CSRFToken': csrfToken,
            },
            body: `latitude=${latitude}&longitude=${longitude}`,
          })
            .then((response) => response.json())
            .then((data) => console.log('Location updated:', data))
            .catch((error) => console.error('Error updating location:', error));
        },
        (error) => console.error('Error getting location:', error)
      );
    } else {
      console.error('Geolocation not supported by browser.');
    }
  };

  // Initialize Map
  useEffect(() => {
    fetchCSRFToken();

    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([53.3498, -6.2603], 10);

      const mainTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      });
      mainTileLayer.addTo(mapRef.current);

      const miniMapTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
      const miniMap = new L.Control.MiniMap(miniMapTileLayer, {
        toggleDisplay: true,
        minimized: false,
        position: 'bottomright',
      }).addTo(mapRef.current);

      fetchHospitals();
      fetchUserLocation();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <h2>Hospitals Near You</h2>
      <input
        type="text"
        placeholder="Search hospitals..."
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: '10px', padding: '8px', width: '100%' }}
      />
      <div ref={mapContainerRef} id="map" style={{ height: '600px' }}></div>
    </div>
  );
};

export default MapPage;
