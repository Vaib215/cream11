# Design Document

## Overview

This design document outlines the architecture and implementation strategy for migrating the Cream11 fantasy sports application from Google's GenAI (Gemini) to Ollama with locally running models. The migration will maintain all existing functionality while replacing the cloud-based AI service with a local alternative.

### Key Design Principles

1. **Minimal Disruption**: Maintain existing interfaces and response formats to avoid breaking changes
2. **Abstraction**: Create a unified AI service layer that can be easily swapped in the future
3. **Error Resilience**: Implement robust error handling for local model availability and performance
4. **Performance**: Optimize for local model inference while maintaining acceptable response times
5. **Compatibility**: Ensure all existing features work identically with Ollama

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (Next.js Pages, React Components, API Routes)              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI Service Abstraction                      │
│              (lib/ai-service.ts - NEW)                       │
│  - Unified interface for AI operations                       │
│  - Connection management                                     │
│  - Error handling & retries                                  │
│  - Response formatting                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Ollama Client                             │
│              (ollama JavaScript library)                     │
│  - Chat completions                                          │
│  - Streaming support                                         │
│  - JSON mode                                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Local Ollama Server                         │
│              (localhost:11434)                               │
│  - Model: llama3.1:8b or similar                            │
│  - Local inference                                           │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### 1. AI Service Abstraction Layer (`lib/ai-service.ts`)

This new module will provide a unified interface for all AI operations:

```typescript
interface AIServiceConfig {
  host: string;
  model: string;
  timeout?: number;
}

interface AIResponse {
  text: string;
  raw?: any;
}

class AIService {
  - generateContent(prompt: string, options?: GenerateOptions): Promise<AIResponse>
  - generateStructuredContent(prompt: string, schema?: any): Promise<any>
  - chat(messages: Message[]): Promise<AIResponse>
  - isAvailable(): Promise<boolean>
}
```

**Key Features:**

- Connection pooling and retry logic
- Automatic JSON parsing and validation
- Error handling with meaningful messages
- Support for both streaming and non-streaming responses
- Configuration via environment variables

#### 2. Migration Strategy for Each Service

##### Main Cricket Service (`lib/gemini.ts` → `lib/cricket-ai.ts`)

**Current Structure:**

- `withKeyRotation()`: Handles API key rotation for rate limiting
- `getCream11()`: Generates fantasy team with Google Search tool
- `getCustomTeamAnalysis()`: Analyzes user-selected teams
- `getPlaying11OfTeams()`: Fetches playing 11 for both teams

**New Structure:**

- `withRetry()`: Replaces key rotation with connection retry logic
- Same function names but using Ollama
- Preserve all prompt engineering and response parsing
- Maintain Next.js caching with `unstable_cache`

**Key Changes:**

