const fantasyCricketRules = `
      Batting Points:
      - Run: +1 pt
      - Boundary Bonus: +4 pts
      - Six Bonus: +6 pts
      - 25 Run Bonus: +4 pts
      - 50 Run Bonus: +8 pts
      - 75 Run Bonus: +12 pts
      - 100 Run Bonus: +16 pts
      - Dismissal for a duck: -2 pts
      
      Strike Rate Points (Min 10 Balls To Be Played):
      - Above 170 runs per 100 balls: +6 pts
      - Between 150.01 - 170 runs per 100 balls: +4 pts
      - Between 130 - 150 runs per 100 balls: +2 pts
      - Between 60 - 70 runs per 100 balls: -2 pts
      - Between 50 - 59.99 runs per 100 balls: -4 pts
      - Below 50 runs per 100 balls: -6 pts
      
      Bowling Points:
      - Dot Ball: +1 pt
      - Wicket (Excluding Run Out): +25 pts
      - Bonus (LBW/Bowled): +8 pts
      - 3 Wicket Bonus: +4 pts
      - 4 Wicket Bonus: +8 pts
      - 5 Wicket Bonus: +12 pts
      - Maiden Over: +12 pts
      
      Economy Rate Points (Min 2 Overs To Be Bowled):
      - Below 5 runs per over: +6 pts
      - Between 5 - 5.99 runs per over: +4 pts
      - Between 6 - 7 runs per over: +2 pts
      - Between 10 - 11 runs per over: -2 pts
      - Between 11.01 - 12 runs per over: -4 pts
      - Above 12 runs per over: -6 pts
      
      Fielding Points:
      - Catch: +8 pts
      - 3 Catch Bonus: +4 pts
      - Stumping: +12 pts
      - Run Out (Direct Hit): +12 pts
      - Run Out (Not a Direct Hit): +6 pts
      
      Additional Points:
      - Captain Points: 2x
      - Vice-Captain Points: 1.5x
      - In Announced Lineups: +4 pts
      - Playing Substitute: +4 pts
`;

export { fantasyCricketRules }