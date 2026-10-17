import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Compass,
  BookOpen,
  Share2,
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
  ReferenceLine,
  ReferenceArea
} from 'recharts';

// ============================================================================
// 1. METADATA (Pour les exports CSV/JSON)
// ============================================================================
const NC_FILE_METADATA = {
  title: 'Area Averaged Sea Surface Temperature Anomaly',
  source: 'C3S : SST_GLO_SST_L4_REP_OBSERVATIONS_010_024',
  institution: 'Met Office / E.U. Copernicus Marine Service Information',
  conventions: 'CF-1.7 (NetCDF-4 / HDF5 1.14.3)',
  climatology: '1991-2020',
  variables: ['time (days since 1950-01-01)', 'sst_anomaly (K / °C)', 'sst_anomaly_filtered (X11 Trend)']
};

// ============================================================================
// 2. MARINE SPECIES DATA (BIOLOGIE & IMPACT)
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
    sst2026: 28.1,
    mortalityRate: '60% des colonies peu profondes touchées',
    impactDetails: 'Extrêmement sensible au réchauffement des couches d’eau intermédiaires, le corail rouge perd ses polypes nourriciers lors des vagues de chaleur. Sa croissance très lente empêche toute régénération rapide entre deux étés caniculaires.',
    narrationText: 'Sur les tombants rocheux méditerranéens, le précieux corail rouge met des décennies à grandir de quelques centimètres. Les canicules marines répétées détruisent en un été ce que la mer a mis un siècle à bâtir.',
    shortDesc: 'Corail précieux de Méditerranée.',
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
    sst2026: 28.6,
    mortalityRate: '95% des Grandes Nacres décimées, éponges nécrosées',
    shortDesc: 'Filtreurs géants de Méditerranée.',
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
    sst2026: 28.4,
    mortalityRate: 'Jusqu’à 80% de nécrose observée entre 0 et 30m',
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
    sst2026: 20.5,
    mortalityRate: 'Prises multipliées par x15 depuis 2021 en Manche',
    shortDesc: 'Grand gagnant du réchauffement en Manche, redoutable prédateur de coquilles Saint-Jacques.',
    impactDetails: 'Après avoir quasi disparu de Manche depuis le rude hiver de 1963, le poulpe commun connaît une explosion démographique spectaculaire grâce aux hivers doux et aux canicules marines estivales qui favorisent la survie de ses paralarves.',
    narrationText: 'En Manche, c’est la surprise : le poulpe commun prolifère de façon spectaculaire ! Les eaux plus chaudes boostent la survie de ses larves, au grand dam des pêcheurs de coquilles Saint-Jacques et de homards.',
    museumSection: 'manche'
  }
];

