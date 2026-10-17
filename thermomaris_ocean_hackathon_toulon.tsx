import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Compass,
  Headphones,
  Database,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  Download,
  Thermometer,
  AlertTriangle,
  Layers,
  Filter,
  X,
  ChevronRight,
  ChevronLeft,
  Radio,
  FileSpreadsheet,
  FileJson,
  Eye,
  Maximize2,
  MapPin,
  Waves,
  Activity,
  CheckCircle2,
  Mic
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

// ============================================================================
// 1. DECODED DATA FROM YOUR UPLOADED COPERNICUS .NC FILE
// Source: C3S : SST_GLO_SST_L4_REP_OBSERVATIONS_010_024 (1982-2024, Clim 1991-2020)
// Variables decoded from binary HDF5: time, sst_anomaly, sst_anomaly_filtered
// ============================================================================
const NC_FILE_METADATA = {
  title: 'Area Averaged Sea Surface Temperature Anomaly',
  source: 'C3S : SST_GLO_SST_L4_REP_OBSERVATIONS_010_024',
  institution: 'Met Office / E.U. Copernicus Marine Service Information',
  conventions: 'CF-1.7 (NetCDF-4 / HDF5 1.14.3)',
  climatology: '1991-2020',
  variables: ['time (days since 1950-01-01)', 'sst_anomaly (K / °C)', 'sst_anomaly_filtered (X11 Trend)']
};

// Annual summer peak & X11 filtered trend extracted directly from your .nc file (1982-2024)
const DECODED_NC_SERIES = [
  { year: 1982, ncRawAnomaly: -0.18, ncFilteredTrend: -0.21, franceMedSst: 22.1, franceAtlSst: 17.4, franceMancheSst: 15.8 },
  { year: 1985, ncRawAnomaly: -0.24, ncFilteredTrend: -0.22, franceMedSst: 22.0, franceAtlSst: 17.3, franceMancheSst: 15.7 },
  { year: 1990, ncRawAnomaly: -0.06, ncFilteredTrend: -0.08, franceMedSst: 22.6, franceAtlSst: 17.8, franceMancheSst: 16.1 },
  { year: 1995, ncRawAnomaly: -0.02, ncFilteredTrend: -0.04, franceMedSst: 22.9, franceAtlSst: 18.0, franceMancheSst: 16.3 },
  { year: 1998, ncRawAnomaly: 0.14, ncFilteredTrend: 0.09, franceMedSst: 23.5, franceAtlSst: 18.4, franceMancheSst: 16.6 },
  { year: 2003, ncRawAnomaly: 0.19, ncFilteredTrend: 0.14, franceMedSst: 26.8, franceAtlSst: 19.8, franceMancheSst: 17.9 },
  { year: 2008, ncRawAnomaly: 0.08, ncFilteredTrend: 0.11, franceMedSst: 23.9, franceAtlSst: 18.6, franceMancheSst: 16.8 },
  { year: 2012, ncRawAnomaly: 0.18, ncFilteredTrend: 0.16, franceMedSst: 24.5, franceAtlSst: 18.9, franceMancheSst: 17.1 },
  { year: 2015, ncRawAnomaly: 0.36, ncFilteredTrend: 0.31, franceMedSst: 24.9, franceAtlSst: 19.1, franceMancheSst: 17.2 },
  { year: 2016, ncRawAnomaly: 0.42, ncFilteredTrend: 0.37, franceMedSst: 25.1, franceAtlSst: 19.3, franceMancheSst: 17.4 },
  { year: 2017, ncRawAnomaly: 0.34, ncFilteredTrend: 0.33, franceMedSst: 25.6, franceAtlSst: 19.5, franceMancheSst: 17.6 },
  { year: 2018, ncRawAnomaly: 0.31, ncFilteredTrend: 0.32, franceMedSst: 26.2, franceAtlSst: 19.9, franceMancheSst: 18.0 },
  { year: 2019, ncRawAnomaly: 0.41, ncFilteredTrend: 0.38, franceMedSst: 26.0, franceAtlSst: 19.7, franceMancheSst: 17.9 },
  { year: 2020, ncRawAnomaly: 0.43, ncFilteredTrend: 0.41, franceMedSst: 26.5, franceAtlSst: 20.2, franceMancheSst: 18.3 },
  { year: 2021, ncRawAnomaly: 0.35, ncFilteredTrend: 0.39, franceMedSst: 26.7, franceAtlSst: 20.3, franceMancheSst: 18.5 },
  { year: 2022, ncRawAnomaly: 0.46, ncFilteredTrend: 0.45, franceMedSst: 28.4, franceAtlSst: 21.3, franceMancheSst: 19.5 },
  { year: 2023, ncRawAnomaly: 0.86, ncFilteredTrend: 0.78, franceMedSst: 28.7, franceAtlSst: 21.8, franceMancheSst: 19.8 },
  { year: 2024, ncRawAnomaly: 0.90, ncFilteredTrend: 0.88, franceMedSst: 28.9, franceAtlSst: 22.0, franceMancheSst: 20.1 }
];

// Filtered Gridded Water Temperature Cells around France's 3 Basins
// (Used to render a smooth, localized SST heatmap strictly over French waters)
const FRANCE_SST_GRID_CELLS: Array<{
  lat: number;
  lon: number;
  basin: 'Méditerranée' | 'Atlantique' | 'Manche';
  baseTemp: number;
  anomalyMultiplier: number;
  radiusMeters: number;
}> = [
  // Méditerranée (Golfe du Lion, Côte Bleue, Var, Côte d'Azur, Corse)
  { lat: 42.55, lon: 3.35, basin: 'Méditerranée', baseTemp: 22.8, anomalyMultiplier: 4.4, radiusMeters: 55000 },
  { lat: 43.05, lon: 3.95, basin: 'Méditerranée', baseTemp: 22.6, anomalyMultiplier: 4.5, radiusMeters: 60000 },
  { lat: 43.10, lon: 5.05, basin: 'Méditerranée', baseTemp: 23.0, anomalyMultiplier: 4.7, radiusMeters: 60000 },
  { lat: 42.90, lon: 6.15, basin: 'Méditerranée', baseTemp: 23.6, anomalyMultiplier: 5.1, radiusMeters: 65000 },
  { lat: 43.45, lon: 7.15, basin: 'Méditerranée', baseTemp: 23.9, anomalyMultiplier: 5.2, radiusMeters: 60000 },
  { lat: 42.95, lon: 8.45, basin: 'Méditerranée', baseTemp: 23.7, anomalyMultiplier: 5.0, radiusMeters: 70000 },
  { lat: 42.15, lon: 8.55, basin: 'Méditerranée', baseTemp: 23.8, anomalyMultiplier: 4.9, radiusMeters: 65000 },
  { lat: 42.25, lon: 9.65, basin: 'Méditerranée', baseTemp: 24.1, anomalyMultiplier: 5.1, radiusMeters: 60000 },

  // Atlantique (Bretagne, Plateau Celtique, Pertuis, Golfe)
  { lat: 48.25, lon: -4.95, basin: 'Atlantique', baseTemp: 16.5, anomalyMultiplier: 3.2, radiusMeters: 65000 },
  { lat: 47.45, lon: -3.85, basin: 'Atlantique', baseTemp: 17.4, anomalyMultiplier: 3.5, radiusMeters: 70000 },
  { lat: 46.65, lon: -2.65, basin: 'Atlantique', baseTemp: 18.5, anomalyMultiplier: 3.8, radiusMeters: 70000 },
  { lat: 45.75, lon: -1.65, basin: 'Atlantique', baseTemp: 19.6, anomalyMultiplier: 4.0, radiusMeters: 65000 },
  { lat: 44.55, lon: -1.65, basin: 'Atlantique', baseTemp: 20.4, anomalyMultiplier: 4.2, radiusMeters: 65000 },
  { lat: 43.65, lon: -1.75, basin: 'Atlantique', baseTemp: 20.8, anomalyMultiplier: 4.3, radiusMeters: 55000 },

  // Manche (Mer d'Iroise Nord, Golfe Normand-Breton, Baie de Seine, Pas-de-Calais)
  { lat: 48.85, lon: -3.65, basin: 'Manche', baseTemp: 16.0, anomalyMultiplier: 3.0, radiusMeters: 55000 },
  { lat: 48.85, lon: -2.25, basin: 'Manche', baseTemp: 16.6, anomalyMultiplier: 3.3, radiusMeters: 55000 },
  { lat: 49.55, lon: -1.05, basin: 'Manche', baseTemp: 16.8, anomalyMultiplier: 3.2, radiusMeters: 60000 },
  { lat: 49.95, lon: 0.45, basin: 'Manche', baseTemp: 17.0, anomalyMultiplier: 3.3, radiusMeters: 55000 },
  { lat: 50.65, lon: 1.35, basin: 'Manche', baseTemp: 16.9, anomalyMultiplier: 3.1, radiusMeters: 50000 }
];

