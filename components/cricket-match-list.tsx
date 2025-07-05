'use client';
import { useEffect, useState } from 'react';
import { InternationalMatch, MatchFormat } from '@/types/cricket';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import Image from 'next/image';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface CricketMatchListProps {
  initialMatches?: InternationalMatch[];
  defaultFormat?: MatchFormat;
}

export function CricketMatchList({ initialMatches = [], defaultFormat = 't20' }: CricketMatchListProps) {
  const [matches, setMatches] = useState<InternationalMatch[]>(initialMatches);
  const [selectedFormat, setSelectedFormat] = useState<MatchFormat>(defaultFormat);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewType, setViewType] = useState<'upcoming' | 'live' | 'date'>('upcoming');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    fetchMatches(0);
  }, [selectedFormat, viewType, selectedDate]);

  const fetchMatches = async (currentOffset: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: viewType,
        offset: currentOffset.toString(),
        limit: LIMIT.toString()
      });

      if (viewType !== 'date') {
        params.append('format', selectedFormat);
      }
      if (viewType === 'date') {
        params.append('date', selectedDate);
      }

      const response = await fetch(`/api/cricket?${params.toString()}`);
      const data = await response.json();

      if (currentOffset === 0) {
        setMatches(data.data);
      } else {
        setMatches(prev => [...prev, ...data.data]);
      }

      if (viewType === 'date') {
        setHasMore(data.data.length >= LIMIT);
      } else {
        setHasMore(data.data.length === LIMIT);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    fetchMatches(newOffset);
  };

  const formatOptions: { value: MatchFormat; label: string }[] = [
    { value: 't20', label: 'T20' },
    { value: 't20i', label: 'T20I' },
    { value: 'odi', label: 'ODI' },
    { value: 'test', label: 'Test' }
  ];

  const viewOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'live', label: 'Live' },
    { value: 'date', label: 'By Date' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <Tabs defaultValue="upcoming" onValueChange={(value) => setViewType(value as typeof viewType)} className="flex-1">
          <TabsList>
            {viewOptions.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {viewType === 'date' ? (
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-auto"
          />
        ) : (
          <Tabs defaultValue={defaultFormat} onValueChange={(value) => setSelectedFormat(value as MatchFormat)}>
            <TabsList>
              {formatOptions.map((format) => (
                <TabsTrigger key={format.value} value={format.value}>
                  {format.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>

      {loading && offset === 0 ? (
        <Progress value={100} className="w-full" />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <Card key={match.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {match.teamInfo.map((team) => (
                      <div key={team.shortname} className="flex items-center">
                        <Image
                          src={team.img}
                          alt={team.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span className="ml-2 font-medium">{team.shortname}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{match.date}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">{match.venue || match.ground}</p>
                  {match.score?.map((inning) => (
                    <p key={inning.inning} className="text-sm font-medium">
                      {inning.inning}: {inning.r}/{inning.w} ({inning.o} ov)
                    </p>
                  ))}
                  <p className="text-sm font-semibold text-blue-600">{match.matchStatus}</p>
                </div>
              </Card>
            ))}
          </div>

          {hasMore && !loading && (
            <div className="flex justify-center mt-4">
              <Button onClick={loadMore} variant="outline">
                Load More
              </Button>
            </div>
          )}

          {loading && offset > 0 && (
            <div className="flex justify-center mt-4">
              <Progress value={100} className="w-32" />
            </div>
          )}
        </>
      )}
    </div>
  );
} 