
export const EMISSION_FACTORS = {
  TRANSPORT: {
    car: 0.192,      // kg CO2 per km
    public: 0.089,   // kg CO2 per km
    bicycle: 0,      // kg CO2 per km
    walking: 0       // kg CO2 per km
  },
  AC_PER_HOUR: 1.15, // kg CO2 per hour (avg 1.5 ton)
  LPG_PER_KG: 2.98, // kg CO2 per kg
  FRIDGE_PER_DAY: 0.85, // kg CO2 per day (avg)
  GENERATOR_PER_HOUR: 2.45, // kg CO2 per hour
  DELIVERY_PER_PACKAGE: 0.75, // kg CO2 per delivery
  ELECTRICITY_PER_KWH: 0.475, // kg CO2 per kWh (global avg)
};

export const INITIAL_LOG: any = {
  transportMode: 'car',
  transportDistance: 0,
  acHours: 0,
  lpgUsage: 0,
  fridgeDaily: 1, // constant
  generatorHours: 0,
  onlineDeliveries: 0,
  electricityKwh: 0,
};

export const COLORS = {
  CAR: '#EF4444',
  AC: '#3B82F6',
  LPG: '#F59E0B',
  FRIDGE: '#10B981',
  GENERATOR: '#6366F1',
  DELIVERY: '#EC4899',
  ELECTRICITY: '#8B5CF6',
  PUBLIC: '#14B8A6'
};

export const MOCK_LEADERBOARD = [
  { name: 'Sarah Jenkins', avatar: 'https://i.pravatar.cc/150?u=sarah', emissions: 1.2, score: 98 },
  { name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?u=michael', emissions: 2.4, score: 95 },
  { name: 'Elena Rodriguez', avatar: 'https://i.pravatar.cc/150?u=elena', emissions: 3.8, score: 91 },
  { name: 'David Smith', avatar: 'https://i.pravatar.cc/150?u=david', emissions: 4.5, score: 88 },
  { name: 'Aisha Khan', avatar: 'https://i.pravatar.cc/150?u=aisha', emissions: 5.2, score: 85 },
];

export const AVATARS = [
  'https://i.pravatar.cc/150?u=1',
  'https://i.pravatar.cc/150?u=2',
  'https://i.pravatar.cc/150?u=3',
  'https://i.pravatar.cc/150?u=4',
];
