# Project Structure Explained

## Visual Overview

```
cream11/
│
├── 🌐 Next.js App (Main Website)
│   └── app/
│       ├── page.tsx                    # Landing page
│       ├── basketball/
│       │   └── page.tsx                # ⚠️ Waitlist page (NOT the app)
│       ├── football/
│       │   └── matches/page.tsx        # ⚠️ Preview page (NOT the app)
│       └── cricket/
│           └── [id]/page.tsx           # Cricket pages
│
└── 🎮 Standalone Fantasy Apps (The Real Apps)
    └── sites/
        ├── basketball/                 # ✅ NBA Fantasy App
        │   ├── App.tsx                 # Main app component
        │   ├── index.tsx               # Entry point
        │   ├── index.html              # HTML template
        │   ├── vite.config.ts          # Vite configuration
        │   ├── package.json            # Dependencies
        │   ├── components/             # React components
        │   │   ├── HomePage.tsx        # Games list
        │   │   ├── GamePage.tsx        # Lineup generator
        │   │   └── ...
        │   └── services/
        │       └── geminiService.ts    # Ollama AI service
        │
        ├── football/                   # ✅ Premier League FPL App
        │   ├── App.tsx                 # Main app component
        │   ├── index.tsx               # Entry point
        │   ├── index.html              # HTML template
        │   ├── vite.config.ts          # Vite configuration
        │   ├── package.json            # Dependencies
        │   ├── components/             # React components
        │   │   ├── FixturesList.tsx    # Matches list
        │   │   ├── TeamDisplay.tsx     # Team generator
        │   │   └── ...
        │   └── services/
        │       └── geminiService.ts    # Ollama AI service
        │
        └── cricket/                    # ✅ Cricket Fantasy App
            └── ...
```

## Two Separate Systems

### System 1: Next.js App (Port 3000)

**Location**: `app/` directory  
**Purpose**: Main website with landing page and routing  
**Run with**: `bun run dev`  
**URL**: `http://localhost:3000`

**What it contains**:

- Landing page with sport selection
- Waitlist pages for basketball
- Preview pages for football
- Cricket integration pages

**Important**: The basketball and football pages here are **NOT** the actual fantasy apps!

---

### System 2: Standalone Vite Apps (Port 5173)

**Location**: `sites/` directory  
**Purpose**: Full-featured fantasy sports applications  
**Run with**: `cd sites/basketball && bun run dev`  
**URL**: `http://localhost:5173`

**What it contains**:

- Complete fantasy lineup/team generators
- AI-powered predictions using Ollama
- Real-time game/match data
- Player analysis and reasoning

**Important**: These are the **ACTUAL** working fantasy apps!

## Why Two Systems?

1. **Next.js App** (`app/`):

   - Serves as the main website
   - Handles routing and navigation
   - Shows waitlist/preview pages
   - Could eventually embed or link to the standalone apps

2. **Standalone Apps** (`sites/`):
   - Independent, fully-functional applications
   - Can be deployed separately
   - Easier to develop and test in isolation
   - Use Vite for faster development

## Running the Apps

### To run the Next.js website:

```bash
bun run dev
# Opens on http://localhost:3000
```

### To run the Basketball fantasy app:

```bash
bun run dev:basketball
# Opens on http://localhost:5173
```

### To run the Football fantasy app:

```bash
bun run dev:football
# Opens on http://localhost:5173
```

## Common Confusion

❌ **Wrong**: Expecting `http://localhost:3000/basketball` to show the fantasy app  
✅ **Right**: Run `bun run dev:basketball` and go to `http://localhost:5173`

❌ **Wrong**: Making changes in `app/basketball/` to fix the fantasy app  
✅ **Right**: Make changes in `sites/basketball/` for the fantasy app

❌ **Wrong**: Thinking the Next.js routes are broken  
✅ **Right**: The Next.js routes work fine - they just show waitlist pages

## Development Workflow

### Working on the main website:

```bash
bun run dev
# Edit files in app/, components/, lib/
```

### Working on basketball fantasy:

```bash
cd sites/basketball
bun install
bun run dev
# Edit files in sites/basketball/
```

### Working on football fantasy:

```bash
cd sites/football
bun install
bun run dev
# Edit files in sites/football/
```

## Key Takeaway

The `app/` directory and `sites/` directory are **completely separate systems**:

- `app/` = Next.js website (main landing page)
- `sites/` = Standalone fantasy apps (the actual games)

When you want to work on the fantasy apps, always go to `sites/`!
