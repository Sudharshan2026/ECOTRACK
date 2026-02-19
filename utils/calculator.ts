
import { ActivityLog, DailyReport, EmissionResult } from '../types';
import { EMISSION_FACTORS, COLORS } from '../constants';

export const calculateDailyEmissions = (log: ActivityLog): DailyReport => {
  const transportEmission = log.transportDistance * EMISSION_FACTORS.TRANSPORT[log.transportMode];
  
  const breakdown: EmissionResult[] = [
    { 
      category: `Transport (${log.transportMode.charAt(0).toUpperCase() + log.transportMode.slice(1)})`, 
      co2kg: transportEmission, 
      percentage: 0, 
      color: log.transportMode === 'car' ? COLORS.CAR : log.transportMode === 'public' ? COLORS.PUBLIC : COLORS.FRIDGE 
    },
    { category: 'Air Conditioning', co2kg: log.acHours * EMISSION_FACTORS.AC_PER_HOUR, percentage: 0, color: COLORS.AC },
    { category: 'Cooking (LPG)', co2kg: log.lpgUsage * EMISSION_FACTORS.LPG_PER_KG, percentage: 0, color: COLORS.LPG },
    { category: 'Refrigerator', co2kg: EMISSION_FACTORS.FRIDGE_PER_DAY, percentage: 0, color: COLORS.FRIDGE },
    { category: 'Generator', co2kg: log.generatorHours * EMISSION_FACTORS.GENERATOR_PER_HOUR, percentage: 0, color: COLORS.GENERATOR },
    { category: 'Online Deliveries', co2kg: log.onlineDeliveries * EMISSION_FACTORS.DELIVERY_PER_PACKAGE, percentage: 0, color: COLORS.DELIVERY },
    { category: 'Electricity', co2kg: log.electricityKwh * EMISSION_FACTORS.ELECTRICITY_PER_KWH, percentage: 0, color: COLORS.ELECTRICITY },
  ];

  const total = breakdown.reduce((acc, curr) => acc + curr.co2kg, 0);
  
  // Update percentages
  breakdown.forEach(item => {
    item.percentage = total > 0 ? (item.co2kg / total) * 100 : 0;
  });

  const score = Math.max(0, 100 - (total / 25) * 100);
  
  let level: 'Low' | 'Moderate' | 'High' = 'Low';
  if (total > 15) level = 'High';
  else if (total > 7) level = 'Moderate';

  return {
    totalEmissions: Number(total.toFixed(2)),
    score: Math.round(score),
    level,
    breakdown: breakdown.filter(b => b.co2kg > 0),
    timestamp: log.timestamp || new Date().toISOString()
  };
};
