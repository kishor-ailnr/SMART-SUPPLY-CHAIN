const axios = require('axios');

async function getRoadRoute(originLng, originLat, destLng, destLat) {
  if (process.env.OPENROUTESERVICE_API_KEY && process.env.OPENROUTESERVICE_API_KEY !== 'your_ors_key_here') {
    try {
      const response = await axios.post(
        `${process.env.OPENROUTESERVICE_BASE_URL}/directions/driving-hgv/geojson`,
        {
          coordinates: [[originLng, originLat], [destLng, destLat]],
          instructions: false
        },
        {
          headers: {
            'Authorization': process.env.OPENROUTESERVICE_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      return response.data.features[0].geometry;
    } catch (err) {
      console.warn('[Routing] ORS failed, using fallback:', err.message);
    }
  }
  return generateFallbackRoute(originLng, originLat, destLng, destLat);
}

function generateFallbackRoute(originLng, originLat, destLng, destLat) {
  const points = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = originLat + (destLat - originLat) * t;
    const lng = originLng + (destLng - originLng) * t;
    const perpOffset = Math.sin(t * Math.PI) * 0.05;
    const angle = Math.atan2(destLat - originLat, destLng - originLng) + Math.PI / 2;
    points.push([lng + perpOffset * Math.cos(angle), lat + perpOffset * Math.sin(angle)]);
  }
  return { type: 'LineString', coordinates: points };
}

module.exports = { getRoadRoute, generateFallbackRoute };
