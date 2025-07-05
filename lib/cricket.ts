import axios from 'axios';
import { createClient } from 'redis';
import { InternationalMatch, MatchFormat, PlayerStats, Team, CricAPIResponse, CricAPIMatch, SportDevsResponse, SportDevsMatch } from '@/types/cricket';

const CRICAPI_KEY = process.env.CRICAPI_KEY;
const SPORTDEVS_API_KEY = process.env.SPORTDEVS_API_KEY;
const REDIS_URL = process.env.REDIS_URL;

// Redis client setup
const redis = createClient({
  url: REDIS_URL
});

// Cache TTL values (in seconds)
const CACHE_TTL = {
  MATCH: 300, // 5 minutes
  PLAYER: 3600, // 1 hour
  TEAM: 3600, // 1 hour
  SERIES: 86400, // 24 hours
};

// Base URLs
const API_BASE_URL = 'https://api.cricapi.com/v1';

export class CricketService {
  private static instance: CricketService;
  private isRedisConnected: boolean = false;

  private constructor() {
    this.connectRedis();
  }

  private async connectRedis() {
    try {
      await redis.connect();
      this.isRedisConnected = true;
    } catch (error) {
      console.error('Redis connection failed:', error);
      this.isRedisConnected = false;
    }
  }

  public static getInstance(): CricketService {
    if (!CricketService.instance) {
      CricketService.instance = new CricketService();
    }
    return CricketService.instance;
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    if (!this.isRedisConnected) return null;

    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  private async setCache<T>(key: string, data: T, ttl: number): Promise<void> {
    if (!this.isRedisConnected) return;

    await redis.setEx(key, ttl, JSON.stringify(data));
  }

  async getUpcomingMatches(format?: MatchFormat): Promise<InternationalMatch[]> {
    const cacheKey = `matches:upcoming:${format || 'all'}`;
    const cached = await this.getFromCache<InternationalMatch[]>(cacheKey);

    if (cached) return cached;

    try {
      const response = await axios.get<CricAPIResponse>(`${API_BASE_URL}/matches`, {
        params: {
          apikey: CRICAPI_KEY,
          offset: 0
        }
      });

      const matches = this.transformMatchesResponse(response.data.data, format);
      await this.setCache(cacheKey, matches, CACHE_TTL.MATCH);
      return matches;
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      return [];
    }
  }

  async getLiveMatches(format?: MatchFormat): Promise<InternationalMatch[]> {
    const cacheKey = `matches:live:${format || 'all'}`;
    // For live matches, use a very short TTL
    const cached = await this.getFromCache<InternationalMatch[]>(cacheKey);

    if (cached) return cached;

    try {
      const response = await axios.get<CricAPIResponse>(`${API_BASE_URL}/matches`, {
        params: {
          apikey: CRICAPI_KEY,
          offset: 0,
          matchStarted: true,
          matchEnded: false
        }
      });

      const matches = this.transformMatchesResponse(response.data.data, format);
      await this.setCache(cacheKey, matches, 60); // Cache for 1 minute only
      return matches;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }
  }

  async getTeamRankings(format: MatchFormat): Promise<Team[]> {
    const cacheKey = `rankings:${format}`;
    const cached = await this.getFromCache<Team[]>(cacheKey);

    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/team-rankings`, {
        params: {
          api_token: CRICAPI_KEY,
          filter: {
            type: format
          }
        }
      });

      const rankings = this.transformRankingsResponse(response.data.data);
      await this.setCache(cacheKey, rankings, CACHE_TTL.TEAM);
      return rankings;
    } catch (error) {
      console.error('Error fetching team rankings:', error);
      return [];
    }
  }

  async getPlayerStats(playerId: number): Promise<PlayerStats> {
    const cacheKey = `player:${playerId}:stats`;
    const cached = await this.getFromCache<PlayerStats>(cacheKey);

    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/players/${playerId}`, {
        params: {
          api_token: CRICAPI_KEY,
          include: 'career,stats,rankings'
        }
      });

      const stats = this.transformPlayerStatsResponse(response.data.data);
      await this.setCache(cacheKey, stats, CACHE_TTL.PLAYER);
      return stats;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw error;
    }
  }

  async getMatchesByDate(date: string, options?: {
    offset?: number;
    limit?: number;
    lang?: string;
  }): Promise<InternationalMatch[]> {
    const { offset = 0, limit = 50, lang = 'en' } = options || {};
    const cacheKey = `matches:date:${date}:${offset}:${limit}:${lang}`;
    const cached = await this.getFromCache<InternationalMatch[]>(cacheKey);

    if (cached) return cached;

    try {
      const response = await axios.get<SportDevsResponse>('https://cricket.sportdevs.com/matches-by-date', {
        params: {
          date: `eq.${date}`,
          offset: offset.toString(),
          limit: limit.toString(),
          lang
        },
        headers: {
          'Authorization': `Bearer ${SPORTDEVS_API_KEY}`
        }
      });

      if (!Array.isArray(response.data) || response.data.length === 0 || !response.data[0].matches) {
        console.error('Invalid response format:', response.data);
        return [];
      }

      // Get all matches for the requested date
      const dayMatches = response.data[0].matches;

      // Apply pagination on the matches array
      const paginatedMatches = dayMatches.slice(offset, offset + limit);

      const matches = this.transformSportDevsMatches(paginatedMatches);
      await this.setCache(cacheKey, matches, CACHE_TTL.MATCH);
      return matches;
    } catch (error) {
      console.error('Error fetching matches by date:', error);
      return [];
    }
  }

  private transformMatchesResponse(matches: CricAPIMatch[], format?: MatchFormat): InternationalMatch[] {
    if (!Array.isArray(matches)) {
      console.error('Invalid matches data:', matches);
      return [];
    }

    return matches
      .filter(match => !format || match.matchType?.toLowerCase() === format)
      .map(match => ({
        id: match.id,
        format: (match.matchType || 't20').toLowerCase() as MatchFormat,
        series: match.series_id,
        home: match.teams?.[0] || 'Unknown Team',
        away: match.teams?.[1] || 'Unknown Team',
        date: match.date,
        start: new Date(match.dateTimeGMT).toLocaleTimeString(),
        venue: match.venue,
        ground: match.venue,
        gameday_id: parseInt(match.id),
        matchStatus: this.getMatchStatus(match),
        teamInfo: match.teamInfo || [],
        score: match.score
      }));
  }

  private transformRankingsResponse(data: any[]): Team[] {
    return data.map(team => ({
      name: team.name,
      shortName: team.code,
      ranking: {
        test: team.rankings.test || 0,
        odi: team.rankings.odi || 0,
        t20i: team.rankings.t20i || 0,
        t20: 0,
        first_class: 0
      },
      recentForm: {
        lastFiveMatches: []  // To be populated with actual data
      },
      squad: [],  // To be populated with actual data
      homeVenue: []  // To be populated with actual data
    }));
  }

  private transformPlayerStatsResponse(data: any): PlayerStats {
    return {
      format: data.career.type,
      matches: data.career.matches,
      runs: data.batting.runs,
      highestScore: data.batting.highest_score,
      average: data.batting.average,
      strikeRate: data.batting.strike_rate,
      hundreds: data.batting.hundreds,
      fifties: data.batting.fifties,
      wickets: data.bowling.wickets,
      bowlingAverage: data.bowling.average,
      economy: data.bowling.economy,
      bestBowling: data.bowling.best_figures,
      catches: data.fielding.catches,
      stumpings: data.fielding.stumpings,
      ranking: {
        batting: data.rankings?.batting,
        bowling: data.rankings?.bowling,
        allRounder: data.rankings?.allrounder
      }
    };
  }

  private getMatchStatus(match: CricAPIMatch): InternationalMatch['matchStatus'] {
    if (!match?.matchStarted) return 'UPCOMING';
    if (match?.matchEnded) return 'COMPLETED';
    if (match?.status?.toLowerCase().includes('abandoned')) return 'ABANDONED';
    return 'LIVE';
  }

  private transformSportDevsMatches(matches: SportDevsMatch[]): InternationalMatch[] {
    return matches.map(match => ({
      id: match.id.toString(),
      format: this.getMatchFormat(match.tournament_name),
      series: match.tournament_name,
      home: match.home_team_name,
      away: match.away_team_name,
      date: new Date(match.start_time).toISOString().split('T')[0],
      start: new Date(match.start_time).toLocaleTimeString(),
      venue: '', // SportDevs API doesn't provide venue information
      ground: '', // SportDevs API doesn't provide ground information
      gameday_id: match.id,
      matchStatus: this.getSportDevsMatchStatus(match.status),
      teamInfo: [
        {
          name: match.home_team_name,
          shortname: match.home_team_name.split(' ')[0],
          img: `https://images.sportdevs.com/${match.home_team_hash_image}`
        },
        {
          name: match.away_team_name,
          shortname: match.away_team_name.split(' ')[0],
          img: `https://images.sportdevs.com/${match.away_team_hash_image}`
        }
      ],
      score: match.home_team_score !== undefined ? [
        {
          r: match.home_team_score,
          w: 0, // SportDevs API doesn't provide wickets information
          o: 0, // SportDevs API doesn't provide overs information
          inning: `${match.home_team_name} Inning`
        },
        {
          r: match.away_team_score || 0,
          w: 0,
          o: 0,
          inning: `${match.away_team_name} Inning`
        }
      ] : undefined
    }));
  }

  private getMatchFormat(tournamentName: string): MatchFormat {
    const name = tournamentName.toLowerCase();
    if (name.includes('test')) return 'test';
    if (name.includes('odi')) return 'odi';
    if (name.includes('t20i') || name.includes('twenty20')) return 't20i';
    return 't20';
  }

  private getSportDevsMatchStatus(status: string): InternationalMatch['matchStatus'] {
    const statusMap: Record<string, InternationalMatch['matchStatus']> = {
      'finished': 'COMPLETED',
      'live': 'LIVE',
      'not_started': 'UPCOMING',
      'abandoned': 'ABANDONED',
      'cancelled': 'ABANDONED'
    };
    return statusMap[status.toLowerCase()] || 'UPCOMING';
  }
}