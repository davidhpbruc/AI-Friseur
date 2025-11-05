# Application User Flow

This document details the step-by-step journey a user takes through the AI Friseur application.

---

**1. Welcome Screen**
-   **Action**: The user opens the app.
-   **UI**: The user sees the app title, a brief tagline, the number of "Previews Remaining," and a prominent "Start Your Preview" button.
-   **Outcome**: The user clicks "Start Your Preview" to begin the process.

**2. Photo 1: Front View**
-   **Action**: The user is presented with the camera interface.
-   **UI**: A live camera feed is shown with a front-profile silhouette guide. The header reads "Front View" with instructions.
-   **Action**: The user captures a photo.
-   **UI**: A loading spinner appears with the text "Analyzing photo...".
-   **System**: The photo is sent to the Gemini API for validation.
    -   **If Invalid**: The captured photo is displayed with a descriptive error message (e.g., "Image is too blurry"). The only option is "Retake Photo".
    -   **If Valid**: The captured photo is displayed with "Retake" and "Confirm & Next" buttons.
-   **Outcome**: The user confirms a valid photo to proceed.

**3. Photo 2: Angled View**
-   **Action**: The user is presented with the camera interface again.
-   **UI**: A live camera feed is shown with a three-quarter profile silhouette guide. A small thumbnail of the confirmed front photo is visible in the corner for context. The user can "Skip" this step.
-   **Action**: The user captures a photo.
-   **System**: The photo undergoes the same validation process as the front view.
-   **Outcome**: The user confirms a valid photo or skips to the next step.

**4. Photo 3: Back View**
-   **Action**: The user is presented with the camera interface.
-   **UI**: The camera defaults to the rear-facing ("environment") camera. A back-profile silhouette guide is shown, along with a thumbnail of the previous photo. The user can "Skip" this step. The prompt suggests asking a friend for help.
-   **Action**: The user captures a photo.
-   **System**: The photo undergoes validation.
-   **Outcome**: The user confirms a valid photo or skips to the next step.

**5. Describe Style Screen**
-   **Action**: The user is ready to specify their desired hairstyle.
-   **UI**: The screen provides multiple input methods:
    -   A text area for typing a description.
    -   A microphone button for voice input.
    -   An "Upload Style Photo" button for a visual reference.
    -   A "Suggest a Style For Me" button that triggers an AI suggestion.
-   **Outcome**: After providing input, the user clicks "Generate My Preview (Uses 1 Take)".

**6. Generating Screen**
-   **Action**: The app communicates with the Gemini API to generate the new hairstyle images.
-   **UI**: A full-screen loading indicator is displayed with reassuring messages. A 30-second timeout is active.
    -   **On Timeout/Error**: The user is returned to the "Describe Style" screen with an error message, and their "take" is refunded.

**7. Results Screen**
-   **Action**: The generated images are ready to be viewed.
-   **UI**:
    -   An interactive "Before & After" slider is shown, comparing the user's original photo with the generated one.
    -   If multiple photos were provided, the results are in a swipeable carousel.
    -   A "Save Photo" button is available for each result.
    -   The footer contains two buttons:
        1.  **"Try Another Style"**: Returns the user to the "Describe Style" screen (Step 5) with their current photos.
        2.  **"Finish"**: Ends the session and returns the user to the "Welcome Screen" (Step 1).
-   **Outcome**: The user reviews their new look, saves it, and decides whether to try another style or finish.
