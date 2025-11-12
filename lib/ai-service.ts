import { Ollama } from "ollama";

/**
 * Configuration interface for the AI service
 */
export interface AIConfig {
  host?: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Options for content generation
 */
export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  systemPrompt?: string;
}

/**
 * Custom error class for AI-related errors
 */
export class AIError extends Error {
  constructor(
    public code:
      | "CONNECTION_FAILED"
      | "MODEL_NOT_FOUND"
      | "GENERATION_FAILED"
      | "TIMEOUT"
      | "PARSE_ERROR",
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AIError";
  }
}

/**
 * Utility function to clean JSON strings by removing markdown code blocks and extra text
 */
export function cleanJsonString(text: string): string {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");

  // Try to extract JSON object or array
  const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  // Remove control characters
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

  // Replace single quotes with double quotes (be careful with this)
  // Only do this if we're sure it's not inside a string value
  cleaned = cleaned.replace(/'/g, '"');

  return cleaned.trim();
}

/**
 * Robust JSON parsing with automatic fixes for common issues
 */
export function parseJsonWithFixes<T>(jsonString: string): T {
  try {
    // First attempt: direct parse
    return JSON.parse(jsonString) as T;
  } catch (error) {
    try {
      // Second attempt: clean and parse
      const cleaned = cleanJsonString(jsonString);
      return JSON.parse(cleaned) as T;
    } catch (secondError) {
      // Third attempt: try to fix common issues
      let fixed = cleanJsonString(jsonString);

      // Fix trailing commas
      fixed = fixed.replace(/,(\s*[}\]])/g, "$1");

      // Fix missing quotes around keys (simple cases only)
      fixed = fixed.replace(
        /(\{|,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g,
        '$1"$2":'
      );

      try {
        return JSON.parse(fixed) as T;
      } catch (thirdError) {
        throw new AIError(
          "PARSE_ERROR",
          "Failed to parse JSON response after multiple attempts",
          { original: jsonString, error: thirdError }
        );
      }
    }
  }
}

/**
 * Validate JSON against a simple schema
 */
export function validateJsonSchema<T>(
  data: unknown,
  requiredFields: string[]
): data is T {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return requiredFields.every((field) => field in obj);
}

/**
 * OllamaAIService - Core AI service abstraction for Ollama
 */
export class OllamaAIService {
  private client: Ollama;
  private model: string;
  private timeout: number;
  private maxRetries: number;
  private retryDelay: number;

  constructor(config?: AIConfig) {
    const host =
      config?.host || process.env.OLLAMA_HOST || "http://localhost:11434";
    this.model = config?.model || process.env.OLLAMA_MODEL || "gemma3:1b";
    this.timeout =
      config?.timeout || parseInt(process.env.OLLAMA_TIMEOUT || "120000");
    this.maxRetries = config?.maxRetries || 3;
    this.retryDelay = config?.retryDelay || 1000;

    this.client = new Ollama({ host });
  }

  /**
   * Check if Ollama server is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.client.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate basic text content
   */
  async generateContent(
    prompt: string,
    options?: GenerateOptions
  ): Promise<string> {
    return this.retryOperation(async () => {
      try {
        const response = await this.client.generate({
          model: this.model,
          prompt,
          system: options?.systemPrompt,
          options: {
            temperature: options?.temperature,
            num_predict: options?.maxTokens,
          },
          format: options?.jsonMode ? "json" : undefined,
        });

        return response.response;
      } catch (error) {
        this.handleError(error);
        throw error; // This won't be reached due to handleError throwing
      }
    });
  }

  /**
   * Generate structured JSON output
   */
  async generateJSON<T>(prompt: string, options?: GenerateOptions): Promise<T> {
    return this.retryOperation(async () => {
      try {
        const response = await this.client.generate({
          model: this.model,
          prompt,
          system: options?.systemPrompt,
          options: {
            temperature: options?.temperature,
            num_predict: options?.maxTokens,
          },
          format: "json",
        });

        return parseJsonWithFixes<T>(response.response);
      } catch (error) {
        if (error instanceof AIError) {
          throw error;
        }
        this.handleError(error);
        throw error; // This won't be reached due to handleError throwing
      }
    });
  }

  /**
   * Chat with conversational context
   */
  async chat(
    messages: Array<{ role: string; content: string }>,
    options?: GenerateOptions
  ): Promise<string> {
    return this.retryOperation(async () => {
      try {
        const response = await this.client.chat({
          model: this.model,
          messages,
          options: {
            temperature: options?.temperature,
            num_predict: options?.maxTokens,
          },
          format: options?.jsonMode ? "json" : undefined,
        });

        return response.message.content;
      } catch (error) {
        this.handleError(error);
        throw error; // This won't be reached due to handleError throwing
      }
    });
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Add timeout wrapper
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              new AIError(
                "TIMEOUT",
                `Operation timed out after ${this.timeout}ms`
              )
            );
          }, this.timeout);
        });

        return await Promise.race([operation(), timeoutPromise]);
      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (error instanceof AIError) {
          if (
            error.code === "MODEL_NOT_FOUND" ||
            error.code === "PARSE_ERROR"
          ) {
            throw error;
          }
        }

        // If this is the last attempt, throw the error
        if (attempt === retries - 1) {
          throw error;
        }

        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Handle and transform errors into AIError instances
   */
  private handleError(error: unknown): never {
    if (error instanceof AIError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Connection errors
    if (
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("fetch failed") ||
      errorMessage.includes("connect")
    ) {
      throw new AIError(
        "CONNECTION_FAILED",
        "Ollama server is not running. Please start Ollama with: ollama serve",
        error
      );
    }

    // Model not found errors
    if (
      errorMessage.includes("model") &&
      (errorMessage.includes("not found") ||
        errorMessage.includes("does not exist"))
    ) {
      throw new AIError(
        "MODEL_NOT_FOUND",
        `Model '${this.model}' not found. Download it with: ollama pull ${this.model}`,
        error
      );
    }

    // Generic generation failure
    throw new AIError(
      "GENERATION_FAILED",
      `AI generation failed: ${errorMessage}`,
      error
    );
  }
}

/**
 * Factory function to create an AI service instance
 */
export function createAIService(config?: AIConfig): OllamaAIService {
  return new OllamaAIService(config);
}
