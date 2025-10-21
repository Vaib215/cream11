import React, { useState, useCallback, useEffect } from 'react';
import { Match, Team, ViewState } from './types';
import { generateFplTeam, fetchUpcomingMatches } from './services/geminiService';
import FixturesList from './components/FixturesList';
import TeamDisplay from './components/TeamDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.Fixtures);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [generatedTeam, setGeneratedTeam] = useState<Team | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(true);
  const [matchFetchError, setMatchFetchError] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    setIsLoadingMatches(true);
    setMatchFetchError(null);
    try {
      const upcomingMatches = await fetchUpcomingMatches();
      setMatches(upcomingMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setMatchFetchError(`Failed to fetch upcoming matches. ${message}`);
    } finally {
      setIsLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleGenerateTeam = useCallback(async (match: Match) => {
    setSelectedMatch(match);
    setView(ViewState.Loading);
    setGeneratedTeam(null);
    setErrorMessage(null);

    try {
      const teamData = await generateFplTeam(match.team1.name, match.team2.name);
      if (teamData) {
        setGeneratedTeam(teamData);
        setView(ViewState.Team);
      } else {
        throw new Error('Received no data from the AI service.');
      }
    } catch (error) {
      console.error('Error generating team:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setErrorMessage(`Failed to generate team. ${message}`);
      setView(ViewState.Error);
    }
  }, []);

  const handleBackToFixtures = () => {
    setView(ViewState.Fixtures);
    setSelectedMatch(null);
    setGeneratedTeam(null);
  };

  const renderContent = () => {
    if (isLoadingMatches) {
        return <LoadingSpinner match={null} message="Fetching latest Premier League fixtures..." />;
    }
    
    if (matchFetchError) {
        return <ErrorDisplay message={matchFetchError} onRetry={loadMatches} retryText="Retry Fetch" />;
    }

    switch (view) {
      case ViewState.Fixtures:
        return <FixturesList matches={matches} onGenerateTeam={handleGenerateTeam} />;
      case ViewState.Loading:
        return <LoadingSpinner match={selectedMatch} />;
      case ViewState.Team:
        if (generatedTeam && selectedMatch) {
          return (
            <TeamDisplay
              teamData={generatedTeam}
              match={selectedMatch}
              onBack={handleBackToFixtures}
            />
          );
        }
        return <ErrorDisplay message="Team data is missing." onRetry={handleBackToFixtures} />;
      case ViewState.Error:
        return <ErrorDisplay message={errorMessage || "An unexpected error occurred."} onRetry={handleBackToFixtures} />;
      default:
        return <FixturesList matches={matches} onGenerateTeam={handleGenerateTeam} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
