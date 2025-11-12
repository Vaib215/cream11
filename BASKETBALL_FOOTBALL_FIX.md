# Basketball & Football Apps - Fix Summary

## Problem

The basketball and football fantasy apps were not rendering because:

1. Changes were being made to the wrong location (`app/basketball` and `app/football`)
2. The actual apps are standalone Vite applications in `sites/basketball` and `sites/football`
3. The apps needed to be migrated from Gemini to Ollama

## Solution Applied

### 1. Updated Standalone Apps to Use Ollama

#### Basketball (`sites/basketball/`)

- ✅ Updated `services/geminiService.ts` to use Ollama
- ✅ Fixed import statement: `import { Ollama } from "ollama"`
- ✅ Updated `package.json` to use `ollama` instead of `@google/genai`
- ✅ Updated `vite.config.ts` to use Ollama environment variables

#### Football (`sites/football/`)

- ✅ Already updated `services/geminiService.ts` to use Ollama
- ✅ Updated `package.json` to use `ollama` instead of `@google/genai`
- ✅ Updated `vite.config.ts` to use Ollama environment variables

### 2. Created Documentation

- ✅ `STANDALONE_APPS_GUIDE.md` - Comprehensive guide for running standalone apps
- ✅ `sites/basketball/RUN_INSTRUCTIONS.md` - Basketball-specific instructions
- ✅ `sites/football/RUN_INSTRUCTIONS.md` - Football-specific instructions

### 3. Added Convenience Scripts

Updated root `package.json` with:

```json
"dev:basketball": "cd sites/basketball && bun run dev",
"dev:football": "cd sites/football && bun run dev",
"dev:cricket": "cd sites/cricket && bun run dev"
```

## How to Run the Apps

### Quick Start

1. **Start Ollama**:

   ```bash
   ollama serve
   ```

2. **Download the model** (if not already done):

   ```bash
   ollama pull llama3.1:8b
   ```

3. **Run Basketball App**:

   ```bash
   # From project root
   bun run dev:basketball

   # Or from the app directory
   cd sites/basketball
   bun install
   bun run dev
   ```

4. **Run Football App**:

   ```bash
   # From project root
   bun run dev:football

   # Or from the app directory
   cd sites/football
   bun install
   bun run dev
   ```

5. **Open in browser**: `http://localhost:5173`

## Key Points

### What's in `app/` directory?

- Next.js routes for the main landing page
- `app/basketball/page.tsx` - Waitlist page (not the actual app)
- `app/football/matches/page.tsx` - Preview page (not the actual app)
- These are part of the main Next.js application

### What's in `sites/` directory?

- **Standalone Vite + React applications**
- `sites/basketball/` - Full NBA fantasy lineup generator
- `sites/football/` - Full Premier League FPL team generator
- `sites/cricket/` - Full cricket fantasy app
- Each runs independently with its own dev server

## Environment Variables

The apps use these environment variables (with defaults):

- `OLLAMA_HOST` - Default: `http://localhost:11434`
- `OLLAMA_MODEL` - Default: `llama3.1:8b`

You can create a `.env` file in each site directory to customize these.

## Troubleshooting

### "Nothing renders in the browser"

- Make sure you're running the standalone app from `sites/` directory
- Check that Ollama is running: `ollama serve`
- Verify the dev server started on port 5173

### "Ollama connection error"

- Ensure Ollama is running: `ollama serve`
- Check the model is downloaded: `ollama list`
- Try: `ollama pull llama3.1:8b`

### "Port already in use"

- Only one Vite app can run on port 5173 at a time
- Stop other dev servers or change the port in vite.config.ts

## Next Steps

1. Install dependencies in each site:

   ```bash
   cd sites/basketball && bun install
   cd sites/football && bun install
   ```

2. Start Ollama and download the model

3. Run the apps using the convenience scripts or directly from their directories

4. Test the AI functionality by generating lineups/teams