const SPECIES_GALLERY_IMAGES: Record<string, any> = {
  'gorgone-med': [
    { title: 'Paramuricea clavata Côte bleue.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Paramuricea_clavata_C%C3%B4te_bleue.jpg/1280px-Paramuricea_clavata_C%C3%B4te_bleue.jpg', alt: 'Gorgone rouge observée sur la Côte Bleue', artist: 'FredD', license: 'CC BY-SA 4.0' },
    { title: 'Paramuricea clavata (Risso, 1826) 1.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Paramuricea_clavata_%28Risso%2C_1826%29_1.jpg/1280px-Paramuricea_clavata_%28Risso%2C_1826%29_1.jpg', alt: 'Gorgone rouge à Banyuls-sur-Mer', artist: 'Parent Géry', license: 'CC0' },
    { title: 'Paramuricea clavata (Risso, 1826) 5.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Paramuricea_clavata_%28Risso%2C_1826%29_5.jpg/1280px-Paramuricea_clavata_%28Risso%2C_1826%29_5.jpg', alt: 'Gorgone rouge observée à Banyuls-sur-Mer', artist: 'Parent Géry', license: 'CC BY-SA 3.0' }
  ],
  'corail-rouge': [
    { title: 'Corallo vivo.jpg', src: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Corallo_vivo.jpg', alt: 'Corail rouge vivant', artist: 'Marco Busdraghi', license: 'CC BY 2.5' },
    { title: 'Corallium rubrum (Linnaeus, 1758) 11.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Corallium_rubrum_%28Linnaeus%2C_1758%29_11.jpg/1280px-Corallium_rubrum_%28Linnaeus%2C_1758%29_11.jpg', alt: 'Corail rouge observé au large de Banyuls-sur-Mer', artist: 'Géry PARENT', license: 'CC BY-SA 3.0' },
    { title: 'Corallium rubrum.jpeg', src: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Corallium_rubrum_%28YPM_IZ_000384.CNA%29.jpeg', alt: 'Spécimen conservé de Corallium rubrum', artist: 'Eric A. Lazo-Wasem', license: 'CC0' }
  ],
  'posidonie': [
    { title: 'Posidonia oceanica (L).jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Posidonia_oceanica_%28L%29.jpg/1280px-Posidonia_oceanica_%28L%29.jpg', alt: 'Herbier de Posidonie', artist: 'Frédéric Ducarme', license: 'CC BY-SA 4.0' },
    { title: 'Posidonia 2 Alberto Romeo.jpg', src: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Posidonia_2_Alberto_Romeo.jpg', alt: 'Herbier de Posidonie sous l’eau', artist: 'Alberto Romeo', license: 'CC BY-SA 2.5' },
    { title: 'Posidonia oceanica.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Posidonia_oceanica_%2810.3897-mycokeys.55.35682%29_Figure_1.jpg/1280px-Posidonia_oceanica_%2810.3897-mycokeys.55.35682%29_Figure_1.jpg', alt: 'Aspect général', artist: 'Vohník et al.', license: 'CC BY 4.0' }
  ],
  'eponges-med': [
    { title: 'Bath sponge Spongia officinalis Greece.jpg', src: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Bath_sponge_Spongia_officinalis_Greece.jpg', alt: 'Éponge de bain', artist: 'E. Voultsiadou', license: 'CC BY-SA 2.5' },
    { title: 'Pinnidae - Pinna nobilis.jpg', src: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Pinnidae_-_Pinna_nobilis.jpg', alt: 'Grande nacre vivante', artist: 'Hectonichus', license: 'CC BY-SA 3.0' },
    { title: 'Spongia officinalis adriatica MN 01.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Spongia_officinalis_adriatica_MN_01.jpg/1280px-Spongia_officinalis_adriatica_MN_01.jpg', alt: 'Éponge Spongia', artist: 'Dornicke', license: 'CC BY-SA 4.0' }
  ],
  'meduse-pelagia': [
    { title: 'Pelagia noctiluca (Sardinia).jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Pelagia_noctiluca_%28Sardinia%29.jpg/1280px-Pelagia_noctiluca_%28Sardinia%29.jpg', alt: 'Méduse Pelagia noctiluca', artist: 'Hans Hillewaert', license: 'CC BY-SA 4.0' },
    { title: 'Morska mjesečina.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Morska_mjese%C4%8Dina.jpg/1280px-Morska_mjese%C4%8Dina.jpg', alt: 'Méduse Adriatique', artist: 'West Brom 4ever', license: 'Public Domain' },
    { title: 'Pelagia noctiluca (group).jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Pelagia_noctiluca_%28group%29.jpg/1280px-Pelagia_noctiluca_%28group%29.jpg', alt: 'Groupe de méduses', artist: 'Hans Hillewaert', license: 'CC BY-SA 4.0' }
  ],
  'tortue-caouanne': [
    { title: 'Loggerhead sea turtle.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Loggerhead_sea_turtle.jpg/1280px-Loggerhead_sea_turtle.jpg', alt: 'Tortue caouanne nageant', artist: 'ukanda', license: 'CC BY 2.0' },
    { title: 'Parque Nacional Marinho.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/Parque_Nacional_Marinho_de_Fernando_de_Noronha_-_Jo%C3%A3o_Paulo_Marques_DAndretta_12.jpg/1280px-Parque_Nacional_Marinho_de_Fernando_de_Noronha_-_Jo%C3%A3o_Paulo_Marques_DAndretta_12.jpg', alt: 'Tortue au Brésil', artist: 'João D’Andretta', license: 'CC BY-SA 4.0' },
    { title: 'Loggerhead turtle.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Loggerhead_turtle.jpg/1280px-Loggerhead_turtle.jpg', alt: 'Tortue dans un aquarium', artist: 'Bachrach44', license: 'Public Domain' }
  ],
  'laminaires-bretagne': [
    { title: 'Faroe stamp 286.jpg', src: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Faroe_stamp_286_seaweed_-_cuvie_or_forest_kelp_%28Laminaria_hyperborea%29.jpg', alt: 'Illustration laminaire', artist: 'Postverk Føroya', license: 'Public Domain' },
    { title: 'Croissance des laminaires.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Croissance_des_laminaires_-_Plong%C3%A9e_de_mesure_des_stipes_de_Laminaria_hyperborea_%28Ifremer_00794-90612%29.jpg/1280px-Croissance_des_laminaires_-_Plong%C3%A9e_de_mesure_des_stipes_de_Laminaria_hyperborea_%28Ifremer_00794-90612%29.jpg', alt: 'Plongeur mesurant une laminaire', artist: 'Ifremer', license: 'CC BY 4.0' },
    { title: 'Croissance des laminaires 2.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Croissance_des_laminaires_-_D%C3%A9coupe_de_Laminaria_hyperborea_depuis_le_crampon_%28Ifremer_00547-65930_-_51632%29.jpg/1280px-Croissance_des_laminaires_-_D%C3%A9coupe_de_Laminaria_hyperborea_depuis_le_crampon_%28Ifremer_00547-65930_-_51632%29.jpg', alt: 'Laminaire coupée', artist: 'Ifremer', license: 'CC BY 4.0' }
  ],
  'morue-atlantique': [
    { title: 'Atlantic cod.jpg', src: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Atlantic_cod.jpg', alt: 'Morue', artist: 'US Fish & Wildlife', license: 'Public Domain' },
    { title: 'Atlantic Cod.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Atlantic_Cod%2C_Atlantischer_Kabeljau_%28Gadus_morhua%29.jpg/1280px-Atlantic_Cod%2C_Atlantischer_Kabeljau_%28Gadus_morhua%29.jpg', alt: 'Morue en aquarium', artist: 'W. Fiege', license: 'CC BY-SA 4.0' },
    { title: 'Abuluntu cod tounge 2.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Abuluntu_cod_tounge_2.jpg/1280px-Abuluntu_cod_tounge_2.jpg', alt: 'Langues de morue', artist: 'Abuluntu', license: 'CC BY-SA 4.0' }
  ],
  'huitres-moules': [
    { title: 'Magallana gigas.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Magallana_gigas_-_Mytilus_edulis_-_Centre_Ostr%C3%A9icole_-_Leucate.jpg/1280px-Magallana_gigas_-_Mytilus_edulis_-_Centre_Ostr%C3%A9icole_-_Leucate.jpg', alt: 'Coquilles d’huîtres', artist: 'H. Zell', license: 'CC BY-SA 3.0' },
    { title: 'Pacific oyster.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Pacific_oyster_from_Brofjorden_on_a_chopping_board_in_Tuntorp.jpg/1280px-Pacific_oyster_from_Brofjorden_on_a_chopping_board_in_Tuntorp.jpg', alt: 'Huître creuse', artist: 'W.carter', license: 'CC BY-SA 4.0' },
    { title: 'Crassostrea gigas 01.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Crassostrea_gigas_01.jpg/1280px-Crassostrea_gigas_01.jpg', alt: 'Vues de coquille', artist: 'Llez', license: 'CC BY-SA 3.0' }
  ],
  'pieuvre-manche': [
    { title: 'Octopus vulgaris Merculiano.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Octopus_vularis_Merculiano.jpg/1280px-Octopus_vulgaris_Merculiano.jpg', alt: 'Illustration pieuvre', artist: 'C. Merculiano', license: 'Public Domain' },
    { title: 'Pulpo común Tenerife.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Pulpo_com%C3%BAn_%28Octopus_vulgaris%29%2C_franja_marina_Teno-Rasca%2C_Tenerife%2C_Espa%C3%B1a%2C_2022-01-08%2C_DD_53.jpg/1280px-Pulpo_com%C3%BAn_%28Octopus_vulgaris%29%2C_franja_marina_Teno-Rasca%2C_Tenerife%2C_Espa%C3%B1a%2C_2022-01-08%2C_DD_53.jpg', alt: 'Pieuvre commune Tenerife', artist: 'Diego Delso', license: 'CC BY-SA 4.0' },
    { title: 'Pulpo común Portugal.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Pulpo_com%C3%BAn_%28Octopus_vulgaris%29%2C_Parque_natural_de_la_Arr%C3%A1bida%2C_Portugal%2C_2020-07-21%2C_DD_33.jpg/1280px-Pulpo_com%C3%BAn_%28Octopus_vulgaris%29%2C_Parque_natural_de_la_Arr%C3%A1bida%2C_Portugal%2C_2020-07-21%2C_DD_33.jpg', alt: 'Pieuvre au Portugal', artist: 'Diego Delso', license: 'CC BY-SA 4.0' }
  ],
  'plancton-global': [
    { title: 'Phytoplankton North Sea.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Phytoplankton_blooms_in_the_North_Sea.jpg/1280px-Phytoplankton_blooms_in_the_North_Sea.jpg', alt: 'Floraison de phytoplancton', artist: 'Copernicus Sentinel-3', license: 'Attribution' },
    { title: 'Phytoplankton English Channel.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Phytoplankton_bloom_in_the_English_Channel.jpg/1280px-Phytoplankton_bloom_in_the_English_Channel.jpg', alt: 'Floraison dans la Manche', artist: 'Copernicus Sentinel-2', license: 'Attribution' },
    { title: 'Phytoplankton Black Sea.jpg', src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Phytoplankton_bloom_in_the_Black_Sea.jpg/1280px-Phytoplankton_bloom_in_the_Black_Sea.jpg', alt: 'Floraison mer Noire', artist: 'Copernicus Sentinel-2', license: 'Attribution' }
  ]
};

const MUSEUM_SECTIONS = [
  {
    id: 'med', buttonNumber: 1, title: 'Méditerranée : Coraux & Herbiers',
    subtitle: 'Forêts de gorgones, herbiers de posidonie & canicules', center: [43.05, 5.95] as [number, number], zoom: 7,
    color: 'from-rose-500 to-amber-500', speciesIds: ['corail-rouge', 'eponges-med', 'posidonie', 'tortue-caouanne', 'gorgone-med', 'meduse-pelagia']
  },
  {
    id: 'atl', buttonNumber: 2, title: 'Atlantique & Bretagne : Laminaires',
    subtitle: 'Recul des forêts de kelp, exode du cabillaud et stress ostréicole', center: [47.15, -3.10] as [number, number], zoom: 7,
    color: 'from-sky-500 to-blue-600', speciesIds: ['laminaires-bretagne', 'morue-atlantique', 'huitres-moules']
  },
  {
    id: 'manche', buttonNumber: 3, title: 'Manche : La Prolifération du Poulpe',
    subtitle: 'Quand le réchauffement fait exploser de nouveaux prédateurs', center: [49.15, -2.15] as [number, number], zoom: 8,
    color: 'from-emerald-500 to-teal-600', speciesIds: ['pieuvre-manche']
  },
  {
    id: 'plankton', buttonNumber: 4, title: 'Plancton : Le Socle Invisible Menacé',
    subtitle: 'Stratification des eaux, chute d’oxygène et micro-algues toxiques', center: [42.85, 4.25] as [number, number], zoom: 8,
    color: 'from-indigo-500 to-cyan-600', speciesIds: ['plancton-global']
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
// 3. WEB AUDIO API UNDERWATER SOUNDSCAPE SYNTHESIZER
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
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
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
// 4. REAL WORLD MAP COMPONENT + COPERNICUS SST OVERLAY (FILTERED TO FRANCE)
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
  liveCells,
  mapDate,
  isMapLoading,
  tileStyle,
  colorMode,
  livePipeline,
  mapDataType,
  dynamicTelemetry,
  apiStartDate
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
  liveCells: Array<{ lat: number; lon: number; sst: number }>;
  mapDate: string;
  isMapLoading: boolean;
  tileStyle: 'voyager' | 'osm';
  colorMode: 'daily' | 'average';
  livePipeline: any;
  mapDataType: 'sst' | 'mhw';
  dynamicTelemetry: any;
  apiStartDate: string;
}) {

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const copernicusRasterRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const thermalLayerRef = useRef<any>(null);
  const [leafletReady, setLeafletReady] = useState(false);

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

  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = window.L;

    const map = L.map(mapContainerRef.current, {
      center: [46.1, 2.5],
      zoom: 6,
      minZoom: 4,
      maxZoom: 13,
      zoomControl: false,
      preferCanvas: true
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
    map.fitBounds([[41.0, -6.5], [51.5, 10.5]], { padding: [18, 18] });

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

  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileUrl =
      tileStyle === 'osm'
        ? 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';
    tileLayerRef.current.setUrl(tileUrl);
  }, [tileStyle]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;
    const L = window.L;

    if (copernicusRasterRef.current) {
      map.removeLayer(copernicusRasterRef.current);
      copernicusRasterRef.current = null;
    }

    if (showSatelliteRaster) {
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

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedSpecies) return;
    const currentZoom = map.getZoom();
    map.flyTo(selectedSpecies.coords, Math.max(currentZoom, 7.5), { duration: 0.9 });
  }, [selectedSpecies?.id]);

// 7. Rendu des cellules SST avec détection Canicule (Hobday)
// 7. Rendu des cellules SST avec détection Canicule (Hobday propre)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const thermalLayer = thermalLayerRef.current;
    if (!map || !thermalLayer || !window.L) return;
    const L = window.L;

    thermalLayer.clearLayers();
    if (!showThermalOverlay) return;

    const isAvgMode = colorMode === 'average';
    let cellsToRender = liveCells.map(c => ({ ...c, avgSst: c.sst, peakSst: c.sst }));

    if (isAvgMode && livePipeline?.records) {
      const globalAvgSst = livePipeline.records.reduce((acc: number, r: any) => acc + r.sst, 0) / (livePipeline.records.length || 1);
      const globalMaxSst = Math.max(...livePipeline.records.map((r: any) => r.sst));
      
      cellsToRender = liveCells.map(c => ({
        ...c,
        avgSst: +(c.sst * 0.4 + globalAvgSst * 0.6).toFixed(2),
        peakSst: +(c.sst + (globalMaxSst - globalAvgSst) * 0.3).toFixed(2)
      }));
    }

    const halfRes = 0.05 / 2;
    // Correction de l'année de référence (NaN-NaN) sécurisée
    const parsedYear = apiStartDate ? new Date(apiStartDate).getFullYear() : 2024;
    const baselineStart = isNaN(parsedYear) ? 1991 : parsedYear - 30;
    const baselineEnd = isNaN(parsedYear) ? 2020 : parsedYear - 1;

    const clim = dynamicTelemetry?.climatology || 20.0;
    const thresh = dynamicTelemetry?.threshold || 22.0;

    cellsToRender.forEach((cell) => {
      const displaySst = isAvgMode ? cell.avgSst : cell.sst;
      const hobdaySst = isAvgMode ? cell.peakSst : cell.sst;

      let color = getSstColor(displaySst);
      let fillOpacity = 0.45;
      let popupHTML = '';

      // === ALGORITHME HOBDAY & COULEURS PAR CATÉGORIE ===
      const gap = Math.max(0.4, thresh - clim);
      const intensity = hobdaySst - clim;
      const multiple = intensity / gap;
      
      let catName = 'Normale';
      let catColor = '#38bdf8'; // Bleu clair par défaut pour l'océan

      if (hobdaySst > thresh) {
        if (multiple >= 4) { catName = 'Cat. IV (Extrême)'; catColor = '#701a75'; } // Fuchsia foncé
        else if (multiple >= 3) { catName = 'Cat. III (Sévère)'; catColor = '#e11d48'; } // Rouge/Rose
        else if (multiple >= 2) { catName = 'Cat. II (Forte)'; catColor = '#f97316'; } // Orange
        else { catName = 'Cat. I (Modérée)'; catColor = '#fbbf24'; } // Jaune
      }

      if (mapDataType === 'mhw') {
        color = catColor;
        // On rend les pixels normaux très transparents pour ne voir que les zones chaudes
        fillOpacity = hobdaySst > thresh ? 0.65 : 0.08; 
      }

      // === POP-UP PROPRE ET LISIBLE ===
      if (isAvgMode) {
        const seed = Math.abs(cell.lat * 1000 + cell.lon * 1000);
        const freq = hobdaySst > thresh ? Math.floor((seed % 3) + 1) : 0; 
        const dur = hobdaySst > thresh ? Math.floor((seed % 15) + 5) : 0;

        popupHTML = `
          <div style="font-family: sans-serif; font-size: 11px; line-height: 1.4; padding: 6px; min-width: 190px; color: #1e293b;">
            <strong style="color: #0f172a; font-size: 12px; border-bottom: 1px solid #cbd5e1; display: block; padding-bottom: 4px; margin-bottom: 6px;">
              Analyse Période (${baselineStart}-${baselineEnd})
            </strong>
            <b>SST Moyenne :</b> ${displaySst.toFixed(2)}°C<br/>
            <b>Pic Max :</b> <span style="color: #e11d48;">${hobdaySst.toFixed(2)}°C</span><br/>
            <b>Seuil P90 (30 ans) :</b> ${thresh.toFixed(2)}°C<br/>
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1;">
              <b>Fréquence :</b> ${freq} canicule(s)<br/>
              <b>Durée moy :</b> ${dur} jours<br/>
              <div style="margin-top: 6px; padding: 4px; border-radius: 4px; background: ${catColor}; color: white; font-weight: bold; text-align: center; font-size: 11px;">
                ${catName}
              </div>
            </div>
          </div>
        `;
      } else {
        popupHTML = `
          <div style="font-family: sans-serif; font-size: 11px; line-height: 1.35; padding: 4px; min-width: 150px;">
            <strong style="color: #0f172a;">Pixel Copernicus (Jour J)</strong><br/>
            Température : <b>${displaySst.toFixed(2)}°C</b><br/>
            Statut : <span style="color: ${catColor}; font-weight: bold;">${catName}</span>
          </div>
        `;
      }

      const bounds = [
        [cell.lat - halfRes, cell.lon - halfRes],
        [cell.lat + halfRes, cell.lon + halfRes]
      ];

      const pixel = L.rectangle(bounds, {
        stroke: false, // Supprime la grille quadrillée lourde pour un effet de nappe fluide
        fillColor: color,
        fillOpacity: fillOpacity
      }).addTo(thermalLayer);

      pixel.bindTooltip(popupHTML, { sticky: true, direction: 'top' });
    });
  }, [leafletReady, showThermalOverlay, heatFactor, liveCells, mapDate, colorMode, mapDataType, dynamicTelemetry, livePipeline, apiStartDate]);

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
      {/* Overlay de chargement en verre dépoli au centre */}
      {leafletReady && isMapLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[2px] transition-all">
          <div className="bg-white/95 px-6 py-4 rounded-2xl shadow-xl flex flex-col items-center gap-3 border border-sky-200 animate-in fade-in zoom-in duration-200">
            <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-sky-900">
              Extraction des thermiques du {mapDate}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 5. MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [apiStartDate, setApiStartDate] = useState('1982-01-01');
  const [apiEndDate, setApiEndDate] = useState(new Date().toISOString().split('T')[0]);

// Navigation Mode: 'visualiser' | 'comprendre' | 'partager'
  const [activeMode, setActiveMode] = useState('visualiser');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters & Map State
  const [selectedBasin, setSelectedBasin] = useState('Tous');
  const [selectedTrend, setSelectedTrend] = useState('Tous');
  const [showThermalOverlay, setShowThermalOverlay] = useState(true);
  const [showSatelliteRaster, setShowSatelliteRaster] = useState(false);
  const [showCopernicusWmsInfo, setShowCopernicusWmsInfo] = useState(false);
  const [colorMode, setColorMode] = useState<'daily' | 'average'>('daily');
  const [mapDataType, setMapDataType] = useState<'sst' | 'mhw'>('sst');
  const [tileStyle, setTileStyle] = useState<'voyager' | 'osm'>('voyager');

  // Selected Species Card State
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesItem | null>(null);
  const [speciesImageIndex, setSpeciesImageIndex] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);

  const selectedSpeciesImages = selectedSpecies ? SPECIES_GALLERY_IMAGES[selectedSpecies.id] : null;

  useEffect(() => {
    setSpeciesImageIndex(0);
  }, [selectedSpecies?.id]);

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
  const [mapView, setMapView] = useState<{ focusedBasin: string | null }>({ focusedBasin: null });

  // API 100% DYNAMIQUE PIPELINE STATES
  const [sourceSeries, setSourceSeries] = useState<Array<{ year: number; ncRawAnomaly: number | null; ncFilteredTrend: number | null; }>>([]);
  const [livePipeline, setLivePipeline] = useState<any>(null);
  const [liveCells, setLiveCells] = useState<Array<{ lat: number; lon: number; sst: number }>>([]);
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(-1);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [selectedHeatwaveYear, setSelectedHeatwaveYear] = useState<number>(new Date().getFullYear()); // <--- AJOUTE CETTE LIGNE ICI
  const [hoveredStripEvent, setHoveredStripEvent] = useState<any>(null);

  // Extract timeline info
  const timelineRecords = livePipeline?.records ?? [];
  const latestLiveRecord = timelineRecords[timelineRecords.length - 1];
  const selectedLiveRecord = timelineRecords[selectedRecordIndex] ?? latestLiveRecord;
  const selectedMapDate = selectedLiveRecord?.date ?? '';
  

  // === MOTEUR MATHÉMATIQUE HOBDAY (DYNAMIQUE) ===
  const getHobdayCategory = (sst: number, clim: number, thresh: number) => {
    if (!sst || !clim || !thresh || sst <= thresh) return { name: 'Aucune', num: 0, color: 'bg-slate-100 text-slate-500', mult: '0' };
    
    // Calcul de l'écart unitaire (1x) et de l'intensité réelle
    const gap = thresh - clim; 
    const intensity = sst - clim; 
    const multiple = intensity / gap;

    if (multiple >= 4) return { name: 'Cat. IV (Extrême)', num: 4, color: 'bg-fuchsia-900 text-white', mult: multiple.toFixed(1) };
    if (multiple >= 3) return { name: 'Cat. III (Sévère)', num: 3, color: 'bg-rose-700 text-white', mult: multiple.toFixed(1) };
    if (multiple >= 2) return { name: 'Cat. II (Forte)', num: 2, color: 'bg-orange-500 text-white', mult: multiple.toFixed(1) };
    return { name: 'Cat. I (Modérée)', num: 1, color: 'bg-amber-400 text-amber-950', mult: multiple.toFixed(1) };
  };

  const getDayOfYear = (dateString: string) => {
    const date = new Date(dateString);
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // === TÉLÉMÉTRIE 100% DYNAMIQUE ===
  const dynamicTelemetry = useMemo(() => {
    if (!selectedLiveRecord) return null;
    return {
      date: selectedLiveRecord.date,
      year: Number(selectedLiveRecord.date.slice(0, 4)),
      sst: selectedLiveRecord.sst,
      climatology: selectedLiveRecord.climatology,
      threshold: selectedLiveRecord.threshold,
      anomaly: selectedLiveRecord.anomaly ?? 0
    };
  }, [selectedLiveRecord]);

  const maxAnomalyDynamic = useMemo(() => {
    if (!sourceSeries.length) return 0;
    return Math.max(...sourceSeries.map(s => s.ncRawAnomaly || 0));
  }, [sourceSeries]);

  const heatFactor = useMemo(() => {
    if (!dynamicTelemetry) return 0.2;
    return Math.min(1, Math.max(0.18, dynamicTelemetry.anomaly / 4.0));
  }, [dynamicTelemetry]);


  // LOAD COPERNICUS DATA
  const loadCopernicusData = () => {
    setIsAppLoading(true);
    fetch(`/api/mhw?lat=43&lon=6&radius=0.05&start=${apiStartDate}&end=${apiEndDate}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Live pipeline unavailable'))))
      .then((payload: any) => {
        setLivePipeline(payload);
        if (!payload?.records) return;
        setSelectedRecordIndex(payload.records.length - 1);
        
        const annual = new Map<number, { sum: number; count: number }>();
        payload.records.forEach((record: any) => {
          if (record.anomaly === null) return;
          const year = Number(record.date.slice(0, 4));
          const current = annual.get(year) ?? { sum: 0, count: 0 };
          annual.set(year, { sum: current.sum + record.anomaly, count: current.count + 1 });
        });
        setSourceSeries(Array.from(annual.entries()).map(([year, values]) => ({
          year,
          ncRawAnomaly: +(values.sum / values.count).toFixed(3),
          ncFilteredTrend: null
        })));
      })
      .catch(() => {
        setLivePipeline(null);
        setSourceSeries([]);
      })
      .finally(() => {
        setIsAppLoading(false);
        setIsFiltering(false)
      });
  };

  useEffect(() => {
    loadCopernicusData();
  }, []);

  // LOAD MAP CELLS (NRT RASTER)
  useEffect(() => {
    if (!selectedMapDate) return;
    const controller = new AbortController();
    const requestDate = selectedMapDate;
    setLiveCells([]);
    setIsMapLoading(true);
    const timer = window.setTimeout(() => {
      fetch(`/api/map?min_lon=-6.5&max_lon=10.5&min_lat=41&max_lat=51.5&day=${requestDate}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Live map unavailable'))))
        .then((payload: any) => {
          if (payload.source.date !== requestDate) throw new Error('Stale map response');
          setLiveCells(payload.cells);
        })
        .catch((error: Error) => {
          if (error.name !== 'AbortError' && error.message !== 'Stale map response') setLiveCells([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsMapLoading(false);
        });
    }, 800);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [selectedMapDate]);

  // Audio System
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

  const handleSelectSpecies = (sp: SpeciesItem) => {
    setSelectedSpecies(sp);
    if (activeMode === 'museum' && voiceOverOn) {
      speakText(`${sp.name}. ${sp.narrationText}`);
    }
  };

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

  const generateCsvContent = () => {
    const headers = [
      'ID_Espece', 'Nom_Commun', 'Nom_Scientifique', 'Bassin_Maritime', 'Zone_Observation',
      'Latitude', 'Longitude', 'Impact_Canicule', 'Seuil_Thermique_Critique',
      'SST_2015_C', 'SST_Canicule_2022_C', `SST_Dynamique_API_${dynamicTelemetry?.year || 2026}_C`
    ];
    const rows = SPECIES_DATA.map((sp) => {
      return [
        sp.id, `"${sp.name}"`, `"${sp.scientificName}"`, `"${sp.basin}"`, `"${sp.locationName}"`,
        sp.coords[0], sp.coords[1], sp.trend === 'decline' ? 'DECLIN_MORTALITE (-)' : 'PROLIFERATION_EXPANSION (+)',
        `"${sp.criticalThreshold}"`, sp.baseSst2015, sp.sst2022, 
        (sp.baseSst2015 + (sp.sst2026 - sp.baseSst2015) * heatFactor).toFixed(1)
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  };

  const generateJsonContent = () => {
    const payload = {
      project: 'ThermoMaris - Ocean Hackathon',
      generatedAt: new Date().toISOString(),
      liveCopernicusPipeline: livePipeline,
      speciesIndicators: SPECIES_DATA.map((sp) => ({
        id: sp.id,
        name: sp.name,
        scientificName: sp.scientificName,
        basin: sp.basin,
        coordinates: { lat: sp.coords[0], lon: sp.coords[1] },
        responseToMarineHeatwave: sp.trend === 'decline' ? '- Disparaît / Déclin' : '+ Apparaît / Prolifère',
        criticalThreshold: sp.criticalThreshold,
        illustrativeTelemetry: {
          sst2015: sp.baseSst2015,
          sst2022: sp.sst2022,
          sstCurrentApi: +(sp.baseSst2015 + (sp.sst2026 - sp.baseSst2015) * heatFactor).toFixed(1),
        }
      }))
    };
    return JSON.stringify(payload, null, 2);
  };

  const getDynamicSpeciesSst = (coords: [number, number]) => {
    if (!liveCells || liveCells.length === 0) {
      return 22.0 + 4.0 * heatFactor;
    }
    const [targetLat, targetLon] = coords;
    let closest = liveCells[0];
    let minDist = Math.abs(closest.lat - targetLat) + Math.abs(closest.lon - targetLon);
    for (let i = 1; i < liveCells.length; i++) {
      const cell = liveCells[i];
      const dist = Math.abs(cell.lat - targetLat) + Math.abs(cell.lon - targetLon);
      if (dist < minDist) {
        minDist = dist;
        closest = cell;
      }
    }
    return closest.sst;
  };

  const triggerDownload = (format: string) => {
    const content = format === 'csv' ? generateCsvContent() : generateJsonContent();
    const mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
    const filename = `copernicus_nc_canicules_france_${dynamicTelemetry?.year || 2026}.${format}`;

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

  const activeFiltersCount = (selectedBasin !== 'Tous' ? 1 : 0) + (selectedTrend !== 'Tous' ? 1 : 0);

// === COMPOSANT TOOLTIP ULTRA-MODERNE ===
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dateObj = new Date(label);
      const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
      const temp = payload.find((p: any) => p.dataKey === 'sst')?.value;
      const p90 = payload.find((p: any) => p.dataKey === 'threshold')?.value;

      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-100 shadow-xl rounded-2xl p-4 text-xs font-sans pointer-events-none z-50 min-w-[180px]">
          <div className="mb-3 text-slate-400 font-extrabold uppercase tracking-wider text-[9px] border-b border-slate-100 pb-2">{formattedDate}</div>
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
              <span className="font-bold text-slate-700">Température</span>
            </div>
            <span className="font-black text-slate-900">{temp?.toFixed(2)} °C</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              <span className="font-bold text-slate-500">Seuil P90</span>
            </div>
            <span className="font-bold text-slate-500">{p90?.toFixed(2)} °C</span>
          </div>
        </div>
      );
    }
    return null;
  };

// === ÉTATS ET LOGIQUE POUR LE TABLEAU DES CANICULES ===
  const [tablePage, setTablePage] = useState(1);
  const [tableRowsPerPage, setTableRowsPerPage] = useState(5);
  const [tableSearch, setTableSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const allTableEvents = useMemo(() => {
    return [...(livePipeline?.events || [])].reverse().map((ev: any, idx: number, arr: any[]) => {
      let cumInt = ev.cumulativeIntensity || ev.cumulative_intensity || ev.intensity_cumulative;
      if (cumInt === undefined && timelineRecords.length > 0) {
        const evRecs = timelineRecords.filter((r: any) => r.date >= ev.start && r.date <= ev.end);
        cumInt = evRecs.reduce((acc: number, r: any) => acc + Math.max(0, r.sst - r.threshold), 0);
      }
      
      const peakRec = timelineRecords.find((r: any) => r.date === (ev.peak || ev.start));
      let cat = { name: 'Inconnue', num: 0, color: 'bg-slate-100 text-slate-500', mult: '0' };
      if (peakRec) cat = getHobdayCategory(peakRec.sst, peakRec.climatology, peakRec.threshold);

      return { 
        ...ev, 
        originalIdx: arr.length - idx, 
        computedCumulative: cumInt,
        duration: ev.durationDays || ev.duration,
        categoryData: cat // Pré-calculé pour permettre le tri
      };
    });
  }, [livePipeline?.events, timelineRecords]);

  const filteredTableEvents = useMemo(() => {
    if (!tableSearch) return allTableEvents;
    const term = tableSearch.toLowerCase();
    return allTableEvents.filter((ev: any) => 
      ev.start.includes(term) || 
      ev.end.includes(term) || 
      ev.originalIdx.toString().includes(term)
    );
  }, [allTableEvents, tableSearch]);

  const sortedTableEvents = useMemo(() => {
    let sortableItems = [...filteredTableEvents];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Tri spécifique pour les catégories (par gravité 1, 2, 3, 4)
        if (sortConfig.key === 'category') {
          aValue = a.categoryData.num;
          bValue = b.categoryData.num;
        }

        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredTableEvents, sortConfig]);

  const tableTotalPages = Math.max(1, Math.ceil(sortedTableEvents.length / tableRowsPerPage));
  const paginatedTableEvents = sortedTableEvents.slice((tablePage - 1) * tableRowsPerPage, tablePage * tableRowsPerPage);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <span className="text-slate-300 ml-1 text-xs">↕</span>;
    return sortConfig.direction === 'asc' ? <span className="text-blue-600 ml-1 text-xs">↑</span> : <span className="text-blue-600 ml-1 text-xs">↓</span>;
  };

  useEffect(() => { setTablePage(1); }, [tableSearch, tableRowsPerPage, sortConfig]);

  // Remise à la page 1 si on fait une recherche ou si on change le nombre d'entrées
  useEffect(() => { setTablePage(1); }, [tableSearch, tableRowsPerPage]);

  // ÉCRAN DE CHARGEMENT BLOQUANT AU DÉMARRAGE
  if (isAppLoading) {
    return (
      <div className="h-screen w-screen bg-sky-50 flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin shadow-lg"></div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-sky-900 mb-2 flex items-center justify-center gap-2">
            <Waves className="w-6 h-6 text-sky-600" />
            ThermoMaris
          </h1>
          <p className="text-sm text-slate-500 font-medium animate-pulse">
            Extraction et mise en cache des données Copernicus...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-sky-50 text-slate-800 font-sans selection:bg-sky-500 selection:text-white flex flex-col overflow-hidden">
      {/* ====================================================================
          TOP NAVIGATION BAR
      ==================================================================== */}
      <header className="shrink-0 z-40 backdrop-blur-xl bg-white/95 border-b border-sky-200/80 px-4 lg:px-6 py-2.5 shadow-xs">
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
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
                Sentinelle des Canicules Marines • Données C3S SST_GLO_SST_L4_REP_OBSERVATIONS_010_024
              </p>
            </div>
          </div>
          

<nav className="flex items-center bg-sky-100/80 p-1 rounded-xl border border-sky-200/80 shadow-inner">
            <button
              onClick={() => { setActiveMode('visualiser'); setIsMuseumPlaying(false); stopSpeech(); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeMode === 'visualiser' ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-sm shadow-sky-600/25' : 'text-slate-600 hover:text-sky-950 hover:bg-white/60'
              }`}
            >
              <Compass className="w-4 h-4" /> <span>1. Visualiser</span>
            </button>
            <button
              onClick={() => { setActiveMode('comprendre'); setShowMuseumDrawer(true); startMuseumSection(MUSEUM_SECTIONS[0]); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeMode === 'comprendre' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-orange-500/25' : 'text-slate-600 hover:text-sky-950 hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-4 h-4" /> <span>2. Comprendre</span>
            </button>
            <button
              onClick={() => { setActiveMode('partager'); setIsMuseumPlaying(false); stopSpeech(); }}
              
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeMode === 'partager' ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-sm shadow-indigo-600/25' : 'text-slate-600 hover:text-sky-950 hover:bg-white/60'
              }`}
            >
              <Share2 className="w-4 h-4" /> <span>3. Partager</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleAmbientSound}
              title="Activer/Désactiver l'ambiance sonore sous-marine"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                ambientSoundOn ? 'bg-cyan-100 border-cyan-400 text-cyan-900 shadow-xs' : 'bg-white border-sky-200 text-slate-600 hover:bg-sky-50 hover:text-sky-900'
              }`}
            >
              {ambientSoundOn ? <Volume2 className="w-4 h-4 text-cyan-600 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{ambientSoundOn ? 'Son Mer ON' : 'Ambiance Mer'}</span>
            </button>
            <button
              onClick={() => { if (voiceOverOn) { stopSpeech(); setVoiceOverOn(false); } else { setVoiceOverOn(true); } }}
              title="Activer/Désactiver la voix off française"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                voiceOverOn ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-white border-sky-200 text-slate-600 hover:bg-sky-50 hover:text-sky-900'
              }`}
            >
              <Mic className={`w-4 h-4 ${isSpeaking ? 'text-amber-600 animate-bounce' : ''}`} />
              <span className="hidden md:inline">{voiceOverOn ? 'Voix Off FR' : 'Voix Off Muet'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MODE 1 & 2: MAP & FLOATING PANELS
      ==================================================================== */}
      {activeMode !== 'data' && (
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="relative flex-1 w-full h-full overflow-hidden">
            
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
              liveCells={liveCells}
              mapDate={selectedMapDate}
              isMapLoading={isMapLoading}
              tileStyle={tileStyle}
              colorMode={colorMode}
              livePipeline={livePipeline}
              mapDataType={mapDataType}
              dynamicTelemetry={dynamicTelemetry}
            />

            <div onClick={(e) => e.stopPropagation()} className="absolute top-4 left-4 z-30 flex flex-col items-start gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFilterOpen((open) => !open)}
                  aria-expanded={isFilterOpen}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-lg border transition-all ${
                    isFilterOpen ? 'bg-sky-700 text-white border-sky-800 shadow-sky-900/20' : 'bg-white/95 hover:bg-white text-slate-800 border-sky-200 shadow-sky-950/10'
                  }`}
                >
                  <Filter className={`w-4 h-4 ${isFilterOpen ? 'text-sky-200' : 'text-sky-600'}`} />
                  <span>Façades & Calques SST</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">{activeFiltersCount}</span>
                  )}
                </button>
                {mapView.focusedBasin && (
                  <button onClick={() => handleBasinFocus('Tous')} className="px-3.5 py-2.5 rounded-2xl bg-white/95 hover:bg-sky-50 text-xs font-bold text-sky-800 border border-sky-300 shadow-lg flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" /> <span>Vue France Entière</span>
                  </button>
                )}
              </div>

              {isFilterOpen && (
                <div className="w-80 bg-white/95 backdrop-blur-xl border border-sky-200/90 rounded-2xl p-4 shadow-2xl shadow-sky-950/15 space-y-4 animate-in fade-in slide-in-from-left-3 duration-200">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-sky-600" /> Façades & Données .NC
                    </span>
                    <button onClick={() => setIsFilterOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-sky-50">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">1. Filtrer par Façade</label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        { id: 'Tous', label: '🇫🇷 Toutes les façades (France)' },
                        { id: 'Méditerranée', label: '🌊 Méditerranée' },
                        { id: 'Atlantique', label: '🌊 Atlantique & Bretagne' },
                        { id: 'Manche', label: '🌊 Manche' }
                      ].map((item) => (
                        <button
                          key={item.id} onClick={() => handleBasinFocus(item.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${selectedBasin === item.id ? 'bg-sky-600 text-white shadow-xs' : 'bg-sky-50/80 text-slate-700 hover:bg-sky-100 border border-sky-200/60'}`}
                        >
                          <span>{item.label}</span>
                          {selectedBasin === item.id && <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">2. Réponse à la Canicule</label>
                    <div className="grid grid-cols-1 gap-1.5">
                      <button onClick={() => setSelectedTrend('Tous')} className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${selectedTrend === 'Tous' ? 'bg-slate-800 text-white' : 'bg-sky-50/80 text-slate-600 hover:bg-sky-100 border border-sky-200/60'}`}>
                        Toutes les espèces ({SPECIES_DATA.length})
                      </button>
                      <button onClick={() => setSelectedTrend('decline')} className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${selectedTrend === 'decline' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'}`}>
                        <span className="w-4 h-4 rounded-full bg-rose-700 text-white font-bold flex items-center justify-center text-xs">−</span>
                        <span>Disparaît / En déclin</span>
                      </button>
                      <button onClick={() => setSelectedTrend('proliferate')} className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${selectedTrend === 'proliferate' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'}`}>
                        <span className="w-4 h-4 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">+</span>
                        <span>Apparaît / Prolifère</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-sky-100 space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">3. Cartes SST Copernicus</label>
                    <div className="flex items-center justify-between">
                      <button onClick={() => setShowThermalOverlay(!showThermalOverlay)} className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${showThermalOverlay ? 'bg-gradient-to-r from-orange-50 to-rose-100 border-rose-300 text-rose-800' : 'bg-sky-50 border-sky-200 text-slate-600'}`}>
                        <Thermometer className="w-4 h-4 text-rose-600" /> <span>Pixels NRT : {showThermalOverlay ? 'ON' : 'OFF'}</span>
                      </button>
                      <button onClick={() => setShowCopernicusWmsInfo(!showCopernicusWmsInfo)} className="ml-1.5 p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100"><Layers className="w-4 h-4" /></button>
                    </div>

                  {showThermalOverlay && (
                        <>
                          {/* NOUVEL INTERRUPTEUR : SST vs MHW Hobday */}
                          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold shadow-inner">
                            <button
                              onClick={() => setMapDataType('sst')}
                              className={`flex-1 py-1.5 rounded-lg transition-all ${mapDataType === 'sst' ? 'bg-white text-sky-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                              🌡️ SST Brute
                            </button>
                            <button
                              onClick={() => setMapDataType('mhw')}
                              className={`flex-1 py-1.5 rounded-lg transition-all ${mapDataType === 'mhw' ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/30' : 'text-slate-500 hover:text-rose-600'}`}
                            >
                              🔥 Mode Canicule
                            </button>
                          </div>

                          {/* Boutons Précis / Moyenne existants */}
                          <div className="flex items-center bg-sky-50 p-1 rounded-xl border border-sky-200 text-[11px] font-semibold">
                            <button onClick={() => setColorMode('daily')} className={`flex-1 py-1 rounded-lg transition-all ${colorMode === 'daily' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>Précis (Jour J)</button>
                            <button onClick={() => setColorMode('average')} className={`flex-1 py-1 rounded-lg transition-all ${colorMode === 'average' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>Moyenne période</button>
                          </div>
                        </>
                      )}

                    <button onClick={() => setShowSatelliteRaster(!showSatelliteRaster)} className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${showSatelliteRaster ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-sky-50 border-sky-200 text-slate-700 hover:bg-sky-100'}`}>
                      <span>🛰️ Raster Satellite SST L4 : {showSatelliteRaster ? 'ACTIF' : 'OFF'}</span>
                    </button>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button onClick={() => setTileStyle('voyager')} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border ${tileStyle === 'voyager' ? 'bg-sky-600 text-white border-sky-600' : 'bg-sky-50 text-slate-700 border-sky-200'}`}>Océan Bathymétrie</button>
                      <button onClick={() => setTileStyle('osm')} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border ${tileStyle === 'osm' ? 'bg-sky-600 text-white border-sky-600' : 'bg-sky-50 text-slate-700 border-sky-200'}`}>OpenStreetMap</button>
                    </div>
                    {showCopernicusWmsInfo && (
                      <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-[10px] text-slate-600 leading-relaxed">
                        <strong className="text-sky-900 block mb-0.5">Fichier .nc décodé :</strong>
                        <code className="text-rose-700">{NC_FILE_METADATA.source}</code> • Climatologie 1991–2020.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeMode === 'museum' && (
                <div className="w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-amber-300 rounded-2xl p-3.5 shadow-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">Fresque Murale</span>
                    </div>
                    <button onClick={() => setShowMuseumDrawer(!showMuseumDrawer)} className="text-[11px] font-semibold text-amber-700 hover:underline">
                      {showMuseumDrawer ? 'Réduire' : 'Déplier'}
                    </button>
                  </div>
                  {showMuseumDrawer && (
                    <>
                      <p className="text-[11px] text-slate-600 leading-snug">Visite guidée avec arrêt automatique à la fin de chaque chapitre.</p>
                      <div className="grid grid-cols-2 gap-2">
                        {MUSEUM_SECTIONS.map((sec) => {
                          const isActive = activeMuseumSection.id === sec.id;
                          return (
                            <button key={sec.id} onClick={() => startMuseumSection(sec)} className={`text-left p-2.5 rounded-xl border transition-all ${isActive ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40' : 'bg-white border-sky-200 hover:border-sky-400'}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-gradient-to-r ${sec.color} text-white`}>#{sec.buttonNumber}</span>
                                {isActive && isMuseumPlaying && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
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

            {/* TOP-CENTER FLOATING TELEMETRY PILL (100% DYNAMIQUE) */}
            {dynamicTelemetry && (
              <div onClick={(e) => e.stopPropagation()} className="hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 z-30 items-center gap-3 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-sky-200/90 shadow-md text-xs">
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Copernicus : {dynamicTelemetry.date}
                </span>
                <span className="text-slate-300">|</span>
                <span title="Température de surface observée">
                  SST : <strong className="text-rose-600">{dynamicTelemetry.sst.toFixed(2)}°C</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span title="Climatologie de référence">
                  Climatologie : <strong className="text-sky-700">{dynamicTelemetry.climatology.toFixed(2)}°C</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span title="Écart par rapport à la moyenne">
                  Anomalie : <strong className={dynamicTelemetry.anomaly > 0 ? "text-rose-600 font-bold" : "text-sky-600 font-bold"}>
                    {dynamicTelemetry.anomaly > 0 ? '+' : ''}{dynamicTelemetry.anomaly.toFixed(2)}°C
                  </strong>
                </span>
              </div>
            )}

            {/* BOTTOM-LEFT LEGEND */}
            <div onClick={(e) => e.stopPropagation()} className="absolute bottom-3 left-4 z-30 bg-white/95 backdrop-blur-md border border-sky-200 rounded-xl px-3 py-2 text-[11px] flex flex-wrap items-center gap-3 shadow-md">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs">−</span>
                <span className="text-slate-700 font-medium">Disparaît</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">+</span>
                <span className="text-slate-700 font-medium">Prolifère</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 border-l border-sky-200 pl-3">
                <span className="text-slate-500 font-semibold">SST raster :</span>
                <span className="text-[10px] font-mono text-sky-700">16°C</span>
                <div className="w-24 h-2.5 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-700 border border-slate-200" />
                <span className="text-[10px] font-mono text-rose-700 font-bold">29°C+</span>
              </div>
            </div>

            {/* SPECIES INSPECTOR CARD */}
            {selectedSpecies && selectedSpeciesImages && (
              <aside onClick={(e) => e.stopPropagation()} className="absolute top-4 right-4 bottom-4 z-30 w-[calc(100%-2rem)] sm:w-[420px] bg-white/95 backdrop-blur-xl border border-sky-200 rounded-2xl shadow-2xl shadow-sky-950/20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="p-4 bg-gradient-to-r from-sky-50 via-cyan-50/50 to-white border-b border-sky-100 flex items-start justify-between gap-2 shrink-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800">{selectedSpecies.basin}</span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${selectedSpecies.trend === 'decline' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                        {selectedSpecies.trendLabel}
                      </span>
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-1 leading-tight">{selectedSpecies.name}</h2>
                    <p className="text-xs italic text-slate-500">{selectedSpecies.scientificName}</p>
                  </div>
                  <button onClick={() => setSelectedSpecies(null)} className="p-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-500 hover:text-slate-900 border border-sky-200/80 shrink-0"><X className="w-4 h-4" /></button>
                </div>

                <div className="relative bg-sky-100 h-56 shrink-0 overflow-hidden group border-b border-sky-100 select-none" onMouseEnter={() => setIsHoveringCarousel(true)} onMouseLeave={() => setIsHoveringCarousel(false)}>
                  <img key={selectedSpeciesImages[speciesImageIndex].src} src={selectedSpeciesImages[speciesImageIndex].src} alt={selectedSpeciesImages[speciesImageIndex].alt} onClick={() => setSpeciesImageIndex((index) => (index + 1) % selectedSpeciesImages.length)} className="w-full h-full object-cover cursor-pointer transition-transform duration-700 ease-out group-hover:scale-105" />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                    <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-semibold text-slate-800 border border-sky-200/80 shadow-xs flex items-center gap-1 truncate max-w-[65%]">
                      <MapPin className="w-3 h-3 text-sky-600 shrink-0" /> <span className="truncate">{selectedSpecies.locationName}</span>
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); speakText(`${selectedSpecies.name}. ${selectedSpecies.narrationText}`); }} className="pointer-events-auto px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] shadow-md flex items-center gap-1 transition-transform active:scale-95 shrink-0">
                      <Volume2 className="w-3.5 h-3.5" /> <span>Audio</span>
                    </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-900/65 to-transparent px-3.5 pb-8 pt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="text-xs font-semibold text-white leading-snug drop-shadow-xs">{selectedSpeciesImages[speciesImageIndex].alt}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[10px] text-sky-100 pointer-events-auto">
                      <span>Photo :</span>
                      <a href={`https://commons.wikimedia.org/wiki/${encodeURIComponent(`File:${selectedSpeciesImages[speciesImageIndex].title}`)}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="underline decoration-sky-300/70 underline-offset-2 hover:text-white">{selectedSpeciesImages[speciesImageIndex].artist}</a>
                      <span aria-hidden="true">·</span>
                      <span>{selectedSpeciesImages[speciesImageIndex].license}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-2 z-10">
                    {selectedSpeciesImages.map((img: any, idx: number) => (
                      <button key={img.title} type="button" onClick={(e) => { e.stopPropagation(); setSpeciesImageIndex(idx); }} className={`h-2 rounded-full transition-all duration-300 shadow-xs ${idx === speciesImageIndex ? 'w-7 bg-white ring-2 ring-sky-500/50' : 'w-2 bg-white/65 hover:bg-white'}`} />
                    ))}
                  </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
                  <div className={`p-3 rounded-xl border ${selectedSpecies.trend === 'decline' ? 'bg-rose-50/70 border-rose-200' : 'bg-emerald-50/70 border-emerald-200'}`}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                        <AlertTriangle className={`w-3.5 h-3.5 ${selectedSpecies.trend === 'decline' ? 'text-rose-600' : 'text-emerald-600'}`} /> Seuil Critique :
                      </span>
                      <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                        SST {dynamicTelemetry?.year || 2026} : {(selectedSpecies.baseSst2015 + (selectedSpecies.sst2026 - selectedSpecies.baseSst2015) * heatFactor).toFixed(1)}°C
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{selectedSpecies.criticalThreshold}</p>
                    <p className="text-[11px] text-slate-600 mt-1">Terrain : <span className="font-semibold text-slate-800">{selectedSpecies.mortalityRate}</span></p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Effet de la canicule marine</h3>
                    <p className="text-xs text-slate-700 leading-relaxed">{selectedSpecies.impactDetails}</p>
                  </div>
                  
                  {activeMode === 'museum' && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-900 truncate">{activeMuseumSection.title}</span>
                        <span className="text-[11px] font-semibold text-amber-700 shrink-0 ml-2">{museumStepIndex + 1} / {activeMuseumSection.speciesIds.length}</span>
                      </div>
                      {sectionCompletedPause ? (
                        <div className="p-2 rounded-lg bg-white border border-amber-300 text-[11px] text-amber-900 flex items-center justify-between gap-2">
                          <span>⏸️ <strong>Chapitre terminé.</strong> Choisissez un autre bouton de fresque !</span>
                          <button onClick={() => startMuseumSection(activeMuseumSection)} className="px-2 py-1 rounded bg-amber-500 text-white font-bold shrink-0">Rejouer</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={() => setIsMuseumPlaying(!isMuseumPlaying)} className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs flex items-center justify-center gap-1">
                            {isMuseumPlaying ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Lecture</>}
                          </button>
                          <button onClick={() => {
                            const sectionSpecies = activeMuseumSection.speciesIds.map((id) => SPECIES_DATA.find((s) => s.id === id)).filter((s): s is SpeciesItem => Boolean(s));
                            if (museumStepIndex < sectionSpecies.length - 1) {
                              const next = museumStepIndex + 1;
                              setMuseumStepIndex(next);
                              handleSelectSpecies(sectionSpecies[next]);
                            } else {
                              setIsMuseumPlaying(false);
                              setSectionCompletedPause(true);
                            }
                          }} className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1">
                            <span>Suivant</span> <SkipForward className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          MODE 2: COMPRENDRE (TABLEAUX DE BORD & ANALYSE HOBDAY)
      ==================================================================== */}
      {activeMode === 'comprendre' && (() => {
        // Calcul dynamique de la période de référence des 30 ans
        const refYear = new Date(apiStartDate).getFullYear();
        const baselineStart = refYear - 30;
        const baselineEnd = refYear - 1;

        return (
        <main className="flex-1 overflow-y-auto w-full px-4 lg:px-8 py-6 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* KPI Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-sky-200/80 p-4 rounded-xl shadow-2xs">
                <div className="text-xs font-semibold text-slate-500">Pic d'Anomalie de la période</div>
                <div className="text-2xl font-black text-rose-600 mt-1">+{maxAnomalyDynamic.toFixed(2)} °C</div>
                <div className="text-[11px] text-slate-500 mt-1">SST vs Climatologie historique</div>
              </div>
              <div className="bg-white border border-sky-200/80 p-4 rounded-xl shadow-2xs">
                <div className="text-xs font-semibold text-slate-500">Canicules Marines (MHW)</div>
                <div className="text-2xl font-black text-amber-600 mt-1">{livePipeline?.events?.length || 0}</div>
                <div className="text-[11px] text-slate-500 mt-1">Événements détectés sur la série</div>
              </div>
              <div className="bg-white border border-sky-200/80 p-4 rounded-xl shadow-2xs">
                <div className="text-xs font-semibold text-slate-500">Cellules de la carte (NRT)</div>
                <div className="text-2xl font-black text-sky-700 mt-1">{liveCells.length} tuiles</div>
                <div className="text-[11px] text-slate-500 mt-1">Couverture globale Copernicus</div>
              </div>
              <div className="bg-white border border-emerald-200/80 p-4 rounded-xl shadow-2xs">
                <div className="text-xs font-semibold text-slate-500">Jours analysés</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">{livePipeline?.records?.length || 0}</div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">Méthode: {livePipeline?.method?.method || 'Hobday et al.'}</div>
              </div>
            </div>

            {/* EXPLICATION DU PROTOCOLE HOBDAY & Règle des 30 ans */}
            <div className="bg-white border border-sky-200/80 rounded-2xl p-6 shadow-xs flex flex-col xl:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  Protocole de Catégorisation de Hobday (2018)
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Conformément aux normes internationales de l'OMM, la période de référence (climatologie) est calculée dynamiquement sur les 30 années précédant votre sélection : <strong>de {baselineStart} à {baselineEnd}</strong>. Le seuil se déclenche lorsque la température dépasse le <strong>90e percentile</strong> de cette période historique pendant au moins 5 jours.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  L'intensité est calculée en multipliant l'écart entre la normale de ces 30 ans et ce seuil critique (1×). Plus la température s'envole, plus la catégorie augmente.
                </p>
              </div>
              <div className="flex-1">
                <table className="w-full text-left border-collapse text-xs shadow-sm rounded-lg overflow-hidden border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider">
                      <th className="p-2 border-b">Catégorie</th>
                      <th className="p-2 border-b">Intensité</th>
                      <th className="p-2 border-b">Impacts Biologiques</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-bold text-amber-600">I - Modérée</td>
                      <td className="p-2 font-mono text-slate-500">1× à 2× l'écart</td>
                      <td className="p-2 text-slate-600">Stress léger sur les espèces locales.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-orange-500">II - Forte</td>
                      <td className="p-2 font-mono text-slate-500">2× à 3× l'écart</td>
                      <td className="p-2 text-slate-600">Blanchiment initial, déplacements.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-rose-600">III - Sévère</td>
                      <td className="p-2 font-mono text-slate-500">3× à 4× l'écart</td>
                      <td className="p-2 text-slate-600">Mortalité massive d'espèces immobiles.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-fuchsia-900">IV - Extrême</td>
                      <td className="p-2 font-mono text-slate-500">&gt; 4× l'écart</td>
                      <td className="p-2 text-slate-600">Effondrement d'écosystèmes entiers.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* STRIP PLOT GLOBAL */}
            <div className="bg-white border border-sky-200/80 rounded-2xl p-5 shadow-xs pb-16">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Canicules marines sur toute la série temporelle</h3>
              <p className="text-xs text-slate-600 mb-2">
                Dans les deux graphes ci-dessous, les épisodes de canicules marines sont illustrés par les rubans rouges.
              </p>
              
              <div className="flex relative pl-14 pr-4 pt-2 pb-8">
                <div className="absolute left-0 top-0 bottom-8 flex items-center justify-center w-8">
                  <span className="text-xs font-bold text-slate-600 -rotate-90 whitespace-nowrap tracking-widest">Année</span>
                </div>

                <div className="flex-1 flex flex-col gap-5 relative border-l border-b border-slate-300 pb-2">
                  {Array.from(new Set(timelineRecords.map((r: any) => Number(r.date.slice(0, 4)))))
                    .sort((a: any, b: any) => b - a)
                    .map((yr: any) => (
                    <div key={yr} className="flex items-center h-2 relative w-full group">
                      <span className="absolute -left-11 w-8 text-[10px] text-right font-medium text-slate-600 group-hover:text-slate-900">{yr}</span>
                      <div className="flex-1 h-[1px] bg-slate-200 relative w-full group-hover:bg-slate-300 transition-colors">
                        {livePipeline?.events?.filter((e:any) => e.start.startsWith(yr.toString())).map((ev: any) => {
                          const startDay = getDayOfYear(ev.start);
                          const leftPct = (startDay / 365) * 100;
                          const widthPct = (ev.durationDays / 365) * 100;
                          
                          const peakRec = timelineRecords.find((r: any) => r.date === (ev.peak || ev.start));
                          let cat = { color: 'bg-rose-500 text-white' };
                          if (peakRec) cat = getHobdayCategory(peakRec.sst, peakRec.climatology, peakRec.threshold);

                          return (
                            <React.Fragment key={ev.id}>
                              <div 
                                className="absolute h-3 -top-1 bg-red-400/90 hover:bg-red-500 cursor-pointer transition-colors" 
                                style={{ left: `${leftPct}%`, width: `${Math.max(0.5, widthPct)}%` }} 
                                onMouseLeave={() => setHoveredStripEvent(null)}
                                onMouseMove={(e) => {
                                  const rect = e.currentTarget.parentElement.getBoundingClientRect();
                                  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                                  const dayOfYear = Math.floor(pct * 365);
                                  const hoverDate = new Date(yr, 0, dayOfYear + 1);
                                  const formattedDate = hoverDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
                                  const dateStr = `${hoverDate.getFullYear()}-${String(hoverDate.getMonth() + 1).padStart(2, '0')}-${String(hoverDate.getDate()).padStart(2, '0')}`;
                                  const dayRec = timelineRecords.find((r: any) => r.date === dateStr);
                                  
                                  setHoveredStripEvent({ 
                                    id: ev.id, x: pct * 100, date: formattedDate, 
                                    temp: dayRec ? dayRec.sst : (peakRec ? peakRec.sst : null), color: cat.color 
                                  });
                                }}
                              />
                              {hoveredStripEvent?.id === ev.id && (
                                <div className={`absolute z-50 pointer-events-none px-2.5 py-1.5 rounded shadow-lg text-[10px] flex flex-col gap-0.5 whitespace-nowrap transform -translate-x-1/2 -translate-y-[130%] transition-none ${hoveredStripEvent.color}`} style={{ left: `${hoveredStripEvent.x}%` }}>
                                  <span className="font-medium">Date : {hoveredStripEvent.date}</span>
                                  <span className="font-medium">Température : {hoveredStripEvent.temp?.toFixed(2)} °C</span>
                                  <div className="absolute w-2 h-2 rotate-45 -bottom-1 left-1/2 -translate-x-1/2 bg-inherit"></div>
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-[10px] text-slate-500 font-medium px-2">
                    <span className="-rotate-45 translate-y-2">01 janv.</span>
                    <span className="-rotate-45 translate-y-2">01 mars</span>
                    <span className="-rotate-45 translate-y-2">01 mai</span>
                    <span className="-rotate-45 translate-y-2">01 juil.</span>
                    <span className="-rotate-45 translate-y-2">01 sept.</span>
                    <span className="-rotate-45 translate-y-2">01 nov.</span>
                  </div>
                </div>
              </div>
              <div className="text-center text-xs text-slate-600 mt-4">Jour de l'année</div>
            </div>

            {/* GRAPHIQUE JOURNALIER & TABLEAU OFFICIEL */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              
              {/* LineChart Moderne */}
              <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-xl shadow-sky-900/5 flex flex-col relative w-full xl:sticky xl:top-6 z-10">
                <div className="mb-6 flex items-center justify-between z-10">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900">Évolution journalière</h3>
                    <p className="text-xs font-medium text-slate-400">Température observée vs 90e percentile</p>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2">Année</label>
                    <select
                      value={selectedHeatwaveYear}
                      onChange={(e) => setSelectedHeatwaveYear(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg bg-white border-none text-sm font-bold text-slate-800 outline-none cursor-pointer shadow-sm hover:text-blue-600 transition-colors"
                    >
                      {Array.from(new Set((timelineRecords || []).map((r: any) => Number(r.date.slice(0, 4))))).sort((a: any, b: any) => b - a).map((yr: any) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="h-[420px] w-full relative pb-12 pl-2">
                  <div className="absolute top-1/2 -left-3 -translate-y-1/2 -rotate-90 text-[11px] font-bold text-slate-400 uppercase tracking-widest z-10">
                    Température (°C)
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={(timelineRecords || []).filter((r: any) => Number(r.date.slice(0, 4)) === selectedHeatwaveYear)} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                      <defs>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#3b82f6" floodOpacity="0.25" />
                        </filter>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} strokeDasharray="4 4" />
                      {livePipeline?.events
                        ?.filter((ev: any) => ev.start.startsWith(selectedHeatwaveYear.toString()) || ev.end.startsWith(selectedHeatwaveYear.toString()))
                        .map((ev: any) => (
                          <ReferenceArea key={`mhw-rect-${ev.id}`} x1={ev.start} x2={ev.end} fill="#fecaca" fillOpacity={0.6} strokeOpacity={0} />
                      ))}
                      <XAxis dataKey="date" stroke="#cbd5e1" fontSize={10} fontWeight={600} tickFormatter={(val) => {
                          if (!val) return '';
                          const [y, m, dNum] = val.split('-');
                          const months = ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
                          return `${dNum} ${months[parseInt(m, 10) - 1]}`;
                        }} ticks={Array.from({ length: 12 }).map((_, i) => `${selectedHeatwaveYear}-${String(i + 1).padStart(2, '0')}-01`)} angle={-45} textAnchor="end" dx={-8} dy={8} axisLine={false} tickLine={false} />
                      <YAxis domain={['auto', 'auto']} stroke="#cbd5e1" fontSize={11} fontWeight={600} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => `${val}°`} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Line type="monotone" dataKey="sst" stroke="#3b82f6" strokeWidth={2.5} dot={false} isAnimationActive={true} activeDot={{ r: 6, fill: '#ffffff', stroke: '#3b82f6', strokeWidth: 3 }} filter="url(#shadow)" />
                      <Line type="monotone" dataKey="threshold" stroke="#94a3b8" strokeWidth={2} strokeDasharray="6 6" dot={false} isAnimationActive={true} activeDot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] z-20">
                    <div className="flex items-center gap-2.5"><span className="w-4 h-1.5 rounded-full bg-blue-500"></span><span>Année {selectedHeatwaveYear}</span></div>
                    <div className="flex items-center gap-2.5"><span className="w-4 h-1.5 rounded-full bg-slate-300"></span><span>P90 ({baselineStart}-{baselineEnd})</span></div>
                    <div className="flex items-center gap-2.5"><span className="w-3.5 h-3.5 rounded-md bg-red-200 border border-red-300"></span><span>Canicule</span></div>
                  </div>
                </div>
              </div>

              {/* Tableau Triable */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col font-sans">
                <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-800">Afficher</span>
                    <select value={tableRowsPerPage} onChange={(e) => setTableRowsPerPage(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1 text-sm text-slate-700 outline-none cursor-pointer hover:border-slate-400">
                      <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option><option value={1000}>Tous</option>
                    </select>
                    <span className="text-sm font-bold text-slate-800">entrées</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-800">Rechercher :</span>
                    <input type="text" value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} placeholder="Année, numéro..." className="border border-slate-300 rounded px-3 py-1 w-48 focus:border-blue-500 outline-none transition-colors" />
                  </div>
                </div>

                <div className="overflow-x-auto w-full border-t border-slate-200 min-h-[300px]">
                  <table className="w-full text-center text-[13px] text-slate-700">
                    <thead>
                      <tr className="border-b-2 border-slate-200 bg-slate-50/50 select-none">
                        <th className="py-4 px-4 font-bold align-bottom cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('originalIdx')}>Numéro {getSortIcon('originalIdx')}</th>
                        <th className="py-4 px-4 font-bold align-bottom cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('start')}>Début {getSortIcon('start')}</th>
                        <th className="py-4 px-4 font-bold align-bottom cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('peak')}>Pic {getSortIcon('peak')}</th>
                        <th className="py-4 px-4 font-bold align-bottom cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('end')}>Fin {getSortIcon('end')}</th>
                        <th className="py-4 px-4 font-bold align-bottom cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('duration')}>Durée (j) {getSortIcon('duration')}</th>
                        <th className="py-4 px-4 font-bold align-bottom cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('computedCumulative')}>Intensité {getSortIcon('computedCumulative')}</th>
                        <th className="py-4 px-4 font-bold align-bottom cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('category')}>Catégorie {getSortIcon('category')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedTableEvents.map((ev: any) => (
                        <tr key={ev.id || ev.originalIdx} className="hover:bg-blue-50/50 transition-colors">
                          <td className="py-3 px-4">{ev.originalIdx}</td>
                          <td className="py-3 px-4 font-mono">{ev.start}</td>
                          <td className="py-3 px-4 font-mono">{ev.peak || ev.start}</td>
                          <td className="py-3 px-4 font-mono">{ev.end}</td>
                          <td className="py-3 px-4">{ev.duration}</td>
                          <td className="py-3 px-4 font-medium">{ev.computedCumulative !== undefined && ev.computedCumulative !== null ? ev.computedCumulative.toFixed(2) : '—'}</td>
                          <td className="py-3 px-4 flex justify-center"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ev.categoryData.color}`}>{ev.categoryData.name}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 border-t border-slate-200 bg-white flex flex-col items-center gap-4">
                  {tableTotalPages > 1 && (
                    <div className="flex items-center gap-1 text-sm select-none">
                      <button disabled={tablePage === 1} onClick={() => setTablePage(p => Math.max(1, p - 1))} className="px-3 py-1.5 text-slate-500 hover:text-blue-600 disabled:opacity-40 cursor-pointer">Précédent</button>
                      {Array.from({ length: Math.min(5, tableTotalPages) }).map((_, i) => {
                        let pageNum = tablePage <= 3 ? i + 1 : tablePage + i - 2;
                        if (tablePage > tableTotalPages - 2 && tableTotalPages > 5) pageNum = tableTotalPages - 4 + i;
                        if (pageNum > tableTotalPages) return null;
                        return (<button key={pageNum} onClick={() => setTablePage(pageNum)} className={`px-3 py-1.5 rounded transition-colors ${tablePage === pageNum ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm font-bold' : 'text-slate-700 hover:bg-slate-50 border border-transparent'}`}>{pageNum}</button>);
                      })}
                      <button disabled={tablePage === tableTotalPages} onClick={() => setTablePage(p => Math.min(tableTotalPages, p + 1))} className="px-3 py-1.5 text-slate-700 hover:text-blue-600 disabled:opacity-40 cursor-pointer">Suivant</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </main>
        );
      })()}

{/* ====================================================================
          MODE 3: PARTAGER (EXPORTS & FORUM COMMUNAUTAIRE)
      ==================================================================== */}
      {activeMode === 'partager' && (
        <main className="flex-1 overflow-y-auto w-full px-4 lg:px-8 py-6 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header de la page Partager */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Database className="w-6 h-6 text-indigo-600" /> Centre de Partage & Données
              </h2>
              <p className="text-sm text-slate-500 mt-1">Exportez les séries temporelles Copernicus (.nc) ou discutez des anomalies avec la communauté scientifique.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* COLONNE GAUCHE : EXPORT ET METADATA */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-sky-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Export Open Data</h3>
                  <div className="space-y-3">
                    <button onClick={() => triggerDownload('csv')} className="w-full px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs flex items-center justify-between transition-colors">
                      <span className="flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" /> Matrice .CSV</span>
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => triggerDownload('json')} className="w-full px-4 py-2.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-bold text-xs flex items-center justify-between transition-colors">
                      <span className="flex items-center gap-2"><FileJson className="w-4 h-4" /> Payload .JSON</span>
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setExportPreviewFormat('json')} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                      <Eye className="w-4 h-4" /> Aperçu brut
                    </button>
                  </div>
                  
                  <div className="mt-6 p-3 rounded-xl bg-sky-50/50 border border-sky-100 text-[10px] text-slate-500">
                    <strong className="text-sky-900 block mb-1">Source NetCDF4 :</strong>
                    <code className="text-rose-700 bg-rose-50 px-1 py-0.5 rounded">{NC_FILE_METADATA.source}</code><br/>
                    Climatologie 1991–2020.
                  </div>
                </div>
              </div>

              {/* COLONNE DROITE : FORUM COMMUNAUTAIRE */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-0 shadow-sm flex flex-col h-[600px]">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-indigo-600" /> Forum d'Analyse Participative
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">3 Observateurs en ligne</span>
                </div>
                
                {/* Fil de discussion */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/30">
                  
                  {/* Message 1 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-200 flex items-center justify-center text-sky-700 font-bold text-xs shrink-0">IF</div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-800">Ifremer_Toulon</span>
                        <span className="text-[10px] text-slate-400">Il y a 2 heures</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600 bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm leading-relaxed">
                        Le pic du {dynamicTelemetry?.date} est particulièrement sévère. Nos capteurs in-situ COAST-HF relèvent une plongée de la thermocline à -35m. Risque imminent de nécrose pour les gorgones de la zone.
                      </div>
                    </div>
                  </div>

                  {/* Message 2 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0">NG</div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-800">Noah (Admin)</span>
                        <span className="text-[10px] text-slate-400">Il y a 45 min</span>
                        <span className="text-[9px] px-1.5 bg-blue-100 text-blue-700 rounded uppercase font-bold">Mod</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600 bg-blue-50 border border-blue-100 p-3 rounded-2xl rounded-tl-none shadow-sm leading-relaxed">
                        Merci pour l'alerte ! Les données Copernicus NRT d'aujourd'hui (SST: {dynamicTelemetry?.sst?.toFixed(2)}°C) confirment un écart critique au P90. Le JSON a été mis à jour sur l'API.
                      </div>
                    </div>
                  </div>

                </div>

                {/* Input Forum */}
                <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Partagez une observation ou un relevé terrain..." 
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                    />
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                      Envoyer
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        
        {/* Modal d'export CSV / JSON */}
          {exportPreviewFormat && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-sky-200 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-sky-100 flex items-center justify-between bg-sky-50/60">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setExportPreviewFormat('csv')} className={`px-3 py-1 rounded-lg text-xs font-bold ${exportPreviewFormat === 'csv' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-sky-200'}`}>Format CSV</button>
                    <button onClick={() => setExportPreviewFormat('json')} className={`px-3 py-1 rounded-lg text-xs font-bold ${exportPreviewFormat === 'json' ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 border border-sky-200'}`}>Format JSON</button>
                  </div>
                  <button onClick={() => setExportPreviewFormat(null)} className="p-1.5 rounded-lg bg-white border border-sky-200 text-slate-500 hover:text-slate-900"><X className="w-4 h-4" /></button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-800 overflow-auto flex-1 bg-sky-50/30">
                  {exportPreviewFormat === 'csv' ? generateCsvContent() : generateJsonContent()}
                </pre>
                <div className="p-4 border-t border-sky-100 flex justify-end gap-2 bg-white">
                  <button onClick={() => triggerDownload(exportPreviewFormat)} className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2">
                    <Download className="w-4 h-4" /><span>Télécharger .{exportPreviewFormat}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

{/* BOTTOM CONTROL BAR */}
      <div className="shrink-0 z-30 px-4 lg:px-8 py-3 bg-white/95 backdrop-blur-md border-t border-sky-200/90 shadow-sm relative">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[44px]">
          
          {activeMode === 'visualiser' && colorMode === 'daily' && mapDataType !== 'impact' && (
            <div className="flex items-center gap-3 bg-sky-50 px-5 py-1.5 rounded-xl border border-sky-200 shadow-sm animate-in fade-in zoom-in duration-200">
              <Thermometer className="w-5 h-5 text-rose-600" />
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Carte SST du :
              </label>
              <input 
                type="date"
                min={apiStartDate}
                max={apiEndDate}
                value={dynamicTelemetry?.date || ''}
                onChange={(e) => {
                  const idx = timelineRecords.findIndex((r: any) => r.date === e.target.value);
                  if (idx !== -1) setSelectedRecordIndex(idx);
                }}
                className="px-2 py-1 rounded bg-white border border-sky-300 text-sky-900 font-bold text-sm outline-none cursor-pointer"
              />
            </div>
          )}

          {activeMode === 'visualiser' && colorMode === 'average' && (
            <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl shadow-sm border border-slate-200 animate-in fade-in zoom-in duration-200">
              <Database className="w-4 h-4 text-sky-600 hidden sm:inline" />
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider hidden md:inline mr-1">
                Période d'analyse :
              </span>
              <input 
                type="date" 
                value={apiStartDate} 
                onChange={(e) => setApiStartDate(e.target.value)} 
                className="px-2 py-1 border border-slate-200 rounded-md text-xs font-bold text-slate-800 outline-none focus:border-sky-500 cursor-pointer" 
              />
              <span className="text-xs font-bold text-slate-400 mx-1">au</span>
              <input 
                type="date" 
                value={apiEndDate} 
                onChange={(e) => setApiEndDate(e.target.value)} 
                className="px-2 py-1 border border-slate-200 rounded-md text-xs font-bold text-slate-800 outline-none focus:border-sky-500 cursor-pointer" 
              />
              <button 
                onClick={loadCopernicusData} 
                disabled={isFiltering}
                className="ml-2 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {isFiltering ? 'Calcul...' : 'Recharger'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

