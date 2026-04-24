import db from './db.js';

export function seedDatabase() {
  const insertAircraft = db.prepare(`
    INSERT OR IGNORE INTO aircraft (
      id, registration, icao_type, airline_iata, airline_name, engine_type, mtow_kg
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertFlight = db.prepare(`
    INSERT OR IGNORE INTO flights (
      id, aircraft_id, flight_number_iata, origin_icao, destination_icao, route_string,
      filed_altitude_ft, filed_speed_ktas, status, peak_risk_level
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const aircraftData = [
    ['ac_1', 'VT-INX', 'A20N', '6E', 'IndiGo', 'CFM LEAP-1A', 79000],
    ['ac_2', 'VT-ALA', 'B788', 'AI', 'Air India', 'GEnx-1B', 227930],
    ['ac_3', 'VT-SLD', 'B738', 'SG', 'SpiceJet', 'CFM56-7B', 79015],
    ['ac_4', 'VT-JNA', 'A21N', 'UK', 'Vistara', 'CFM LEAP-1A', 89000],
    ['ac_5', 'VT-ANB', 'B77L', 'AI', 'Air India', 'GE90-110B', 347452],
    ['ac_6', 'VT-IZA', 'AT76', '6E', 'IndiGo', 'PW127M', 23000],
    ['ac_7', 'VT-AXU', 'A320', 'I5', 'AirAsia India', 'CFM56-5B', 77000],
    ['ac_8', 'VT-GOA', 'A320', 'G8', 'GoFirst', 'CFM56-5B', 77000],
    ['ac_9', 'VT-AKC', 'B744', 'AI', 'Air India', 'CF6-80C2B5F', 396890],
    ['ac_10', 'VT-SZK', 'B737', 'SG', 'SpiceJet', 'CFM56-7B', 77000],
  ];

  const flightData = [
    // 6E-1234
    ['fl_1', 'ac_1', '6E1234', 'VIDP', 'VABB', 'VIDP DCT DOLNI G332 PARDI DCT VABB', 35000, 460, 'ENROUTE', 'CAUTION'],
    // AI-101
    ['fl_2', 'ac_2', 'AI101', 'VIDP', 'EGLL', 'VIDP DCT PARDI UA348 AROSO DCT EGLL', 39000, 510, 'ENROUTE', 'HIGH'],
    // SG-421
    ['fl_3', 'ac_3', 'SG421', 'VABB', 'VOMM', 'VABB DCT BOPAL G462 CHH DCT VOMM', 28000, 422, 'ENROUTE', 'MODERATE'],
    // 9W-615 (Vistara)
    ['fl_4', 'ac_4', 'UK615', 'VOBL', 'VECC', 'VOBL DCT VAMPI L626 VAGRI DCT VECC', 36000, 448, 'ENROUTE', 'LOW'],
    // AI-822
    ['fl_5', 'ac_5', 'AI822', 'VABB', 'KJFK', 'VABB DCT SAMKO DCT NAT D DCT KJFK', 41000, 535, 'ENROUTE', 'CAUTION'],
    // 6E-2541
    ['fl_6', 'ac_6', '6E2541', 'VOMM', 'VOCL', 'VOMM DCT COIMB DCT VOCL', 17000, 265, 'ENROUTE', 'HIGH'],
    // IX-543
    ['fl_7', 'ac_7', 'I5543', 'VECC', 'VIDP', 'VECC DCT DOPLUB UB204 LHN DCT VIDP', 24000, 380, 'DIVERTING', 'CRITICAL'],
    // G8-101
    ['fl_8', 'ac_8', 'G8101', 'VABB', 'VAAH', 'VABB DCT L619 VAAH', 26000, 398, 'ENROUTE', 'HIGH'],
    // AI-9801
    ['fl_9', 'ac_9', 'AI9801', 'VABB', 'OMDB', 'VABB DCT L301 OMDB', 34000, 488, 'ENROUTE', 'CAUTION'],
    // SG-8701
    ['fl_10', 'ac_10', 'SG8701', 'VIDP', 'VABB', 'VIDP DCT G332 VABB', 39000, 462, 'ENROUTE', 'LOW']
  ];

  db.transaction(() => {
    for (const ac of aircraftData) {
      insertAircraft.run(ac);
    }
    for (const fl of flightData) {
      insertFlight.run(fl);
    }
  })();

  const insertPosition = db.prepare(`
    INSERT INTO adsb_positions (aircraft_id, flight_id, lat, lng, altitude_ft, true_heading, squawk, signal_quality)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  // Real initial positions based on the prompt descriptions
  const initialPositions = [
    { aircraft_id: 'ac_1', flight_id: 'fl_1', lat: 23.2, lng: 77.4, alt: 35000, hdg: 197, squawk: '1234', sq: 100 }, // Near Bhopal
    { aircraft_id: 'ac_2', flight_id: 'fl_2', lat: 28.5, lng: 54.2, alt: 39000, hdg: 298, squawk: '2341', sq: 85 }, // Over Iran
    { aircraft_id: 'ac_3', flight_id: 'fl_3', lat: 18.5, lng: 74.1, alt: 28000, hdg: 143, squawk: '3452', sq: 98 }, // Near Pune
    { aircraft_id: 'ac_4', flight_id: 'fl_4', lat: 17.8, lng: 83.4, alt: 36000, hdg: 58, squawk: '4563', sq: 100 }, // Near Visakhapatnam
    { aircraft_id: 'ac_5', flight_id: 'fl_5', lat: 52.3, lng: -30.1, alt: 41000, hdg: 315, squawk: '5674', sq: 60 }, // North Atlantic
    { aircraft_id: 'ac_6', flight_id: 'fl_6', lat: 10.9, lng: 76.8, alt: 17000, hdg: 295, squawk: '6785', sq: 95 }, // Near Coimbatore
    { aircraft_id: 'ac_7', flight_id: 'fl_7', lat: 25.4, lng: 82.9, alt: 24000, hdg: 0, squawk: '7700', sq: 100 }, // Near Varanasi - EMERGENCY
    { aircraft_id: 'ac_8', flight_id: 'fl_8', lat: 21.5, lng: 72.8, alt: 26000, hdg: 22, squawk: '1001', sq: 0 }, // Gulf of Khambhat - GAP
    { aircraft_id: 'ac_9', flight_id: 'fl_9', lat: 20.8, lng: 64.2, alt: 34000, hdg: 278, squawk: '7021', sq: 92 }, // Arabian Sea
    { aircraft_id: 'ac_10', flight_id: 'fl_10', lat: 25.8, lng: 74.2, alt: 39000, hdg: 198, squawk: '1000', sq: 100 } // Rajasthan
  ];

  db.transaction(() => {
    // only insert initial positions if they don't exist to avoid exploding
    const count = db.prepare('SELECT count(*) as c FROM adsb_positions').get().c;
    if (count === 0) {
      for (const pos of initialPositions) {
        insertPosition.run(pos.aircraft_id, pos.flight_id, pos.lat, pos.lng, pos.alt, pos.hdg, pos.squawk, pos.sq);
      }
    }
  })();
}
