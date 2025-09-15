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
      { lat: 9.9, lng: 122.9, name: "Tower Negros Center" }
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
  for (let type in data) {
    data[type].forEach(item => {
      const marker = L.circleMarker([item.lat, item.lng], {
        radius: getMarkerRadius(),
        color: colors[type],
        fillColor: colors[type],
        fillOpacity: 0.9
      })
      .bindPopup(`<b>${item.name}</b>`)
      .addTo(layers[type]);
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
