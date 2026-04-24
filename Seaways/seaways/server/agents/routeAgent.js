import { SeaPathfinder } from '../utils/pathfinder.js';
import { calculateDistance, calculateBearing } from '../utils/geoUtils.js';

const pathfinder = new SeaPathfinder(1.2); // 1.2 degrees grid for global performance

// Define core maritime transit choke points and nodes to ensure lines never cross land
const SEA_NODES = {
  'ROTTERDAM': { lat: 51.92, lng: 4.47 },
  'ENGLISH_CHANNEL': { lat: 50.00, lng: -1.00 },
  'CELTIC_SEA': { lat: 48.50, lng: -5.50 },
  'BAY_OF_BISCAY': { lat: 45.00, lng: -8.50 },
  'PORTUGAL_COAST': { lat: 39.00, lng: -10.50 },
  'GIBRALTAR': { lat: 36.00, lng: -5.50 },
  'ALBORAN_SEA': { lat: 36.00, lng: -2.00 },
  'MED_WEST': { lat: 37.00, lng: 5.00 },
  'MALTA': { lat: 35.90, lng: 14.40 },
  'MED_EAST': { lat: 34.00, lng: 25.00 },
  'SUEZ_NORTH': { lat: 31.25, lng: 32.32 },
  'SUEZ_SOUTH': { lat: 29.90, lng: 32.55 },
  'RED_SEA_NORTH': { lat: 27.00, lng: 34.50 },
  'RED_SEA_MID': { lat: 20.00, lng: 39.00 },
  'RED_SEA_SOUTH': { lat: 14.00, lng: 42.50 },
  'BAB_EL_MANDEB': { lat: 12.50, lng: 43.50 },
  'GULF_OF_ADEN': { lat: 12.00, lng: 48.00 },
  'ARABIAN_SEA_WEST': { lat: 14.00, lng: 55.00 },
  'ARABIAN_SEA_MID': { lat: 15.00, lng: 63.00 },
  'ARABIAN_SEA_EAST': { lat: 15.00, lng: 68.00 },
  'GULF_OF_OMAN': { lat: 24.50, lng: 57.50 },
  'DUBAI': { lat: 25.20, lng: 55.27 },
  'MUMBAI': { lat: 18.96, lng: 72.83 },
  'LACCADIVE_SEA': { lat: 8.00, lng: 75.00 },
  'SOUTH_SUBCONTINENT': { lat: 5.50, lng: 78.00 },
  'SRI_LANKA_EAST': { lat: 6.00, lng: 82.00 },
  'BAY_OF_BENGAL': { lat: 10.00, lng: 85.00 },
  'CHENNAI': { lat: 13.08, lng: 80.27 },
  'ANDAMAN_SEA': { lat: 6.50, lng: 93.00 },
  'MALACCA_NORTH': { lat: 5.80, lng: 96.00 },
  'MALACCA_MID': { lat: 3.00, lng: 100.50 },
  'SINGAPORE': { lat: 1.25, lng: 104.00 },
  'SOUTH_CHINA_SEA_WEST': { lat: 5.00, lng: 107.00 },
  'SOUTH_CHINA_SEA_MID': { lat: 10.00, lng: 110.00 },
  'SOUTH_CHINA_SEA_EAST': { lat: 15.00, lng: 112.00 },
  'HONG_KONG_APPROACH': { lat: 20.00, lng: 114.00 },
  'HONG_KONG': { lat: 22.31, lng: 114.16 }
};

// ... Dijkstra Graph Implementation for Fallback ...
class Graph {
  constructor() {
    this.nodes = new Set();
    this.edges = new Map();
  }
  addNode(n) {
    this.nodes.add(n);
    this.edges.set(n, []);
  }
  addEdge(n1, n2, weight) {
    this.edges.get(n1).push({ node: n2, weight });
    this.edges.get(n2).push({ node: n1, weight });
  }
  shortestPath(start, finish) {
    const distances = new Map();
    const previous = new Map();
    let pq = [];

    for (let node of this.nodes) {
      if (node === start) {
        distances.set(node, 0);
        pq.push({ node, priority: 0 });
      } else {
        distances.set(node, Infinity);
        pq.push({ node, priority: Infinity });
      }
      previous.set(node, null);
    }

    while (pq.length) {
      pq.sort((a,b) => a.priority - b.priority);
      let smallest = pq.shift().node;
      
      if (smallest === finish) {
        let path = [];
        while (previous.get(smallest)) {
          path.push(smallest);
          smallest = previous.get(smallest);
        }
        path.push(start);
        return path.reverse();
      }

      if (!smallest || distances.get(smallest) === Infinity) break;

      for (let neighbor of this.edges.get(smallest)) {
        let alt = distances.get(smallest) + neighbor.weight;
        if (alt < distances.get(neighbor.node)) {
          distances.set(neighbor.node, alt);
          previous.set(neighbor.node, smallest);
          pq.push({ node: neighbor.node, priority: alt });
        }
      }
    }
    return [start, finish];
  }
}