- Remove Google Search tool (Ollama doesn't support it natively)
- Add instructions in prompts to use model's built-in knowledge
- Implement fallback for when real-time data is needed
- Keep all JSON parsing and validation logic

##### Sites Services

**Cricket Site (`sites/cricket/services/geminiService.ts`):**

- Replace `GoogleGenAI` with Ollama client
- Update `generateContentWithFallback()` to handle Ollama errors
- Preserve all budget adjustment and team validation logic
- Maintain JSON cleaning utilities

**Football Site (`sites/football/services/geminiService.ts`):**

- Migrate schema-based generation to Ollama's JSON mode
- Adapt structured output for FPL team generation
- Keep match fetching logic with updated prompts

**Basketball Site (`sites/basketball/services/geminiService.ts`):**

- Convert lineup schema to Ollama-compatible format
- Maintain salary cap validation
- Preserve player analysis structure

## Components and Interfaces

### 1. Core AI Service Module

**File:** `lib/ai-service.ts`

```typescript
import Ollama from 'ollama';

export interface AIConfig {
  host?: string;
  model?: string;
  timeout?: number;
}

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  systemPrompt?: string;
}

export class OllamaAIService {
  private client: Ollama;
  private model: string;
  private maxRetries: number = 3;

  constructor(config?: AIConfig);

  async generateContent(
    prompt: string,
    options?: GenerateOptions
  ): Promise<string>;

  async generateJSON<T>(
    prompt: string,
    options?: GenerateOptions
  ): Promise<T>;

  async chat(
    messages: Array<{role: string; content: string}>,
    options?: GenerateOptions
  ): Promise<string>;

  async isAvailable(): Promise<boolean>;

  private async retryOperation<T>(
    operation: () => Promise<T>,
    retries?: number
  ): Promise<T>;
}

export const createAIService = (config?: AIConfig): OllamaAIService;
```

### 2. Migrated Cricket Service

**File:** `lib/cricket-ai.ts` (replaces `lib/gemini.ts`)

```typescript
import { OllamaAIService } from "./ai-service";
import { unstable_cache } from "next/cache";

const aiService = new OllamaAIService({
  host: process.env.OLLAMA_HOST || "http://localhost:11434",
  model: process.env.OLLAMA_MODEL || "llama3.1:8b",
});

export async function withRetry<T>(
  fn: (service: OllamaAIService) => Promise<T>
): Promise<T>;

export const getCream11 = unstable_cache(
  async (match: Match) => {
    // Same logic, using aiService instead of genAI
  }
  // Same cache key function
);

export const getCustomTeamAnalysis = unstable_cache(
  async (
    match: Match,
    selectedPlayers: ExtendedSelectedPlayer[],
    aiSuggestedTeam: Player[]
  ) => {
    // Same logic, using aiService instead of genAI
  }
  // Same cache key function
);

export async function getPlaying11OfTeams(match: Match);
```

### 3. Site Services Migration Pattern

Each site service will follow this pattern:

```typescript
import Ollama from "ollama";

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://localhost:11434",
});

const MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";

async function generateWithFallback(prompt: string, options?: any) {
  try {
    const response = await ollama.generate({
      model: MODEL,
      prompt,
      format: options?.jsonMode ? "json" : undefined,
      ...options,
    });
    return response.response;
  } catch (error) {
    // Handle Ollama-specific errors
    throw new Error("AI generation failed");
  }
}
```

## Data Models

### Configuration Model

```typescript
interface OllamaConfig {
  host: string; // Default: 'http://localhost:11434'
  model: string; // Default: 'llama3.1:8b'
  timeout: number; // Default: 120000 (2 minutes)
  maxRetries: number; // Default: 3
  retryDelay: number; // Default: 1000 (1 second)
}
```

### Response Models

All existing response models remain unchanged:

- `FantasyTeamResult`
- `DreamTeamResponse`
- `Team` (Football)
- `Lineup` (Basketball)

### Error Models

```typescript
interface AIError {
  code:
    | "CONNECTION_FAILED"
    | "MODEL_NOT_FOUND"
    | "GENERATION_FAILED"
    | "TIMEOUT";
  message: string;
  details?: any;
}
```

## Error Handling

### Error Categories and Handling Strategy

#### 1. Connection Errors

**Scenario:** Ollama server is not running or unreachable

**Handling:**

```typescript
try {
  await ollama.list(); // Check if server is available
} catch (error) {
  throw new AIError({
    code: "CONNECTION_FAILED",
    message:
      "Ollama server is not running. Please start Ollama with: ollama serve",
    details: error,
  });
}
```

#### 2. Model Not Found

**Scenario:** Requested model is not downloaded

**Handling:**

```typescript
try {
  await ollama.generate({ model, prompt });
} catch (error) {
  if (error.message.includes("model not found")) {
    throw new AIError({
      code: "MODEL_NOT_FOUND",
      message: `Model '${model}' not found. Download it with: ollama pull ${model}`,
      details: error,
    });
  }
}
```

#### 3. Generation Failures

**Scenario:** Model fails to generate valid response

**Handling:**

- Implement retry logic with exponential backoff
- Return default/fallback responses for non-critical features
- Log errors for debugging

#### 4. JSON Parsing Errors

**Scenario:** Model returns invalid JSON

**Handling:**

- Preserve existing JSON cleaning utilities
- Add additional validation layers
- Implement schema validation for structured outputs

### Retry Logic

```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }
  throw new Error("Max retries exceeded");
}
```

## Testing Strategy

### Unit Testing

1. **AI Service Module Tests**

   - Connection handling
   - Retry logic
   - JSON parsing and validation
   - Error handling

2. **Service Migration Tests**
   - Each migrated function with sample inputs
   - Response format validation
   - Edge case handling

### Integration Testing

1. **End-to-End Flow Tests**

   - Cricket team generation flow
   - Football team generation flow
   - Basketball lineup generation flow
   - Match data fetching

2. **Caching Tests**
   - Verify Next.js cache still works
   - Test cache invalidation

### Manual Testing Checklist

- [ ] Start Ollama server locally
- [ ] Pull required model (llama3.1:8b or specified)
- [ ] Test cricket fantasy team generation
- [ ] Test custom team analysis
- [ ] Test playing 11 fetching
- [ ] Test cricket site dream team generation
- [ ] Test football FPL team generation
- [ ] Test basketball lineup generation
- [ ] Test error scenarios (Ollama not running, model not found)
- [ ] Verify response formats match original
- [ ] Check performance and response times

## Model Selection and Requirements

### Recommended Models

#### Primary: Llama 3.1 8B

- **Model:** `llama3.1:8b`
- **Context Length:** 128K tokens
- **Strengths:** Good balance of speed and quality, excellent JSON generation
- **Use Case:** All fantasy team generation and analysis

#### Alternative: Mistral 7B

- **Model:** `mistral:7b`
- **Context Length:** 32K tokens
- **Strengths:** Fast inference, good for structured output
- **Use Case:** Fallback option if Llama 3.1 is unavailable

#### Alternative: Qwen 2.5 7B

- **Model:** `qwen2.5:7b`
- **Context Length:** 128K tokens
- **Strengths:** Excellent reasoning, good JSON adherence
- **Use Case:** Complex analysis tasks

### Model Requirements

- **Minimum Context Length:** 8K tokens (for large prompts with player data)
- **JSON Mode Support:** Required for structured outputs
- **Instruction Following:** Must follow complex multi-step instructions
- **Knowledge Cutoff:** Recent enough to have sports knowledge (2023+)

### Prompt Engineering Considerations

Since Ollama models don't have real-time search capabilities:

1. **Update Prompts:** Add disclaimers about using model's built-in knowledge
2. **Historical Data:** Emphasize using provided historical data in prompts
3. **Fallback Strategy:** For time-sensitive data, consider adding a note that data may not be current
4. **Explicit Instructions:** Be more explicit about JSON format requirements

Example prompt modification:

```
OLD: "Use Google Search to find the latest statistics..."
NEW: "Based on your knowledge and the provided historical data, analyze..."
```

## Performance Considerations

### Expected Performance

- **Local Inference Time:** 5-30 seconds per request (depending on model and hardware)
- **Comparison to GenAI:** 2-5x slower than cloud API
- **Mitigation:** Leverage Next.js caching aggressively

### Optimization Strategies

1. **Caching:**

   - Maintain existing `unstable_cache` usage
   - Increase cache duration for stable data
   - Implement Redis caching for frequently accessed data

2. **Model Optimization:**

   - Use quantized models (Q4_K_M) for faster inference
   - Consider GPU acceleration if available
   - Batch requests where possible

3. **Prompt Optimization:**
   - Reduce prompt length where possible
   - Remove redundant instructions
   - Use more concise system prompts

### Hardware Requirements

- **Minimum:** 8GB RAM, CPU inference
- **Recommended:** 16GB RAM, GPU with 6GB+ VRAM
- **Optimal:** 32GB RAM, GPU with 12GB+ VRAM

## Environment Configuration

### Environment Variables

```bash
# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
OLLAMA_TIMEOUT=120000
OLLAMA_MAX_RETRIES=3

# Fallback Configuration (optional)
OLLAMA_FALLBACK_MODEL=mistral:7b

# Feature Flags (optional)
USE_OLLAMA=true
```

### Configuration File

Create `.env.local`:

```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
OLLAMA_TIMEOUT=120000
```

### Docker Configuration (Optional)

For containerized deployment:

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_MODELS=llama3.1:8b

  app:
    build: .
    environment:
      - OLLAMA_HOST=http://ollama:11434
      - OLLAMA_MODEL=llama3.1:8b
    depends_on:
      - ollama
```

## Migration Phases

### Phase 1: Foundation (Core Infrastructure)

1. Install Ollama JavaScript library
2. Create AI service abstraction layer
3. Set up environment configuration
4. Implement error handling utilities

### Phase 2: Main Service Migration

1. Migrate `lib/gemini.ts` to `lib/cricket-ai.ts`
2. Update imports in dependent files
3. Test cricket fantasy team generation
4. Verify caching still works

### Phase 3: Site Services Migration

1. Migrate cricket site service
2. Migrate football site service
3. Migrate basketball site service
4. Test each site independently

### Phase 4: Integration and Testing

1. End-to-end testing of all features
2. Performance benchmarking
3. Error scenario testing
4. Documentation updates

### Phase 5: Cleanup

1. Remove GenAI dependencies
2. Remove unused code
3. Update README with Ollama setup instructions
4. Final verification

## Rollback Strategy

In case of issues:

1. **Keep GenAI Code:** Don't delete original files immediately
2. **Feature Flag:** Use environment variable to toggle between GenAI and Ollama
3. **Gradual Migration:** Migrate one service at a time
4. **Monitoring:** Log all AI operations for debugging

## Documentation Requirements

### Setup Guide

1. **Ollama Installation:**

   - macOS: `brew install ollama`
   - Linux: `curl -fsSL https://ollama.com/install.sh | sh`
   - Windows: Download from ollama.com

2. **Model Download:**

   ```bash
   ollama pull llama3.1:8b
   ```

3. **Start Ollama:**

   ```bash
   ollama serve
   ```

4. **Configure Application:**
   - Copy `.env.example` to `.env.local`
   - Set `OLLAMA_HOST` and `OLLAMA_MODEL`

### Troubleshooting Guide

Common issues and solutions:

- Ollama not running → Start with `ollama serve`
- Model not found → Download with `ollama pull <model>`
- Slow responses → Use quantized model or GPU acceleration
- JSON parsing errors → Check model supports JSON mode

## Security Considerations

### Benefits of Local Deployment

1. **Data Privacy:** All data stays local, no external API calls
2. **No API Keys:** No risk of key exposure or rotation
3. **Cost Control:** No usage-based billing

### Considerations

1. **Resource Usage:** Monitor CPU/GPU usage
2. **Model Updates:** Keep Ollama and models updated
3. **Access Control:** Secure Ollama endpoint if exposed

## Future Enhancements

1. **Model Fine-tuning:** Train custom models on fantasy sports data
2. **Hybrid Approach:** Use Ollama for most requests, fallback to cloud for complex queries
3. **Model Switching:** Dynamic model selection based on query complexity
4. **Caching Layer:** Implement Redis for distributed caching
5. **Monitoring:** Add telemetry for AI operation performance
