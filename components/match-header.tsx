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
      <div className="relative z-10 p-8 text-white">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex-1 flex justify-center items-center md:justify-start">
            {match.teams[teamNames[0]].logo && (
              <div className="relative h-18 w-18 p-1.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                <Image
                  src={match.teams[teamNames[0]].logo as string}
                  alt={`${teamNames[0]} logo`}
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
            )}
            <div className="hidden md:block ml-3">
              <h4 className="font-bold text-3xl">{teamNames[0]}</h4>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="relative mx-auto px-4 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mb-3">
              <span className="font-bold text-3xl">VS</span>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"></div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center text-indigo-100 justify-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">{match.venue}</span>
              </div>
              <div className="flex items-center text-indigo-100 justify-center">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  {dayjs(match.date).format("MMM D, YYYY")} at {match.startTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center md:justify-end">
            <div className="hidden md:block mr-3 text-right">
              <h4 className="font-bold text-3xl">{teamNames[1]}</h4>
            </div>
            {match.teams[teamNames[1]].logo && (
              <div className="relative h-18 w-18 p-1.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                <Image
                  src={match.teams[teamNames[1]].logo as string}
                  alt={`${teamNames[1]} logo`}
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600"></div>
    </div>
  );
}
