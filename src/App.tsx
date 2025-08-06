import React from 'react';
import NightSkyBackground from './components/NightSkyBackground';
import PortfolioContent from './components/PortfolioContent';

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <NightSkyBackground />
      <PortfolioContent />
    </div>
  );
}

export default App;