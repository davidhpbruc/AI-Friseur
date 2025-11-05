# Architectural Decisions

This document outlines the key architectural decisions made for the AI Friseur application. The primary goal is to maintain simplicity and a great user experience while leveraging a powerful AI backend.

## Frontend Architecture

-   **Framework: React & TypeScript**
    -   **Why**: React's component-based model is ideal for building a modular and maintainable UI. TypeScript adds static typing, which helps prevent common errors and improves developer experience, especially as the application grows.

-   **Styling: Tailwind CSS**
    -   **Why**: Tailwind's utility-first approach allows for rapid prototyping and building custom designs without writing custom CSS. It ensures visual consistency and keeps styling co-located with the components.

-   **State Management: React Hooks & `localStorage`**
    -   **Why**: For the current scope of the application, a complex state management library (like Redux or Zustand) is unnecessary.
    -   `useState` and `useCallback` are sufficient for managing component-level and screen flow state.
    -   A custom `useLocalStorage` hook provides a simple mechanism for persisting the user's "takes" directly on their device, which aligns with our stateless, no-database philosophy.

## Backend & AI Integration

-   **Backend: Direct-to-API Model**
    -   **Why**: To simplify the MVP, the application communicates directly from the client to the Google Gemini API. This eliminates the need for a custom server-side backend, reducing development time, complexity, and maintenance overhead. This is a critical decision for a lean, single-purpose application.

-   **AI Model: Google Gemini**
    -   **Why**: The Gemini family of models provides the powerful, multi-modal capabilities required for this application.
    -   **`gemini-2.5-flash-image`**: Used for the core hairstyle generation. It's capable of high-quality image-to-image transformations.
    -   **`gemini-2.5-flash`**: Used for all text and analysis tasks, including:
        -   **Photo Validation**: Analyzing user photos for quality issues. Its JSON output mode is crucial for returning structured data (`isValid`, `issue`).
        -   **Style Suggestion**: Analyzing a user's photo to suggest a flattering hairstyle.

## Data Flow & State

-   **Stateless by Design**
    -   **Decision**: The application does not have user accounts or a central database. All user-provided data (photos, style descriptions) exists only for the duration of a single session.
    -   **Rationale**: This prioritizes user privacy and simplicity. Users can use the app immediately without the friction of signing up. It also dramatically simplifies the architecture.

-   **On-Device Persistence**
    -   **Decision**: The only piece of data that persists between sessions is the number of remaining "takes".
    -   **Rationale**: Using the browser's `localStorage` is a lightweight solution for this. We accept the trade-off that these takes are tied to a specific device and will be lost if the user clears their browser data or switches devices. For an MVP, this is an acceptable simplification over a fully-fledged account and credit system.