const seaGraph = new Graph();
Object.keys(SEA_NODES).forEach(node => seaGraph.addNode(node));
const SEA_EDGES = [
  ['ROTTERDAM', 'ENGLISH_CHANNEL'], ['ENGLISH_CHANNEL', 'CELTIC_SEA'], ['CELTIC_SEA', 'BAY_OF_BISCAY'],
  ['BAY_OF_BISCAY', 'PORTUGAL_COAST'], ['PORTUGAL_COAST', 'GIBRALTAR'], ['GIBRALTAR', 'ALBORAN_SEA'],
  ['ALBORAN_SEA', 'MED_WEST'], ['MED_WEST', 'MALTA'], ['MALTA', 'MED_EAST'], ['MED_EAST', 'SUEZ_NORTH'],
  ['SUEZ_NORTH', 'SUEZ_SOUTH'], ['SUEZ_SOUTH', 'RED_SEA_NORTH'], ['RED_SEA_NORTH', 'RED_SEA_MID'],
  ['RED_SEA_MID', 'RED_SEA_SOUTH'], ['RED_SEA_SOUTH', 'BAB_EL_MANDEB'], ['BAB_EL_MANDEB', 'GULF_OF_ADEN'],
  ['GULF_OF_ADEN', 'ARABIAN_SEA_WEST'], ['ARABIAN_SEA_WEST', 'ARABIAN_SEA_MID'], ['ARABIAN_SEA_MID', 'ARABIAN_SEA_EAST'],
  ['MUMBAI', 'ARABIAN_SEA_EAST'], ['MUMBAI', 'LACCADIVE_SEA'], ['DUBAI', 'GULF_OF_OMAN'],
  ['GULF_OF_OMAN', 'ARABIAN_SEA_MID'], ['ARABIAN_SEA_EAST', 'LACCADIVE_SEA'], ['LACCADIVE_SEA', 'SOUTH_SUBCONTINENT'],
  ['SOUTH_SUBCONTINENT', 'SRI_LANKA_EAST'], ['CHENNAI', 'BAY_OF_BENGAL'], ['BAY_OF_BENGAL', 'SRI_LANKA_EAST'],
  ['BAY_OF_BENGAL', 'ANDAMAN_SEA'], ['SRI_LANKA_EAST', 'ANDAMAN_SEA'], ['ANDAMAN_SEA', 'MALACCA_NORTH'],
  ['MALACCA_NORTH', 'MALACCA_MID'], ['MALACCA_MID', 'SINGAPORE'], ['SINGAPORE', 'SOUTH_CHINA_SEA_WEST'],
  ['SOUTH_CHINA_SEA_WEST', 'SOUTH_CHINA_SEA_MID'], ['SOUTH_CHINA_SEA_MID', 'SOUTH_CHINA_SEA_EAST'],
  ['SOUTH_CHINA_SEA_EAST', 'HONG_KONG_APPROACH'], ['HONG_KONG_APPROACH', 'HONG_KONG']
];
SEA_EDGES.forEach(([n1, n2]) => {
  const dist = Math.sqrt(Math.pow(SEA_NODES[n1].lat - SEA_NODES[n2].lat, 2) + Math.pow(SEA_NODES[n1].lng - SEA_NODES[n2].lng, 2));
  seaGraph.addEdge(n1, n2, dist);
});

export class RouteAgent {
  constructor() {
    this.ports = [];
  }

  getNearestSeaNode(lat, lng) {
    let nearest = null;
    let minDist = Infinity;
    Object.keys(SEA_NODES).forEach(node => {
      const d = Math.sqrt(Math.pow(SEA_NODES[node].lat - lat, 2) + Math.pow(SEA_NODES[node].lng - lng, 2));
      if (d < minDist) { minDist = d; nearest = node; }
    });
    return nearest;
  }

  async suggestRoute(start, end) {
    console.log(`[ROUTEBOT] Routing from ${start.lat},${start.lng} to ${end.lat},${end.lng}...`);
    
    // 1. A* Pathfinder (Prioritize)
    try {
      const astarPath = await pathfinder.findPath(start, end);
      if (astarPath && astarPath.length >= 2) {
        return astarPath;
      }
    } catch (e) {
      console.error('[ROUTEBOT] A* failed:', e.message);
    }

    // 2. Dijkstra Fallback
    const startNodeName = this.getNearestSeaNode(start.lat, start.lng);
    const endNodeName = this.getNearestSeaNode(end.lat, end.lng);
    
    if (startNodeName === endNodeName) return [start, end];

    const path = seaGraph.shortestPath(startNodeName, endNodeName);
    return [start, ...path.map(n => SEA_NODES[n]), end];
  }

  findNamedCheckpoints(route, allPorts) {
    const checkpoints = [];
    route.forEach((wp, index) => {
      allPorts.forEach(port => {
        const dist = Math.sqrt(Math.pow(port.lat - wp.lat, 2) + Math.pow(port.lng - wp.lng, 2));
        if (dist < 1.0) checkpoints.push({ ...port, index });
      });
    });
    return checkpoints;
  }
}
