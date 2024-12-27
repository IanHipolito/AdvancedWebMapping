import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet-minimap';
import 'leaflet-minimap/dist/Control.MiniMap.min.js';
import 'leaflet-minimap/dist/Control.MiniMap.min.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import Axios from '../services/Axios';
import axios, { AxiosError } from 'axios';

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

interface Hospital {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    name: string;
    address1: string;
    eircode: string;
  };
}

// interface HospitalResponse {
//   type: string;
//   features: Hospital[];
// }

const MapPage: React.FC<MapPageProps> = ({ updateLocationUrl }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  const customIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const userIcon = L.icon({
    iconUrl: 'https://cdn2.iconfinder.com/data/icons/map-and-navigation-12/48/53-512.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const renderMarkers = (data: Hospital[]) => {
    if (!mapRef.current) return;

    if (markersRef.current) {
      markersRef.current.clearLayers();
    } else {
      markersRef.current = L.markerClusterGroup(); // Create cluster group
    }

    data.forEach((hospital: Hospital) => {
      const coordinates = hospital.geometry.coordinates;

      // Defensive check for valid coordinates
      if (!coordinates || coordinates.length < 2) {
        console.error('Invalid coordinates for hospital:', hospital);
        return;
      }

      const { name, address1, eircode } = hospital.properties;

      // Create marker
      const marker = L.marker([coordinates[1], coordinates[0]], { icon: customIcon, draggable: false });

      const popupContent = `
            <div>
                <strong>${name}</strong><br>
                ${address1}<br>
                ${eircode}<br><br>
                <button id="route-btn-${name.replace(/\s+/g, '-')}">Get Route</button>
            </div>
        `;
      marker.bindPopup(popupContent);
      markersRef.current?.addLayer(marker); // Add marker to cluster group

      // Add route functionality
      marker.on('popupopen', () => {
        const routeButton = document.getElementById(`route-btn-${name.replace(/\s+/g, '-')}`);
        if (routeButton) {
          routeButton.addEventListener('click', () => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
                  const hospitalLatLng = L.latLng(coordinates[1], coordinates[0]);

                  // Clear previous route if exists
                  if (routingControlRef.current) {
                    routingControlRef.current.getPlan().setWaypoints([]);
                    mapRef.current?.removeControl(routingControlRef.current);
                    routingControlRef.current = null;
                  }

                  // Create new route
                  routingControlRef.current = L.Routing.control({
                    waypoints: [userLatLng, hospitalLatLng],
                    routeWhileDragging: true,
                    fitSelectedRoutes: true,
                    show: true,
                    createMarker: () => null,
                    router: L.Routing.osrmv1({
                      serviceUrl: 'https://router.project-osrm.org/route/v1'
                    })
                  } as L.Routing.RoutingControlOptions).addTo(mapRef.current!);

                  routingControlRef.current.on('routesfound', (e: any) => {
                    const route = e.routes[0];
                    const distance = (route.summary.totalDistance / 1000).toFixed(2);
                    const time = (route.summary.totalTime / 60).toFixed(0);
                    alert(`Distance: ${distance} km\nTime: ${time} mins`);
                  });

                  routingControlRef.current.on('routingerror', () => {
                    alert('Failed to calculate route.');
                  });
                },
                () => alert('Failed to retrieve user location.'),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
              );
            } else {
              alert('Geolocation is not supported by this browser.');
            }
          });
        }
      });
    });

    // Add cluster group to the map
    mapRef.current!.addLayer(markersRef.current!);
  };

  const fetchHospitals = async () => {
    try {
      const response = await Axios.get('/api/hospitals/');
      console.log('API Response:', response.data);

      // Check for valid GeoJSON format
      if (response.data.type === "FeatureCollection") {
        const features = response.data.features; // Extract features

        setHospitals(features); // Update state
        setFilteredHospitals(features);
        renderMarkers(features); // Render markers
      } else {
        console.error('Invalid data format:', response.data);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching hospitals:', error);

        if (error.response && error.response.status === 401) {
          alert('Unauthorized: Please log in again.');
          navigate('/login');
        } else {
          alert('An error occurred while fetching hospital data.');
        }
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };


  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // Filter hospitals based on the search query
    const filtered = hospitals.filter((hospital) =>
      hospital.properties.name.toLowerCase().includes(query.toLowerCase()) ||
      hospital.properties.address1.toLowerCase().includes(query.toLowerCase()) ||
      hospital.properties.eircode.toLowerCase().includes(query.toLowerCase())
    );

    // Update the filtered hospitals and re-render markers
    setFilteredHospitals(filtered);
    renderMarkers(filtered);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([53.3498, -6.2603], 10);
      const mainTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      });
      mainTileLayer.addTo(mapRef.current);
      const miniMapTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
      new L.Control.MiniMap(miniMapTileLayer, {
        toggleDisplay: true,
        minimized: false,
        position: 'bottomright',
        width: 150,
        height: 150,
        zoomLevelOffset: -5,
      }).addTo(mapRef.current);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
          userMarkerRef.current = L.marker(userLatLng, { icon: userIcon }).addTo(mapRef.current!);
          mapRef.current?.setView(userLatLng, 12);
        },
        () => alert('Failed to retrieve user location.')
      );

      fetchHospitals();
    }
  }, []);

  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#333', color: '#fff' }}>
        <div>Hospital Locator</div>
        <button onClick={handleLogout} style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '10px' }}>Logout</button>
      </nav>
      <input
        type="text"
        placeholder="Search hospitals..."
        style={{ marginBottom: '10px', padding: '8px', width: '100%' }}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <div ref={mapContainerRef} id="map" style={{ height: '600px' }}></div>
    </div>
  );
};

export default MapPage;