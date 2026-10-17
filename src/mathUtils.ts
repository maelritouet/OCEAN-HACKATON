// src/mathUtils.ts

// Calcul de la catégorie de canicule marine (Inspiré de Hobday et al.)
// Cat I (Modérée), Cat II (Forte), Cat III (Sévère), Cat IV (Extrême)
export function calculateMHWCategorization(currentSst: number, baselineSst: number) {
  const anomaly = currentSst - baselineSst;
  const thresholdMhw = 1.5; // Simplification pour le hackathon : le 90e percentile est estimé à +1.5°C au-dessus de la moyenne estivale

  if (anomaly < thresholdMhw) return { category: 'Normale', level: 0, color: 'text-emerald-500' };
  
  // Différence avec le seuil divisée par l'écart type local (simplifié ici par des tranches de 1°C)
  if (anomaly >= thresholdMhw && anomaly < thresholdMhw + 1) return { category: 'Cat I (Modérée)', level: 1, color: 'text-amber-500' };
  if (anomaly >= thresholdMhw + 1 && anomaly < thresholdMhw + 2) return { category: 'Cat II (Forte)', level: 2, color: 'text-orange-500' };
  if (anomaly >= thresholdMhw + 2 && anomaly < thresholdMhw + 3) return { category: 'Cat III (Sévère)', level: 3, color: 'text-rose-500' };
  
  return { category: 'Cat IV (Extrême)', level: 4, color: 'text-rose-700' };
}

// Calcul du risque de mortalité dynamique pour une espèce
export function calculateSpeciesStress(currentSst: number, criticalThresholdRaw: string) {
  // Extraction du nombre (ex: "> 24.5°C" -> 24.5)
  const match = criticalThresholdRaw.match(/\d+(\.\d+)?/);
  if (!match) return 0;
  
  const threshold = parseFloat(match[0]);
  if (currentSst < threshold) return 0; // Pas de stress
  
  // Si on dépasse le seuil, le risque augmente de 30% par degré supplémentaire
  const excessHeat = currentSst - threshold;
  const riskPercentage = Math.min(100, Math.round(excessHeat * 30));
  
  return riskPercentage;
}