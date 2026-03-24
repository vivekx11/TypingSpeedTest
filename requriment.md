# Requirements Document

## Introduction

This document specifies the requirements for a 60-second typing speed test web application. The application measures typing performance by displaying random English words that users type within a fixed time limit. Upon completion, the system calculates and displays performance metrics including words per minute (WPM), characters per minute (CPM), accuracy percentage, and skill level classification.

## Glossary

- **Typing_Test_Engine**: The core system component that manages test execution, word validation, and metric calculation
- **Timer_Component**: The countdown timer that tracks the 60-second test duration
- **Input_Handler**: The component that processes user keyboard input and validates typed characters
- **Result_Calculator**: The component that computes WPM, CPM, accuracy, and skill level
- **UI_Controller**: The component that manages display states and user interface updates
- **Word_Provider**: The component that generates and provides random English words for the test
- **Current_Word**: The word the user is actively typing
- **Completed_Word**: A word that has been submitted by pressing the space key
- **Test_Session**: A single 60-second typing test instance from start to completion
- **Skill_Level**: A classification of typing proficiency (Beginner, Intermediate, Advanced, Expert)

## Requirements

### Requirement 1: Test Initialization

**User Story:** As a user, I want to start the typing test immediately upon visiting the page, so that I can begin testing without unnecessary steps.

#### Acceptance Criteria

1. WHEN the application loads, THE UI_Controller SHALL display a 60-second timer in ready state
2. WHEN the application loads, THE Word_Provider SHALL generate a sequence of random English words
3. WHEN the application loads, THE UI_Controller SHALL display the word sequence with the first word highlighted
4. WHEN the application loads, THE UI_Controller SHALL display an empty input field with placeholder text "Start typing…"
5. WHEN the application loads, THE UI_Controller SHALL display initial statistics showing 0 WPM, 0 CPM, and 100% accuracy

### Requirement 2: Test Start Trigger

**User Story:** As a user, I want the timer to start automatically when I begin typing, so that I don't waste time clicking a start button.

#### Acceptance Criteria

1. WHEN the input field receives focus AND the user presses any alphanumeric key, THE Timer_Component SHALL start the 60-second countdown
2. WHEN the timer starts, THE Timer_Component SHALL decrement the displayed seconds every 1000 milliseconds
3. THE Typing_Test_Engine SHALL start a Test_Session only once per test instance

### Requirement 3: Character Input Processing

**User Story:** As a user, I want immediate visual feedback on my typing accuracy, so that I can see my mistakes as I type.

#### Acceptance Criteria

1. WHEN the user types a character that matches the expected character at the current position, THE Input_Handler SHALL display the character in green or black
2. WHEN the user types a character that does not match the expected character at the current position, THE Input_Handler SHALL display the character in red
3. WHEN the user presses the backspace key, THE Input_Handler SHALL remove the last character from the Current_Word input
4. THE Input_Handler SHALL restrict backspace functionality to the Current_Word only
5. THE Input_Handler SHALL prevent modification of Completed_Words

### Requirement 4: Word Submission

**User Story:** As a user, I want to submit words by pressing the space key, so that I can progress through the test naturally.

#### Acceptance Criteria

1. WHEN the user presses the space key, THE Typing_Test_Engine SHALL compare the typed input with the expected Current_Word
2. WHEN the typed input exactly matches the expected Current_Word, THE Typing_Test_Engine SHALL increment the correct word count by 1
3. WHEN the typed input does not exactly match the expected Current_Word, THE Typing_Test_Engine SHALL count the number of matching characters at identical positions
4. WHEN a word is submitted, THE UI_Controller SHALL clear the input field
5. WHEN a word is submitted, THE UI_Controller SHALL highlight the next word in the sequence as the new Current_Word
6. WHEN the user presses multiple consecutive space keys, THE Input_Handler SHALL ignore the extra space key presses

### Requirement 5: Real-Time Statistics Update

**User Story:** As a user, I want to see my performance statistics update in real-time, so that I can monitor my progress during the test.

#### Acceptance Criteria

1. WHEN a word is submitted, THE Result_Calculator SHALL recalculate words per minute based on correct words and elapsed time
2. WHEN a word is submitted, THE Result_Calculator SHALL recalculate characters per minute based on total correct characters and elapsed time
3. WHEN a word is submitted, THE Result_Calculator SHALL recalculate accuracy percentage as (correct characters / total typed characters) × 100
4. WHEN statistics are recalculated, THE UI_Controller SHALL update the displayed WPM, CPM, and accuracy values within 100 milliseconds

### Requirement 6: Test Completion

**User Story:** As a user, I want the test to stop automatically after 60 seconds, so that the test duration is consistent and fair.

#### Acceptance Criteria

1. WHEN the Timer_Component reaches 0 seconds, THE Typing_Test_Engine SHALL stop accepting input
2. WHEN the timer reaches 0 seconds, THE Timer_Component SHALL stop the countdown interval
3. WHEN the test stops, THE Input_Handler SHALL disable the input field
4. WHEN the test stops, THE UI_Controller SHALL display the result modal or result section

### Requirement 7: Final Results Calculation

**User Story:** As a user, I want to see my final typing performance metrics, so that I can understand how well I performed..

#### Acceptance Criteria

1. WHEN the test completes, THE Result_Calculator SHALL calculate final WPM as (correct words / 60 seconds) × 60
2. WHEN the test completes, THE Result_Calculator SHALL calculate final CPM as (total correct characters / 60 seconds) × 60
3. WHEN the test completes, THE Result_Calculator SHALL calculate final accuracy as (correct characters / total typed characters) × 100
4. WHEN the test completes, THE Result_Calculator SHALL determine Skill_Level based on final WPM
5. WHEN final WPM is less than 25, THE Result_Calculator SHALL assign Skill_Level as "Beginner"
6. WHEN final WPM is greater than or equal to 25 AND less than 45, THE Result_Calculator SHALL assign Skill_Level as "Intermediate"
7. WHEN final WPM is greater than or equal to 45 AND less than or equal to 70, THE Result_Calculator SHALL assign Skill_Level as "Advanced"
8. WHEN final WPM is greater than 70, THE Result_Calculator SHALL assign Skill_Level as "Expert"

