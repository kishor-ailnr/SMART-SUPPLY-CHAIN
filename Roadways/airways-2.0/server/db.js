// Mocking DB due to Node 24 native module build constraints
const db = {
  exec: () => {},
  prepare: (sql) => ({
    get: (...args) => {
      if (sql.includes('COUNT(*)')) return { c: 1 };
      if (sql.includes('ORDER BY id DESC')) return {lat: 28.55, lng: 77.10, altitude_ft: 35000};
      return {};
    },
    run: (...args) => {},
    all: (...args) => {
       if (sql.includes('flights')) return [{ id: 'FL001', lat: 28.55, lng: 77.10, altitude_ft: 35000, risk_level: 'LOW', flight_number: '6E-101' }];
       if (sql.includes('vehicles')) return [{ id: 'VH001', current_lat: 12.9165, current_lng: 79.1325, type: 'TRUCK', status: 'EN_ROUTE', vehicle_number: 'VH001' }];
       if (sql.includes('cargo')) return [{ id: 'CS001'}];
       return [];
    }
  })
};

function seedDatabase() {
  console.log('[DB] Running mocked in-memory database fallback...');
}

module.exports = { db, seedDatabase };
