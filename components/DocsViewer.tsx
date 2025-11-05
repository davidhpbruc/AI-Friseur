import React, { useState } from 'react';

const docsContent = {
  overview: `
# AI Friseur

**Visualize your next hairstyle in seconds.**

## Overview

AI Friseur is a mobile-first, single-session application designed to provide users with a fun, effortless, and realistic way to visualize new hairstyles using the power of generative AI. Users can take a few photos of themselves, describe a style (or get a suggestion), and receive a multi-angle preview of their new look.

## Core Philosophy

The application is built on a set of user-centric principles:

-   **Effortless & Intelligent**: The app proactively guides the user with smart feedback to ensure a smooth experience and high-quality results.
-   **Privacy First (Stateless)**: There are no user accounts or databases. All photo processing happens within a single session, and the images are not stored long-term.
-   **Frictionless Experience**: The UI is designed to be simple and intuitive, with a clear, linear flow that's easy to navigate.

## Technology Stack

-   **Frontend**: React with TypeScript for a robust, component-based UI.
-   **Styling**: Tailwind CSS for rapid and consistent styling.
-   **AI Engine**: Google Gemini API (\`gemini-2.5-flash\` for text/validation and \`gemini-2.5-flash-image\` for image generation).
-   **State Management**: Local component state via React Hooks and \`localStorage\` for on-device persistence of "takes".
  `,
  architecture: `
# Architectural Decisions

This document outlines the key architectural decisions made for the AI Friseur application. The primary goal is to maintain simplicity and a great user experience while leveraging a powerful AI backend.

## Frontend Architecture

-   **Framework: React & TypeScript**
    -   **Why**: React's component-based model is ideal for building a modular and maintainable UI. TypeScript adds static typing, which helps prevent common errors and improves developer experience, especially as the application grows.

-   **Styling: Tailwind CSS**
    -   **Why**: Tailwind's utility-first approach allows for rapid prototyping and building custom designs without writing custom CSS. It ensures visual consistency and keeps styling co-located with the components.

-   **State Management: React Hooks & \`localStorage\`**
    -   **Why**: For the current scope of the application, a complex state management library (like Redux or Zustand) is unnecessary.
    -   \`useState\` and \`useCallback\` are sufficient for managing component-level and screen flow state.
    -   A custom \`useLocalStorage\` hook provides a simple mechanism for persisting the user's "takes" directly on their device, which aligns with our stateless, no-database philosophy.

## Backend & AI Integration

-   **Backend: Direct-to-API Model**
    -   **Why**: To simplify the MVP, the application communicates directly from the client to the Google Gemini API. This eliminates the need for a custom server-side backend, reducing development time, complexity, and maintenance overhead. This is a critical decision for a lean, single-purpose application.

-   **AI Model: Google Gemini**
    -   **Why**: The Gemini family of models provides the powerful, multi-modal capabilities required for this application.
    -   **\`gemini-2.5-flash-image\`**: Used for the core hairstyle generation. It's capable of high-quality image-to-image transformations.
    -   **\`gemini-2.5-flash\`**: Used for all text and analysis tasks, including:
        -   **Photo Validation**: Analyzing user photos for quality issues. Its JSON output mode is crucial for returning structured data (\`isValid\`, \`issue\`).
        -   **Style Suggestion**: Analyzing a user's photo to suggest a flattering hairstyle.

## Data Flow & State

-   **Stateless by Design**
    -   **Decision**: The application does not have user accounts or a central database. All user-provided data (photos, style descriptions) exists only for the duration of a single session.
    -   **Rationale**: This prioritizes user privacy and simplicity. Users can use the app immediately without the friction of signing up. It also dramatically simplifies the architecture.

-   **On-Device Persistence**
    -   **Decision**: The only piece of data that persists between sessions is the number of remaining "takes".
    -   **Rationale**: Using the browser's \`localStorage\` is a lightweight solution for this. We accept the trade-off that these takes are tied to a specific device and will be lost if the user clears their browser data or switches devices. For an MVP, this is an acceptable simplification over a fully-fledged account and credit system.
  `,
  roadmap: `
# Project Roadmap: AI Friseur

## 1. The Vision (What We Are Doing)

Our mission is to create an effortless, fun, and magical experience for users to try on new hairstyles. We aim to remove the fear and uncertainty associated with getting a new haircut by providing a realistic, multi-angle preview, empowering users to make confident style choices.

---

## 2. Minimum Viable Product (MVP) — Current Status

The MVP is focused on delivering the core value proposition: generating a high-quality hairstyle preview from user photos.

### What Works (MVP Features)

-   **✅ Welcome Screen**: Displays remaining "takes" and provides a clear starting point.
-   **✅ Multi-Step Photo Capture**: A guided, three-step process for capturing front, side, and back photos.
-   **✅ Smart Camera Guides**: Angle-specific silhouette overlays to help users position themselves correctly.
-   **✅ Intelligent Camera Defaults**: Automatically uses the selfie camera for front/side views and the rear camera for the back view.
-   **✅ AI-Powered Photo Validation**: Each photo is analyzed in real-time for common issues (blur, lighting, angle), with clear feedback provided to the user.
-   **✅ Multi-Modal Style Input**: Users can describe a style using:
    -   Text input
    -   Voice dictation (Speech-to-Text)
    -   An uploaded reference photo
    -   An AI-powered suggestion based on their photo.
-   **✅ Angle-Aware AI Generation**: The AI receives specific instructions for each view (front, side, back) to ensure the hairstyle is rendered correctly from every perspective.
-   **✅ Interactive Results Carousel**:
    -   A swipeable carousel to view all generated images.
    -   An interactive "Before & After" slider for each angle.
-   **✅ Save Photo Functionality**: Users can download the generated images to their device.
-   **✅ On-Device "Take" Management**: A simple, local counter for available previews.

---

## 3. Idea Inbox & Future Roadmap

This section serves as a backlog of potential features and improvements for future iterations.

### Short-Term Goals (Next Steps)

-   **In-App Purchases**: Integrate with native payment systems (e.g., Apple/Google Pay) to allow users to buy "take" packages.
-   **UI/UX Polish**: Refine animations, transitions, and overall visual appeal based on user feedback.
-   **Performance Optimization**: Investigate ways to speed up the AI generation and validation steps.
-   **Expanded Style Suggestions**: Provide a richer set of suggestions, perhaps with visual examples.

### Medium-Term Goals (The "Wow" Factor)

-   **Advanced Color Customization**: Re-introduce a robust color-changing feature on the results screen that doesn't consume an additional "take".
-   **Style Library**: Create a curated gallery of trending hairstyles that users can select to try on with a single tap.
-   **Video Previews**: Generate short, animated video clips (e.g., a 360-degree view) of the user with their new hairstyle.

### Long-Term Goals (The Vision)

-   **Live AR Preview**: Utilize augmented reality to superimpose hairstyles directly onto the user's live camera feed for a real-time try-on experience.
-   **Social Sharing**: Seamlessly integrate sharing functionality to post results to platforms like Instagram, Pinterest, and TikTok.
-   **Hairstylist/Salon Integration**: Partner with salons to allow users to find and book appointments with stylists who can create their desired look.
  `,
  user_flow: `
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
  `,
};

