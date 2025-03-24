const fs = require("fs");

// Read the JSON file
const teamsData = JSON.parse(
  fs.readFileSync("./data/ipl_2025_teams.json", "utf8")
);

// Create updated version
const updatedTeams = { ...teamsData };

// Process each team
for (const teamName in updatedTeams) {
  const team = updatedTeams[teamName];

  // Process each player - convert from array of objects to array of strings
  team.players = team.players.map((player) => player.name);
}

// Write the updated JSON back to a new file
fs.writeFileSync(
  "./data/ipl_2025_teams_updated.json",
  JSON.stringify(updatedTeams, null, 2),
  "utf8"
);
console.log("Updated JSON file saved as ipl_2025_teams_updated.json");
