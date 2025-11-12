# Implementation Plan

- [x] 1. Set up project infrastructure and dependencies

  - Update package.json to add ollama dependency
  - Create environment configuration file (.env.example) with Ollama settings
  - _Requirements: 1.1, 1.2, 8.1, 8.3_

- [x] 2. Create core AI service abstraction layer

  - [x] 2.1 Implement OllamaAIService class in lib/ai-service.ts

    - Create class with constructor accepting AIConfig
    - Implement generateContent method for basic text generation
    - Implement generateJSON method for structured output
    - Implement chat method for conversational interactions
    - Implement isAvailable method to check Ollama server status
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

  - [x] 2.2 Implement retry and error handling logic

    - Create retryOperation private method with exponential backoff
    - Implement connection error handling with meaningful messages
    - Implement model not found error handling
    - Add timeout handling for long-running operations
    - _Requirements: 2.3, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 2.3 Create utility functions for JSON parsing and validation
    - Implement cleanJsonString function to remove markdown and extra text
    - Implement parseJsonWithFixes function for robust JSON parsing
    - Add schema validation helpers
    - _Requirements: 3.4, 4.3_

- [x] 3. Migrate main cricket service (lib/gemini.ts)

  - [x] 3.1 Create new lib/cricket-ai.ts file

    - Import OllamaAIService from ai-service
    - Set up service instance with environment configuration
    - Create withRetry function to replace withKeyRotation
    - _Requirements: 3.1, 3.2_

  - [x] 3.2 Migrate getCream11 function

    - Copy existing function structure and preserve unstable_cache wrapper
    - Replace genAI.getGenerativeModel with aiService.generateJSON
    - Update prompts to remove Google Search references
    - Preserve all JSON parsing and validation logic
    - Maintain player validation and credit calculation
    - Keep default response fallbacks
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6_

  - [x] 3.3 Migrate getCustomTeamAnalysis function

    - Copy existing function structure and preserve unstable_cache wrapper
    - Replace genAI.getGenerativeModel with aiService.generateJSON
    - Update prompts to use model's built-in knowledge instead of search
    - Preserve JSON parsing, cleaning, and error handling
    - Maintain teamStats and teamAnalysis validation
    - _Requirements: 3.1, 3.3, 3.4, 3.5_

  - [x] 3.4 Migrate getPlaying11OfTeams function

    - Replace genAI.getGenerativeModel with aiService.generateJSON
    - Update prompts to remove Google Search tool references
    - Preserve JSON parsing and team structure
    - Maintain fallback to empty arrays on error
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 3.5 Update imports in dependent files
    - Update app/cricket/[id]/page.tsx to import from cricket-ai
    - Update any other files importing from lib/gemini.ts
    - _Requirements: 7.1, 7.2_

- [ ] 4. Migrate cricket site service (sites/cricket/services/geminiService.ts)

  - [x] 4.1 Replace GoogleGenAI with Ollama client

    - Import Ollama from ollama library
    - Create Ollama instance with host configuration
    - Remove GoogleGenAI initialization
    - _Requirements: 4.1_

  - [x] 4.2 Update generateContentWithFallback function

    - Replace genAI.models.generateContent with ollama.generate
    - Update error handling for Ollama-specific errors
    - Remove 503 error handling (not applicable to local Ollama)
    - Add connection error handling
    - _Requirements: 4.2, 4.4_

  - [x] 4.3 Migrate fetchUpcomingMatches function

    - Update to use ollama.generate with JSON format
    - Modify prompts to use model knowledge instead of search
    - Preserve cleanJsonString and parseJsonWithFixes utilities
    - Maintain error handling and response structure
    - _Requirements: 4.1, 4.3, 4.5_

  - [x] 4.4 Migrate generateDreamTeam function
    - Update to use ollama.generate with JSON format
    - Remove Google Search tool references from prompts
    - Preserve budget adjustment logic (adjustDreamTeamForBudget)
    - Preserve team validation logic (ensureCaptainVice, etc.)
    - Maintain response structure with dreamTeam and allPlayers
    - _Requirements: 4.1, 4.3, 4.4, 4.5_

