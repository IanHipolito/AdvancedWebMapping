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
import axios from 'axios';
import '../styles/stylesheet.css';

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

interface LocationData {
  latitude: number;
  longitude: number;
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
  const [loading, setLoading] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const navigate = useNavigate();

  const customIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const bookmarkedIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const userIcon = L.icon({
    iconUrl: 'https://cdn2.iconfinder.com/data/icons/map-and-navigation-12/48/53-512.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    // Retrieve bookmarks from localStorage if available
    const savedBookmarks = localStorage.getItem('bookmarks');
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  });

  const toggleBookmark = (hospitalName: string) => {
    setBookmarks((prevBookmarks) => {
      let updatedBookmarks;

      if (prevBookmarks.includes(hospitalName)) {
        // Remove bookmark
        updatedBookmarks = prevBookmarks.filter((name) => name !== hospitalName);
      } else {
        // Add bookmark
        updatedBookmarks = [...prevBookmarks, hospitalName];
      }

      // Update localStorage
      localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
      return updatedBookmarks; // Update state
    });
  };

  const fitMapBounds = (data: Hospital[]) => {
    if (!mapRef.current) return;
    const bounds = L.latLngBounds([]);
    data.forEach((hospital) => {
      const coordinates = hospital.geometry.coordinates;
      bounds.extend([coordinates[1], coordinates[0]]);
    });
    if (bounds.isValid()) mapRef.current.fitBounds(bounds, { padding: [20, 20] });
  };

  const renderMarkers = (data: Hospital[]) => {
    if (!mapRef.current) return;
    if (markersRef.current) markersRef.current.clearLayers();
    else markersRef.current = L.markerClusterGroup();

    data.forEach((hospital) => {
      const coordinates = hospital.geometry.coordinates;
      const { name, address1, eircode } = hospital.properties;
      const isBookmarked = bookmarks.includes(name);

      const marker = L.marker([coordinates[1], coordinates[0]], {
        icon: isBookmarked ? bookmarkedIcon : customIcon,
      });

      const createPopupContent = () => `
      <div>
        <strong>${name}</strong><br>
        ${address1}<br>
        ${eircode}<br><br>
        <button id="route-btn-${name.replace(/\s+/g, '-')}">Get Route</button>
        <button id="bookmark-btn-${name.replace(/\s+/g, '-')}">
          ${isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
        </button>
      </div>
    `;
      marker.bindPopup(createPopupContent);
      markersRef.current?.addLayer(marker);

      marker.on('popupopen', () => {
        const bookmarkButton = document.getElementById(`bookmark-btn-${name.replace(/\s+/g, '-')}`);

        if (bookmarkButton) {
          bookmarkButton.addEventListener('click', () => {
            toggleBookmark(name);
            // Update popup content dynamically without closing it
            renderMarkers(data);
          });
        }
      });

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
                    // Display a popup with route details and a close button
                    const popupContent = `
                      <div>
                        <strong>Route Information</strong><br>
                        Distance: ${distance} km<br>
                        Time: ${time} min<br><br>
                        <button id="close-route-popup">Close</button>
                      </div>
                    `;

                    // Open popup on the hospital location
                    const popup = L.popup()
                      .setLatLng(hospitalLatLng)
                      .setContent(popupContent)
                      .openOn(mapRef.current!);

                    // Add close button functionality
                    document.getElementById('close-route-popup')?.addEventListener('click', () => {
                      mapRef.current?.closePopup(); // Close the popup
                      if (routingControlRef.current) {
                        mapRef.current?.removeControl(routingControlRef.current); // Remove the route
                        routingControlRef.current = null; // Clear reference
                      }
                    });
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

      markersRef.current?.addLayer(marker);
    });

    mapRef.current!.addLayer(markersRef.current!);
  };

  const fetchHospitals = async () => {
    setLoading(true);
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
    fitMapBounds(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const sendLocationToBackend = async (latitude: number, longitude: number): Promise<void> => {
    const data = { latitude, longitude };
    try {
      const response = await axios.post(
        'http://localhost:8001/hospital/update_location/',
        data, // Sending coordinates
        {
          headers: {
            Authorization: `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(response.data); // Log server response
    } catch (error) {
      console.error('Error updating location:', error); // Handle errors
    }
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
          const { latitude, longitude } = position.coords;
          const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
          userMarkerRef.current = L.marker(userLatLng, { icon: userIcon }).addTo(mapRef.current!);
          const userCircle = L.circle(userLatLng, {
            color: 'blue',       // Circle border color
            fillColor: '#3a7bd5', // Fill color
            fillOpacity: 0.2,    // Opacity
            radius: 500          // Radius in meters
          }).addTo(mapRef.current!);
          mapRef.current?.setView(userLatLng, 12);

          // Send location to backend
          sendLocationToBackend(latitude, longitude);
        },
        () => alert('Failed to retrieve user location.')
      );

      fetchHospitals();
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return; // Ensure the map is initialized before rendering markers

    const filtered = showBookmarksOnly
      ? hospitals.filter((hospital) => bookmarks.includes(hospital.properties.name))
      : hospitals;

    renderMarkers(filtered); // Render markers based on the filter
    fitMapBounds(filtered);  // Fit map bounds dynamically based on filtered hospitals
  }, [showBookmarksOnly, bookmarks]);


  return (
    <div>
      <nav className="navbar">
        <div>Hospital Locator</div>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <input
        type="text"
        placeholder="Search hospitals..."
        className="search-bar"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <label className="bookmark-filter">
        <input
          type="checkbox"
          checked={showBookmarksOnly}
          onChange={(e) => setShowBookmarksOnly(e.target.checked)}
        />
        Show Only Bookmarks
      </label>
      <div ref={mapContainerRef} id="map" style={{ height: '600px' }}></div>
    </div>
  );
};

export default MapPage;