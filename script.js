// Hide splash after 2 seconds
window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash");
    splash.style.opacity = 0;
    setTimeout(() => {
      splash.style.display = "none";
      document.getElementById("map").style.display = "block";
      initMap();
    }, 800); // wait for fade out
  }, 2000);
});

function initMap() {
  let currentLocation = null;
  let routeLine = null;
  // Add current location marker (red person icon)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      currentLocation = [lat, lng];
      // Create a custom red person icon using SVG
      const personIcon = L.divIcon({
        className: 'person-icon',
        html: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="10" r="6" fill="red" />
          <rect x="10" y="18" width="12" height="8" rx="6" fill="red" />
        </svg>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
      L.marker(currentLocation, { icon: personIcon })
        .bindPopup('<b>Your Current Location</b>')
        .addTo(map);
      map.setView(currentLocation, 12);
    });
  }
  // Initialize map centered on Negros Island
  const map = L.map('map').setView([9.9, 123.0], 9);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Define layers (groups)
  const layers = {
    CentralizedVendo: L.layerGroup(),
    Subscribers: L.layerGroup(),
    NapBox: L.layerGroup(),
    Towers: L.layerGroup()
  };

  // Example data
  const data = {
    CentralizedVendo: [
      { lat: 10.006, lng: 122.967, name: "Vendo Bacolod" }
    ],
    Subscribers: [
      { lat: 9.307, lng: 123.308, name: "Subscriber Dumaguete" }
    ],
    NapBox: [
      { lat: 10.5, lng: 123.4, name: "Nap Box North Negros" }
    ],
    Towers: [
      { lat: 9.9, lng: 122.9, name: "Tower Negros Center" },
      // Test marker on a highway (Bacolod North Road, near Talisay City)
      { lat: 10.6711, lng: 122.9636, name: "Highway Test Marker" },
      // Gil Montilla, Sipalay City (near highway)
      { lat: 9.7897, lng: 122.4047, name: "Gil Montilla, Sipalay City" }
    ]
  };

  // Colors for each type
  const colors = {
    CentralizedVendo: "blue",
    Subscribers: "green",
    NapBox: "black",
    Towers: "skyblue"
  };

  // Responsive marker size function
  function getMarkerRadius() {
    // Old radius was 6, let's use 7 for a slight increase
    return 7;
  }

  // Store markers for resizing
  const allMarkers = [];
  // OSRM public routing (no API key required)
  async function getRoute(start, end) {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes[0] && data.routes[0].geometry) {
        return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
      }
    } catch (e) {
      console.error('Route fetch error:', e);
    }
    return null;
  }

  for (let type in data) {
    data[type].forEach(item => {
      const marker = L.circleMarker([item.lat, item.lng], {
        radius: getMarkerRadius(),
        color: colors[type],
        fillColor: colors[type],
        fillOpacity: 0.9
      })
      .addTo(layers[type]);
      marker.on('click', async function() {
        if (currentLocation) {
          // Remove previous route if exists
          if (routeLine) {
            map.removeLayer(routeLine);
          }
          // Fetch route from ORS
          marker.bindPopup(`<b>${item.name}</b><br><span style='color:orange;'>Tracing route...</span>`).openPopup();
          const routeCoords = await getRoute(currentLocation, [item.lat, item.lng]);
          if (routeCoords) {
            routeLine = L.polyline(routeCoords, {
              color: 'red',
              weight: 5,
              opacity: 0.9
            }).addTo(map);
            marker.bindPopup(`<b>${item.name}</b><br><span style='color:red;font-weight:bold;'>Trace Route from your location</span>`).openPopup();
          } else {
            marker.bindPopup(`<b>${item.name}</b><br><span style='color:red;'>Route not found</span>`).openPopup();
          }
        } else {
          marker.bindPopup(`<b>${item.name}</b><br><span style='color:gray;'>Current location not found</span>`).openPopup();
        }
      });
      allMarkers.push(marker);
    });
    // Add all layers to map by default
    layers[type].addTo(map);
  }

  // Update marker sizes on zoom
  // No need to resize markers on zoom for this size

  // Create custom filter control
  const filterControl = L.control({ position: 'topleft' });
  filterControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'filter-box');
    div.innerHTML = `
      <label><input type="checkbox" id="CentralizedVendo" checked>
        <span class="color-dot" style="background: ${colors.CentralizedVendo};"></span>
        Centralized Vendo
      </label>
      <label><input type="checkbox" id="Subscribers" checked>
        <span class="color-dot" style="background: ${colors.Subscribers};"></span>
        Subscribers
      </label>
      <label><input type="checkbox" id="NapBox" checked>
        <span class="color-dot" style="background: ${colors.NapBox};"></span>
        Nap Box
      </label>
      <label><input type="checkbox" id="Towers" checked>
        <span class="color-dot" style="background: ${colors.Towers};"></span>
        Towers
      </label>
    `;
    return div;
  };
  filterControl.addTo(map);

  // Handle checkbox changes
  function updateLayers() {
    for (let type in layers) {
      const checkbox = document.getElementById(type);
      if (checkbox && checkbox.checked) {
        map.addLayer(layers[type]);
      } else {
        map.removeLayer(layers[type]);
      }
    }
  }

  // Attach event listeners
  document.addEventListener("change", e => {
    if (layers[e.target.id]) {
      updateLayers();
    }
  });

  // Add current location marker (red person icon)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      // Create a custom red person icon using SVG
      const personIcon = L.divIcon({
        className: 'person-icon',
        html: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="10" r="6" fill="red" />
          <rect x="10" y="18" width="12" height="8" rx="6" fill="red" />
        </svg>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
      L.marker([lat, lng], { icon: personIcon })
        .bindPopup('<b>Your Current Location</b>')
        .addTo(map);
      map.setView([lat, lng], 12);
    });
  }
}
