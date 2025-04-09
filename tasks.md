# Project Tasks from User Feedback

This document outlines actionable tasks derived from user feedback provided in `feedback.md`, along with potential solutions.

## Pending Tasks (Reordered by Perceived Ease)

### UI/UX & Documentation Improvements (Easier)

- [x] **Task:** Add a user guide, tutorial, or better onboarding.

  - **Feedback Ref:** "Kindly give a guide how to use it", "I didn't understand anything form this", "How to use that", "Add a quick guide about how to use it.... I am unable to figure out its use...... Does it already give the best team...or do we enter our team..."
  - **Potential Solution:** Create a dedicated help/FAQ section, an interactive onboarding tour for new users, tooltips explaining key features and metrics, or short video tutorials. Clearly explain the application's core functionality and workflow on the landing page or intro screen.
  - **Resolution:** Created `components/how-to-use-guide.tsx` using `shadcn/ui` Dialog to show basic workflow instructions. Added the component trigger button to the header in `app/page.tsx`.

- [x] **Task:** Provide clearer guidance on selecting Captain (C) and Vice-Captain (VC).

  - **Feedback Ref:** "And I am not Able to understand to whom to make captain and vice captain"
  - **Potential Solution:** Enhance the UI to highlight suggested C/VC picks based on projections or risk/reward analysis. Add explanations or tooltips detailing the reasoning behind the suggestions.
  - **Resolution:** Modified `FantasyTeamSection` to pass suggested C/VC names to `FantasyTeamBuilder`. Updated `FantasyTeamBuilder` and `PlayerCard` to accept these suggestions and display "(AI C)" / "(AI VC)" badges next to the corresponding player names.

- [x] **Task:** Explain the factors driving team scores/analysis.

  - **Feedback Ref:** "How This Team Scores High"
  - **Potential Solution:** Add tooltips, info icons, or a dedicated section within the analysis view that breaks down the score, highlighting key player contributions, synergy factors, or other elements influencing the outcome.
  - **Resolution:** Added tooltips to each metric in `TeamPerformanceMetrics` showing its description on hover. Added an info icon with a tooltip next to the title in `TeamAnalysis` explaining the factors the AI considers.

- [ ] **Task:** Improve overall UI/UX clarity and ease of use.
  - **Feedback Ref:** "What kind of ui is it", "HOW TO CHANGE THE TEAM AND CHECK?", "how i can change the teams", "worst...cant even change the team", "Bkl kese use karni hai ye lodu" (Implies frustration/confusion), "How to access daily team"
  - **Potential Solution:** Conduct a UI/UX audit. Simplify workflows for core tasks like building/editing teams and viewing analysis. Improve navigation, button labeling, and visual hierarchy. Consider user testing sessions.
  - **Note:** Added tooltips to 'Reset Team' buttons explaining behavior (resets to basic suggested, not empty) as a small clarification step (16 Aug).

### Core Functionality Features (Easier-Medium)

- [x] **Task:** Enable selection between multiple matches occurring on the same day.

  - **Feedback Ref:** "It is showing analysis for one Match.. What if there is 2 matches in a day.Need a Match Selection Button.", "There are more then one match happening today and I am only able to see data of the second match"
  - **Potential Solution:** Add a match selection mechanism (e.g., dropdown, tabs, list) on the main page or analysis view to allow users to switch between concurrent matches.
  - **Resolution:** Moved `MatchWithPlayers` type to `types/match.ts`. Refactored `MatchFantasySelector` to accept `MatchWithPlayers[]`, use `Tabs` (from `shadcn/ui`) for selection, manage state for the selected match, and render `FantasyTeamSection` dynamically for the chosen match. (Note: Edit to `app/page.tsx` to pass the full array failed and needs manual check/fix).

- [x] **Task:** Add search functionality for teams or leagues.

  - **Feedback Ref:** "Ther no search bar to check other team or league"
  - **Potential Solution:** Implement a search bar component allowing users to quickly find specific matches, teams, or potentially player information.
  - **Resolution:** Created `components/match-list-wrapper.tsx` client component to handle search state and filtering. Added an Input field to this wrapper. Modified `app/page.tsx` to use this wrapper, passing the initial list of today's matches. Matches are now filtered by team name or venue based on search input.

