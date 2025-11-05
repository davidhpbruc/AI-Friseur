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
-   **AI Engine**: Google Gemini API (`gemini-2.5-flash` for text/validation and `gemini-2.5-flash-image` for image generation).
-   **State Management**: Local component state via React Hooks and `localStorage` for on-device persistence of "takes".