- [x] 5. Migrate football site service (sites/football/services/geminiService.ts)

  - [x] 5.1 Replace GoogleGenAI with Ollama client

    - Import Ollama from ollama library
    - Create Ollama instance with host configuration
    - Remove GoogleGenAI initialization and hardcoded API key
    - _Requirements: 5.1_

  - [x] 5.2 Update generateContentWithFallback function

    - Replace genAI.models.generateContent with ollama.generate
    - Update error handling for Ollama-specific errors
    - _Requirements: 5.2, 5.4_

  - [x] 5.3 Migrate fetchUpcomingMatches function

    - Update to use ollama.generate with JSON format
    - Modify prompts to use model knowledge
    - Preserve JSON extraction and parsing logic
    - Maintain match data structure validation
    - _Requirements: 5.1, 5.4_

  - [x] 5.4 Migrate generateFplTeam function
    - Adapt schema-based generation to Ollama's JSON mode
    - Convert Type schema to JSON schema format if needed
    - Update to use ollama.generate with format: 'json'
    - Preserve formation and team structure validation
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 6. Migrate basketball site service (sites/basketball/services/geminiService.ts)

  - [x] 6.1 Replace GoogleGenAI with Ollama client

    - Import Ollama from ollama library
    - Create Ollama instance with host configuration
    - Remove GoogleGenAI initialization
    - _Requirements: 6.1_

  - [x] 6.2 Update generateContentWithFallback function

    - Replace genAI.models.generateContent with ollama.generate
    - Update error handling for Ollama-specific errors
    - _Requirements: 6.1, 6.4_

  - [x] 6.3 Migrate fetchUpcomingGames function

    - Update to use ollama.generate with JSON format
    - Modify prompts to use model knowledge instead of search
    - Preserve cleanJsonString and parseJsonWithFixes utilities
    - Maintain game data structure
    - _Requirements: 6.1, 6.4_

  - [x] 6.4 Migrate generateFantasyLineup function
    - Adapt lineupSchema to work with Ollama's JSON mode
    - Convert Type schema to JSON schema format if needed
    - Update to use ollama.generate with format: 'json'
    - Preserve lineup validation (8 players, salary cap)
    - Maintain player analysis structure
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. Update cricket match page (app/cricket/[id]/page.tsx)

  - Replace withKeyRotation import with withRetry from cricket-ai
  - Update genAI.getGenerativeModel to use aiService
  - Preserve prompt structure and response handling
  - Maintain JSON response format
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 8. Create documentation and setup guide

  - [ ] 8.1 Create OLLAMA_SETUP.md with installation instructions

    - Document Ollama installation for macOS, Linux, Windows
    - Document model download instructions
    - Document how to start Ollama server
    - _Requirements: 12.1, 12.2_

  - [ ] 8.2 Update README.md with Ollama configuration

    - Add Ollama setup section
    - Document environment variables
    - Add troubleshooting section
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ] 8.3 Create .env.example file
    - Add OLLAMA_HOST with default value
    - Add OLLAMA_MODEL with recommended model
    - Add OLLAMA_TIMEOUT with default value
    - Add comments explaining each variable
    - _Requirements: 8.1, 8.2, 8.3, 12.3_

- [ ] 9. Testing and validation

  - [ ] 9.1 Test main cricket service

    - Test getCream11 with sample match data
    - Test getCustomTeamAnalysis with sample team
    - Test getPlaying11OfTeams with sample match
    - Verify response formats match original
    - _Requirements: 11.1, 11.2_

  - [ ] 9.2 Test cricket site service

    - Test fetchUpcomingMatches
    - Test generateDreamTeam with sample match
    - Verify budget adjustment logic works
    - Verify team validation works
    - _Requirements: 11.1, 11.2_

  - [ ] 9.3 Test football site service

    - Test fetchUpcomingMatches
    - Test generateFplTeam with sample teams
    - Verify formation and team structure
    - _Requirements: 11.1, 11.2_

  - [ ] 9.4 Test basketball site service

    - Test fetchUpcomingGames
    - Test generateFantasyLineup with sample game
    - Verify salary cap validation
    - Verify lineup structure
    - _Requirements: 11.1, 11.2_

  - [ ] 9.5 Test error scenarios

    - Test with Ollama not running
    - Test with model not downloaded
    - Test with invalid responses
    - Verify error messages are user-friendly
    - _Requirements: 11.3, 10.1, 10.2, 10.3_

  - [ ] 9.6 End-to-end testing
    - Test full cricket fantasy team generation flow
    - Test full football FPL team generation flow
    - Test full basketball lineup generation flow
    - Verify all user-facing features work
    - _Requirements: 11.4_

- [ ] 10. Cleanup and finalization
  - Remove @google/generative-ai dependency from package.json
  - Remove @google/genai dependency from package.json
  - Remove hardcoded API keys from code
  - Remove unused imports and code
  - Update ecosystem.config.js to remove GEMINI_API_KEY
  - _Requirements: 1.1_
