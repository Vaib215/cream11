import { Match } from "@/types/match";
import axios from "axios";

interface My11CirclePlayer {
  id: number;
  name: string;
  short_name: string;
  team_id: number;
  team_name: string;
  team_short_name: string;
  skill_name: string;
  skill_id: number;
  is_fp: string;
  is_injured: string;
  price: number;
  is_active: number;
  sel_per: number;
  cap_sel_per: number;
  vcap_sel_per: number;
  ov_pts: number;
  gd_pts: number;
  is_announced: string;
  player_desc: string;
  profile_url: string;
  gamedayId: number;
  playing_order: number;
  is_dreamteam: number;
}

interface My11CircleResponse {
  Data: {
    Value: {
      players: My11CirclePlayer[];
      FeedTime: {
        UTCTime: string;
        ISTTime: string;
        CESTTime: string;
      };
    };
  };
  Meta: {
    Message: string;
    RetVal: number;
    Success: boolean;
    Timestamp: {
      UTCTime: string;
      ISTTime: string;
      CESTTime: string;
    };
  };
}

export const getPlayersCredits = async (match: Match) => {
  const URL = `https://fantasy.iplt20.com/daily/api/feed/gamedayplayers?lang=en&gamedayId=${match.gameday_id}&announcedVersion=03262025183322`;

  const { data } = await axios.get<My11CircleResponse>(URL);

  return data.Data.Value.players.map((player) => ({
    name: player.name,
    credits: player.price,
  }));
};
