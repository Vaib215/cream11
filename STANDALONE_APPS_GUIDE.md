# Standalone Sports Fantasy Apps Guide

This project contains **standalone Vite + React applications** for different sports fantasy platforms, all powered by Ollama AI.

## Project Structure

```
cream11/
├── app/                    # Next.js app (main landing page)
│   ├── basketball/        # Basketball waitlist page (Next.js route)
│   ├── football/          # Football matches page (Next.js route)
│   └── cricket/           # Cricket pages (Next.js route)
├── sites/                 # Standalone Vite apps (run independently)
│   ├── basketball/        # NBA Fantasy Lineup Generator
│   ├── football/          # Premier League FPL Team Generator
│   └── cricket/           # Cricket Fantasy App
└── ...
```

## Important: Two Different Systems

### 1. Next.js App (`app/` directory)

- Main landing page and routing
- Basketball and football pages here are **waitlist/preview pages**
- Not the actual fantasy apps

### 2. Standalone Vite Apps (`sites/` directory)

- **These are the actual working fantasy apps**
- Each runs independently with its own dev server
- Use Ollama for AI-powered predictions

## Running the Standalone Apps

### Basketball Fantasy App

```bash
cd sites/basketball
bun install
bun run dev
```

Open: `http://localhost:5173`

### Football Fantasy App

```bash
cd sites/football
bun install
bun run dev
```

Open: `http://localhost:5173`

### Cricket Fantasy App

```bash
cd sites/cricket
bun install
bun run dev
```

Open: `http://localhost:5173`

## Prerequisites for All Apps

1. **Ollama must be running**:

   ```bash
   ollama serve
   ```

2. **Download the model**:
   ```bash
   ollama pull llama3.1:8b
   ```

## Environment Variables

Create a `.env` file in each site directory (optional):

```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

## Features by Sport

### Basketball (NBA)

- View upcoming NBA games
- Generate fantasy lineups with salary cap ($50,000)
- AI-powered player analysis
- Position-based team composition

### Football (Premier League)

- View upcoming EPL matches
- Generate FPL teams with formations
- Match-specific team optimization
- Player reasoning and analysis

### Cricket

- View upcoming cricket matches
- Generate fantasy teams
- Player performance predictions
- Match-specific strategies

## Troubleshooting

### "Nothing is rendering"

- Make sure you're running the **standalone app** from `sites/` directory
- Don't expect the Next.js routes in `app/basketball` or `app/football` to show the fantasy apps
- Those are just waitlist/preview pages

### "Ollama connection error"

- Ensure Ollama is running: `ollama serve`
- Check the model is downloaded: `ollama list`
- Verify the host URL: `http://localhost:11434`

### "Model not found"

- Download the model: `ollama pull llama3.1:8b`
- Or use a different model you have installed

## Development Workflow

1. Start Ollama: `ollama serve`
2. Navigate to the sport app: `cd sites/basketball`
3. Install dependencies: `bun install`
4. Run dev server: `bun run dev`
5. Open browser: `http://localhost:5173`

## Building for Production

```bash
cd sites/basketball  # or football, cricket
bun run build
bun run preview
```

The built files will be in the `dist/` directory.
