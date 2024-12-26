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
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

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
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    name: string;
    address1: string;
    eircode: string;
  };
}

const MapPage: React.FC<MapPageProps> = ({ updateLocationUrl }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      markersRef.current = L.markerClusterGroup();
    }

    data.forEach((hospital: Hospital) => {
      const coordinates: [number, number] = hospital.geometry.coordinates;
      const { name, address1, eircode } = hospital.properties;

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
      markersRef.current?.addLayer(marker);

      marker.on('popupopen', () => {
        const routeButton = document.getElementById(`route-btn-${name.replace(/\s+/g, '-')}`);

        if (routeButton) {
          routeButton.addEventListener('click', () => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
                  const hospitalLatLng = L.latLng(coordinates[1], coordinates[0]);

                  if (routingControlRef.current) {
                    routingControlRef.current.getPlan().setWaypoints([]);
                    mapRef.current?.removeControl(routingControlRef.current);
                    routingControlRef.current = null;
                  }

                  routingControlRef.current = L.Routing.control({
                    waypoints: [userLatLng, hospitalLatLng],
                    routeWhileDragging: false,
                    fitSelectedRoutes: true,
                    show: true,
                    createMarker: () => null,
                    router: L.Routing.osrmv1({
                      serviceUrl: 'https://router.project-osrm.org/route/v1'
                    })
                  } as L.Routing.RoutingControlOptions).addTo(mapRef.current!);

                  routingControlRef.current.on('routesfound', (e: any) => {
                    const routes = e.routes[0];
                    const distance = (routes.summary.totalDistance / 1000).toFixed(2);
                    const time = (routes.summary.totalTime / 60).toFixed(0);
                    alert(`Distance: ${distance} km\nTime: ${time} mins`);
                  });

                  routingControlRef.current.on('routingerror', () => {
                    alert('Failed to calculate route. Please try again.');
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

      mapRef.current!.addLayer(markersRef.current!);
    });
  };

  const fetchHospitals = async () => {
    try {
      const response = await fetch('http://localhost:8001/hospital/api/hospitals/');
      const data = await response.json();
      if (data.features) {
        setHospitals(data.features);
        setFilteredHospitals(data.features);
        renderMarkers(data.features);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
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
      <h2>Hospitals Near You</h2>
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
