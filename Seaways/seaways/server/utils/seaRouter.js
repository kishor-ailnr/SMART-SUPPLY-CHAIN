import * as turf from '@turf/turf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seaBoundaryPath = path.join(__dirname, '../data/seaBoundary.json');

let seaBoundary = null;
try {
  const data = fs.readFileSync(seaBoundaryPath, 'utf8');
  seaBoundary = JSON.parse(data);
} catch (error) {
  console.error('Failed to load seaBoundary.json', error);
}

export const isPointInSea = (lat, lng) => {
  if (!seaBoundary) return true; // Fallback if no boundary file
  const point = turf.point([lng, lat]);
  let inSea = false;
  
  turf.featureEach(seaBoundary, (feature) => {
    if (turf.booleanPointInPolygon(point, feature)) {
      inSea = true;
    }
  });
  
  return inSea;
};

export const validateAndCorrectWaypoint = (lat, lng, heading = 0) => {
  if (isPointInSea(lat, lng)) {
    return { lat, lng, corrected: false };
  }
  
  // Simple correction: move 50km perpendicular to heading
  // In a real system, this would be a more complex pathfinding algorithm
  console.warn(`Land detected at ${lat}, ${lng}. Correcting...`);
  
  const point = turf.point([lng, lat]);
  const distance = 50; // km
  const correctedPoint = turf.destination(point, distance, (heading + 90) % 360);
  
  return {
    lat: correctedPoint.geometry.coordinates[1],
    lng: correctedPoint.geometry.coordinates[0],
    corrected: true
  };
};
