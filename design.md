# Design Document: Typing Speed Test Web Application

## Overview

The typing speed test is a single-page web application that measures typing performance over a 60-second period. The system presents users with a sequence of random English words, tracks their typing accuracy in real-time, and calculates performance metrics including words per minute (WPM), characters per minute (CPM), accuracy percentage, and skill level classification.

The application is designed as a client-side only solution with no backend dependencies, making it fast, portable, and privacy-friendly. All test logic, timing, and calculations occur in the browser using vanilla JavaScript or a lightweight framework like React or Vue.

### Key Design Goals

- **Immediate feedback**: Visual indicators for correct/incorrect characters appear instantly
- **Zero friction**: No authentication, no setup - just start typing
- **Responsive design**: Works seamlessly on desktop and mobile devices
- **Performance**: Sub-100ms response time for all user interactions
- **Accessibility**: WCAG 2.1 AA compliant for keyboard navigation and screen readers

## Architecture

The application follows a component-based architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     UI Controller                        │
│  (Manages display states, user interface updates)       │
└───────────┬─────────────────────────────────┬───────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────────┐         ┌──────────────────────┐
│   Input Handler       │         │   Timer Component    │
│  (Keyboard events,    │         │  (60s countdown)     │
│   character validation)│         │                      │
└───────────┬───────────┘         └──────────┬───────────┘
            │                                 │
            │         ┌───────────────────────┘
            │         │
            ▼         ▼
