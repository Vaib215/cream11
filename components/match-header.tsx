"use client";

import { Clock, MapPin } from "lucide-react";
import Image from "next/image";
import dayjs from "dayjs";

interface MatchHeaderProps {
  teamNames: string[];
  match: {
    teams: Record<
      string,
      {
        logo?: string;
        color: string;
      }
    >;
    venue: string;
    date: string;
    startTime: string;
  };
}

export function MatchHeader({ teamNames, match }: MatchHeaderProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 opacity-90"></div>
      <div className="relative z-10 p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4">
            {match.teams[teamNames[0]].logo && (
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 p-1.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                <Image
                  src={match.teams[teamNames[0]].logo as string}
                  alt={`${teamNames[0]} logo`}
                  width={72}
                  height={72}
                  className="object-contain"
                />
              </div>
            )}
            <div className="text-center sm:text-left mt-2 sm:mt-0">
              <h4 className="font-bold text-2xl sm:text-3xl">{teamNames[0]}</h4>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative px-6 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mb-3">
              <span className="font-bold text-2xl sm:text-3xl tracking-wider">
                VS
              </span>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-center">
              <div className="flex items-center text-indigo-100 justify-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">{match.venue}</span>
              </div>
              <div className="hidden sm:block text-white/50">•</div>
              <div className="flex items-center text-indigo-100 justify-center">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  {dayjs(match.date).format("MMM D")} • {match.startTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row-reverse items-center justify-center sm:justify-start gap-2 sm:gap-4">
            {match.teams[teamNames[1]].logo && (
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 p-1.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                <Image
                  src={match.teams[teamNames[1]].logo as string}
                  alt={`${teamNames[1]} logo`}
                  width={72}
                  height={72}
                  className="object-contain"
                />
              </div>
            )}
            <div className="text-center sm:text-right mt-2 sm:mt-0">
              <h4 className="font-bold text-2xl sm:text-3xl">{teamNames[1]}</h4>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600"></div>
    </div>
  );
}