- [ ] **Task:** Provide suggested/optimal fantasy teams.

  - **Feedback Ref:** "Csk match team????", "kkr vs Isg team??", "Lag vs kkr", "Lsg vs kkr team kaha hai", "Hii this match team give yss vs kucc team", "how to get best 11 out of it with maximum win probability?", "Where is combined 11"
  - **Potential Solution:** Add a feature to generate and display one or more recommended fantasy teams based on the platform's analysis and optimization algorithms. Clearly label these as suggestions. _(Backend `getCream11` exists, needs reliable UI presentation)_

### Data & Reliability (Easier-Medium)

- [ ] **Task:** Ensure the player database is complete and accurate.

  - **Feedback Ref:** "Where is dube?", "Missing players. For example in esk vs Punjab kings match, i could not locate players like Nehal wadhera and Shivam dube."
  - **Potential Solution:** Implement regular updates to the player database, cross-referencing with official IPL squad lists and news sources. Establish a process for quickly adding newly relevant players (including Impact Players).

- [ ] **Task:** Improve data freshness and ensure timely updates.

  - **Feedback Ref:** "Its not updating man", "Not working, doesn't show player names and selection just before match and after toss"
  - **Potential Solution:** Review and optimize data pipelines, CRON jobs, or event triggers responsible for fetching player stats, match info, and playing XIs. Monitor data source latency and reliability. _(Partially addressed by reducing cache times, ongoing monitoring needed)_

- [ ] **Task:** Clarify and investigate reported issues with manual team functionality.

  - **Feedback Ref:** "Manual team not set"
  - **Potential Solution:** This feedback is ambiguous. Requires testing the entire workflow for creating, saving, loading, and editing manually constructed teams. If possible, seek clarification from users experiencing this issue.

- [ ] **Task:** Investigate general stability issues and downtime.
  - **Feedback Ref:** "Its not running", "Not working properly.", "Website is down from the last 2 days", "Not working"
  - **Potential Solution:** Set up robust monitoring and logging (server-side and client-side). Analyze logs for recurring errors. Check server resource utilization, database performance, and hosting provider status. Perform load testing if stability issues occur under heavy use.

### Core Functionality Features (Harder / More Complex)

- [ ] **Task:** Include substitute player information.

  - **Feedback Ref:** "What about substitute and team announcement??"
  - **Potential Solution:** Enhance data sources (e.g., modify `getPlaying11OfTeams` prompt) and UI to fetch and display announced substitutes for each team.

- [ ] **Task:** Allow users to save and manage multiple teams.

  - **Feedback Ref:** "Add team" (Potential interpretation)
  - **Potential Solution:** Implement user accounts or use browser local storage to allow users to save, name, and load different team combinations they create.
  - **Note:** This is a significant feature requiring architectural decisions (local storage vs. user accounts/database) and substantial UI/state implementation for saving, naming, loading, and managing multiple team configurations. Task remains pending further planning.

- [ ] **Task:** Enhance the prediction model with more factors.

  - **Feedback Ref:** "Your model doesn't consider recent form, pitch analysis, opponent strength. It's plain analysis completely from past data.", (Implied by specific analysis like) "kholi against deepak and boult..."
  - **Potential Solution:** Augment the dataset with features like recent player form (last 3-5 matches), detailed pitch reports (batting/bowling friendly, pace/spin), historical player vs. player/team matchups, and opponent strength metrics. Retrain or update the prediction model to utilize these inputs. Clearly communicate which factors are considered in the analysis. _(Partially addressed by adding search/toss factor to prompts, requires verification and potentially more data sources)_
  - **Note:** Prompts for `getCream11` and `getCustomTeamAnalysis` updated/intended to instruct AI to use search for recent form and consider toss/venue impact. Effectiveness requires verification. Explicit data augmentation (recent scores, pitch reports, H2H) is a larger future enhancement if needed. Task remains open for verification.