┌─────────────────────────────────────────────────────────┐
│              Typing Test Engine                          │
│  (Core logic: test session, word validation, state)     │
└───────────┬─────────────────────────────────┬───────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────────┐         ┌──────────────────────┐
│   Word Provider       │         │  Result Calculator   │
│  (Random word         │         │  (WPM, CPM,          │
│   generation)         │         │   accuracy, skill)   │
└───────────────────────┘         └──────────────────────┘
```

### Component Responsibilities

**Typing Test Engine**: Central coordinator that manages test lifecycle, maintains session state, orchestrates word validation, and coordinates between all other components.

**UI Controller**: Handles all DOM manipulation and visual updates including word highlighting, character coloring, statistics display, and modal management.

**Input Handler**: Processes keyboard events, validates character input against expected characters, manages cursor position, and enforces input rules (e.g., no editing completed words).

**Timer Component**: Manages the 60-second countdown, triggers test start/stop events, and provides elapsed time for real-time calculations.

**Word Provider**: Generates randomized word sequences from a predefined word list, ensures sufficient words for the test duration, and filters inappropriate content.

**Result Calculator**: Computes performance metrics (WPM, CPM, accuracy) in real-time and at test completion, determines skill level classification based on final WPM.

## Components and Interfaces

### Typing Test Engine

**State:**
```javascript
{
  testActive: boolean,
  testStarted: boolean,
  currentWordIndex: number,
  words: string[],
  typedWords: string[],
  currentInput: string,
  correctWords: number,
  totalCorrectChars: number,
  totalTypedChars: number,
  startTime: number | null,
  endTime: number | null
}
```

**Public Methods:**
- `initializeTest()`: Sets up a new test session with fresh word sequence
- `startTest()`: Begins the test session and timer
- `processCharacter(char: string)`: Validates and records character input
- `submitWord()`: Validates current word and moves to next
- `endTest()`: Stops the test and triggers final calculations
- `resetTest()`: Clears all state and prepares for new test

**Events Emitted:**
- `testStarted`: When first character is typed
- `wordSubmitted`: When space key is pressed
- `testEnded`: When timer reaches zero
- `statsUpdated`: When metrics are recalculated

### Input Handler

**Public Methods:**
- `handleKeyDown(event: KeyboardEvent)`: Processes all keyboard input
- `validateCharacter(char: string, expected: string)`: Returns match status
- `handleBackspace()`: Removes last character from current input
- `handleSpace()`: Triggers word submission
- `disableInput()`: Prevents further typing after test ends

**Character Validation Logic:**
```javascript
function validateCharacter(typed, expected) {
  return {
    isCorrect: typed === expected,
    position: currentPosition,
    character: typed
  }
}
```

### Timer Component

**State:**
```javascript
{
  timeRemaining: number,  // seconds
  intervalId: number | null,
  isRunning: boolean
}
```

**Public Methods:**
- `start()`: Begins countdown from 60 seconds
- `stop()`: Halts the countdown
- `reset()`: Returns to 60 seconds
- `getElapsedTime()`: Returns seconds elapsed since start

**Update Frequency:** 100ms intervals for smooth display, but decrements by 1 second

### Word Provider

**Public Methods:**
- `generateWordSequence(count: number)`: Returns array of random words
- `getWordList()`: Returns the complete word dictionary

**Word List Requirements:**
- Minimum 200 common English words
- Average word length: 4-6 characters
- No profanity or offensive terms
- Includes common words like: "the", "and", "for", "you", "with", "have", "this", "that", etc.

### Result Calculator

**Public Methods:**
- `calculateWPM(correctWords: number, seconds: number)`: Returns words per minute
- `calculateCPM(correctChars: number, seconds: number)`: Returns characters per minute
- `calculateAccuracy(correctChars: number, totalChars: number)`: Returns percentage
- `determineSkillLevel(wpm: number)`: Returns skill classification

**Calculation Formulas:**
```javascript
WPM = (correctWords / elapsedSeconds) * 60
CPM = (totalCorrectChars / elapsedSeconds) * 60
Accuracy = (totalCorrectChars / totalTypedChars) * 100
```

**Skill Level Thresholds:**
- Beginner: WPM < 25
- Intermediate: 25 ≤ WPM < 45
- Advanced: 45 ≤ WPM ≤ 70
- Expert: WPM > 70

### UI Controller

**Public Methods:**
- `renderWords(words: string[], currentIndex: number)`: Displays word sequence
- `updateCharacterDisplay(position: number, isCorrect: boolean)`: Colors characters
- `updateStats(wpm: number, cpm: number, accuracy: number)`: Updates metrics display
- `updateTimer(seconds: number)`: Updates countdown display
- `showResults(results: TestResults)`: Displays result modal
- `hideResults()`: Closes result modal
- `disableInput()`: Grays out and disables input field

**Visual Feedback:**
- Correct characters: Green (#4CAF50) or default text color
- Incorrect characters: Red (#F44336)
- Current word: Highlighted background or underline
- Completed words: Dimmed or grayed out

## Data Models

### TestSession

```javascript
interface TestSession {
  sessionId: string;
  startTime: number;
  endTime: number | null;
  words: string[];
  typedWords: TypedWord[];
  isActive: boolean;
  isCompleted: boolean;
}
```

### TypedWord

```javascript
interface TypedWord {
  expected: string;
  typed: string;
  isCorrect: boolean;
  correctCharCount: number;
  timestamp: number;
}
```

### TestResults

```javascript
interface TestResults {
  wpm: number;
  cpm: number;
  accuracy: number;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  correctWords: number;
  totalWords: number;
  correctChars: number;
  totalChars: number;
  duration: number;
}
```

### CharacterValidation

```javascript
interface CharacterValidation {
  character: string;
  position: number;
  isCorrect: boolean;
  expectedChar: string;
}
```

## State Management

The application uses a centralized state management approach with the Typing Test Engine as the single source of truth.

### State Flow

1. **Initialization**: Word Provider generates word sequence → Engine stores in state → UI Controller renders words
2. **Test Start**: User types first character → Input Handler notifies Engine → Engine starts timer and sets testActive flag
3. **Character Input**: Input Handler validates character → Engine updates state → UI Controller updates display
4. **Word Submission**: User presses space → Engine validates word → Result Calculator updates metrics → UI Controller updates stats
5. **Test End**: Timer reaches zero → Engine sets testActive to false → Result Calculator computes final metrics → UI Controller shows results

### State Updates

All state mutations flow through the Typing Test Engine to maintain consistency:

```javascript
// Centralized state update pattern
function updateState(mutation) {
  state = { ...state, ...mutation };
  notifySubscribers(state);
}
```

Subscribers (UI Controller, Result Calculator) receive state updates and react accordingly.

## UI/UX Design Considerations

### Layout Structure

**Desktop (≥768px):**
```
┌─────────────────────────────────────────┐
│         Test your typing skills         │
│                                         │
│              Timer: 60s                 │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  word1 word2 word3 word4 word5    │ │
│  │  word6 word7 word8 word9 word10   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  [Start typing...]                │ │
│  └───────────────────────────────────┘ │
│                                         │
│   WPM: 0    CPM: 0    Accuracy: 100%   │
│                                         │
│         Footer Links                    │
└─────────────────────────────────────────┘
```

**Mobile (<768px):**
```
┌─────────────────────┐
│  Test your typing   │
│       skills        │
│                     │
│    Timer: 60s       │
│                     │
│  WPM: 0             │
│  CPM: 0             │
│  Accuracy: 100%     │
│                     │
│ ┌─────────────────┐ │
│ │ word1 word2     │ │
│ │ word3 word4     │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ [Start typing...│ │
│ └─────────────────┘ │
│                     │
│   Footer Links      │
└─────────────────────┘
```

### Visual Feedback Timing

- Character color change: Immediate (<16ms, same frame)
- Statistics update: Within 100ms of word submission
- Timer update: Every 100ms for smooth countdown
- Modal appearance: Immediate upon test completion

### Interaction Patterns

**Focus Management:**
- Input field auto-focuses on page load
- Focus remains in input field during test
- Focus moves to "Try again" button in results modal

**Error Prevention:**
- Backspace only works on current word
- Multiple spaces are ignored
- Input disabled after test ends

**Progressive Disclosure:**
- Initial view shows only essential elements
- Results modal appears only after completion
- Statistics update progressively during test

### Accessibility Features

- Semantic HTML structure (header, main, section, footer)
- ARIA live regions for dynamic statistics updates
- Keyboard-only navigation support
- High contrast mode compatibility
- Focus indicators on all interactive elements
- Screen reader announcements for test state changes

### Performance Optimizations

- Debounce statistics calculations (max once per word)
- Virtual scrolling for word display if sequence is very long
- Minimal DOM manipulations (batch updates)
- CSS transforms for animations (GPU acceleration)
- Lazy load word list if large


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Test start triggers on alphanumeric input

*For any* alphanumeric character, when typed in the input field with focus, the timer should start the 60-second countdown if not already started.

**Validates: Requirements 2.1**

### Property 2: Test session starts only once

*For any* sequence of start attempts, the Typing Test Engine should create only one test session per test instance, maintaining idempotence.

**Validates: Requirements 2.3**

### Property 3: Character validation and display

*For any* character typed at the current position, if it matches the expected character it should be displayed in green/black, and if it doesn't match it should be displayed in red.

**Validates: Requirements 3.1, 3.2**

### Property 4: Backspace removes current word characters

*For any* non-empty current word input, pressing backspace should remove the last character from the current word input.

**Validates: Requirements 3.3**

### Property 5: Completed words are immutable

*For any* completed word, backspace and other editing operations should not modify its content or display.

**Validates: Requirements 3.4, 3.5**

### Property 6: Correct word increments counter

*For any* word in the sequence, when the typed input exactly matches the expected word and space is pressed, the correct word count should increment by 1.

**Validates: Requirements 4.2**

### Property 7: Incorrect word counts matching characters

*For any* word in the sequence, when the typed input does not exactly match the expected word and space is pressed, the system should count the number of characters that match at identical positions.

**Validates: Requirements 4.3**

### Property 8: Word submission clears input

*For any* word submission (space key press), the input field should be cleared immediately after.

**Validates: Requirements 4.4**

### Property 9: Word submission advances to next word

*For any* word submission, the current word index should increment by 1, highlighting the next word in the sequence.

**Validates: Requirements 4.5**

### Property 10: Multiple spaces are idempotent

*For any* sequence of consecutive space key presses, only the first space should trigger word submission, and subsequent spaces should be ignored.

**Validates: Requirements 4.6**

### Property 11: WPM calculation formula

*For any* number of correct words and elapsed time in seconds, WPM should be calculated as (correctWords / elapsedSeconds) × 60.

**Validates: Requirements 5.1, 7.1**

### Property 12: CPM calculation formula

*For any* number of correct characters and elapsed time in seconds, CPM should be calculated as (correctCharacters / elapsedSeconds) × 60.

**Validates: Requirements 5.2, 7.2**

### Property 13: Accuracy calculation formula

*For any* number of correct characters and total typed characters, accuracy should be calculated as (correctCharacters / totalTypedCharacters) × 100.

**Validates: Requirements 5.3, 7.3**

### Property 14: Skill level classification

*For any* final WPM value, the skill level should be determined as: Beginner (WPM < 25), Intermediate (25 ≤ WPM < 45), Advanced (45 ≤ WPM ≤ 70), or Expert (WPM > 70).

**Validates: Requirements 7.4, 7.5, 7.6, 7.7, 7.8**

### Property 15: Results display contains all metrics

*For any* completed test, the result display should contain WPM, CPM, accuracy percentage, skill level classification, and a "Try again" button.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

### Property 16: Word generation from predefined list

*For any* generated word sequence, all words should come from the predefined list of common English words.

**Validates: Requirements 14.1**

### Property 17: Word sequence randomization

*For any* two consecutive test sessions, the word sequences should be different (randomized order).

**Validates: Requirements 14.3**

### Property 18: Form inputs have labels

*For any* form input element in the UI, it should have an associated descriptive label or ARIA label.

**Validates: Requirements 12.1**

### Property 19: Keyboard navigation support

*For any* interactive element in the UI, it should be reachable and operable using keyboard-only navigation.

**Validates: Requirements 12.3**

### Property 20: Dynamic content has ARIA labels

*For any* dynamically updated content (timer, statistics), the element should have appropriate ARIA labels for screen reader announcements.

**Validates: Requirements 12.4**

## Error Handling

The application should handle the following error conditions gracefully:

### Input Validation Errors

**Empty word list**: If the Word Provider fails to load or returns an empty word list, display an error message: "Unable to load word list. Please refresh the page."

**Invalid character input**: Non-printable characters and special characters (except backspace and space) should be ignored silently without affecting test state.

**Timer malfunction**: If the timer fails to start or stops unexpectedly, log the error to console and allow manual test restart via "Try again" button.

### State Consistency Errors

**Desynchronized state**: If the current word index exceeds the word array length, reset to the last valid word and log a warning.

**Negative statistics**: If any calculated metric (WPM, CPM, accuracy) becomes negative due to calculation errors, clamp to 0 and log the error.

**Division by zero**: When calculating metrics with zero elapsed time or zero typed characters, return 0 instead of NaN or Infinity.

### Browser Compatibility Errors

**LocalStorage unavailable**: If localStorage is not available (private browsing mode), continue test functionality but skip any persistence features.

**Performance API unavailable**: If performance.now() is not available, fall back to Date.now() for timing calculations.

**Keyboard event incompatibility**: If KeyboardEvent.key is not supported, fall back to KeyboardEvent.keyCode with appropriate mapping.

### Error Recovery Strategy

- All errors should be logged to console with descriptive messages
- Non-critical errors should not interrupt the test in progress
- Critical errors (word list failure) should display user-friendly messages
- The "Try again" button should always be available to reset to a known good state

## Testing Strategy

The typing speed test will employ a dual testing approach combining unit tests for specific scenarios and property-based tests for comprehensive coverage.

### Unit Testing

Unit tests will focus on:

**Initialization examples**: Verify initial state values (timer at 60s, stats at 0/0/100%, empty input)

**Edge cases**: 
- Empty input submission
- Backspace on empty input
- Timer reaching exactly 0 seconds
- Word list with minimum required words
- No offensive words in word list

**Integration points**:
- Timer component triggering test end
- Input handler notifying engine of events
- Result calculator receiving correct data

**Error conditions**:
- Division by zero in calculations
- Invalid word index
- Missing word list

### Property-Based Testing

Property-based tests will verify universal properties across randomized inputs. The testing framework should be configured to run a minimum of 100 iterations per property test to ensure comprehensive coverage.

**Testing Library**: Use `fast-check` for JavaScript/TypeScript property-based testing.

**Property Test Configuration**:
```javascript
// Each property test should run at least 100 iterations
fc.assert(
  fc.property(/* generators */, (/* inputs */) => {
    // Test logic
  }),
  { numRuns: 100 }
);
```

**Property Test Tags**: Each property test must include a comment tag referencing the design document property:

```javascript
// Feature: typing-speed-test, Property 1: Test start triggers on alphanumeric input
test('timer starts on any alphanumeric character', () => {
  fc.assert(
    fc.property(fc.char().filter(isAlphanumeric), (char) => {
      // Test implementation
    }),
    { numRuns: 100 }
  );
});
```

**Property Test Coverage**:

1. **Character validation** (Property 3): Generate random characters and expected characters, verify correct/incorrect display
2. **Backspace behavior** (Property 4, 5): Generate random input sequences with backspace operations
3. **Word matching** (Property 6, 7): Generate random typed words and expected words, verify counting logic
4. **Input clearing** (Property 8): Generate random word submissions, verify input is cleared
5. **Word progression** (Property 9): Generate random word sequences, verify index increments
6. **Space idempotence** (Property 10): Generate random sequences of space presses
7. **Calculation formulas** (Property 11, 12, 13): Generate random correct words, characters, and time values
8. **Skill level classification** (Property 14): Generate random WPM values across all ranges including boundaries
9. **Results display** (Property 15): Generate random test results, verify all fields present
10. **Word generation** (Property 16): Generate multiple word sequences, verify all from predefined list
11. **Randomization** (Property 17): Generate multiple test sessions, verify sequences differ
12. **Accessibility** (Property 18, 19, 20): Generate UI components, verify labels and keyboard support

**Generator Strategies**:

- **Alphanumeric characters**: Use character generators filtered to a-z, A-Z, 0-9
- **Word sequences**: Generate arrays of strings from predefined word list
- **Typed input**: Generate strings with intentional matches/mismatches to expected words
- **Time values**: Generate positive integers representing elapsed seconds
- **WPM values**: Generate integers across skill level boundaries (0-100+)
- **Edge cases**: Ensure generators include empty strings, zero values, boundary values

### Test Organization

```
tests/
├── unit/
│   ├── initialization.test.js
│   ├── timer.test.js
│   ├── input-handler.test.js
│   ├── word-provider.test.js
│   ├── result-calculator.test.js
│   └── ui-controller.test.js
├── property/
│   ├── character-validation.property.test.js
│   ├── word-submission.property.test.js
│   ├── calculations.property.test.js
│   ├── skill-level.property.test.js
│   └── accessibility.property.test.js
└── integration/
    ├── full-test-flow.test.js
    └── restart-flow.test.js
```

### Testing Balance

- Unit tests provide concrete examples and catch specific bugs
- Property tests verify general correctness across all inputs
- Together they provide comprehensive coverage without redundancy
- Avoid writing too many unit tests for scenarios covered by properties
- Focus unit tests on integration points and specific edge cases
- Let property tests handle the bulk of input variation coverage

### Continuous Integration

- All tests must pass before merging code
- Property tests run with fixed seed for reproducibility
- Failed property tests should output the failing example for debugging
- Test coverage target: 90% for core logic components
