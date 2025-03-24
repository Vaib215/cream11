const fs = require("fs");
const path = require("path");

// Define input and output file paths
const inputFilePath = path.join(__dirname, "data", "IPL 2024 Player Data.csv");
const outputFilePath = path.join(
  __dirname,
  "data",
  "ipl_2024_player_data.json"
);

// Function to parse CSV and convert to JSON organized by player name
function convertCsvToJson(csvFilePath) {
  // Read the CSV file
  const csvData = fs.readFileSync(csvFilePath, "utf8");

  // Split the CSV into rows
  const rows = csvData.trim().split("\n");

  // Extract headers (first row)
  const headers = rows[0]
    .split(",")
    .map((header) => header.trim().replace(/\r$/, ""));

  // Process data rows and organize by player name
  const playerData = {};

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].split(",");

    // Skip rows with insufficient data
    if (row.length < headers.length) continue;

    const playerName = row[1].trim();
    const year = row[0].trim();

    // Create player entry if it doesn't exist
    if (!playerData[playerName]) {
      playerData[playerName] = [];
    }

    // Create object for this year's data
    const yearData = {
      year: year,
    };

    // Add all other fields
    for (let j = 2; j < headers.length; j++) {
      const value = row[j].trim().replace(/\r$/, "");

      // Convert numeric values to numbers
      if (value !== "" && !isNaN(value)) {
        yearData[headers[j]] = Number(value);
      } else {
        yearData[headers[j]] = value;
      }
    }

    // Add this year's data to the player's array
    playerData[playerName].push(yearData);
  }

  return playerData;
}

// Execute the conversion
try {
  console.log(`Reading CSV file: ${inputFilePath}`);
  const playerData = convertCsvToJson(inputFilePath);

  // Count total number of players
  const playerCount = Object.keys(playerData).length;

  // Count total number of player-year records
  let totalRecords = 0;
  Object.values(playerData).forEach((yearArray) => {
    totalRecords += yearArray.length;
  });

  // Write to JSON file
  fs.writeFileSync(outputFilePath, JSON.stringify(playerData, null, 2), "utf8");
  console.log(`Conversion completed successfully!`);
  console.log(`JSON file saved at: ${outputFilePath}`);
  console.log(`Total players: ${playerCount}`);
  console.log(`Total player-year records: ${totalRecords}`);
} catch (error) {
  console.error("Error during conversion:", error);
}
