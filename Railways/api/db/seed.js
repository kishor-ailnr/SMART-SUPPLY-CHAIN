import { setupDB } from './setup.js';
import * as uuid from 'uuid';
const { v4: uuidv4 } = uuid;

const db = setupDB();

const trains = [
  { id: uuidv4(), train_number: '12301', train_name: 'HOWRAH RAJDHANI', train_type: 'Rajdhani Express', zone: 'NR', division: 'DELHI', rake_type: 'LHB', loco_type: 'WAP-7', loco_number: '30123', loco_shed: 'Howrah', coach_count: 22, max_speed_kmh: 130, is_electrified: 1, kavach_installed: 0 },
  { id: uuidv4(), train_number: '22119', train_name: 'CSMT VANDE BHARAT', train_type: 'Vande Bharat Express', zone: 'CR', division: 'MUMBAI', rake_type: 'VB-18', loco_type: 'EMU', loco_number: 'VB-05', loco_shed: 'Kalyan', coach_count: 16, max_speed_kmh: 160, is_electrified: 1, kavach_installed: 1 },
  { id: uuidv4(), train_number: '70022', train_name: 'FREIGHT BCNA RAKE', train_type: 'Container Express', zone: 'WDFC', division: 'DFCCIL', rake_type: 'BLCS', loco_type: 'WAG-12B', loco_number: '60022', loco_shed: 'Palanpur', coach_count: 90, max_speed_kmh: 100, is_electrified: 1, kavach_installed: 1, is_freight: 1, is_dfc: 1 },
  { id: uuidv4(), train_number: '12623', train_name: 'TRIVANDRUM MAIL', train_type: 'Mail Express', zone: 'SR', division: 'CHENNAI', rake_type: 'ICF', loco_type: 'WAP-4', loco_number: '22543', loco_shed: 'Erode', coach_count: 24, max_speed_kmh: 110, is_electrified: 1, kavach_installed: 0 },
  { id: uuidv4(), train_number: '58401', train_name: 'PURI PASSENGER', train_type: 'Passenger', zone: 'ECoR', division: 'KHURDA', rake_type: 'ICF', loco_type: 'WDM-3A', loco_number: '16432', loco_shed: 'Khurda Road', coach_count: 22, max_speed_kmh: 90, is_electrified: 0, kavach_installed: 0 },
  { id: uuidv4(), train_number: '03456', train_name: 'COAL RAKE', train_type: 'Freight Express', zone: 'EDFC', division: 'DFCCIL', rake_type: 'BOBR', loco_type: 'WAG-12B', loco_number: '60089', loco_shed: 'Tundla', coach_count: 58, max_speed_kmh: 100, is_electrified: 1, kavach_installed: 1, is_freight: 1, is_dfc: 1 },
  { id: uuidv4(), train_number: '55025', train_name: 'DARJEELING EXPRESS', train_type: 'Heritage Steam', zone: 'NFR', division: 'KATIHAR', rake_type: 'Heritage', loco_type: 'B-class Steam', loco_number: 'B-738', loco_shed: 'Darjeeling', coach_count: 8, max_speed_kmh: 20, is_electrified: 0, kavach_installed: 0, is_heritage: 1 },
  { id: uuidv4(), train_number: '12027', train_name: 'KACHEGUDA SHATABDI', train_type: 'Shatabdi Express', zone: 'SCR', division: 'SECUNDERABAD', rake_type: 'LHB', loco_type: 'WAP-7', loco_number: '30456', loco_shed: 'Vijayawada', coach_count: 20, max_speed_kmh: 130, is_electrified: 1, kavach_installed: 1 },
  { id: uuidv4(), train_number: '09483', train_name: 'AHMEDABAD SPECIAL', train_type: 'Mail Express', zone: 'WR', division: 'AHMEDABAD', rake_type: 'LHB', loco_type: 'WAP-5', loco_number: '30234', loco_shed: 'Vadodara', coach_count: 18, max_speed_kmh: 110, is_electrified: 1, kavach_installed: 0 },
  { id: uuidv4(), train_number: '06502', train_name: 'BANGALORE METRO PURPLE LINE', train_type: 'Metro', zone: 'METRO', division: 'BMRCL', rake_type: 'Movia 300', loco_type: 'EMU', loco_number: 'M-12', loco_shed: 'Baiyappanahalli', coach_count: 6, max_speed_kmh: 80, is_electrified: 1, kavach_installed: 1, is_metro: 1 },
];

const insertTrain = db.prepare(`
  INSERT INTO trains (id, train_number, train_name, train_type, zone, division, rake_type, loco_type, loco_number, loco_shed, coach_count, max_speed_kmh, is_electrified, kavach_installed, is_freight, is_heritage, is_metro, is_dfc)
  VALUES (@id, @train_number, @train_name, @train_type, @zone, @division, @rake_type, @loco_type, @loco_number, @loco_shed, @coach_count, @max_speed_kmh, @is_electrified, @kavach_installed, @is_freight, @is_heritage, @is_metro, @is_dfc)
`);

db.transaction(() => {
  for (const train of trains) {
    try {
      insertTrain.run({
        ...train,
        is_freight: train.is_freight || 0,
        is_heritage: train.is_heritage || 0,
        is_metro: train.is_metro || 0,
        is_dfc: train.is_dfc || 0,
      });
      console.log(`Inserted train ${train.train_number}`);
    } catch (e) {
      if (!e.message.includes('UNIQUE constraint failed')) {
        throw e;
      }
    }
  }
})();

console.log('Database seeding complete');
