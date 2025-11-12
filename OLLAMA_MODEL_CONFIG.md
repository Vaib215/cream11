# Ollama Model Configuration

## Default Model

Both basketball and football apps now use **`gemma2:2b`** as the default model.

## How to Change the Model

### Option 1: Edit the `.env` file (Recommended)

Each site has its own `.env` file:

**Basketball**: `sites/basketball/.env`

```env
VITE_OLLAMA_HOST=http://localhost:11434
VITE_OLLAMA_MODEL=gemma2:2b
```

**Football**: `sites/football/.env`

```env
VITE_OLLAMA_HOST=http://localhost:11434
VITE_OLLAMA_MODEL=gemma2:2b
```

Change `VITE_OLLAMA_MODEL` to any model you have installed:

- `gemma2:2b` (default, fast and small)
- `llama3.1:8b` (larger, more capable)
- `qwen2.5:3b` (good balance)
- Any other Ollama model

### Option 2: Edit the service file directly

If you don't want to use `.env` files, you can change the default in the code:

**Basketball**: `sites/basketball/services/geminiService.ts`

```typescript
const MODEL = import.meta.env.VITE_OLLAMA_MODEL || "your-model-here";
```

**Football**: `sites/football/services/geminiService.ts`

```typescript
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || "your-model-here";
```

## Important Notes

1. **Restart the dev server** after changing `.env` files:

   ```bash
   # Stop the server (Ctrl+C)
   # Then start again
   bun run dev
   ```

2. **Make sure the model is downloaded**:

   ```bash
   ollama pull gemma2:2b
   # or whatever model you want to use
   ```

3. **Check available models**:

   ```bash
   ollama list
   ```

4. **Vite environment variables** must be prefixed with `VITE_` to be exposed to the browser

## Troubleshooting

### "Model not found" error

- Make sure you've downloaded the model: `ollama pull gemma2:2b`
- Check the model name matches exactly (case-sensitive)
- Verify with: `ollama list`

### Changes not taking effect

- Restart the dev server (Ctrl+C, then `bun run dev`)
- Clear browser cache
- Check the browser console for the actual model being used

### Want to use different models for basketball vs football?

Just edit the respective `.env` files:

- `sites/basketball/.env` → `VITE_OLLAMA_MODEL=llama3.1:8b`
- `sites/football/.env` → `VITE_OLLAMA_MODEL=gemma2:2b`
