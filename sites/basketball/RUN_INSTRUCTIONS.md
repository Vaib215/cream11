# Basketball Fantasy AI - Standalone App

This is a standalone Vite + React application for NBA fantasy lineup generation using Ollama AI.

## Prerequisites

1. **Ollama must be running**: Make sure Ollama is installed and running on your system

   ```bash
   ollama serve
   ```

2. **Model must be downloaded**: Download the required model (default: llama3.1:8b)
   ```bash
   ollama pull llama3.1:8b
   ```

## Running the App

1. **Install dependencies** (from this directory):

   ```bash
   npm install
   # or
   bun install
   ```

2. **Start the development server**:

   ```bash
   npm run dev
   # or
   bun run dev
   ```

3. **Open in browser**: The app will typically run on `http://localhost:5173`

## Environment Variables

You can customize the Ollama configuration by setting these environment variables:

- `OLLAMA_HOST`: Ollama server URL (default: `http://localhost:11434`)
- `OLLAMA_MODEL`: Model to use (default: `llama3.1:8b`)

## Features

- View upcoming NBA games
- Generate AI-powered fantasy lineups
- Analyze player selections with detailed reasoning
- Salary cap management ($50,000 limit)
- Position-based team composition