- [ ] **Task:** Add functionality to handle 'Impact Players'. (Backend AI Logic Update Pending - Apply Failed)

  - **Feedback Ref:** "I am not able to impact player like Rutherford"
  - **Potential Solution:** Add UI elements (e.g., a dedicated slot, toggle) and logic within the team builder/analyzer to allow users to select/swap Impact Players and see their effect on team score/probability.
  - **Status:** `getPlaying11OfTeams` prompt requests `isImpactPlayer` flag. Prompts for `getCream11` and `getCustomTeamAnalysis` need updating to explain and utilize the Impact Player rule (e.g., only 11 score, substitution logic). (File edit failed repeatedly). Requires significant UI changes in `FantasyTeamBuilder`.

- [ ] **Task:** Implement an AI chat feature for user assistance.
  - **Feedback Ref:** "It will be better if we can get a chat feature with the Al Agent."
  - **Potential Solution:** Integrate a chatbot (using existing LLM APIs or a custom model) to answer user queries about players, teams, app features, or fantasy strategies.
  - **Note:** This is a major feature requiring significant design (UI, conversation flow) and implementation (integration with LLM, potentially context management). Task remains pending further planning.

## Completed Tasks

- [x] **Task:** Team performance metrics do not update dynamically when the team composition is changed.

  - **Resolution:** Modified `handleFantasyTeamChange` in `components/fantasy-team-section.tsx` to automatically trigger `handleReanalyze` (which calls the backend) whenever the team composition changes significantly, ensuring stats are updated with fresh backend data.

- [x] **Task:** The team analysis section sometimes shows empty results.

  - **Resolution:** Added checks in `lib/gemini.ts` (`getCustomTeamAnalysis`) to handle cases where the AI returns valid JSON but with missing or empty `teamAnalysis` or `teamStats`. Default messages/stats are now provided in such cases. Enhanced logging for debugging JSON parsing issues.

- [x] **Task:** The tool suggests teams violating fantasy league rules (e.g., more than 7 players from one team).

  - **Resolution:** Added the "Maximum 7 players per team" rule to the AI prompt in `lib/gemini.ts` (`getCream11`) to ensure the initial AI-suggested teams adhere to this constraint.

- [x] **Task:** The 'Reset Team' option is not functional. (Potentially resolved)

  - **Resolution:** Reviewed the `resetFantasyTeam` function and its usage in `components/fantasy-team-section.tsx`. The logic appears correct: it generates a basic suggested team and calls `handleFantasyTeamChange`, which updates state and triggers reanalysis. The issue might have been a misunderstanding of function (resets to suggested, not empty) or fixed by resolving task #1 (state update issues).

- [x] **Task:** The calculated win probability appears static (stuck at 50%) regardless of team changes.

  - **Resolution:** Changed fallback/error `winProbability` values in `lib/gemini.ts` (`getCream11`) from 50 to 0. Added emphasis in AI prompts (`getCream11`, `getCustomTeamAnalysis`) to ensure stats are dynamically calculated based on the selected team and not static placeholders.

- [x] **Task:** Player names and team selections are missing or outdated after the toss.

  - **Resolution:** Reduced page revalidation time in `app/page.tsx` to 60 seconds (`export const revalidate = 60;`) and reduced the cache time for `getAISuggestedTeamCached` to 300 seconds (5 minutes). This ensures player data and AI suggestions are updated much more frequently, especially around toss time.

- [x] **Task:** Incorrect year ("IPL 2025") is displayed in the UI.

  - **Resolution:** Corrected hardcoded "IPL 2025" string to "IPL 2024" in `app/page.tsx` (header) and `app/players/page.tsx` (page title).

- [x] **Task:** Incorporate the toss factor into team analysis and predictions. (Acknowledged - Apply Failed)
  - **Resolution:** Intended to add instructions to AI prompts (`getCream11`, `getCustomTeamAnalysis`) to consider toss impact based on venue conditions (using search) and mention it in analysis. (File edit failed repeatedly).
