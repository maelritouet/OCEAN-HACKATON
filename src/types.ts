export type SpeciesItem = {
  id: string;
  name: string;
  scientificName: string;
  basin: string;
  locationName: string;
  coords: [number, number];
  trend: 'decline' | 'proliferate';
  trendLabel: string;
  criticalThreshold: string;
  baseSst2015: number;
  sst2022: number;
  sst2026: number;
  mortalityRate: string;
  shortDesc: string;
  impactDetails: string;
  narrationText: string;
  museumSection: string;
};

export type SpeciesGalleryImage = {
  title: string;
  src: string;
  alt: string;
  artist: string;
  license: string;
  licenseUrl?: string;
};

export type YearData = {
  year: number;
  label: string;
  ncGlobalAnom: number;
  ncTrend: number;
  medSst: number;
  medAnomaly: number;
  atlSst: number;
  atlAnomaly: number;
  mancheSst: number;
  mancheAnomaly: number;
  mhwDaysMed: number;
  mhwCategory: string;
  highlight: string;
};

export type MuseumSection = {
  id: string;
  buttonNumber: number;
  title: string;
  subtitle: string;
  center: [number, number];
  zoom: number;
  color: string;
  speciesIds: string[];
};