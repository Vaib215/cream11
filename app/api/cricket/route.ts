import { NextRequest, NextResponse } from 'next/server';
import { CricketService } from '@/lib/cricket';
import { MatchFormat } from '@/types/cricket';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') as 'upcoming' | 'live' | 'date';
  const format = searchParams.get('format') as MatchFormat;
  const date = searchParams.get('date');
  const offset = searchParams.get('offset');
  const limit = searchParams.get('limit');
  const lang = searchParams.get('lang');

  const cricketService = CricketService.getInstance();

  try {
    let data;
    switch (type) {
      case 'upcoming':
        data = await cricketService.getUpcomingMatches(format);
        break;
      case 'live':
        data = await cricketService.getLiveMatches(format);
        break;
      case 'date':
        if (!date) {
          return NextResponse.json({ error: 'Date parameter is required for type=date' }, { status: 400 });
        }
        data = await cricketService.getMatchesByDate(date, {
          offset: offset ? parseInt(offset) : undefined,
          limit: limit ? parseInt(limit) : undefined,
          lang: lang || undefined
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching cricket data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    const cricketService = CricketService.getInstance();
    const playerStats = await cricketService.getPlayerStats(playerId);

    return NextResponse.json(playerStats);
  } catch (error) {
    console.error('Cricket API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player stats' },
      { status: 500 }
    );
  }
} 