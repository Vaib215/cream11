# Requirements Document

## Introduction

This document outlines the requirements for migrating the Cream11 fantasy sports application from Google's GenAI (Gemini) to Ollama with a locally running model. The application currently uses Google's Gemini models (gemini-2.0-flash, gemini-2.5-flash, gemini-2.5-flash-lite) across multiple services for generating fantasy teams, analyzing matches, and fetching sports data. The migration aims to replace all GenAI implementations with Ollama while maintaining feature parity and ensuring no existing functionality is broken.

The codebase has AI integrations in:

- Main Next.js app (`lib/gemini.ts`) for cricket fantasy team generation
- Cricket site (`sites/cricket/services/geminiService.ts`)
- Football site (`sites/football/services/geminiService.ts`)
- Basketball site (`sites/basketball/services/geminiService.ts`)
- Cricket match page (`app/cricket/[id]/page.tsx`)

## Requirements

### Requirement 1: Library Migration

**User Story:** As a developer, I want to replace the Google GenAI library with Ollama's JavaScript library, so that the application uses locally running AI models instead of cloud-based services.

#### Acceptance Criteria

1. WHEN the package.json is updated THEN the `@google/generative-ai` and `@google/genai` dependencies SHALL be removed
2. WHEN the package.json is updated THEN the `ollama` JavaScript library SHALL be added as a dependency
3. WHEN dependencies are installed THEN the application SHALL build successfully without GenAI-related errors
4. IF the `ollama` package is already present in package.json THEN it SHALL be verified to be the latest stable version

### Requirement 2: Core Service Abstraction

**User Story:** As a developer, I want a unified abstraction layer for AI operations, so that switching between AI providers in the future is easier and the codebase remains maintainable.

#### Acceptance Criteria

1. WHEN a new AI service module is created THEN it SHALL provide a consistent interface for all AI operations
2. WHEN the AI service is initialized THEN it SHALL connect to the locally running Ollama instance
3. WHEN an AI operation fails THEN the service SHALL provide meaningful error messages
4. WHEN the service is used THEN it SHALL support streaming and non-streaming responses
5. IF Ollama is not running locally THEN the service SHALL throw a clear error indicating the connection issue

### Requirement 3: Main Cricket Service Migration

**User Story:** As a user, I want the cricket fantasy team generation to work with Ollama, so that I can continue using the app without relying on Google's API.

#### Acceptance Criteria

1. WHEN `lib/gemini.ts` is migrated THEN all functions (`getCream11`, `getCustomTeamAnalysis`, `getPlaying11OfTeams`) SHALL use Ollama instead of GenAI
2. WHEN the `withKeyRotation` function is refactored THEN it SHALL handle Ollama connection retries instead of API key rotation
3. WHEN fantasy teams are generated THEN the response format SHALL remain identical to the current implementation
4. WHEN JSON parsing occurs THEN the existing parsing logic SHALL be preserved
5. WHEN caching is used THEN the Next.js `unstable_cache` functionality SHALL continue to work
6. IF the AI response format differs THEN appropriate transformations SHALL be applied to maintain compatibility

### Requirement 4: Cricket Site Service Migration

**User Story:** As a user of the standalone cricket site, I want match and team generation features to work with Ollama, so that the site continues to function independently.

#### Acceptance Criteria

1. WHEN `sites/cricket/services/geminiService.ts` is migrated THEN both `fetchUpcomingMatches` and `generateDreamTeam` functions SHALL use Ollama
2. WHEN the fallback mechanism is updated THEN it SHALL handle Ollama model availability instead of Google API overload errors
3. WHEN JSON cleaning and parsing occurs THEN the existing utility functions SHALL be preserved
4. WHEN budget adjustment logic runs THEN it SHALL continue to work without modification
5. WHEN the service is called THEN it SHALL maintain the same response structure

### Requirement 5: Football Site Service Migration

**User Story:** As a user of the football fantasy site, I want match fetching and FPL team generation to work with Ollama, so that I can continue building fantasy football teams.

#### Acceptance Criteria

1. WHEN `sites/football/services/geminiService.ts` is migrated THEN both `fetchUpcomingMatches` and `generateFplTeam` functions SHALL use Ollama
2. WHEN structured output is required THEN the service SHALL handle Ollama's JSON mode or structured output capabilities
3. WHEN the schema-based generation is used THEN it SHALL be adapted to work with Ollama's capabilities
4. WHEN API errors occur THEN they SHALL be handled gracefully with appropriate fallbacks

### Requirement 6: Basketball Site Service Migration

**User Story:** As a user of the basketball fantasy site, I want game fetching and lineup generation to work with Ollama, so that I can continue building NBA fantasy lineups.

#### Acceptance Criteria

1. WHEN `sites/basketball/services/geminiService.ts` is migrated THEN both `fetchUpcomingGames` and `generateFantasyLineup` functions SHALL use Ollama
2. WHEN the lineup schema is used THEN it SHALL be adapted to work with Ollama's structured output capabilities
3. WHEN salary cap validation occurs THEN it SHALL continue to work correctly
4. WHEN player analysis is generated THEN the format SHALL remain consistent

### Requirement 7: Cricket Match Page Migration

**User Story:** As a user viewing a cricket match page, I want the fantasy team generation to work with Ollama, so that I can see AI-generated teams for specific matches.

#### Acceptance Criteria

1. WHEN `app/cricket/[id]/page.tsx` is migrated THEN the `withKeyRotation` usage SHALL be replaced with Ollama calls
2. WHEN the page renders THEN it SHALL display the same fantasy team data structure
3. WHEN the AI generates content THEN it SHALL use the same prompt structure
4. IF the response format differs THEN appropriate transformations SHALL be applied

### Requirement 8: Environment Configuration

**User Story:** As a developer, I want to configure Ollama connection settings via environment variables, so that the application can be easily deployed in different environments.

#### Acceptance Criteria

1. WHEN environment variables are defined THEN they SHALL include Ollama host URL and model name
2. WHEN the application starts THEN it SHALL read Ollama configuration from environment variables
3. WHEN no environment variables are set THEN sensible defaults SHALL be used (localhost:11434, appropriate model)
4. IF custom models are specified THEN the application SHALL use them instead of defaults

### Requirement 9: Model Selection and Compatibility

**User Story:** As a developer, I want to specify which Ollama model to use, so that I can optimize for performance or quality based on requirements.

#### Acceptance Criteria

1. WHEN a model is selected THEN it SHALL support the required context length for fantasy team generation
2. WHEN prompts are sent THEN they SHALL be compatible with the selected Ollama model
3. WHEN structured output is needed THEN the model SHALL support JSON mode or equivalent functionality
4. IF a model doesn't support required features THEN the application SHALL provide clear error messages

### Requirement 10: Error Handling and Fallbacks

**User Story:** As a user, I want the application to handle errors gracefully, so that I receive helpful feedback when AI operations fail.

#### Acceptance Criteria

1. WHEN Ollama is not running THEN the application SHALL display a clear error message
2. WHEN a model is not available THEN the application SHALL suggest downloading the required model
3. WHEN generation fails THEN the application SHALL provide default fallback responses where appropriate
4. WHEN network errors occur THEN they SHALL be caught and handled with user-friendly messages
5. IF rate limiting occurs THEN the application SHALL implement appropriate retry logic
