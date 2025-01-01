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

// Extend Leaflet Control namespace to include MiniMap
declare module 'leaflet' {
  namespace Control {
    class MiniMap extends Control {
      constructor(layer: Layer, options?: any);
    }
  }
}

// Hospital interface for API response data structure
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
    subcategory: string;
  };
}

// Map page component
const MapPage: React.FC = () => {
  // State variables for map, hospitals, and filtered hospitals
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
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

  // Custom marker icons
  const customIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // User icon for geolocation
  const userIcon = L.icon({
    iconUrl: 'https://cdn2.iconfinder.com/data/icons/map-and-navigation-12/48/53-512.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // State variable for bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const savedBookmarks = localStorage.getItem('bookmarks');
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  });

  // Toggle bookmark status for a hospital
  const toggleBookmark = (hospitalName: string) => {
    // Update bookmarks in localStorage and state
    setBookmarks((prevBookmarks) => {
      const updatedBookmarks = prevBookmarks.includes(hospitalName)
        ? prevBookmarks.filter((name) => name !== hospitalName)
        : [...prevBookmarks, hospitalName];
      localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
      return updatedBookmarks;
    });
  };

  // Fit map bounds to show all hospitals on the map view
  const fitMapBounds = (data: Hospital[]) => {
    // Check if mapRef is initialized before proceeding with map operations
    if (!mapRef.current) return;
    const bounds = L.latLngBounds([]);
    // Extend bounds for each hospital location
    data.forEach((hospital) => {
      const coordinates = hospital.geometry.coordinates;
      bounds.extend([coordinates[1], coordinates[0]]);
    });
    if (bounds.isValid()) mapRef.current.fitBounds(bounds, { padding: [20, 20] });
  };

  // Filter hospitals by subcategory and bookmarks and update map markers accordingly
  const handleSubcategoryFilter = (subcategory: string) => {
    // Normalize subcategory name for consistency
    const normalizedSubcategory = subcategory === "GeneralAcute" ? "General/Acute" : subcategory;
    setSelectedSubcategory(normalizedSubcategory);

    // Filter hospitals based on subcategory and bookmarks
    const filtered = hospitals.filter((hospital) => {
      const matchesSubcategory =
        normalizedSubcategory === '' || hospital.properties.subcategory === normalizedSubcategory;

      const matchesBookmark =
        !showBookmarksOnly || bookmarks.includes(hospital.properties.name);

      return matchesSubcategory && matchesBookmark;
    });

    // Update filtered hospitals and map markers
    setFilteredHospitals(filtered);
    renderMarkers(filtered);
    fitMapBounds(filtered);
  };

  // Render hospital markers on the map
  const renderMarkers = (data: Hospital[]) => {
    // Check if mapRef is initialized before proceeding with map operations
    if (!mapRef.current) return;
    // Clear existing markers before rendering new markers
    if (markersRef.current) markersRef.current.clearLayers();
    // Initialize marker cluster group if not already initialized
    else markersRef.current = L.markerClusterGroup({
      animateAddingMarkers: true,
      disableClusteringAtZoom: 18,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      animate: true,
    });

    // Add markers for each hospital in the filtered data
    data.forEach((hospital) => {
      const coordinates = hospital.geometry.coordinates;
      const { name, address1, eircode, subcategory } = hospital.properties;
      const isBookmarked = bookmarks.includes(name);

      // Create marker with custom icon and popup content
      const marker = L.marker([coordinates[1], coordinates[0]], {
        icon: isBookmarked ? customIcon : customIcon,
      });

      // Create popup content with hospital details and action buttons
      const createPopupContent = () => `
      <div>
        <strong>${name}</strong><br>
        ${address1}<br>
        ${eircode}<br>
        ${subcategory}<br><br>
        <button id="route-btn-${name.replace(/\s+/g, '-')}">Get Route</button>
        <button id="bookmark-btn-${name.replace(/\s+/g, '-')}">
          ${isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
        </button>
      </div>
    `;
      marker.bindPopup(createPopupContent);
      markersRef.current?.addLayer(marker);

      // Add event listeners for bookmark and route buttons in popup content on marker click event 
      marker.on('popupopen', () => {
        const bookmarkButton = document.getElementById(`bookmark-btn-${name.replace(/\s+/g, '-')}`);

        // Toggle bookmark status on button click
        if (bookmarkButton) {
          bookmarkButton.addEventListener('click', () => {
            toggleBookmark(name);
            renderMarkers(data);
          });
        }
      });

      // Add event listener for route button in popup content on marker click event
      marker.on('popupopen', () => {
        const routeButton = document.getElementById(`route-btn-${name.replace(/\s+/g, '-')}`);

        // Calculate route from user location to hospital on button click
        if (routeButton) {
          routeButton.addEventListener('click', () => {
            // Check if user location is available before calculating route
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
                  const hospitalLatLng = L.latLng(coordinates[1], coordinates[0]);

                  // Clear existing routing control before adding new route
                  if (routingControlRef.current) {
                    routingControlRef.current.getPlan().setWaypoints([]);
                    mapRef.current?.removeControl(routingControlRef.current);
                    routingControlRef.current = null;
                  }

                  // Calculate route using Leaflet Routing Machine plugin
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

                  // Add event listeners for route calculation success and error
                  routingControlRef.current.on('routesfound', (e: any) => {
                    const routes = e.routes[0];
                    const distance = (routes.summary.totalDistance / 1000).toFixed(2);
                    const time = (routes.summary.totalTime / 60).toFixed(0);
                    const popupContent = `
                      <div>
                        <strong>Route Information</strong><br>
                        Distance: ${distance} km<br>
                        Time: ${time} min<br><br>
                        <button id="close-route-popup">Close</button>
                      </div>
                    `;

                    // Display route information in popup content
                    const popup = L.popup()
                      .setLatLng(hospitalLatLng)
                      .setContent(popupContent)
                      .openOn(mapRef.current!);

                    // Add event listener to close route popup on button click
                    document.getElementById('close-route-popup')?.addEventListener('click', () => {
                      mapRef.current?.closePopup();
                      if (routingControlRef.current) {
                        mapRef.current?.removeControl(routingControlRef.current);
                        routingControlRef.current = null;
                      }
                    });
                  });

                  // Add event listener for route calculation error
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

      // Add marker to marker cluster group
      markersRef.current?.addLayer(marker);
    });

    // Add marker cluster group to map
    mapRef.current!.addLayer(markersRef.current!);
  };

  // Fetch hospital data from API and update state variables
  const fetchHospitals = async () => {
    // Set loading state to true before fetching data
    setLoading(true);
    
    try {
      // Fetch hospital data from API using Axios service and update state variables on success response
      const response = await Axios.get('https://c21436494.xyz/hospital/api/hospitals/');
      console.log('API Response:', response.data);

      // Check if response data is in valid format before updating state variables and rendering markers on map view
      if (response.data.type === "FeatureCollection") {
        const features = response.data.features;
        setHospitals(features);
        setFilteredHospitals(features);
        renderMarkers(features);
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

  // Handle search query input and filter hospitals based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // Filter hospitals based on search query and update map markers
    const filtered = hospitals.filter((hospital) =>
      hospital.properties.name.toLowerCase().includes(query.toLowerCase()) ||
      hospital.properties.address1.toLowerCase().includes(query.toLowerCase()) ||
      hospital.properties.eircode.toLowerCase().includes(query.toLowerCase())
    );

    // Update filtered hospitals and map markers
    setFilteredHospitals(filtered);
    renderMarkers(filtered);
    fitMapBounds(filtered);
  };

  // Handle logout action and remove token from localStorage
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Send user location to backend for updating hospital location data in database
  const sendLocationToBackend = async (latitude: number, longitude: number): Promise<void> => {
    const data = { latitude, longitude };
    try {
      // Send user location data to backend using Axios service and token
      const response = await axios.post(
        'https://c21436494.xyz/hospital/update_location/',
        data,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  // Initialize map and fetch hospital data on component mount and user location on successful geolocation request
  useEffect(() => {
    // Check if mapRef is initialized before proceeding with map operations
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([53.3498, -6.2603], 10);
      const mainTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      });
      // Add main tile layer to map view
      mainTileLayer.addTo(mapRef.current);
      const miniMapTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
      // Add minimap control to map view
      new L.Control.MiniMap(miniMapTileLayer, {
        toggleDisplay: true,
        minimized: false,
        position: 'bottomright',
        width: 150,
        height: 150,
        zoomLevelOffset: -5,
      }).addTo(mapRef.current);

      // Check if user location is available before fetching hospital data
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
          userMarkerRef.current = L.marker(userLatLng, { icon: userIcon }).addTo(mapRef.current!);
          const userCircle = L.circle(userLatLng, {
            color: 'blue',
            fillColor: '#3a7bd5',
            fillOpacity: 0.2,
            radius: 500
          }).addTo(mapRef.current!);
          mapRef.current?.setView(userLatLng, 12);

          // Send user location to backend for updating hospital location data
          sendLocationToBackend(latitude, longitude);
        },
        () => alert('Failed to retrieve user location.')
      );

      fetchHospitals();
    }
  }, []);

  // Find closest hospital to user location based on subcategory filter
  const findClosestHospital = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    // Check if user location is available before finding closest hospital
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Filter hospitals based on subcategory and bookmarks
        const filtered = filteredHospitals.filter(
          (hospital) =>
            selectedSubcategory === '' ||
            hospital.properties.subcategory === selectedSubcategory
        );

        // Check if any hospitals are found in the selected subcategory
        if (filtered.length === 0) {
          alert('No hospitals found in this category.');
          return;
        }

        // Find closest hospital to user location based on distance calculation
        let closestHospital: Hospital = null as unknown as Hospital;
        let shortestDistance = Infinity;

        // Iterate over filtered hospitals to find closest hospital
        filtered.forEach((hospital) => {
          const [lng, lat] = hospital.geometry.coordinates;
          const distance = getDistance(userLat, userLng, lat, lng);
          if (distance < shortestDistance) {
            shortestDistance = distance;
            closestHospital = hospital;
          }
        });

        // Display closest hospital location on map view
        if (closestHospital) {
          const [lng, lat] = closestHospital.geometry.coordinates;
          const hospitalLatLng = L.latLng(lat, lng);
          L.popup()
            .setLatLng(hospitalLatLng)
            .setContent(`<strong>Closest Hospital:</strong><br>${closestHospital.properties.name}`)
            .openOn(mapRef.current!);
          mapRef.current?.setView(hospitalLatLng, 15);
        } else {
          alert('No hospitals found.');
        }
      },
      () => alert('Failed to retrieve your location.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Calculate distance between two coordinates using Haversine formula for spherical geometry calculation
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    // Convert degrees to radians for trigonometric calculations
    const toRad = (angle: number): number => (angle * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    // Haversine formula for spherical geometry calculation of distance between two points on Earth surface in kilometers
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    // Angular distance in radians between two points on Earth surface in kilometers
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Update filtered hospitals and map markers based on subcategory and bookmark filters
  useEffect(() => {
    // Check if mapRef is initialized before proceeding with map operations
    if (!mapRef.current) return;

    // Filter hospitals based on subcategory and bookmarks
    const filtered = hospitals.filter((hospital) => {
      const matchesSubcategory =
        selectedSubcategory === '' || hospital.properties.subcategory === selectedSubcategory;

      // Check if hospital is bookmarked before filtering
      const matchesBookmark =
        !showBookmarksOnly || bookmarks.includes(hospital.properties.name);

      return matchesSubcategory && matchesBookmark;
    });

    // Update filtered hospitals and map markers
    setFilteredHospitals(filtered);
    renderMarkers(filtered);
    fitMapBounds(filtered);
  }, [showBookmarksOnly, bookmarks, selectedSubcategory]);

  // Render map page with navigation bar, search bar, filter options, and map view
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
      <div className="filter-container">
        <select
          className="subcategory-filter"
          value={selectedSubcategory}
          onChange={(e) => handleSubcategoryFilter(e.target.value)}
        >
          <option value="">All Subcategories</option>
          <option value="Community">Community</option>
          <option value="Private General">Private General</option>
          <option value="GeneralAcute">General/Acute</option>
          <option value="Mixed Use">Mixed Use</option>
          <option value="Paediatric">Paediatric</option>
          <option value="Maternity">Maternity</option>
          <option value="Orthopaedic">Orthopaedic</option>
          <option value="Continuing Care Service">Continuing Care Service</option>
          <option value="Psycho-Geriatric">Psycho-Geriatric</option>
          <option value="Rehabilitation">Rehabilitation</option>
          <option value="Cancer">Cancer</option>
        </select>
        <button onClick={findClosestHospital} className="closest-hospital-btn">
          Find Closest Hospital
        </button>
        <label className="bookmark-filter">
          <input
            type="checkbox"
            checked={showBookmarksOnly}
            onChange={(e) => setShowBookmarksOnly(e.target.checked)}
          />
          Show Only Bookmarks
        </label>
      </div>
      <div ref={mapContainerRef} id="map" style={{ height: '600px' }}></div>
    </div>
  );
};

export default MapPage;