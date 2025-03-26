# Player Images Guide

## Image Naming Convention

All player images follow this naming convention:

- Located in `/public/players/` directory
- Filename pattern: `player_name_in_lowercase.webp` (spaces replaced with underscores)

## How to Use in Code

With the updated JSON structure, the team data includes players as a simple array of strings. To display a player image:

```jsx
// Example in a React component
const PlayerCard = ({ playerName }) => {
  // Convert player name to image filename
  const imageUrl = `/players/${playerName
    .toLowerCase()
    .replace(/\s+/g, "_")}.webp`;

  return (
    <div className="player-card">
      <img src={imageUrl} alt={playerName} />
      <h3>{playerName}</h3>
    </div>
  );
};
```

## Example

For a player named "MS Dhoni", the image path would be:

```
/players/ms_dhoni.webp
```

## Benefits

- Consistent naming pattern for all player images
- No need to maintain image URLs in the JSON data
- Easy to predict image paths based on player names
- Reduced JSON file size
