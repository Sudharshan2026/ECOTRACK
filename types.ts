
export type TransportMode = 'car' | 'public' | 'bicycle' | 'walking';

export interface ActivityLog {
  transportMode: TransportMode;
  transportDistance: number;
  acHours: number; // hours
  lpgUsage: number; // kg
  fridgeDaily: number; // constant estimate
  generatorHours: number; // hours
  onlineDeliveries: number; // count
  electricityKwh: number; // kWh
  timestamp: string;
}

export interface EmissionResult {
  category: string;
  co2kg: number;
  percentage: number;
  color: string;
}

export interface DailyReport {
  totalEmissions: number;
  score: number; // 0-100 (100 is best/lowest)
  level: 'Low' | 'Moderate' | 'High';
  breakdown: EmissionResult[];
  timestamp: string;
}

export interface AIRecommendation {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  achieved: boolean;
  description: string;
  type: 'reduction' | 'streak' | 'category' | 'milestone';
  currentProgress?: number;
  targetProgress?: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  joinedDate: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  emissions: number;
  score: number;
  isCurrentUser?: boolean;
}
