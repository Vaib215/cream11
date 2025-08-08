
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import { COLORS } from './constants';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div 
        className="min-h-screen flex flex-col text-white"
        style={{ backgroundColor: COLORS.background }}
      >
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game/:gameId" element={<GamePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
