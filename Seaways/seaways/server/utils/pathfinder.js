import * as turf from '@turf/turf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landDataPath = path.join(__dirname, '../data/land_polygons.json');

let landPolygons = null;
try {
  const data = JSON.parse(fs.readFileSync(landDataPath, 'utf8'));
  landPolygons = data;
} catch (error) {
  console.error('[PATHFINDER] Failed to load land_polygons.json', error);
}

/**
 * Checks if a point is on land (within any land polygon)
 */
export const isPointOnLand = (lat, lng, bufferKm = 0.5) => {
  if (!landPolygons) return false;
  
  const point = turf.point([lng, lat]);
  let onLand = false;

  turf.featureEach(landPolygons, (feature) => {
    if (onLand) return;
    try {
      if (turf.booleanPointInPolygon(point, feature)) {
        onLand = true;
      }
    } catch (e) {
      // Ignore geometry errors
    }
  });

  // Simple buffer check: check points around center if specified
  if (!onLand && bufferKm > 0) {
    const directions = [0, 90, 180, 270];
    for (const bearing of directions) {
      const bufferedPoint = turf.destination(point, bufferKm, bearing);
      turf.featureEach(landPolygons, (feature) => {
        if (onLand) return;
        if (turf.booleanPointInPolygon(bufferedPoint, feature)) {
          onLand = true;
        }
      });
      if (onLand) break;
    }
  }

  return onLand;
};

/**
 * Checks if a line segment between two points intersects land
 */
export const segmentIntersectsLand = (p1, p2) => {
  if (!landPolygons) return false;
  const line = turf.lineString([[p1.lng, p1.lat], [p2.lng, p2.lat]]);
  
  let intersects = false;
  turf.featureEach(landPolygons, (feature) => {
    if (intersects) return;
    try {
      // booleanIntersects is good, but lineIntersect can be more robust for linestrings vs polygons
      const intersectionPoints = turf.lineIntersect(line, feature);
      if (intersectionPoints.features.length > 0) {
        intersects = true;
      }
      
      // Also check if the line is completely INSIDE the land (unlikely if starts/ends are in sea, but safe)
      if (!intersects && turf.booleanPointInPolygon(turf.point([p1.lng, p1.lat]), feature)) {
        intersects = true;
      }
    } catch (e) {
      // Ignore geometry errors
    }
  });
  
  return intersects;
};

/**
 * Basic A* implementation on a grid
 */
export class SeaPathfinder {
  constructor(gridSizeDegrees = 1.0) {
    this.gridSize = gridSizeDegrees;
  }

  // Round coordinate to grid
  round(val) {
    return Math.round(val / this.gridSize) * this.gridSize;
  }

  async findPath(start, end) {
    const startNode = { lat: this.round(start.lat), lng: this.round(start.lng) };
    const endNode = { lat: this.round(end.lat), lng: this.round(end.lng) };

    const openSet = new Set([JSON.stringify(startNode)]);
    const cameFrom = new Map();
    const gScore = new Map([[JSON.stringify(startNode), 0]]);
    const fScore = new Map([[JSON.stringify(startNode), this.heuristic(startNode, endNode)]]);

    const pq = [{ node: startNode, fScore: fScore.get(JSON.stringify(startNode)) }];

    let limit = 2000; // Hard cap on iterations for performance
    
    while (pq.length > 0 && limit-- > 0) {
      pq.sort((a, b) => a.fScore - b.fScore);
      const current = pq.shift().node;
      const currentKey = JSON.stringify(current);

      if (this.heuristic(current, endNode) < this.gridSize * 1.5) {
        return this.reconstructPath(cameFrom, current, end);
      }

      openSet.delete(currentKey);

      for (const neighbor of this.getNeighbors(current)) {
        const neighborKey = JSON.stringify(neighbor);
        
        // Skip if on land
        if (isPointOnLand(neighbor.lat, neighbor.lng, 0.5)) continue;

        const tentativeGScore = gScore.get(currentKey) + this.heuristic(current, neighbor);
        
        if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, endNode));
          
          if (!openSet.has(neighborKey)) {
            openSet.add(neighborKey);
            pq.push({ node: neighbor, fScore: fScore.get(neighborKey) });
          }
        }
      }
    }

    console.warn('[PATHFINDER] No optimal path found, using sea-lane fallback.');
    return null;
  }

  heuristic(p1, p2) {
    // Basic Euclidean distance in degrees
    return Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
  }

  getNeighbors(node) {
    const neighbors = [];
    for (let dLat = -this.gridSize; dLat <= this.gridSize; dLat += this.gridSize) {
      for (let dLng = -this.gridSize; dLng <= this.gridSize; dLng += this.gridSize) {
        if (dLat === 0 && dLng === 0) continue;
        neighbors.push({ 
          lat: Number((node.lat + dLat).toFixed(4)), 
          lng: Number((node.lng + dLng).toFixed(4)) 
        });
      }
    }
    return neighbors;
  }

  reconstructPath(cameFrom, current, actualEnd) {
    let totalPath = [actualEnd, current];
    let key = JSON.stringify(current);
    while (cameFrom.has(key)) {
      current = cameFrom.get(key);
      key = JSON.stringify(current);
      totalPath.push(current);
    }
    const path = totalPath.reverse();
    return this.simplifyPath(path);
  }

  // Smooth path using line-of-sight check
  simplifyPath(path) {
    if (path.length <= 2) return path;
    const simplified = [path[0]];
    let currentIndex = 0;

    while (currentIndex < path.length - 1) {
      let furthestIndex = path.length - 1;
      
      while (furthestIndex > currentIndex + 1) {
        if (!segmentIntersectsLand(path[currentIndex], path[furthestIndex])) {
          break;
        }
        furthestIndex--;
      }
      
      simplified.push(path[furthestIndex]);
      currentIndex = furthestIndex;
    }
    
    return simplified;
  }
}