type DocKey = keyof typeof docsContent;

const docTabs: { key: DocKey, title: string }[] = [
    { key: 'overview', title: '1. Overview' },
    { key: 'architecture', title: '2. Architecture' },
    { key: 'roadmap', title: '3. Roadmap' },
    { key: 'user_flow', title: '4. User Flow' },
];

const DocsViewer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<DocKey>('overview');

  const renderContent = () => {
    const content = docsContent[activeTab];
    return content.split('\n').map((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('## ')) {
            return <h2 key={index} className="text-2xl font-bold mt-5 mb-2 text-gray-200">{trimmedLine.substring(3)}</h2>;
        }
        if (trimmedLine.startsWith('# ')) {
            return <h1 key={index} className="text-3xl font-bold mt-6 mb-3 text-purple-400">{trimmedLine.substring(2)}</h1>;
        }
        if (trimmedLine.startsWith('### ')) {
            return <h3 key={index} className="text-xl font-semibold mt-4 mb-1 text-gray-300">{trimmedLine.substring(4)}</h3>;
        }
        if (trimmedLine.startsWith('-   ')) {
            return <li key={index} className="ml-6 list-disc text-gray-300">{trimmedLine.substring(4)}</li>;
        }
        if (trimmedLine === '---') {
            return <hr key={index} className="my-6 border-gray-600" />;
        }
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
            return <p key={index} className="my-1 text-gray-200 font-bold">{trimmedLine.substring(2, trimmedLine.length - 2)}</p>;
        }
        return <p key={index} className="my-1 text-gray-400 leading-relaxed">{line || '\u00A0'}</p>;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <style>{`.animate-fade-in { animation: fadeIn 0.3s ease-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Project Documentation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </header>
        <div className="flex flex-grow overflow-hidden">
          <nav className="w-1/4 p-4 border-r border-gray-700 overflow-y-auto flex-shrink-0">
            <ul>
              {docTabs.map(tab => (
                <li key={tab.key}>
                  <button 
                    onClick={() => setActiveTab(tab.key)} 
                    className={`w-full text-left p-2 my-1 rounded-md text-sm ${activeTab === tab.key ? 'bg-purple-600 text-white font-bold' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    {tab.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <main className="w-3/4 p-6 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DocsViewer;
