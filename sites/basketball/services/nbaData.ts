
import type { Game } from '../types';

export const upcomingGames: Game[] = [
  {
    id: '1',
    teamA: { name: 'Los Angeles Lakers', logo: 'https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg' },
    teamB: { name: 'Boston Celtics', logo: 'https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg' },
    date: 'Today',
    time: '7:30 PM EST',
    arena: 'Crypto.com Arena'
  },
  {
    id: '2',
    teamA: { name: 'Golden State Warriors', logo: 'https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg' },
    teamB: { name: 'Denver Nuggets', logo: 'https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg' },
    date: 'Tomorrow',
    time: '10:00 PM EST',
    arena: 'Chase Center'
  },
  {
    id: '3',
    teamA: { name: 'Milwaukee Bucks', logo: 'https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg' },
    teamB: { name: 'Phoenix Suns', logo: 'https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg' },
    date: 'In 2 Days',
    time: '8:00 PM EST',
    arena: 'Fiserv Forum'
  },
    {
    id: '4',
    teamA: { name: 'Miami Heat', logo: 'https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg' },
    teamB: { name: 'Philadelphia 76ers', logo: 'https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg' },
    date: 'In 3 Days',
    time: '7:00 PM EST',
    arena: 'Kaseya Center'
  }
];
