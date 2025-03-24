import matchesSchedule from "@/data/ipl_2025_schedule.json";
import { getPlaying11OfTeams } from "@/lib/gemini";
import dayjs from "dayjs";

export default async function Home() {
  const matchesToday = matchesSchedule.matches.filter((match) =>
    dayjs(match.date).isSame(dayjs(), "day")
  );

  const players = await Promise.all(
    matchesToday.map(async (match) => {
      const players = await getPlaying11OfTeams(match);
      return players;
    })
  );

  console.log(players);

  return (
    <div>
      <div>
        {matchesToday.map((match) => (
          <div key={match.date}>
            {match.home} vs {match.away}
          </div>
        ))}
      </div>
    </div>
  );
}
