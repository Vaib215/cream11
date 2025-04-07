import { NextApiRequest, NextApiResponse } from 'next';
import { revalidateTag } from 'next/cache';
import { getCream11 } from '@/lib/gemini';
import { Match } from '@/types/match';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Revalidate the cache
      revalidateTag('cream11-cache');

      // Force a new team generation by calling with dummy match
      const dummyMatch: Match = {
        home: "Mumbai Indians",
        away: "Chennai Super Kings",
        date: new Date().toISOString().split('T')[0],
        start: "15:00",
        venue: "Wankhede Stadium",
        gameday_id: 1
      };

      // This will create fresh data and update cache
      await getCream11(dummyMatch);

      return res.json({
        success: true,
        message: 'Cache reset successfully. New teams generated.'
      });
    } catch (err) {
      console.error('Cache reset error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to reset cache'
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 