# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NextFlix is a personal movie and TV show tracking application built with React and Vite. It allows users to:
- Search for movies and TV shows (using mock TMDB API data)
- Track watched content with ratings (love, like, dislike)
- Filter and sort personal collections
- View detailed information about tracked items

## Architecture

This is a Vite React application with the main component in `src/App.jsx`:

- **Main Component**: `NextFlix` - The root component managing all state and UI
- **Sub-components** (defined within App.jsx):
  - `ThumbsRating` - Custom rating system with thumbs up/down and "love" ratings
  - `MovieCard` - Display component for tracked items in the collection
  - `SearchResultCard` - Display component for search results
  - `DetailModal` - Full-screen modal for viewing detailed item information

## Tech Stack

- **Frontend**: React 19.1.1 with Vite 7.1.2
- **Styling**: Tailwind CSS 4.1.12
- **Icons**: Lucide React 0.542.0
- **Build Tool**: Vite with React plugin
- **Code Quality**: ESLint with React plugins

## State Management

Uses React's built-in `useState` hooks for:
- `watchedItems` - Array of tracked movies/shows stored in localStorage
- `searchTerm` - Current search query with debounced search
- `searchResults` - Results from mock TMDB API calls
- `filterType` - Filter by 'all', 'movie', or 'series'
- `sortBy` - Sort by 'dateWatched', 'title', 'year', or 'rating'

## Data Persistence

- All data is stored in browser localStorage under key 'nextflix-data'
- No external database or API integration (uses mock data)

## Key Features

- **Mock TMDB Integration**: Uses placeholder TMDB API calls with demo data
- **Rating System**: Three-tier rating (love = double thumbs up, like = thumbs up, dislike = thumbs down)
- **Search**: Debounced search with 500ms delay
- **Responsive Design**: Netflix-style dark UI with grid layouts and hover effects
- **Local Storage**: Automatic persistence of user's tracked content
- **Statistics**: Real-time stats showing total watched items, movies, series, and ratings

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Development Notes

- Uses Lucide React icons throughout
- TailwindCSS for styling with dark theme
- Fully configured Vite build process
- TMDB_API_KEY is set to 'demo_key' (placeholder value)
- LocalStorage key changed from 'flexflix-data' to 'nextflix-data'