### Requirement 8: Results Display

**User Story:** As a user, I want to see my results in a clear and prominent way, so that I can easily understand my performance.

#### Acceptance Criteria

1. WHEN the result modal displays, THE UI_Controller SHALL show the final WPM value
2. WHEN the result modal displays, THE UI_Controller SHALL show the final CPM value
3. WHEN the result modal displays, THE UI_Controller SHALL show the final accuracy percentage
4. WHEN the result modal displays, THE UI_Controller SHALL show the Skill_Level classification
5. WHEN the result modal displays, THE UI_Controller SHALL show a "Try again" button

### Requirement 9: Test Restart

**User Story:** As a user, I want to restart the test with a new word sequence, so that I can practice multiple times without refreshing the page.

#### Acceptance Criteria

1. WHEN the user clicks the "Try again" button, THE UI_Controller SHALL close the result modal
2. WHEN the user clicks the "Try again" button, THE Word_Provider SHALL generate a new sequence of random English words
3. WHEN the user clicks the "Try again" button, THE Timer_Component SHALL reset to 60 seconds
4. WHEN the user clicks the "Try again" button, THE Result_Calculator SHALL reset all statistics to initial values (0 WPM, 0 CPM, 100% accuracy)
5. WHEN the user clicks the "Try again" button, THE Input_Handler SHALL clear and enable the input field
6. WHEN the user clicks the "Try again" button, THE UI_Controller SHALL highlight the first word of the new sequence

### Requirement 10: Responsive Desktop Layout

**User Story:** As a desktop user, I want a clear and organized layout, so that I can focus on the typing test without distractions.

#### Acceptance Criteria

1. WHEN the application is viewed on a desktop viewport (width ≥ 768px), THE UI_Controller SHALL display a centered hero section with the title "Test your typing skills"
2. WHEN the application is viewed on a desktop viewport, THE UI_Controller SHALL display the timer prominently above the word display area
3. WHEN the application is viewed on a desktop viewport, THE UI_Controller SHALL display WPM, CPM, and accuracy statistics in a horizontal strip
4. WHEN the application is viewed on a desktop viewport, THE UI_Controller SHALL display the word sequence with adequate spacing for readability
5. WHEN the application is viewed on a desktop viewport, THE UI_Controller SHALL display the input field below the word sequence
6. WHEN the application is viewed on a desktop viewport, THE UI_Controller SHALL display footer links at the bottom of the page

### Requirement 11: Responsive Mobile Layout

**User Story:** As a mobile user, I want the interface to adapt to my smaller screen, so that I can use the typing test on my phone or tablet.

#### Acceptance Criteria

1. WHEN the application is viewed on a mobile viewport (width < 768px), THE UI_Controller SHALL stack the timer and statistics vertically
2. WHEN the application is viewed on a mobile viewport, THE UI_Controller SHALL display the word sequence above the virtual keyboard area
3. WHEN the application is viewed on a mobile viewport, THE UI_Controller SHALL ensure the input field is visible when the virtual keyboard appears
4. WHEN the application is viewed on a mobile viewport, THE UI_Controller SHALL maintain touch-friendly spacing for all interactive elements

### Requirement 12: Accessibility Compliance

**User Story:** As a user with accessibility needs, I want to use the typing test with assistive technologies, so that I can participate regardless of my abilities.

#### Acceptance Criteria

1. THE UI_Controller SHALL provide descriptive labels for all form inputs
2. THE UI_Controller SHALL maintain a color contrast ratio of at least 4.5:1 for all text elements
3. THE Input_Handler SHALL support keyboard-only navigation for all interactive elements
4. THE UI_Controller SHALL provide ARIA labels for dynamic content updates
5. THE UI_Controller SHALL ensure focus indicators are visible on all focusable elements

### Requirement 13: Performance Requirements

**User Story:** As a user on a low-end device, I want the application to load and run smoothly, so that my device limitations don't affect my test results.

#### Acceptance Criteria

1. WHEN the application loads, THE UI_Controller SHALL render the initial view within 2 seconds on a 3G connection
2. WHILE the test is running, THE Typing_Test_Engine SHALL process each keystroke within 50 milliseconds
3. WHILE the test is running, THE UI_Controller SHALL update visual feedback within 100 milliseconds of user input
4. THE Typing_Test_Engine SHALL maintain consistent performance on devices with 2GB RAM or more

### Requirement 14: Word Generation

**User Story:** As a user, I want to type common English words, so that the test reflects realistic typing scenarios.

#### Acceptance Criteria

1. THE Word_Provider SHALL generate words from a predefined list of common English words
2. THE Word_Provider SHALL provide sufficient words to fill at least 90 seconds of typing at 100 WPM
3. THE Word_Provider SHALL randomize word order for each Test_Session
4. THE Word_Provider SHALL exclude profanity and offensive terms from the word list

### Requirement 15: No Authentication Required

**User Story:** As a casual user, I want to use the typing test immediately without creating an account, so that I can test my typing speed quickly.

#### Acceptance Criteria

1. THE Typing_Test_Engine SHALL allow users to complete a Test_Session without authentication
2. THE UI_Controller SHALL not display login or signup prompts during the test experience
3. THE Typing_Test_Engine SHALL function fully without requiring user registration
4. 
