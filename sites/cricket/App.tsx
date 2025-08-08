import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import MatchPage from './pages/MatchPage';

const App: React.FC = () => {
    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-base-100 font-sans">
                <Header />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/match/:matchId" element={<MatchPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;