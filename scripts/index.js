const metroManilaBounds = L.latLngBounds(
  L.latLng(14.3400, 120.9000),
  L.latLng(14.7800, 121.1500)
);

const map = L.map('map', {
  center: [14.5995, 120.9842],
  zoom: 11,
  minZoom: 11,
  maxZoom: 18,
  maxBounds: metroManilaBounds,
  maxBoundsViscosity: 1.0
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  bounds: metroManilaBounds
}).addTo(map);

let startPoint = null;
let endPoint = null;
let routeLayer = null;
let routeInfo = null;
let routeFetchFailed = false;

function placeMarker(lat, lng, labelText, existingPoint) {
  if (existingPoint && existingPoint.marker) {
    map.removeLayer(existingPoint.marker);
  }
  const marker = L.marker([lat, lng]).addTo(map).bindPopup(labelText).openPopup();
  return { lat, lng, marker };
}

function setLocation(lat, lng, displayName, isStart) {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    console.error("Invalid coordinates received:", lat, lng);
    return;
  }

  const shortName = displayName ? displayName.split(',')[0] : 'Selected Location';
  const labelText = isStart ? `<b>Start:</b> ${shortName}` : `<b>Destination:</b> ${shortName}`;

  if (isStart) {
    startPoint = placeMarker(parsedLat, parsedLng, labelText, startPoint);
    startPoint.name = shortName;
  } else {
    endPoint = placeMarker(parsedLat, parsedLng, labelText, endPoint);
    endPoint.name = shortName;
  }

  if (startPoint && endPoint) {
    getRoute();
  }
}

async function getRoute() {
  if (!startPoint || !endPoint) return;

  if (routeLayer) {
    map.removeLayer(routeLayer);
  }

  const startCoord = `${startPoint.lng},${startPoint.lat}`;
  const endCoord = `${endPoint.lng},${endPoint.lat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${startCoord};${endCoord}?overview=full&geometries=geojson`;

  routeInfo = null;
  routeFetchFailed = false;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

      routeLayer = L.polyline(coordinates, { color: '#0066ff', weight: 5 }).addTo(map);
      map.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });

      routeInfo = {
        distanceKm: route.distance / 1000,
        durationMin: route.duration / 60,
        coordinates
      };

      saveRouteData();
    } else {
      routeFetchFailed = true;
      alert('No drivable route found between these points.');
    }
  } catch (err) {
    routeFetchFailed = true;
    console.error('Routing Error:', err);
    alert('Failed to fetch route line. Check internet connection.');
  }
}

function saveRouteData() {
  if (!startPoint || !endPoint || !routeInfo) return;

  const payload = {
    start: { lat: startPoint.lat, lng: startPoint.lng, name: startPoint.name },
    end: { lat: endPoint.lat, lng: endPoint.lng, name: endPoint.name },
    distanceKm: routeInfo.distanceKm,
    durationMin: routeInfo.durationMin,
    coordinates: routeInfo.coordinates
  };

  try {
    sessionStorage.setItem('lakbayRoute', JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save route data:', err);
  }
}

async function geocodeLocation(query, isStartPoint) {
  if (!query.trim()) return;

  let searchQuery = query.trim();
  if (!searchQuery.toLowerCase().includes('metro manila')) {
    searchQuery += ', Metro Manila, Philippines';
  }

  const viewbox = `${metroManilaBounds.getWest()},${metroManilaBounds.getNorth()},${metroManilaBounds.getEast()},${metroManilaBounds.getSouth()}`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&countrycodes=ph&viewbox=${viewbox}&bounded=1&format=json&limit=5&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Metro-Manila-Distance-Calculator-App'
      }
    });
    const data = await response.json();

    if (data.length > 0) {
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);

      if (metroManilaBounds.contains([lat, lng])) {
        setLocation(lat, lng, result.display_name, isStartPoint);
        map.setView([lat, lng], 15);
      } else {
        alert('Location found is outside Metro Manila. Please enter a Metro Manila location.');
      }
    } else {
      alert('Location or store not found in Metro Manila.');
    }
  } catch (err) {
    console.error('Geocoding error:', err);
    alert('Failed to search location.');
  }
}

document.getElementById('search-start-btn').addEventListener('click', () => {
  const query = document.getElementById('start-search').value;
  geocodeLocation(query, true);
});

document.getElementById('search-end-btn').addEventListener('click', () => {
  const query = document.getElementById('end-search').value;
  geocodeLocation(query, false);
});

function validateRoute() {
  if (!startPoint && !endPoint) {
    return 'Please enter a start location and a destination before confirming.';
  }
  if (!startPoint) {
    return 'Please enter a start location.';
  }
  if (!endPoint) {
    return 'Please enter a destination.';
  }
  if (startPoint.lat === endPoint.lat && startPoint.lng === endPoint.lng) {
    return 'Your start and destination are the same location. Please choose a different destination.';
  }
  if (!routeInfo) {
    return routeFetchFailed
      ? 'No drivable route could be found between these two points.'
      : 'Still calculating the route - please wait a moment and try again.';
  }
  return null;
}

document.getElementById('confirm').addEventListener('click', (event) => {
  const errorEl = document.getElementById('confirm-error');
  const error = validateRoute();

  if (error) {
    event.preventDefault();
    errorEl.textContent = error;
  } else {
    errorEl.textContent = '';
  }
});