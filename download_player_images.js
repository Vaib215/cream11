const fs = require("fs");
const path = require("path");
const https = require("https");
const url = require("url");

// Read the original JSON file
const teamsData = JSON.parse(
  fs.readFileSync("./data/ipl_2025_teams.json", "utf8")
);

// Create players directory if it doesn't exist
const playersDir = "./public/players";
if (!fs.existsSync(playersDir)) {
  fs.mkdirSync(playersDir, { recursive: true });
}

// Add delay function for rate limiting
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Track failed downloads for retry
const failedDownloads = [];

// Function to download an image with retry logic
async function downloadImage(imageUrl, imagePath, retryCount = 0) {
  return new Promise(async (resolve, reject) => {
    // Skip if already downloaded
    if (fs.existsSync(imagePath)) {
      console.log(`File already exists: ${imagePath}`);
      return resolve();
    }

    // Skip if URL is already a local path
    if (imageUrl.startsWith("/players/")) {
      console.log(`Already a local path: ${imageUrl}`);
      return resolve();
    }

    // Add a delay to prevent rate limiting (increase for larger values if needed)
    await delay(500);

    const file = fs.createWriteStream(imagePath);

    https
      .get(imageUrl, (response) => {
        if (response.statusCode === 429) {
          // Too many requests - retry after a longer delay
          fs.unlink(imagePath, () => {});
          file.close();

          if (retryCount < 3) {
            console.log(
              `Rate limited (429) for ${imageUrl}, retrying after delay...`
            );
            setTimeout(() => {
              downloadImage(imageUrl, imagePath, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, 5000 * (retryCount + 1)); // Exponential backoff
          } else {
            console.error(`Failed to download after retries: ${imageUrl}`);
            failedDownloads.push({ url: imageUrl, path: imagePath });
            resolve(); // Continue with other downloads
          }
          return;
        }

        if (response.statusCode !== 200) {
          fs.unlink(imagePath, () => {});
          file.close();
          console.error(
            `Failed to download ${imageUrl}: ${response.statusCode}`
          );

          if (retryCount < 3) {
            setTimeout(() => {
              downloadImage(imageUrl, imagePath, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, 3000 * (retryCount + 1));
          } else {
            failedDownloads.push({ url: imageUrl, path: imagePath });
            resolve(); // Continue with other downloads
          }
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log(`Downloaded: ${imagePath}`);
          resolve();
        });

        file.on("error", (err) => {
          fs.unlink(imagePath, () => {});
          reject(err);
        });
      })
      .on("error", (err) => {
        fs.unlink(imagePath, () => {});

        if (retryCount < 3) {
          setTimeout(() => {
            downloadImage(imageUrl, imagePath, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, 3000 * (retryCount + 1));
        } else {
          console.error(`Network error for ${imageUrl}:`, err.message);
          failedDownloads.push({ url: imageUrl, path: imagePath });
          resolve(); // Continue with other downloads
        }
      });
  });
}

// Process images in small batches to avoid overwhelming the server
async function processTeams() {
  const updatedTeams = { ...teamsData };
  let allPlayers = [];

  // Collect all players first
  for (const teamName in updatedTeams) {
    const team = updatedTeams[teamName];

    team.players.forEach((player) => {
      allPlayers.push({
        teamName,
        player,
        index: team.players.indexOf(player),
      });
    });
  }

  console.log(`Processing ${allPlayers.length} player images...`);

  // Process in batches of 5
  const batchSize = 5;
  for (let i = 0; i < allPlayers.length; i += batchSize) {
    const batch = allPlayers.slice(i, i + batchSize);
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        allPlayers.length / batchSize
      )}`
    );

    await Promise.all(
      batch.map(async ({ teamName, player, index }) => {
        const playerName = player.name;

        // Create a filename from player name: convert to lowercase and replace spaces with underscores
        const fileName = `${playerName.toLowerCase().replace(/\s+/g, "_")}.png`;
        const localPath = path.join(playersDir, fileName);
        const localUrl = `/players/${fileName}`;

        try {
          await downloadImage(player.imageUrl, localPath);

          // Update the image URL in the JSON
          updatedTeams[teamName].players[index].imageUrl = localUrl;
          console.log(
            `Updated player: ${playerName} with local URL: ${localUrl}`
          );
        } catch (error) {
          console.error(`Error processing ${playerName}:`, error.message);
        }
      })
    );

    // Add a pause between batches
    if (i + batchSize < allPlayers.length) {
      console.log("Pausing between batches to avoid rate limiting...");
      await delay(2000);
    }
  }

  // Report on failed downloads
  if (failedDownloads.length > 0) {
    console.log(
      `Failed to download ${failedDownloads.length} images. See failed_downloads.json for details.`
    );
    fs.writeFileSync(
      "./failed_downloads.json",
      JSON.stringify(failedDownloads, null, 2),
      "utf8"
    );
  }

  // Write the updated JSON back to the file
  fs.writeFileSync(
    "./data/ipl_2025_teams_updated.json",
    JSON.stringify(updatedTeams, null, 2),
    "utf8"
  );
  console.log("Updated JSON file saved as ipl_2025_teams_updated.json");
}

// Run the processing
processTeams().catch(console.error);
