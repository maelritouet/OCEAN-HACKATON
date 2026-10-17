import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SPECIES_DATA, COPERNICUS_YEARS, MUSEUM_SECTIONS } from './data';
import { UnderwaterAudioEngine } from './utils';
import Header from './components/Header';
import RealWorldMap from './components/Map';
import DataPortal from './components/DataPortal';
// Imports fictifs pour les autres panels (FilterMenu, Timeline, SpeciesCard)
import ExpertMode from './components/ExpertMode';

export default function App() {
  // Navigation
  const [activeMode, setActiveMode] = useState('explore');
  const [yearIndex, setYearIndex] = useState(9);
  const currentYearData = COPERNICUS_YEARS[yearIndex];

  // Carte & Filtres
  const [selectedBasin, setSelectedBasin] = useState('Tous');
  const [selectedTrend, setSelectedTrend] = useState('Tous');
  const [showThermalOverlay, setShowThermalOverlay] = useState(true);
  const [showSatelliteRaster, setShowSatelliteRaster] = useState(false);
  const [tileStyle, setTileStyle] = useState<'voyager' | 'osm'>('voyager');
  const [mapView, setMapView] = useState<{ focusedBasin: string | null }>({ focusedBasin: null });
  const [selectedSpecies, setSelectedSpecies] = useState<any>(null);

  // Audio Engine
  const [ambientSoundOn, setAmbientSoundOn] = useState(false);
  const [voiceOverOn, setVoiceOverOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioEngineRef = useRef<UnderwaterAudioEngine | null>(null);

  useEffect(() => {
    audioEngineRef.current = new UnderwaterAudioEngine();
    return () => { audioEngineRef.current?.stop(); };
  }, []);

  const toggleAmbientSound = () => {
    if (ambientSoundOn) { audioEngineRef.current?.stop(); setAmbientSoundOn(false); } 
    else { audioEngineRef.current?.start(); setAmbientSoundOn(true); }
  };

  const filteredSpecies = useMemo(() => {
    return SPECIES_DATA.filter(sp => (selectedBasin === 'Tous' || sp.basin === selectedBasin));
  }, [selectedBasin, selectedTrend]);

  return (
    <div className="h-screen w-screen bg-sky-50 flex flex-col overflow-hidden">
      <Header 
        activeMode={activeMode} 
        setActiveMode={setActiveMode}
        ambientSoundOn={ambientSoundOn}
        toggleAmbientSound={toggleAmbientSound}
        voiceOverOn={voiceOverOn}
        setVoiceOverOn={setVoiceOverOn}
        isSpeaking={isSpeaking}
      />
      
      {activeMode !== 'data' && activeMode !== 'expert' && (
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <RealWorldMap 
             species={filteredSpecies}
             selectedSpecies={selectedSpecies}
             onSelectSpecies={setSelectedSpecies}
             onClearSelection={() => setSelectedSpecies(null)}
             focusedBasin={mapView.focusedBasin}
             selectedBasin={selectedBasin}
             showThermalOverlay={showThermalOverlay}
             showSatelliteRaster={showSatelliteRaster}
             heatFactor={Math.min(1, Math.max(0.18, (currentYearData.medAnomaly - 0.5) / 4.3))}
             currentYearData={currentYearData}
             tileStyle={tileStyle}
          />
          
          {/* Les panneaux superposés reçoivent juste leurs props de pilotage */}
          {/* <FilterMenu selectedBasin={selectedBasin} setSelectedBasin={setSelectedBasin} ... /> */}
          {/* {selectedSpecies && <SpeciesCard species={selectedSpecies} ... />} */}
          {/* <Timeline yearIndex={yearIndex} setYearIndex={setYearIndex} ... /> */}
        </div>
      )}

      {activeMode === 'data' && <DataPortal currentYearData={currentYearData} />}
      {activeMode === 'expert' && <ExpertMode />}
      
    </div>
  );
}