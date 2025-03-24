const fs = require("fs");

// Read the updated JSON file
const updatedData = JSON.parse(
  fs.readFileSync("./data/ipl_2025_teams_updated.json", "utf8")
);

// Write the updated JSON back to the original file
fs.writeFileSync(
  "./data/ipl_2025_teams.json",
  JSON.stringify(updatedData, null, 2),
  "utf8"
);
console.log("Original JSON file updated successfully");