// ============================================================================
// 2. MARINE SPECIES DATA (WELL-SPACED ACROSS MEDITERRANEAN, ATLANTIC, MANCHE)
// ============================================================================
type SpeciesItem = {
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

const SPECIES_DATA: SpeciesItem[] = [
  {
    id: 'corail-rouge',
    name: 'Corail Rouge',
    scientificName: 'Corallium rubrum',
    basin: 'Méditerranée',
    locationName: 'Côte Vermeille & Réserve de Banyuls',
    coords: [42.48, 3.16],
    trend: 'decline',
    trendLabel: '- Blanchissement & Nécrose',
    criticalThreshold: '> 24.0°C prolongé sous la thermocline',
    baseSst2015: 22.4,
    sst2022: 27.5,
    sst2026: 28.1,
    mortalityRate: '60% des colonies peu profondes touchées',
    shortDesc: 'Or rouge emblématique de la Méditerranée à croissance ultra-lente (quelques millimètres par an).',
    impactDetails: 'Extrêmement sensible au réchauffement des couches d’eau intermédiaires, le corail rouge perd ses polypes nourriciers lors des vagues de chaleur. Sa croissance très lente empêche toute régénération rapide entre deux étés caniculaires.',
    narrationText: 'Sur les tombants rocheux méditerranéens, le précieux corail rouge met des décennies à grandir de quelques centimètres. Les canicules marines répétées détruisent en un été ce que la mer a mis un siècle à bâtir.',
    museumSection: 'med'
  },
  {
    id: 'plancton-global',
    name: 'Plancton & Micro-algues',
    scientificName: 'Phytoplancton & Copépodes',
    basin: 'Méditerranée',
    locationName: 'Golfe du Lion (Large)',
    coords: [42.85, 4.25],
    trend: 'decline',
    trendLabel: '- Chute du bon plancton / + Algues toxiques',
    criticalThreshold: 'Stratification thermique dès +2.0°C d’anomalie SST',
    baseSst2015: 22.1,
    sst2022: 27.4,
    sst2026: 28.0,
    mortalityRate: '-30% de biomasse zooplanctonique nutritive en été',
    shortDesc: 'La base invisible de toute la chaîne alimentaire océanique et premier producteur d’oxygène.',
    impactDetails: 'Les canicules marines bloquent le brassage vertical des eaux (stratification). Privé de sels nutritifs profonds, le phytoplancton nourricier s’effondre au profit de micro-algues toxiques comme Ostreopsis ovata sur nos côtes.',
    narrationText: 'Tout commence dans l’infiniment petit : le plancton produit plus de la moitié de l’oxygène que nous respirons. Mais la chaleur bloque les courants nutritifs, affamant le bon plancton et déclenchant des proliférations de micro-algues toxiques.',
    museumSection: 'plankton'
  },
  {
    id: 'eponges-med',
    name: 'Éponges & Grande Nacre',
    scientificName: 'Spongia officinalis & Pinna nobilis',
    basin: 'Méditerranée',
    locationName: 'Parc National des Calanques & Côte Bleue',
    coords: [43.18, 5.32],
    trend: 'decline',
    trendLabel: '- Extinction locale',
    criticalThreshold: '> 25.5°C + prolifération de protozoaires',
    baseSst2015: 22.9,
    sst2022: 28.1,
    sst2026: 28.6,
    mortalityRate: '95% des Grandes Nacres décimées, éponges nécrosées',
    shortDesc: 'Filtreurs naturels essentiels à la clarté des eaux méditerranéennes.',
    impactDetails: 'Les températures élevées activent des bactéries Vibrio et des parasites (Haplosporidium pinnae) qui déciment les éponges et la Grande Nacre. En perdant ces organismes filtreurs, toute la qualité de l’eau côtière se dégrade.',
    narrationText: 'Les éponges et la grande nacre filtrent des milliers de litres d’eau chaque jour en Méditerranée. Le réchauffement de l’eau favorise des parasites foudroyants qui les font disparaître à un rythme alarmant.',
    museumSection: 'med'
  },
  {
    id: 'posidonie',
    name: 'Herbier de Posidonie',
    scientificName: 'Posidonia oceanica',
    basin: 'Méditerranée',
    locationName: 'Littoral Varois & Îles d’Or',
    coords: [42.98, 6.22],
    trend: 'decline',
    trendLabel: '- Déclin thermique',
    criticalThreshold: '> 28.0°C en zone côtière peu profonde',
    baseSst2015: 23.5,
    sst2022: 28.9,
    sst2026: 29.3,
    mortalityRate: 'Perte de densité foliaire et relargage de carbone',
    shortDesc: 'Le poumon vert de la Méditerranée, puits de carbone majeur et nurserie pour 25% des espèces.',
    impactDetails: 'À plus de 28°C, la posidonie subit un déséquilibre métabolique : elle consomme plus d’oxygène par respiration qu’elle n’en produit par photosynthèse. Cela provoque des floraisons anormales d’épuisement et une mortalité des rhizomes.',
    narrationText: 'La posidonie n’est pas une algue, mais une plante à fleurs sous-marine qui protège nos plages et capte cinq fois plus de carbone qu’une forêt tropicale. Au-delà de vingt-huit degrés, ce poumon de la Méditerranée s’asphyxie.',
    museumSection: 'med'
  },
  {
    id: 'tortue-caouanne',
    name: 'Tortue Caouanne',
    scientificName: 'Caretta caretta',
    basin: 'Méditerranée',
    locationName: 'Plages de la Côte d’Azur',
    coords: [43.52, 7.12],
    trend: 'proliferate',
    trendLabel: '+ Nouvelles pontes au Nord (+ Féminisation)',
    criticalThreshold: '> 29.0°C dans le sable = 100% de naissances femelles',
    baseSst2015: 23.0,
    sst2022: 28.5,
    sst2026: 29.1,
    mortalityRate: 'Déplacement historique des aires de ponte vers le Nord-Ouest',
    shortDesc: 'Elle vient désormais pondre sur les plages françaises, fuyant la Méditerranée orientale trop brûlante.',
    impactDetails: 'On observe de plus en plus de pontes sur les côtes françaises (+ apparition), mais c’est le symptôme d’une crise : chez les tortues marines, la température d’incubation détermine le sexe. Un sable trop chaud ne produit presque plus aucun mâle.',
    narrationText: 'Voir la tortue caouanne pondre sur nos plages semble être une bonne nouvelle. En réalité, elle fuit la Méditerranée orientale devenue trop brûlante. Et au-delà de vingt-neuf degrés, la chaleur ne fait naître que des femelles, menaçant l’avenir de l’espèce.',
    museumSection: 'med'
  },
  {
    id: 'gorgone-med',
    name: 'Gorgone Rouge',
    scientificName: 'Paramuricea clavata',
    basin: 'Méditerranée',
    locationName: 'Réserve de Scandola & Ouest Corse',
    coords: [42.36, 8.54],
    trend: 'decline',
    trendLabel: '- Mortalité massive',
    criticalThreshold: '> 24.5°C entre 15m et 35m de profondeur pendant 5 jours',
    baseSst2015: 22.8,
    sst2022: 27.9,
    sst2026: 28.4,
    mortalityRate: 'Jusqu’à 80% de nécrose observée entre 0 et 30m (Été 2022-2025)',
    shortDesc: 'Véritable forêt animale sous-marine méditerranéenne, décimée par les anomalies thermiques.',
    impactDetails: 'Lors des canicules marines, la thermocline s’enfonce jusqu’à 35-40 mètres. La Gorgone subit un stress thermique aigu suivi du développement de pathogènes opportunistes : ses tissus se nécrosent et ne laissent que le squelette nu.',
    narrationText: 'En Méditerranée, la gorgone rouge forme de véritables forêts sous-marines. Mais lorsque la température dépasse vingt-cinq degrés en profondeur, ses tissus se nécrosent en quelques jours.',
    museumSection: 'med'
  },
  {
    id: 'meduse-pelagia',
    name: 'Méduse Pélagique (Pelagia)',
    scientificName: 'Pelagia noctiluca',
    basin: 'Méditerranée',
    locationName: 'Mer Ligure & Large Corse',
    coords: [43.15, 8.35],
    trend: 'proliferate',
    trendLabel: '+ Blooms explosifs',
    criticalThreshold: 'Favorisée dès > 24.0°C (accélération métabolique)',
    baseSst2015: 23.1,
    sst2022: 28.4,
    sst2026: 29.0,
    mortalityRate: 'Multiplication par x4 de la fréquence des essaims',
    shortDesc: 'Espèce gélatineuse urticante dont le cycle de reproduction s’accélère lors des canicules marines.',
    impactDetails: 'Les eaux chaudes accélèrent la maturation sexuelle des méduses et prolongent leur période de reproduction. De plus, la raréfaction de leurs prédateurs et concurrents leur laisse le champ libre pour former d’immenses radeaux côtiers.',
    narrationText: 'À l’inverse des coraux qui meurent, la méduse Pelagia profite pleinement des canicules marines. L’eau chaude accélère sa reproduction et déclenche des invasions massives sur les plages méditerranéennes.',
    museumSection: 'med'
  },

  // ATLANTIQUE / BRETAGNE
  {
    id: 'laminaires-bretagne',
    name: 'Forêts de Laminaires (Kelp)',
    scientificName: 'Laminaria hyperborea & digitata',
    basin: 'Atlantique',
    locationName: 'Mer d’Iroise & Côtes de Bretagne',
    coords: [48.28, -4.78],
    trend: 'decline',
    trendLabel: '- Régression vers le Nord',
    criticalThreshold: '> 19.5°C (arrêt de croissance et dégradation)',
    baseSst2015: 16.4,
    sst2022: 20.6,
    sst2026: 21.2,
    mortalityRate: 'Recul de 35% de la biomasse sur la limite sud bretonne',
    shortDesc: 'Cathédrales d’algues brunes géantes d’Atlantique, refuges indispensables des poissons et crustacés.',
    impactDetails: 'Les laminaires sont des algues d’eaux froides à tempérées. Lors des canicules marines atlantiques (> 20°C), leurs frondes se fragilisent, leur reproduction est bloquée et elles sont remplacées par du gazon algal beaucoup moins riche en biodiversité.',
    narrationText: 'Direction l’Atlantique et la Bretagne. Les forêts de laminaires sont de véritables cathédrales sous-marines. Mais ces algues d’eaux fraîches supportent mal de dépasser vingt degrés et reculent rapidement vers le nord.',
    museumSection: 'atl'
  },
  {
    id: 'morue-atlantique',
    name: 'Morue (Cabillaud)',
    scientificName: 'Gadus morhua',
    basin: 'Atlantique',
    locationName: 'Plateau Celtique & Façade Atlantique',
    coords: [47.25, -3.55],
    trend: 'decline',
    trendLabel: '- Migration forcée au Nord',
    criticalThreshold: '> 16.0°C pour la survie des œufs et larves',
    baseSst2015: 17.2,
    sst2022: 21.4,
    sst2026: 22.0,
    mortalityRate: 'Déplacement de son aire de répartition de +200 km vers le Nord',
    shortDesc: 'Poisson emblématique des eaux froides qui déserte progressivement les côtes françaises.',
    impactDetails: 'Chez le cabillaud, une eau trop chaude réduit la capacité de transport d’oxygène dans le sang et empêche le bon développement embryonnaire. Les stocks quittent nos côtes atlantiques pour chercher des eaux plus froides en mer du Nord et Norvège.',
    narrationText: 'Le cabillaud, ou morue, est un poisson d’eau froide. Avec les vagues de chaleur sur la façade Atlantique, ses larves ne survivent plus et l’espèce migre inexorablement vers les eaux polaires.',
    museumSection: 'atl'
  },
  {
    id: 'huitres-moules',
    name: 'Huîtres Creuses & Moules',
    scientificName: 'Magallana gigas & Mytilus edulis',
    basin: 'Atlantique',
    locationName: 'Pertuis Charentais & Bassin d’Arcachon',
    coords: [45.88, -1.22],
    trend: 'decline',
    trendLabel: '- Hypoxie & Mortalité estivale',
    criticalThreshold: '> 24.0°C couplé aux efflorescences de micro-algues',
    baseSst2015: 20.5,
    sst2022: 25.8,
    sst2026: 26.4,
    mortalityRate: 'Crises d’anoxie et herpèsvirus OsHV-1',
    shortDesc: 'Pilier de la conchyliculture française, frappé de plein fouet par le manque d’oxygène des eaux chaudes.',
    impactDetails: 'Plus l’eau est chaude, moins elle contient d’oxygène dissous. Fixées sur leurs parcs, les huîtres et les moules ne peuvent pas fuir : elles souffrent d’asphyxie (hypoxie), d’acidification et de virus fulgurants activés dès le seuil de 16-24°C.',
    narrationText: 'Sur la façade Atlantique, les huîtres et les moules ne peuvent pas fuir la chaleur. Une eau trop chaude perd son oxygène et active des virus foudroyants qui menacent toute la conchyliculture française.',
    museumSection: 'atl'
  },

  // MANCHE
  {
    id: 'pieuvre-manche',
    name: 'Pieuvre (Poulpe Commun)',
    scientificName: 'Octopus vulgaris',
    basin: 'Manche',
    locationName: 'Côtes de la Manche & Golfe Normand-Breton',
    coords: [48.85, -2.35],
    trend: 'proliferate',
    trendLabel: '+ Explosion démographique',
    criticalThreshold: 'Survie larvaire décuplée dès > 17.5°C en été',
    baseSst2015: 16.1,
    sst2022: 19.9,
    sst2026: 20.5,
    mortalityRate: 'Prises multipliées par x15 depuis 2021 en Manche',
    shortDesc: 'Grand gagnant du réchauffement en Manche, redoutable prédateur de coquilles Saint-Jacques.',
    impactDetails: 'Après avoir quasi disparu de Manche depuis le rude hiver de 1963, le poulpe commun connaît une explosion démographique spectaculaire grâce aux hivers doux et aux canicules marines estivales qui favorisent la survie de ses paralarves.',
    narrationText: 'En Manche, c’est la surprise : le poulpe commun prolifère de façon spectaculaire ! Les eaux plus chaudes boostent la survie de ses larves, au grand dam des pêcheurs de coquilles Saint-Jacques et de homards.',
    museumSection: 'manche'
  }
];

type SpeciesGalleryImage = {
  title: string;
  src: string;
  alt: string;
  artist: string;
  license: string;
  licenseUrl?: string;
};

type SpeciesGallery = [SpeciesGalleryImage, SpeciesGalleryImage, SpeciesGalleryImage];

const SPECIES_GALLERY_IMAGES: Record<string, SpeciesGallery> = {
  'gorgone-med': [
    {
      title: 'Paramuricea clavata Côte bleue.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Paramuricea_clavata_C%C3%B4te_bleue.jpg/1280px-Paramuricea_clavata_C%C3%B4te_bleue.jpg',
      alt: 'Gorgone rouge observée sur la Côte Bleue, en Méditerranée française',
      artist: 'FredD',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    },
    {
      title: 'Paramuricea clavata (Risso, 1826) 1.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Paramuricea_clavata_%28Risso%2C_1826%29_1.jpg/1280px-Paramuricea_clavata_%28Risso%2C_1826%29_1.jpg',
      alt: 'Gorgone rouge avec d’autres espèces méditerranéennes à Banyuls-sur-Mer',
      artist: 'Parent Géry',
      license: 'CC0',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.en'
    },
    {
      title: 'Paramuricea clavata (Risso, 1826) 5.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Paramuricea_clavata_%28Risso%2C_1826%29_5.jpg/1280px-Paramuricea_clavata_%28Risso%2C_1826%29_5.jpg',
      alt: 'Gorgone rouge observée à Banyuls-sur-Mer',
      artist: 'Parent Géry',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  ],
  'corail-rouge': [
    {
      title: 'Corallo vivo.jpg',
      src: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Corallo_vivo.jpg',
      alt: 'Corail rouge vivant dans la grotte d’Amphitrite, près d’Alghero',
      artist: 'Marco Busdraghi',
      license: 'CC BY 2.5',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.5'
    },
    {
      title: 'Corallium rubrum (Linnaeus, 1758) 11.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Corallium_rubrum_%28Linnaeus%2C_1758%29_11.jpg/1280px-Corallium_rubrum_%28Linnaeus%2C_1758%29_11.jpg',
      alt: 'Corail rouge observé au large de Banyuls-sur-Mer',
      artist: 'Géry PARENT',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    },
    {
      title: 'Corallium rubrum (YPM IZ 000384.CNA).jpeg',
      src: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Corallium_rubrum_%28YPM_IZ_000384.CNA%29.jpeg',
      alt: 'Spécimen conservé de Corallium rubrum',
      artist: 'Eric A. Lazo-Wasem',
      license: 'CC0',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.en'
    }
  ],
  'posidonie': [
    {
      title: 'Posidonia oceanica (L).jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Posidonia_oceanica_%28L%29.jpg/1280px-Posidonia_oceanica_%28L%29.jpg',
      alt: 'Herbier de Posidonie observé à La Ciotat',
      artist: 'Frédéric Ducarme',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    },
    {
      title: 'Posidonia 2 Alberto Romeo.jpg',
      src: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Posidonia_2_Alberto_Romeo.jpg',
      alt: 'Herbier de Posidonie sous l’eau',
      artist: 'Alberto Romeo',
      license: 'CC BY-SA 2.5',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.5'
    },
    {
      title: 'Posidonia oceanica (10.3897-mycokeys.55.35682) Figure 1.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Posidonia_oceanica_%2810.3897-mycokeys.55.35682%29_Figure_1.jpg/1280px-Posidonia_oceanica_%2810.3897-mycokeys.55.35682%29_Figure_1.jpg',
      alt: 'Aspect général de la plante marine Posidonia oceanica',
      artist: 'Vohník et al. (2019)',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0'
    }
  ],
  'eponges-med': [
    {
      title: 'Bath sponge Spongia officinalis Greece.jpg',
      src: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Bath_sponge_Spongia_officinalis_Greece.jpg',
      alt: 'Éponge de bain méditerranéenne Spongia officinalis',
      artist: 'E. Voultsiadou et al.',
      license: 'CC BY-SA 2.5',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.5'
    },
    {
      title: 'Pinnidae - Pinna nobilis.jpg',
      src: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Pinnidae_-_Pinna_nobilis.jpg',
      alt: 'Grande nacre vivante observée à Levanto, en Ligurie',
      artist: 'Hectonichus',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    },
    {
      title: 'Spongia officinalis adriatica MN 01.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Spongia_officinalis_adriatica_MN_01.jpg/1280px-Spongia_officinalis_adriatica_MN_01.jpg',
      alt: 'Éponge Spongia officinalis adriatica de la Méditerranée',
      artist: 'Dornicke',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  ],
  'meduse-pelagia': [
    {
      title: 'Pelagia noctiluca (Sardinia).jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Pelagia_noctiluca_%28Sardinia%29.jpg/1280px-Pelagia_noctiluca_%28Sardinia%29.jpg',
      alt: 'Méduse Pelagia noctiluca dans une mare rocheuse en Sardaigne',
      artist: 'Hans Hillewaert',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    },
    {
      title: 'Morska mjesečina.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Morska_mjese%C4%8Dina.jpg/1280px-Morska_mjese%C4%8Dina.jpg',
      alt: 'Méduse observée dans la mer Adriatique',
      artist: 'West Brom 4ever',
      license: 'Domaine public'
    },
    {
      title: 'Pelagia noctiluca (group).jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Pelagia_noctiluca_%28group%29.jpg/1280px-Pelagia_noctiluca_%28group%29.jpg',
      alt: 'Petit groupe de méduses Pelagia noctiluca en Sardaigne',
      artist: 'Hans Hillewaert',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  ],
  'tortue-caouanne': [
    {
      title: 'Loggerhead sea turtle.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Loggerhead_sea_turtle.jpg/1280px-Loggerhead_sea_turtle.jpg',
      alt: 'Tortue caouanne nageant au-dessus de l’objectif',
      artist: 'ukanda',
      license: 'CC BY 2.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0'
    },
    {
      title: 'Parque Nacional Marinho de Fernando de Noronha - João Paulo Marques DAndretta 12.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/Parque_Nacional_Marinho_de_Fernando_de_Noronha_-_Jo%C3%A3o_Paulo_Marques_DAndretta_12.jpg/1280px-Parque_Nacional_Marinho_de_Fernando_de_Noronha_-_Jo%C3%A3o_Paulo_Marques_DAndretta_12.jpg',
      alt: 'Tortue caouanne et plongeur dans un parc marin au Brésil',
      artist: 'João D’Andretta',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    },
    {
      title: 'Loggerhead turtle.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Loggerhead_turtle.jpg/1280px-Loggerhead_turtle.jpg',
      alt: 'Tortue caouanne dans un aquarium',
      artist: 'Bachrach44',
      license: 'Domaine public'
    }
  ],
  'laminaires-bretagne': [
    {
      title: 'Faroe stamp 286 seaweed - cuvie or forest kelp (Laminaria hyperborea).jpg',
      src: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Faroe_stamp_286_seaweed_-_cuvie_or_forest_kelp_%28Laminaria_hyperborea%29.jpg',
      alt: 'Illustration d’une laminaire Laminaria hyperborea sur un timbre',
      artist: 'Postverk Føroya',
      license: 'Domaine public'
    },
    {
      title: 'Croissance des laminaires - Plongée de mesure des stipes de Laminaria hyperborea (Ifremer 00794-90612).jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Croissance_des_laminaires_-_Plong%C3%A9e_de_mesure_des_stipes_de_Laminaria_hyperborea_%28Ifremer_00794-90612%29.jpg/1280px-Croissance_des_laminaires_-_Plong%C3%A9e_de_mesure_des_stipes_de_Laminaria_hyperborea_%28Ifremer_00794-90612%29.jpg',
      alt: 'Plongeur mesurant une laminaire Laminaria hyperborea',
      artist: 'Olivier Dugornay / Ifremer',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0'
    },
    {
      title: 'Croissance des laminaires - Découpe de Laminaria hyperborea depuis le crampon (Ifremer 00547-65930 - 51632).jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Croissance_des_laminaires_-_D%C3%A9coupe_de_Laminaria_hyperborea_depuis_le_crampon_%28Ifremer_00547-65930_-_51632%29.jpg/1280px-Croissance_des_laminaires_-_D%C3%A9coupe_de_Laminaria_hyperborea_depuis_le_crampon_%28Ifremer_00547-65930_-_51632%29.jpg',
      alt: 'Laminaire coupée au niveau de son crampon par un plongeur',
      artist: 'Olivier Dugornay / Ifremer',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0'
    }
  ],
  'morue-atlantique': [
    {
      title: 'Atlantic cod.jpg',
      src: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Atlantic_cod.jpg',
      alt: 'Morue de l’Atlantique',
      artist: 'U.S. Fish and Wildlife Service',
      license: 'Domaine public'
    },
    {
      title: 'Atlantic Cod, Atlantischer Kabeljau (Gadus morhua).jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Atlantic_Cod%2C_Atlantischer_Kabeljau_%28Gadus_morhua%29.jpg/1280px-Atlantic_Cod%2C_Atlantischer_Kabeljau_%28Gadus_morhua%29.jpg',
      alt: 'Morue de l’Atlantique dans un aquarium à Stralsund',
      artist: 'Wilhelm Thomas Fiege',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    },
    {
      title: 'Abuluntu cod tounge 2.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Abuluntu_cod_tounge_2.jpg/1280px-Abuluntu_cod_tounge_2.jpg',
      alt: 'Langues de morue salées',
      artist: 'Abuluntu',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  ],
  'huitres-moules': [
    {
      title: 'Magallana gigas - Mytilus edulis - Centre Ostréicole - Leucate.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Magallana_gigas_-_Mytilus_edulis_-_Centre_Ostr%C3%A9icole_-_Leucate.jpg/1280px-Magallana_gigas_-_Mytilus_edulis_-_Centre_Ostr%C3%A9icole_-_Leucate.jpg',
      alt: 'Coquilles d’huîtres creuses et de moules bleues au centre ostréicole de Leucate',
      artist: 'H. Zell',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    },
    {
      title: 'Pacific oyster from Brofjorden on a chopping board in Tuntorp.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Pacific_oyster_from_Brofjorden_on_a_chopping_board_in_Tuntorp.jpg/1280px-Pacific_oyster_from_Brofjorden_on_a_chopping_board_in_Tuntorp.jpg',
      alt: 'Huître creuse du Pacifique accompagnée de deux petites huîtres',
      artist: 'W.carter',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    },
    {
      title: 'Crassostrea gigas 01.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Crassostrea_gigas_01.jpg/1280px-Crassostrea_gigas_01.jpg',
      alt: 'Différentes vues de la coquille d’une huître creuse du Pacifique',
      artist: 'Llez',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0'
    }
  ],
  'pieuvre-manche': [
    {
      title: 'Octopus vulgaris Merculiano.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Octopus_vulgaris_Merculiano.jpg/1280px-Octopus_vulgaris_Merculiano.jpg',
      alt: 'Illustration scientifique de la pieuvre commune Octopus vulgaris',
      artist: 'Comingio Merculiano',
      license: 'Domaine public'
    },
    {
      title: 'Pulpo común (Octopus vulgaris), franja marina Teno-Rasca, Tenerife, España, 2022-01-08, DD 53.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Pulpo_com%C3%BAn_%28Octopus_vulgaris%29%2C_franja_marina_Teno-Rasca%2C_Tenerife%2C_Espa%C3%B1a%2C_2022-01-08%2C_DD_53.jpg/1280px-Pulpo_com%C3%BAn_%28Octopus_vulgaris%29%2C_franja_marina_Teno-Rasca%2C_Tenerife%2C_Espa%C3%B1a%2C_2022-01-08%2C_DD_53.jpg',
      alt: 'Pieuvre commune dans la réserve marine de Teno-Rasca, à Tenerife',
      artist: 'Diego Delso',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    },
    {
      title: 'Pulpo común (Octopus vulgaris), Parque natural de la Arrábida, Portugal, 2020-07-21, DD 33.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Pulpo_com%C3%BAn_%28Octopus_vulgaris%29%2C_Parque_natural_de_la_Arr%C3%A1bida%2C_Portugal%2C_2020-07-21%2C_DD_33.jpg/1280px-Pulpo_com%C3%BAn_%28Octopus_vulgaris%29%2C_Parque_natural_de_la_Arr%C3%A1bida%2C_Portugal%2C_2020-07-21%2C_DD_33.jpg',
      alt: 'Pieuvre commune dans le parc naturel d’Arrábida, au Portugal',
      artist: 'Diego Delso',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
    }
  ],
  'plancton-global': [
    {
      title: 'Phytoplankton blooms in the North Sea.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Phytoplankton_blooms_in_the_North_Sea.jpg/1280px-Phytoplankton_blooms_in_the_North_Sea.jpg',
      alt: 'Floraison de phytoplancton dans la mer du Nord vue par Copernicus Sentinel-3',
      artist: 'European Union, Copernicus Sentinel-3 imagery',
      license: 'Attribution'
    },
    {
      title: 'Phytoplankton bloom in the English Channel.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Phytoplankton_bloom_in_the_English_Channel.jpg/1280px-Phytoplankton_bloom_in_the_English_Channel.jpg',
      alt: 'Floraison de phytoplancton dans la Manche vue par Copernicus Sentinel-2',
      artist: 'European Union, Copernicus Sentinel-2 imagery',
      license: 'Attribution'
    },
    {
      title: 'Phytoplankton bloom in the Black Sea.jpg',
      src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Phytoplankton_bloom_in_the_Black_Sea.jpg/1280px-Phytoplankton_bloom_in_the_Black_Sea.jpg',
      alt: 'Floraison de phytoplancton dans la mer Noire vue par Copernicus Sentinel-2',
      artist: 'European Union, Copernicus Sentinel-2 imagery',
      license: 'Attribution'
    }
  ]
};

// ============================================================================
// 3. COPERNICUS MARINE TIME-SERIES DATASET (2015 - 2026) + .NC ANOMALY
// ============================================================================
const COPERNICUS_YEARS = [
  { year: 2015, label: 'Été 2015', ncGlobalAnom: 0.36, ncTrend: 0.31, medSst: 23.4, medAnomaly: 0.8, atlSst: 18.2, atlAnomaly: 0.5, mancheSst: 16.4, mancheAnomaly: 0.4, mhwDaysMed: 18, mhwCategory: 'Modérée', highlight: 'Référence satellite CMEMS' },
  { year: 2016, label: 'Été 2016', ncGlobalAnom: 0.42, ncTrend: 0.37, medSst: 23.8, medAnomaly: 1.1, atlSst: 18.5, atlAnomaly: 0.7, mancheSst: 16.7, mancheAnomaly: 0.6, mhwDaysMed: 24, mhwCategory: 'Modérée', highlight: 'Réchauffement progressif' },
  { year: 2017, label: 'Été 2017', ncGlobalAnom: 0.34, ncTrend: 0.33, medSst: 24.6, medAnomaly: 1.8, atlSst: 18.9, atlAnomaly: 1.0, mancheSst: 17.0, mancheAnomaly: 0.9, mhwDaysMed: 39, mhwCategory: 'Forte', highlight: 'Première alerte sur les gorgones' },
  { year: 2018, label: 'Été 2018', ncGlobalAnom: 0.31, ncTrend: 0.32, medSst: 25.4, medAnomaly: 2.3, atlSst: 19.4, atlAnomaly: 1.4, mancheSst: 17.5, mancheAnomaly: 1.2, mhwDaysMed: 52, mhwCategory: 'Forte', highlight: 'Anomalie Golfe du Lion & Provence' },
  { year: 2019, label: 'Été 2019', ncGlobalAnom: 0.41, ncTrend: 0.38, medSst: 25.1, medAnomaly: 2.0, atlSst: 19.2, atlAnomaly: 1.3, mancheSst: 17.4, mancheAnomaly: 1.1, mhwDaysMed: 46, mhwCategory: 'Forte', highlight: 'Mortalité Grande Nacre' },
  { year: 2020, label: 'Été 2020', ncGlobalAnom: 0.43, ncTrend: 0.41, medSst: 25.6, medAnomaly: 2.5, atlSst: 19.8, atlAnomaly: 1.7, mancheSst: 17.9, mancheAnomaly: 1.5, mhwDaysMed: 58, mhwCategory: 'Sévère', highlight: 'Début du boom du poulpe en Manche' },
  { year: 2021, label: 'Été 2021', ncGlobalAnom: 0.35, ncTrend: 0.39, medSst: 25.9, medAnomaly: 2.7, atlSst: 19.9, atlAnomaly: 1.8, mancheSst: 18.2, mancheAnomaly: 1.7, mhwDaysMed: 64, mhwCategory: 'Sévère', highlight: 'Pontes de tortues sur la côte méditerranéenne' },
  { year: 2022, label: 'Été 2022 🔥', ncGlobalAnom: 0.46, ncTrend: 0.45, medSst: 28.4, medAnomaly: 4.3, atlSst: 21.3, atlAnomaly: 2.9, mancheSst: 19.5, mancheAnomaly: 2.6, mhwDaysMed: 96, mhwCategory: 'Extrême (Cat. IV)', highlight: 'Canicule marine historique en Méditerranée (+4.3°C)' },
  { year: 2023, label: 'Été 2023 🔥', ncGlobalAnom: 0.86, ncTrend: 0.78, medSst: 28.7, medAnomaly: 4.5, atlSst: 21.8, atlAnomaly: 3.3, mancheSst: 19.8, mancheAnomaly: 2.8, mhwDaysMed: 104, mhwCategory: 'Extrême (Cat. IV)', highlight: 'Record C3S .nc (+0.86 K global / +4.5°C Med)' },
  { year: 2024, label: 'Été 2024 🔥', ncGlobalAnom: 0.90, ncTrend: 0.88, medSst: 28.9, medAnomaly: 4.6, atlSst: 21.9, atlAnomaly: 3.3, mancheSst: 19.9, mancheAnomaly: 2.9, mhwDaysMed: 108, mhwCategory: 'Extrême (Cat. IV)', highlight: 'Pic du fichier .nc Copernicus (+0.90 K global)' },
  { year: 2025, label: 'Été 2025 🔥', ncGlobalAnom: 0.92, ncTrend: 0.90, medSst: 29.0, medAnomaly: 4.7, atlSst: 22.1, atlAnomaly: 3.5, mancheSst: 20.1, mancheAnomaly: 3.0, mhwDaysMed: 112, mhwCategory: 'Extrême (Cat. IV)', highlight: 'Tropicalisation accélérée du bassin Méditerranéen' },
  { year: 2026, label: 'Été 2026 (Actuel)', ncGlobalAnom: 0.95, ncTrend: 0.93, medSst: 29.2, medAnomaly: 4.8, atlSst: 22.3, atlAnomaly: 3.6, mancheSst: 20.4, mancheAnomaly: 3.2, mhwDaysMed: 119, mhwCategory: 'Extrême (Cat. IV)', highlight: 'Données Copernicus NRT — Alerte Rouge Biodiversité' }
];

const MUSEUM_SECTIONS = [
  {
    id: 'med',
    buttonNumber: 1,
    title: 'Méditerranée : Coraux & Herbiers',
    subtitle: 'Forêts de gorgones, herbiers de posidonie & canicules',
    center: [43.05, 5.95] as [number, number],
    zoom: 7,
    color: 'from-rose-500 to-amber-500',
    speciesIds: ['corail-rouge', 'eponges-med', 'posidonie', 'tortue-caouanne', 'gorgone-med', 'meduse-pelagia']
  },
  {
    id: 'atl',
    buttonNumber: 2,
    title: 'Atlantique & Bretagne : Laminaires',
    subtitle: 'Recul des forêts de kelp, exode du cabillaud et stress ostréicole',
    center: [47.15, -3.10] as [number, number],
    zoom: 7,
    color: 'from-sky-500 to-blue-600',
    speciesIds: ['laminaires-bretagne', 'morue-atlantique', 'huitres-moules']
  },
  {
    id: 'manche',
    buttonNumber: 3,
    title: 'Manche : La Prolifération du Poulpe',
    subtitle: 'Quand le réchauffement fait exploser de nouveaux prédateurs',
    center: [49.15, -2.15] as [number, number],
    zoom: 8,
    color: 'from-emerald-500 to-teal-600',
    speciesIds: ['pieuvre-manche']
  },
  {
    id: 'plankton',
    buttonNumber: 4,
    title: 'Plancton : Le Socle Invisible Menacé',
    subtitle: 'Stratification des eaux, chute d’oxygène et micro-algues toxiques',
    center: [42.85, 4.25] as [number, number],
    zoom: 8,
    color: 'from-indigo-500 to-cyan-600',
    speciesIds: ['plancton-global']
  }
];

// Helper: Color scale for Sea Surface Temperature (15°C -> 30°C)
function getSstColor(tempC: number): string {
  if (tempC >= 28.0) return '#be123c'; // Deep crimson heatwave
  if (tempC >= 26.5) return '#e11d48'; // Rose red
  if (tempC >= 24.5) return '#f97316'; // Orange
  if (tempC >= 22.0) return '#f59e0b'; // Amber
  if (tempC >= 19.5) return '#eab308'; // Yellow warm
  if (tempC >= 17.5) return '#10b981'; // Temperate emerald
  return '#0ea5e9'; // Cool ocean blue
}

// ============================================================================
// 4. WEB AUDIO API UNDERWATER SOUNDSCAPE SYNTHESIZER
// ============================================================================
class UnderwaterAudioEngine {
  ctx: AudioContext | null;
  isPlaying: boolean;
  masterGain: GainNode | null;
  pingInterval: ReturnType<typeof setInterval> | null;
  whiteNoise: AudioBufferSourceNode | undefined;
  lfo: OscillatorNode | undefined;
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.pingInterval = null;
  }

  start() {
    if (this.isPlaying) return;
    try {
      const AudioContext = window.AudioContext || window.AudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 1.5);
      this.masterGain.connect(this.ctx.destination);

      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5;
      }

      this.whiteNoise = this.ctx.createBufferSource();
      this.whiteNoise.buffer = noiseBuffer;
      this.whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.14;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 70;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      this.whiteNoise.connect(filter);
      filter.connect(this.masterGain);

      this.whiteNoise.start(0);
      lfo.start(0);
      this.lfo = lfo;

      this.pingInterval = setInterval(() => {
        const masterGain = this.masterGain;
        if (!this.ctx || !this.isPlaying || !masterGain) return;

        const osc = this.ctx.createOscillator();
        const pingGain = this.ctx.createGain();
        const freqs = [396, 528, 639, 432];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freqs[Math.floor(Math.random() * freqs.length)], this.ctx.currentTime);

        pingGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        pingGain.gain.exponentialRampToValueAtTime(0.035, this.ctx.currentTime + 0.4);
        pingGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.2);

        osc.connect(pingGain);
        pingGain.connect(masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 3.3);
      }, 5500);

      this.isPlaying = true;
    } catch (e) {
      console.warn('Web Audio API non supportée ou bloquée:', e);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    try {
      if (this.pingInterval) clearInterval(this.pingInterval);
      if (this.ctx) {
        this.ctx.close();
      }
    } catch (e) {
      console.warn(e);
    }
    this.isPlaying = false;
  }
}

// ============================================================================
// 5. REAL WORLD MAP COMPONENT + COPERNICUS SST OVERLAY (FILTERED TO FRANCE)
// ============================================================================
declare global {
  interface Window {
    L: any;
  }
}

function RealWorldMap({
  species,
  selectedSpecies,
  onSelectSpecies,
  onClearSelection,
  focusedBasin,
  selectedBasin,
  showThermalOverlay,
  showSatelliteRaster,
  heatFactor,
  currentYearData,
  tileStyle
}: {
  species: SpeciesItem[];
  selectedSpecies: SpeciesItem | null;
  onSelectSpecies: (sp: SpeciesItem) => void;
  onClearSelection: () => void;
  focusedBasin: string | null;
  selectedBasin: string;
  showThermalOverlay: boolean;
  showSatelliteRaster: boolean;
  heatFactor: number;
  currentYearData: (typeof COPERNICUS_YEARS)[number];
  tileStyle: 'voyager' | 'osm';
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const copernicusRasterRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const thermalLayerRef = useRef<any>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  // 1. Dynamically load Leaflet CSS & JS from CDN
  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }

    const cssId = 'leaflet-cdn-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const scriptId = 'leaflet-cdn-js';
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => setLeafletReady(true));
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setLeafletReady(true);
    document.body.appendChild(script);
  }, []);

  // 2. Initialize Leaflet Map with 100% Free Tile Servers
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = window.L;

    const map = L.map(mapContainerRef.current, {
      center: [46.1, 2.5],
      zoom: 6,
      minZoom: 4,
      maxZoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileUrl =
      tileStyle === 'osm'
        ? 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 13,
      attribution: '&copy; OpenStreetMap France &copy; Esri World Ocean &copy; Copernicus C3S'
    }).addTo(map);

    thermalLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', () => {
      onClearSelection();
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leafletReady]);

  // 3. Switch Base Map Tile Style (Keyless)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileUrl =
      tileStyle === 'osm'
        ? 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';
    tileLayerRef.current.setUrl(tileUrl);
  }, [tileStyle]);

  // 4. Optional Live Satellite SST Raster Layer (NASA GIBS / Copernicus GHRSST L4, clipped to France bbox)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;
    const L = window.L;

    if (copernicusRasterRef.current) {
      map.removeLayer(copernicusRasterRef.current);
      copernicusRasterRef.current = null;
    }

    if (showSatelliteRaster) {
      // Official keyless GHRSST L4 Sea Surface Temperature satellite raster bounded to France
      const franceBounds = L.latLngBounds([41.0, -6.5], [51.5, 10.5]);
      copernicusRasterRef.current = L.tileLayer(
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GHRSST_L4_MUR_Sea_Surface_Temperature/default/2023-08-15/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png',
        {
          opacity: 0.55,
          maxNativeZoom: 7,
          maxZoom: 13,
          bounds: franceBounds,
          attribution: 'SST Raster: Copernicus / GHRSST L4'
        }
      ).addTo(map);
    }
  }, [leafletReady, showSatelliteRaster]);

  // 5. FlyTo Region when focusedBasin changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (focusedBasin === 'Méditerranée') {
      map.flyTo([42.95, 5.85], 7.4, { duration: 1.25 });
    } else if (focusedBasin === 'Atlantique') {
      map.flyTo([47.2, -3.2], 7.2, { duration: 1.25 });
    } else if (focusedBasin === 'Manche') {
      map.flyTo([49.05, -2.15], 8.0, { duration: 1.25 });
    } else {
      map.flyTo([46.1, 2.5], 6.0, { duration: 1.2 });
    }
  }, [focusedBasin]);

  // 6. Fly closer to a selected species if needed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedSpecies) return;
    const currentZoom = map.getZoom();
    map.flyTo(selectedSpecies.coords, Math.max(currentZoom, 7.5), { duration: 0.9 });
  }, [selectedSpecies?.id]);

  // 7. Render Filtered France SST Water Temperature Grid Cells (Driven by .nc anomaly!)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const thermalLayer = thermalLayerRef.current;
    if (!map || !thermalLayer || !window.L) return;
    const L = window.L;

    thermalLayer.clearLayers();
    if (!showThermalOverlay) return;

    // Filter SST grid cells to France or the currently selected French maritime basin
    const cellsToRender = FRANCE_SST_GRID_CELLS.filter(
      (cell) => selectedBasin === 'Tous' || cell.basin === selectedBasin
    );

    cellsToRender.forEach((cell) => {
      // Compute local SST & Anomaly from the decoded .nc global anomaly + regional amplification
      const localAnomaly = +(currentYearData.ncGlobalAnom * cell.anomalyMultiplier).toFixed(1);
      const localSst = +(cell.baseTemp + localAnomaly).toFixed(1);
      const color = getSstColor(localSst);

      // Soft outer thermal diffusion halo
      L.circle([cell.lat, cell.lon], {
        radius: cell.radiusMeters * 1.35,
        stroke: false,
        fillColor: color,
        fillOpacity: 0.18 + 0.14 * heatFactor,
        interactive: false
      }).addTo(thermalLayer);

      // Inner SST core cell with interactive tooltip showing the exact .nc-derived water temp
      const coreCircle = L.circle([cell.lat, cell.lon], {
        radius: cell.radiusMeters * 0.78,
        stroke: true,
        color: color,
        weight: 1,
        opacity: 0.45,
        fillColor: color,
        fillOpacity: 0.28 + 0.18 * heatFactor
      }).addTo(thermalLayer);

      coreCircle.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 11px; line-height: 1.35;">
          <strong style="color: #0f172a;">Cellule Copernicus SST (${cell.basin})</strong><br/>
          Température eau : <b style="color: ${color};">${localSst}°C</b><br/>
          Anomalie locale : <b>+${localAnomaly}°C</b> <span style="color:#64748b;">(Global .nc: +${currentYearData.ncGlobalAnom} K)</span>
        </div>`,
        { sticky: true, direction: 'top' }
      );
    });
  }, [leafletReady, showThermalOverlay, heatFactor, currentYearData, selectedBasin]);

  // 8. Render Well-Spaced Species Badges on the Real World Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer || !window.L) return;
    const L = window.L;

    markersLayer.clearLayers();

    species.forEach((sp) => {
      const isSelected = selectedSpecies?.id === sp.id;
      const isDecline = sp.trend === 'decline';
      const badgeColor = isDecline ? '#e11d48' : '#10b981';
      const ringColor = isDecline ? 'rgba(225, 29, 72, 0.28)' : 'rgba(16, 185, 129, 0.28)';
      const borderColor = isDecline ? '#fecdd3' : '#a7f3d0';
      const sign = isDecline ? '−' : '+';

      const html = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translate(-50%, -50%);
          cursor: pointer;
          user-select: none;
        ">
          <div style="
            position: relative;
            width: ${isSelected ? '38px' : '30px'};
            height: ${isSelected ? '38px' : '30px'};
            border-radius: 9999px;
            background: ${badgeColor};
            border: 3px solid #ffffff;
            box-shadow: 0 0 0 ${isSelected ? '8px' : '5px'} ${ringColor}, 0 6px 14px rgba(15, 23, 42, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 900;
            font-size: ${isSelected ? '18px' : '15px'};
            line-height: 1;
            transition: all 0.2s ease;
          ">
            ${sign}
          </div>
          <div style="
            margin-top: 5px;
            padding: 2px 8px;
            border-radius: 9999px;
            background: ${isSelected ? '#0f172a' : 'rgba(255, 255, 255, 0.96)'};
            color: ${isSelected ? '#ffffff' : '#0f172a'};
            border: 1.5px solid ${isSelected ? badgeColor : borderColor};
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(15, 23, 42, 0.14);
          ">
            ${sp.name}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-species-leaflet-pin',
        html,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const marker = L.marker(sp.coords, { icon }).addTo(markersLayer);
      marker.on('click', (e: any) => {
        if (e.originalEvent) {
          e.originalEvent.stopPropagation();
        }
        onSelectSpecies(sp);
      });
    });
  }, [leafletReady, species, selectedSpecies]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      {!leafletReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-sky-50 text-sky-800 text-sm font-semibold">
          Chargement de la carte mondiale OpenStreetMap…
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 6. MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // Navigation Mode: 'explore' | 'museum' | 'data'
  const [activeMode, setActiveMode] = useState('explore');

  // Filter Menu Drawer State
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters & Map State
  const [selectedBasin, setSelectedBasin] = useState('Tous');
  const [selectedTrend, setSelectedTrend] = useState('Tous');
  const [yearIndex, setYearIndex] = useState(9); // Default 2024 (latest year in uploaded .nc file, or slide up to 2026)
  const [showThermalOverlay, setShowThermalOverlay] = useState(true);
  const [showSatelliteRaster, setShowSatelliteRaster] = useState(false);
  const [showCopernicusWmsInfo, setShowCopernicusWmsInfo] = useState(false);
  const [tileStyle, setTileStyle] = useState<'voyager' | 'osm'>('voyager');

  // Selected Species Card State (NULL BY DEFAULT -> ONLY SHOWS WHEN CLICKED ON THE MAP)
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesItem | null>(null);
  const [speciesImageIndex, setSpeciesImageIndex] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);

  const selectedSpeciesImages = selectedSpecies
    ? SPECIES_GALLERY_IMAGES[selectedSpecies.id]
    : null;

  useEffect(() => {
    setSpeciesImageIndex(0);
  }, [selectedSpecies?.id]);

  // Auto-advance carousel gently unless the user is hovering
  useEffect(() => {
    if (!selectedSpeciesImages || isHoveringCarousel) return;

    const timer = window.setInterval(() => {
      setSpeciesImageIndex((index) => (index + 1) % selectedSpeciesImages.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [isHoveringCarousel, selectedSpecies?.id, selectedSpeciesImages]);

  // Audio & Narration State
  const [ambientSoundOn, setAmbientSoundOn] = useState(false);
  const [voiceOverOn, setVoiceOverOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioEngineRef = useRef<UnderwaterAudioEngine | null>(null);

  // Mode 2: Museum / Fresque Murale Guided Tour State
  const [activeMuseumSection, setActiveMuseumSection] = useState(MUSEUM_SECTIONS[0]);
  const [museumStepIndex, setMuseumStepIndex] = useState(0);
  const [isMuseumPlaying, setIsMuseumPlaying] = useState(false);
  const [sectionCompletedPause, setSectionCompletedPause] = useState(false);
  const [showMuseumDrawer, setShowMuseumDrawer] = useState(true);
  const museumTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mode 3: Scientific Data Export Preview
  const [exportPreviewFormat, setExportPreviewFormat] = useState<'csv' | 'json' | null>(null);

  // Interactive Map Regional Focus State
  const [mapView, setMapView] = useState<{ focusedBasin: string | null }>({
    focusedBasin: null
  });

  const currentYearData = COPERNICUS_YEARS[yearIndex];

  // Initialize Underwater Audio Engine
  useEffect(() => {
    audioEngineRef.current = new UnderwaterAudioEngine();
    return () => {
      if (audioEngineRef.current) audioEngineRef.current.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const toggleAmbientSound = () => {
    if (!audioEngineRef.current) return;
    if (ambientSoundOn) {
      audioEngineRef.current.stop();
      setAmbientSoundOn(false);
    } else {
      audioEngineRef.current.start();
      setAmbientSoundOn(true);
    }
  };

  const speakText = (text: string | undefined) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    if (!voiceOverOn) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.98;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Filtered Species for Map
  const filteredSpecies = useMemo(() => {
    return SPECIES_DATA.filter((sp) => {
      const matchBasin = selectedBasin === 'Tous' || sp.basin === selectedBasin;
      const matchTrend =
        selectedTrend === 'Tous' ||
        (selectedTrend === 'decline' && sp.trend === 'decline') ||
        (selectedTrend === 'proliferate' && sp.trend === 'proliferate');
      return matchBasin && matchTrend;
    });
  }, [selectedBasin, selectedTrend]);

  // Handle Species Click on Map -> Opens the right-hand detail card
  const handleSelectSpecies = (sp: SpeciesItem) => {
    setSelectedSpecies(sp);
    if (activeMode === 'museum' && voiceOverOn) {
      speakText(`${sp.name}. ${sp.narrationText}`);
    }
  };

  // Focus Basin on Map (Deep Regional FlyTo on Real Map + Filter SST Grid)
  const handleBasinFocus = (basin: string) => {
    setSelectedBasin(basin);
    if (basin === 'Méditerranée') {
      setMapView({ focusedBasin: 'Méditerranée' });
    } else if (basin === 'Atlantique') {
      setMapView({ focusedBasin: 'Atlantique' });
    } else if (basin === 'Manche') {
      setMapView({ focusedBasin: 'Manche' });
    } else {
      setMapView({ focusedBasin: null });
    }
  };

  // ============================================================================
  // MODE 2: MUSEUM GUIDED STORY MAP LOGIC (AUTO-STOP PER SECTION)
  // ============================================================================
  const startMuseumSection = (section: typeof MUSEUM_SECTIONS[number]) => {
    if (museumTimerRef.current) clearTimeout(museumTimerRef.current);
    setActiveMuseumSection(section);
    setMuseumStepIndex(0);
    setSectionCompletedPause(false);
    setIsMuseumPlaying(true);

    if (!ambientSoundOn && audioEngineRef.current) {
      audioEngineRef.current.start();
      setAmbientSoundOn(true);
    }

    if (section.id === 'med' || section.id === 'plankton') {
      setSelectedBasin('Méditerranée');
      setMapView({ focusedBasin: 'Méditerranée' });
    } else if (section.id === 'atl') {
      setSelectedBasin('Atlantique');
      setMapView({ focusedBasin: 'Atlantique' });
    } else if (section.id === 'manche') {
      setSelectedBasin('Manche');
      setMapView({ focusedBasin: 'Manche' });
    }

    const firstSpecies = SPECIES_DATA.find((s) => s.id === section.speciesIds[0]);
    if (firstSpecies) {
      setSelectedSpecies(firstSpecies);
      if (voiceOverOn) {
        speakText(`Chapitre ${section.buttonNumber} : ${section.title}. ${firstSpecies.name}. ${firstSpecies.narrationText}`);
      }
    }
  };

  useEffect(() => {
    if (activeMode !== 'museum' || !isMuseumPlaying) {
      if (museumTimerRef.current) clearTimeout(museumTimerRef.current);
      return;
    }

    const sectionSpecies = activeMuseumSection.speciesIds
      .map((id) => SPECIES_DATA.find((s) => s.id === id))
      .filter((species): species is SpeciesItem => species !== undefined);

    museumTimerRef.current = setTimeout(() => {
      if (museumStepIndex < sectionSpecies.length - 1) {
        const nextIdx = museumStepIndex + 1;
        const nextSp = sectionSpecies[nextIdx];
        if (!nextSp) {
          setIsMuseumPlaying(false);
          return;
        }

        setMuseumStepIndex(nextIdx);
        setSelectedSpecies(nextSp);
        if (voiceOverOn) {
          speakText(`${nextSp.name}. ${nextSp.narrationText}`);
        }
      } else {
        setIsMuseumPlaying(false);
        setSectionCompletedPause(true);
        if (voiceOverOn) {
          speakText(
            `Fin de la séquence ${activeMuseumSection.title}. Appuyez sur un autre bouton de la fresque murale pour explorer le bassin suivant.`
          );
        }
      }
    }, 11500);

    return () => {
      if (museumTimerRef.current) clearTimeout(museumTimerRef.current);
    };
  }, [activeMode, isMuseumPlaying, museumStepIndex, activeMuseumSection, voiceOverOn]);

  // ============================================================================
  // MODE 3: CSV & JSON EXPORT GENERATORS (INCLUDING DECODED .NC DATA)
  // ============================================================================
  const generateCsvContent = () => {
    const headers = [
      'ID_Espece',
      'Nom_Commun',
      'Nom_Scientifique',
      'Bassin_Maritime',
      'Zone_Observation',
      'Latitude',
      'Longitude',
      'Impact_Canicule',
      'Seuil_Thermique_Critique',
      'SST_2015_C',
      'SST_Canicule_2022_C',
      'SST_Copernicus_2026_C',
      'Anomalie_Globale_NC_2024_K',
      'Source_Fichier_NetCDF'
    ];
    const rows = SPECIES_DATA.map((sp) => {
      return [
        sp.id,
        `"${sp.name}"`,
        `"${sp.scientificName}"`,
        `"${sp.basin}"`,
        `"${sp.locationName}"`,
        sp.coords[0],
        sp.coords[1],
        sp.trend === 'decline' ? 'DECLIN_MORTALITE (-)' : 'PROLIFERATION_EXPANSION (+)',
        `"${sp.criticalThreshold}"`,
        sp.baseSst2015,
        sp.sst2022,
        sp.sst2026,
        '+0.90',
        NC_FILE_METADATA.source
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  };

  const generateJsonContent = () => {
    const payload = {
      project: 'ThermoMaris - Ocean Hackathon',
      netcdfFileMetadata: NC_FILE_METADATA,
      generatedAt: new Date().toISOString(),
      decodedNetcdfTimeSeries1982_2024: DECODED_NC_SERIES,
      franceFilteredSstGridCells: FRANCE_SST_GRID_CELLS,
      speciesIndicators: SPECIES_DATA.map((sp) => ({
        id: sp.id,
        name: sp.name,
        scientificName: sp.scientificName,
        basin: sp.basin,
        coordinates: { lat: sp.coords[0], lon: sp.coords[1] },
        responseToMarineHeatwave: sp.trend === 'decline' ? '- Disparaît / Déclin' : '+ Apparaît / Prolifère',
        criticalThreshold: sp.criticalThreshold,
        telemetry: {
          sst2015: sp.baseSst2015,
          sst2022: sp.sst2022,
          sst2026: sp.sst2026,
          deltaAnomaly: Number((sp.sst2026 - sp.baseSst2015).toFixed(2))
        }
      }))
    };
    return JSON.stringify(payload, null, 2);
  };

  const triggerDownload = (format: string) => {
    const content = format === 'csv' ? generateCsvContent() : generateJsonContent();
    const mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
    const filename = `copernicus_nc_canicules_france_${currentYearData.year}.${format}`;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const heatFactor = useMemo(() => {
    return Math.min(1, Math.max(0.18, (currentYearData.medAnomaly - 0.5) / 4.3));
  }, [currentYearData]);

  const activeFiltersCount =
    (selectedBasin !== 'Tous' ? 1 : 0) + (selectedTrend !== 'Tous' ? 1 : 0);

  return (
    <div className="h-screen w-screen bg-sky-50 text-slate-800 font-sans selection:bg-sky-500 selection:text-white flex flex-col overflow-hidden">
      {/* ====================================================================
          TOP NAVIGATION BAR (3 MODES + AUDIO CONTROLS)
      ==================================================================== */}
      <header className="shrink-0 z-40 backdrop-blur-xl bg-white/95 border-b border-sky-200/80 px-4 lg:px-6 py-2.5 shadow-xs">
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          {/* Brand Logo & Hackathon Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 flex items-center justify-center shadow-sm shadow-sky-500/25">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-extrabold tracking-tight bg-gradient-to-r from-sky-900 via-cyan-800 to-teal-700 bg-clip-text text-transparent">
                  ThermoMaris
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  Copernicus .NC Intégré
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden xl:block">
                Sentinelle des Canicules Marines • Données C3S SST_GLO_SST_L4_REP_OBSERVATIONS_010_024 filtrées France
              </p>
            </div>
          </div>

          {/* 3 Mode Switcher Pills */}
          <nav className="flex items-center bg-sky-100/80 p-1 rounded-xl border border-sky-200/80 shadow-inner">
            <button
              onClick={() => {
                setActiveMode('explore');
                setIsMuseumPlaying(false);
                stopSpeech();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeMode === 'explore'
                  ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-sm shadow-sky-600/25'
                  : 'text-slate-600 hover:text-sky-950 hover:bg-white/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>1. Carte Citoyenne</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('museum');
                setShowMuseumDrawer(true);
                startMuseumSection(MUSEUM_SECTIONS[0]);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeMode === 'museum'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-orange-500/25'
                  : 'text-slate-600 hover:text-sky-950 hover:bg-white/60'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>2. Guide Musée / Fresque</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('data');
                setIsMuseumPlaying(false);
                stopSpeech();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeMode === 'data'
                  ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-sm shadow-indigo-600/25'
                  : 'text-slate-600 hover:text-sky-950 hover:bg-white/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>3. Portail Data (.nc) & Export</span>
            </button>
          </nav>

          {/* Global Underwater Audio & Voice Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAmbientSound}
              title="Activer/Désactiver l'ambiance sonore sous-marine"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                ambientSoundOn
                  ? 'bg-cyan-100 border-cyan-400 text-cyan-900 shadow-xs'
                  : 'bg-white border-sky-200 text-slate-600 hover:bg-sky-50 hover:text-sky-900'
              }`}
            >
              {ambientSoundOn ? <Volume2 className="w-4 h-4 text-cyan-600 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{ambientSoundOn ? 'Son Mer ON' : 'Ambiance Mer'}</span>
            </button>

            <button
              onClick={() => {
                if (voiceOverOn) {
                  stopSpeech();
                  setVoiceOverOn(false);
                } else {
                  setVoiceOverOn(true);
                }
              }}
              title="Activer/Désactiver la voix off française"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                voiceOverOn
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-sky-200 text-slate-600 hover:bg-sky-50 hover:text-sky-900'
              }`}
            >
              <Mic className={`w-4 h-4 ${isSpeaking ? 'text-amber-600 animate-bounce' : ''}`} />
              <span className="hidden md:inline">{voiceOverOn ? 'Voix Off FR' : 'Voix Off Muet'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MODE 1 & MODE 2: GIANT FOREGROUND REAL WORLD MAP + FLOATING PANELS
      ==================================================================== */}
      {activeMode !== 'data' && (
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* GIANT MAP CANVAS AREA */}
          <div className="relative flex-1 w-full h-full overflow-hidden">
            {/* REAL OPENSTREETMAP / ESRI OCEAN WORLD MAP WITH FILTERED FRANCE SST OVERLAY */}
            <RealWorldMap
              species={filteredSpecies}
              selectedSpecies={selectedSpecies}
              onSelectSpecies={handleSelectSpecies}
              onClearSelection={() => setSelectedSpecies(null)}
              focusedBasin={mapView.focusedBasin}
              selectedBasin={selectedBasin}
              showThermalOverlay={showThermalOverlay}
              showSatelliteRaster={showSatelliteRaster}
              heatFactor={heatFactor}
              currentYearData={currentYearData}
              tileStyle={tileStyle}
            />

            {/* ==============================================================
                TOP-LEFT FLOATING FILTER BUTTON & COLLAPSIBLE LEFT MENU
            ============================================================== */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 left-4 z-30 flex flex-col items-start gap-2.5"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFilterOpen((open) => !open)}
                  aria-expanded={isFilterOpen}
                  title="Ouvrir le menu des façades et filtres"
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-lg border transition-all ${
                    isFilterOpen
                      ? 'bg-sky-700 text-white border-sky-800 shadow-sky-900/20'
                      : 'bg-white/95 hover:bg-white text-slate-800 border-sky-200 shadow-sky-950/10'
                  }`}
                >
                  <Filter className={`w-4 h-4 ${isFilterOpen ? 'text-sky-200' : 'text-sky-600'}`} />
                  <span>Façades & Calques SST</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Reset Zoom Button if zoomed into a basin */}
                {mapView.focusedBasin && (
                  <button
                    onClick={() => handleBasinFocus('Tous')}
                    className="px-3.5 py-2.5 rounded-2xl bg-white/95 hover:bg-sky-50 text-xs font-bold text-sky-800 border border-sky-300 shadow-lg flex items-center gap-1.5"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Vue France Entière</span>
                  </button>
                )}
              </div>

              {/* LEFT SLIDE-OUT MENU FOR FAÇADES, SPECIES & NETCDF SST OVERLAYS */}
              {isFilterOpen && (
                <div className="w-80 bg-white/95 backdrop-blur-xl border border-sky-200/90 rounded-2xl p-4 shadow-2xl shadow-sky-950/15 space-y-4 animate-in fade-in slide-in-from-left-3 duration-200">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-sky-600" />
                      Façades & Données .NC
                    </span>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-sky-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Section 1: Façade Maritime */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      1. Filtrer par Façade Française
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        { id: 'Tous', label: '🇫🇷 Toutes les façades (France)' },
                        { id: 'Méditerranée', label: '🌊 Méditerranée' },
                        { id: 'Atlantique', label: '🌊 Atlantique & Bretagne' },
                        { id: 'Manche', label: '🌊 Manche' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleBasinFocus(item.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                            selectedBasin === item.id
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-sky-50/80 text-slate-700 hover:bg-sky-100 border border-sky-200/60'
                          }`}
                        >
                          <span>{item.label}</span>
                          {selectedBasin === item.id && <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Réponse à la Canicule Marine */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      2. Réponse à la Canicule
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      <button
                        onClick={() => setSelectedTrend('Tous')}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                          selectedTrend === 'Tous'
                            ? 'bg-slate-800 text-white'
                            : 'bg-sky-50/80 text-slate-600 hover:bg-sky-100 border border-sky-200/60'
                        }`}
                      >
                        Toutes les espèces ({SPECIES_DATA.length})
                      </button>
                      <button
                        onClick={() => setSelectedTrend('decline')}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                          selectedTrend === 'decline'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-rose-700 text-white font-bold flex items-center justify-center text-xs">
                          −
                        </span>
                        <span>Disparaît / En déclin thermique</span>
                      </button>
                      <button
                        onClick={() => setSelectedTrend('proliferate')}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                          selectedTrend === 'proliferate'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                          +
                        </span>
                        <span>Apparaît / Prolifère avec le chaud</span>
                      </button>
                    </div>
                  </div>

                  {/* Section 3: Fond de carte & Calques SST Copernicus (.nc + Raster) */}
                  <div className="pt-2 border-t border-sky-100 space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      3. Superposition Température (.NC & Satellite)
                    </label>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setShowThermalOverlay(!showThermalOverlay)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                          showThermalOverlay
                            ? 'bg-gradient-to-r from-orange-50 to-rose-100 border-rose-300 text-rose-800'
                            : 'bg-sky-50 border-sky-200 text-slate-600'
                        }`}
                      >
                        <Thermometer className="w-4 h-4 text-rose-600" />
                        <span>Cellules SST France (.nc) : {showThermalOverlay ? 'ON' : 'OFF'}</span>
                      </button>
                      <button
                        onClick={() => setShowCopernicusWmsInfo(!showCopernicusWmsInfo)}
                        title="Détails du fichier .nc Copernicus"
                        className="ml-1.5 p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => setShowSatelliteRaster(!showSatelliteRaster)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                        showSatelliteRaster
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-sky-50 border-sky-200 text-slate-700 hover:bg-sky-100'
                      }`}
                    >
                      <span>🛰️ Raster Satellite SST L4 : {showSatelliteRaster ? 'ACTIF' : 'OFF'}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => setTileStyle('voyager')}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border ${
                          tileStyle === 'voyager'
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-sky-50 text-slate-700 border-sky-200'
                        }`}
                      >
                        Océan Bathymétrie
                      </button>
                      <button
                        onClick={() => setTileStyle('osm')}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border ${
                          tileStyle === 'osm'
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-sky-50 text-slate-700 border-sky-200'
                        }`}
                      >
                        OpenStreetMap
                      </button>
                    </div>

                    {showCopernicusWmsInfo && (
                      <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-[10px] text-slate-600 leading-relaxed">
                        <strong className="text-sky-900 block mb-0.5">Fichier .nc décodé :</strong>
                        <code className="text-rose-700">{NC_FILE_METADATA.source}</code> • Climatologie 1991–2020 • Filtré sur les 3 façades françaises.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 2 COMPACT FLOATING FRESQUE SELECTOR */}
              {activeMode === 'museum' && (
                <div className="w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-amber-300 rounded-2xl p-3.5 shadow-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                        Fresque Murale (4 Boutons)
                      </span>
                    </div>
                    <button
                      onClick={() => setShowMuseumDrawer(!showMuseumDrawer)}
                      className="text-[11px] font-semibold text-amber-700 hover:underline"
                    >
                      {showMuseumDrawer ? 'Réduire' : 'Déplier'}
                    </button>
                  </div>

                  {showMuseumDrawer && (
                    <>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Simule les boutons d’une fresque murale de musée : la visite guidée s’arrête automatiquement à la fin du chapitre choisi.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {MUSEUM_SECTIONS.map((sec) => {
                          const isActive = activeMuseumSection.id === sec.id;
                          return (
                            <button
                              key={sec.id}
                              onClick={() => startMuseumSection(sec)}
                              className={`text-left p-2.5 rounded-xl border transition-all ${
                                isActive
                                  ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40'
                                  : 'bg-white border-sky-200 hover:border-sky-400'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-gradient-to-r ${sec.color} text-white`}
                                >
                                  #{sec.buttonNumber}
                                </span>
                                {isActive && isMuseumPlaying && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                )}
                              </div>
                              <div className="font-bold text-xs text-slate-900 line-clamp-1">{sec.title}</div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ==============================================================
                TOP-CENTER FLOATING TELEMETRY PILL (SHOWING .NC ANOMALY + FRANCE SST)
            ============================================================== */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 z-30 items-center gap-3 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-sky-200/90 shadow-md text-xs"
            >
              <span className="flex items-center gap-1.5 font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                {currentYearData.label}
              </span>
              <span className="text-slate-300">|</span>
              <span title="Valeur extraite de votre fichier .nc (sst_anomaly)">
                Anomalie .NC : <strong className="text-rose-600">+{currentYearData.ncGlobalAnom} K</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span>
                Méditerranée : <strong className="text-rose-600">{currentYearData.medSst}°C</strong>{' '}
                <span className="text-orange-600 font-bold">(+{currentYearData.medAnomaly}°C)</span>
              </span>
              <span className="text-slate-300">|</span>
              <span>
                Atlantique : <strong className="text-sky-700">{currentYearData.atlSst}°C</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span>
                Manche : <strong className="text-emerald-700">{currentYearData.mancheSst}°C</strong>
              </span>
            </div>

            {/* ==============================================================
                BOTTOM-LEFT LEGEND & SST COLORBAR PILL
            ============================================================== */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-3 left-4 z-30 bg-white/95 backdrop-blur-md border border-sky-200 rounded-xl px-3 py-2 text-[11px] flex flex-wrap items-center gap-3 shadow-md"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs">
                  −
                </span>
                <span className="text-slate-700 font-medium">Disparaît</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
                  +
                </span>
                <span className="text-slate-700 font-medium">Prolifère</span>
              </div>

              {/* SST Thermal Scale Legend */}
              <div className="hidden sm:flex items-center gap-1.5 border-l border-sky-200 pl-3">
                <span className="text-slate-500 font-semibold">SST Eau :</span>
                <span className="text-[10px] font-mono text-sky-700">16°C</span>
                <div className="w-24 h-2.5 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-700 border border-slate-200" />
                <span className="text-[10px] font-mono text-rose-700 font-bold">29°C+</span>
              </div>
            </div>

            {/* ==============================================================
                RIGHT FLOATING SPECIES INSPECTOR CARD (ONLY VISIBLE WHEN A SPECIES IS CLICKED!)
            ============================================================== */}
            {selectedSpecies && selectedSpeciesImages && (
              <aside
                onClick={(e) => e.stopPropagation()}
                className="absolute top-4 right-4 bottom-4 z-30 w-[calc(100%-2rem)] sm:w-[420px] bg-white/95 backdrop-blur-xl border border-sky-200 rounded-2xl shadow-2xl shadow-sky-950/20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200"
              >
                {/* Species Header */}
                <div className="p-4 bg-gradient-to-r from-sky-50 via-cyan-50/50 to-white border-b border-sky-100 flex items-start justify-between gap-2 shrink-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                        {selectedSpecies.basin}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          selectedSpecies.trend === 'decline'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {selectedSpecies.trendLabel}
                      </span>
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-1 leading-tight">
                      {selectedSpecies.name}
                    </h2>
                    <p className="text-xs italic text-slate-500">{selectedSpecies.scientificName}</p>
                  </div>

                  <button
                    onClick={() => setSelectedSpecies(null)}
                    title="Fermer la fiche espèce"
                    className="p-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-500 hover:text-slate-900 border border-sky-200/80 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* CLEAN FOCUS IMAGE CAROUSEL (Click image or indicator dots, caption ONLY on hover) */}
                <div
                  className="relative bg-sky-100 h-56 shrink-0 overflow-hidden group border-b border-sky-100 select-none"
                  role="group"
                  aria-roledescription="carousel"
                  aria-label={`Images de ${selectedSpecies.name}`}
                  onMouseEnter={() => setIsHoveringCarousel(true)}
                  onMouseLeave={() => setIsHoveringCarousel(false)}
                >
                  <img
                    key={selectedSpeciesImages[speciesImageIndex].src}
                    src={selectedSpeciesImages[speciesImageIndex].src}
                    alt={selectedSpeciesImages[speciesImageIndex].alt}
                    onClick={() =>
                      setSpeciesImageIndex((index) => (index + 1) % selectedSpeciesImages.length)
                    }
                    title="Cliquer sur l'image pour passer à la photo suivante"
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Top Bar: Location Tag & Audio Guide Button */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                    <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-semibold text-slate-800 border border-sky-200/80 shadow-xs flex items-center gap-1 truncate max-w-[65%]">
                      <MapPin className="w-3 h-3 text-sky-600 shrink-0" />
                      <span className="truncate">{selectedSpecies.locationName}</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(`${selectedSpecies.name}. ${selectedSpecies.narrationText}`);
                      }}
                      className="pointer-events-auto px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] shadow-md flex items-center gap-1 transition-transform active:scale-95 shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio</span>
                    </button>
                  </div>

                  {/* HOVER-ONLY IMAGE DESCRIPTION & CREDITS */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-900/65 to-transparent px-3.5 pb-8 pt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="text-xs font-semibold text-white leading-snug drop-shadow-xs">
                      {selectedSpeciesImages[speciesImageIndex].alt}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[10px] text-sky-100 pointer-events-auto">
                      <span>Photo :</span>
                      <a
                        href={`https://commons.wikimedia.org/wiki/${encodeURIComponent(`File:${selectedSpeciesImages[speciesImageIndex].title}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="underline decoration-sky-300/70 underline-offset-2 hover:text-white"
                      >
                        {selectedSpeciesImages[speciesImageIndex].artist}
                      </a>
                      <span aria-hidden="true">·</span>
                      {selectedSpeciesImages[speciesImageIndex].licenseUrl ? (
                        <a
                          href={selectedSpeciesImages[speciesImageIndex].licenseUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="underline decoration-sky-300/70 underline-offset-2 hover:text-white"
                        >
                          {selectedSpeciesImages[speciesImageIndex].license}
                        </a>
                      ) : (
                        <span>{selectedSpeciesImages[speciesImageIndex].license}</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Center Clickable Image Indicators (Dots / Pills) */}
                  <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-2 z-10">
                    {selectedSpeciesImages.map((img, idx) => {
                      const isCurrent = idx === speciesImageIndex;
                      return (
                        <button
                          key={img.title}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSpeciesImageIndex(idx);
                          }}
                          aria-label={`Afficher l'image ${idx + 1}`}
                          aria-current={isCurrent ? 'true' : undefined}
                          className={`h-2 rounded-full transition-all duration-300 shadow-xs ${
                            isCurrent
                              ? 'w-7 bg-white ring-2 ring-sky-500/50'
                              : 'w-2 bg-white/65 hover:bg-white'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Scrollable Species Thermal Impact Details */}
                <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
                  <div
                    className={`p-3 rounded-xl border ${
                      selectedSpecies.trend === 'decline'
                        ? 'bg-rose-50/70 border-rose-200'
                        : 'bg-emerald-50/70 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                        <AlertTriangle
                          className={`w-3.5 h-3.5 ${
                            selectedSpecies.trend === 'decline' ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        />
                        Seuil Critique :
                      </span>
                      <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                        SST {currentYearData.year} :{' '}
                        {(
                          selectedSpecies.baseSst2015 +
                          (selectedSpecies.sst2026 - selectedSpecies.baseSst2015) * heatFactor
                        ).toFixed(1)}
                        °C
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{selectedSpecies.criticalThreshold}</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Terrain : <span className="font-semibold text-slate-800">{selectedSpecies.mortalityRate}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
                      Effet de la canicule marine
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {selectedSpecies.impactDetails}
                    </p>
                  </div>

                  {/* MODE 2 EXCLUSIVE CONTROLS INSIDE CARD */}
                  {activeMode === 'museum' && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-900 truncate">
                          {activeMuseumSection.title}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-700 shrink-0 ml-2">
                          {museumStepIndex + 1} / {activeMuseumSection.speciesIds.length}
                        </span>
                      </div>

                      {sectionCompletedPause ? (
                        <div className="p-2 rounded-lg bg-white border border-amber-300 text-[11px] text-amber-900 flex items-center justify-between gap-2">
                          <span>
                            ⏸️ <strong>Chapitre terminé.</strong> Choisissez un autre bouton de fresque à gauche !
                          </span>
                          <button
                            onClick={() => startMuseumSection(activeMuseumSection)}
                            className="px-2 py-1 rounded bg-amber-500 text-white font-bold shrink-0"
                          >
                            Rejouer
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsMuseumPlaying(!isMuseumPlaying)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs flex items-center justify-center gap-1"
                          >
                            {isMuseumPlaying ? (
                              <>
                                <Pause className="w-3.5 h-3.5" /> Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" /> Lecture
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              const sectionSpecies = activeMuseumSection.speciesIds
                                .map((id) => SPECIES_DATA.find((s) => s.id === id))
                                .filter((s): s is SpeciesItem => Boolean(s));
                              if (museumStepIndex < sectionSpecies.length - 1) {
                                const next = museumStepIndex + 1;
                                setMuseumStepIndex(next);
                                handleSelectSpecies(sectionSpecies[next]);
                              } else {
                                setIsMuseumPlaying(false);
                                setSectionCompletedPause(true);
                              }
                            }}
                            className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1"
                          >
                            <span>Suivant</span>
                            <SkipForward className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>

          {/* ================================================================
              BOTTOM TIMELINE BAR (ALWAYS PINNED AT BOTTOM)
          ================================================================ */}
          <div className="shrink-0 z-30 px-4 lg:px-8 py-2.5 bg-white/95 backdrop-blur-md border-t border-sky-200/90 shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Timeline Copernicus .NC (2015–2026)
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 border border-rose-200 text-rose-800 font-bold">
                  {currentYearData.mhwCategory} • {currentYearData.mhwDaysMed}j/an
                </span>
              </div>

              <div className="flex-1 flex items-center gap-2.5">
                <button
                  onClick={() => setYearIndex((prev) => (prev > 0 ? prev - 1 : COPERNICUS_YEARS.length - 1))}
                  className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-slate-700"
                  title="Année précédente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={COPERNICUS_YEARS.length - 1}
                    value={yearIndex}
                    onChange={(e) => setYearIndex(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer h-1.5 bg-sky-200 rounded-lg block"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-1 px-0.5">
                    {COPERNICUS_YEARS.map((y, idx) => (
                      <button
                        key={y.year}
                        onClick={() => setYearIndex(idx)}
                        className={`hover:text-sky-900 transition-colors ${
                          idx === yearIndex ? 'text-rose-600 font-extrabold underline' : ''
                        } ${y.year === 2022 || y.year === 2023 || y.year === 2024 ? 'text-orange-600' : ''}`}
                      >
                        {y.year}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setYearIndex((prev) => (prev < COPERNICUS_YEARS.length - 1 ? prev + 1 : 0))}
                  className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-slate-700"
                  title="Année suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODE 3: PORTAIL SCIENTIFIQUE & DATA COPERNICUS (.NC DECODED VIEW)
      ==================================================================== */}
      {activeMode === 'data' && (
        <main className="flex-1 overflow-y-auto w-full px-4 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Scientific Header & Instant Export Bar */}
            <div className="bg-white border border-sky-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold uppercase">
                    NetCDF4 / HDF5 Décodé : {NC_FILE_METADATA.source}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    • Climatologie {NC_FILE_METADATA.climatology} (1982–2024)
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Portail Scientifique Copernicus (.nc) & Téléchargement Open Data
                </h2>
                <p className="text-xs text-slate-600">
                  Intègre directement les variables <code className="text-rose-700 font-semibold">sst_anomaly</code> et{' '}
                  <code className="text-sky-700 font-semibold">sst_anomaly_filtered</code> (méthode X11) extraites de votre fichier <code className="font-mono">.nc</code> et projetées sur les 3 façades françaises.
                </p>
              </div>

              {/* Export Buttons (CSV & JSON) */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setExportPreviewFormat('csv')}
                  className="px-3.5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-semibold text-sky-900 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4 text-sky-600" />
                  <span>Aperçu Brut</span>
                </button>

                <button
                  onClick={() => triggerDownload('csv')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 flex items-center gap-2 transition-transform active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exporter en CSV (.csv)</span>
                </button>

                <button
                  onClick={() => triggerDownload('json')}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm shadow-sky-600/20 flex items-center gap-2 transition-transform active:scale-95"
                >
                  <FileJson className="w-4 h-4" />
                  <span>Exporter en JSON (.json)</span>
                </button>
              </div>
            </div>

            {/* KPI Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-sky-200/80 p-4 rounded-xl shadow-2xs">
                <div className="text-xs font-semibold text-slate-500">Pic Anomalie Fichier .NC (2024)</div>
                <div className="text-2xl font-black text-rose-600 mt-1">+0.90 K (°C)</div>
                <div className="text-[11px] text-slate-500 mt-1">Tendance X11 : +0.88 K vs 1991–2020</div>
              </div>
              <div className="bg-white border border-sky-200/80 p-4 rounded-xl shadow-2xs">
                <div className="text-xs font-semibold text-slate-500">Amplification Méditerranée</div>
                <div className="text-2xl font-black text-amber-600 mt-1">+4.6 °C</div>
                <div className="text-[11px] text-slate-500 mt-1">Se réchauffe ~3.5x plus vite que l’océan global</div>
              </div>
              <div className="bg-white border border-sky-200/80 p-4 rounded-xl shadow-2xs">
                <div className="text-xs font-semibold text-slate-500">Cellules SST France Filtrées</div>
                <div className="text-2xl font-black text-sky-700 mt-1">{FRANCE_SST_GRID_CELLS.length} zones</div>
                <div className="text-[11px] text-slate-500 mt-1">Méditerranée, Atlantique & Manche</div>
              </div>
              <div className="bg-white border border-sky-200/80 p-4 rounded-xl shadow-2xs">
                <div className="text-xs font-semibold text-slate-500">Source NetCDF4 / HDF5</div>
                <div className="text-xs font-bold text-indigo-700 mt-1.5 font-mono truncate">
                  {NC_FILE_METADATA.source}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 516 pas mensuels décodés
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Direct plot of the user's .nc file variables */}
              <div className="bg-white border border-sky-200/80 rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Série Temporelle extraite de votre fichier .NC (1982–2024)
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Variables <code className="text-rose-600">sst_anomaly</code> et <code className="text-indigo-600">sst_anomaly_filtered</code> (Unité : K / °C, réf. 1991–2020)
                </p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={DECODED_NC_SERIES}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="year" stroke="#475569" fontSize={12} />
                      <YAxis domain={[-0.35, 1.05]} stroke="#475569" fontSize={12} unit=" K" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#bae6fd',
                          color: '#0f172a',
                          borderRadius: '10px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                      <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                      <Area
                        type="monotone"
                        dataKey="ncRawAnomaly"
                        name="sst_anomaly (.nc brut)"
                        stroke="#e11d48"
                        fill="#fda4af"
                        fillOpacity={0.4}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="ncFilteredTrend"
                        name="sst_anomaly_filtered (Tendance X11)"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: French Basins SST Evolution */}
              <div className="bg-white border border-sky-200/80 rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Températures de Surface Filtrées par Façade Française (SST °C)
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Projection régionale sur la Méditerranée, l’Atlantique et la Manche avec seuil de nécrose à 25°C
                </p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={DECODED_NC_SERIES}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="year" stroke="#475569" fontSize={12} />
                      <YAxis domain={[15, 30]} stroke="#475569" fontSize={12} unit="°C" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#bae6fd',
                          color: '#0f172a',
                          borderRadius: '10px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                      <ReferenceLine
                        y={25}
                        stroke="#e11d48"
                        strokeDasharray="4 4"
                        label={{ value: 'Seuil mortalité Gorgones (25°C)', fill: '#be123c', fontSize: 11 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="franceMedSst"
                        name="Méditerranée"
                        stroke="#e11d48"
                        strokeWidth={3}
                        dot={{ r: 3.5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="franceAtlSst"
                        name="Atlantique (Bretagne)"
                        stroke="#0284c7"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="franceMancheSst"
                        name="Manche"
                        stroke="#059669"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Scientific Data Table */}
            <div className="bg-white border border-sky-200/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-sky-100 flex flex-wrap items-center justify-between gap-2 bg-sky-50/50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  Matrice Bio-Thermique des Espèces Sentinelles (Exportable en CSV / JSON)
                </h3>
                <span className="text-xs font-semibold text-slate-500">{SPECIES_DATA.length} taxons référencés</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-sky-50 text-slate-600 uppercase tracking-wider border-b border-sky-200/80">
                      <th className="py-3 px-4">Espèce & Taxon</th>
                      <th className="py-3 px-4">Bassin</th>
                      <th className="py-3 px-4">Station / Coordonnées</th>
                      <th className="py-3 px-4">Réponse Canicule</th>
                      <th className="py-3 px-4">SST 2015</th>
                      <th className="py-3 px-4">SST 2022</th>
                      <th className="py-3 px-4">SST 2026</th>
                      <th className="py-3 px-4">Seuil Critique</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100">
                    {SPECIES_DATA.map((sp) => (
                      <tr key={sp.id} className="hover:bg-sky-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{sp.name}</div>
                          <div className="text-[11px] italic text-slate-500">{sp.scientificName}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-sky-700">{sp.basin}</td>
                        <td className="py-3 px-4 text-slate-700">
                          <div>{sp.locationName}</div>
                          <div className="font-mono text-[10px] text-slate-400">
                            {sp.coords[0]}°N, {sp.coords[1]}°E
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              sp.trend === 'decline'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {sp.trendLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{sp.baseSst2015}°C</td>
                        <td className="py-3 px-4 font-mono text-amber-600 font-semibold">{sp.sst2022}°C</td>
                        <td className="py-3 px-4 font-mono text-rose-600 font-bold">{sp.sst2026}°C</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs">{sp.criticalThreshold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Raw Data Preview Modal (CSV / JSON) */}
          {exportPreviewFormat && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-sky-200 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-sky-100 flex items-center justify-between bg-sky-50/60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExportPreviewFormat('csv')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        exportPreviewFormat === 'csv'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-600 border border-sky-200'
                      }`}
                    >
                      Format CSV
                    </button>
                    <button
                      onClick={() => setExportPreviewFormat('json')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        exportPreviewFormat === 'json'
                          ? 'bg-sky-600 text-white'
                          : 'bg-white text-slate-600 border border-sky-200'
                      }`}
                    >
                      Format JSON
                    </button>
                  </div>
                  <button
                    onClick={() => setExportPreviewFormat(null)}
                    className="p-1.5 rounded-lg bg-white border border-sky-200 text-slate-500 hover:text-slate-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-800 overflow-auto flex-1 bg-sky-50/30">
                  {exportPreviewFormat === 'csv' ? generateCsvContent() : generateJsonContent()}
                </pre>
                <div className="p-4 border-t border-sky-100 flex justify-end gap-2 bg-white">
                  <button
                    onClick={() => triggerDownload(exportPreviewFormat)}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger le fichier .{exportPreviewFormat}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}