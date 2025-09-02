import React, { useState, useEffect } from 'react';
import { Search, Eye, ThumbsUp, ThumbsDown, Star, X, RotateCcw, Award, Grid, List, Shield, ChevronUp, Download } from 'lucide-react';

const NextFlix = () => {
  const [watchedItems, setWatchedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('dateWatched');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [collectionSearchTerm, setCollectionSearchTerm] = useState('');
  const [contentFilterEnabled, setContentFilterEnabled] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // TMDB API configuration
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'demo_key';
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const TMDB_IMAGE_BASE_URL_HIRES = 'https://image.tmdb.org/t/p/w1280';

  // TMDB Genre mappings
  const movieGenres = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
  };

  const tvGenres = {
    10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary',
    18: 'Drama', 10751: 'Family', 10762: 'Kids', 9648: 'Mystery', 10763: 'News',
    10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk',
    10768: 'War & Politics', 37: 'Western'
  };

  // Helper function to convert genre IDs to names
  const getGenreNames = (genreIds, mediaType) => {
    if (!genreIds || !Array.isArray(genreIds)) return [];
    const genreMap = mediaType === 'tv' ? tvGenres : movieGenres;
    return genreIds.map(id => genreMap[id]).filter(Boolean);
  };

  // Content filtering keywords - only explicit adult content, not mainstream movies
  const adultContentKeywords = [
    'xxx', 'porn', 'pornographic', 'hardcore', 'adult film', 'adult movie',
    'playboy', 'hustler', 'penthouse', 'strip club', 'brothel',
    'fetish film', 'amateur adult', 'explicit sex'
  ];

  // Content filter function
  const isContentAppropriate = (item) => {
    if (!contentFilterEnabled) return true;
    
    const title = (item.title || item.name || '').toLowerCase();
    const overview = (item.overview || '').toLowerCase();
    
    // Check for inappropriate keywords in title and overview
    const containsAdultKeywords = adultContentKeywords.some(keyword => 
      title.includes(keyword.toLowerCase()) || overview.includes(keyword.toLowerCase())
    );
    
    // Only filter content that's explicitly adult/pornographic
    return !containsAdultKeywords;
  };

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nextflix-data');
    if (saved) {
      setWatchedItems(JSON.parse(saved));
    }
    
    const savedFilter = localStorage.getItem('nextflix-content-filter');
    if (savedFilter !== null) {
      setContentFilterEnabled(JSON.parse(savedFilter));
    }
    
    const savedLastUpdated = localStorage.getItem('nextflix-last-updated');
    if (savedLastUpdated) {
      setLastUpdated(savedLastUpdated);
    }
    
    setIsInitialized(true);
  }, []);

  // Save to localStorage (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('nextflix-data', JSON.stringify(watchedItems));
      // Don't update lastUpdated here - only update when items are added
    }
  }, [watchedItems, isInitialized]);

  // Save content filter setting
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('nextflix-content-filter', JSON.stringify(contentFilterEnabled));
    }
  }, [contentFilterEnabled, isInitialized]);

  // Update existing items with genre and director information if missing
  useEffect(() => {
    if (isInitialized && watchedItems.length > 0) {
      const itemsNeedingUpdate = watchedItems.filter(item => 
        (!item.genres || item.genres.length === 0) || !item.director || (!item.cast || item.cast.length === 0)
      );
      if (itemsNeedingUpdate.length > 0) {
        const updatedItems = watchedItems.map(item => {
          let updatedItem = { ...item };
          
          // Add genres if missing
          if (!item.genres || item.genres.length === 0) {
            let defaultGenres = [];
            const title = item.title.toLowerCase();
            const overview = (item.overview || '').toLowerCase();
            
            // Basic genre detection based on keywords
            if (title.includes('horror') || overview.includes('horror') || overview.includes('scary')) defaultGenres.push('Horror');
            if (title.includes('comedy') || overview.includes('comedy') || overview.includes('funny')) defaultGenres.push('Comedy');
            if (title.includes('action') || overview.includes('action') || overview.includes('adventure')) defaultGenres.push('Action');
            if (title.includes('drama') || overview.includes('drama') || overview.includes('emotional')) defaultGenres.push('Drama');
            if (title.includes('romance') || overview.includes('romance') || overview.includes('love')) defaultGenres.push('Romance');
            if (title.includes('thriller') || overview.includes('thriller') || overview.includes('suspense')) defaultGenres.push('Thriller');
            if (title.includes('sci-fi') || title.includes('science fiction') || overview.includes('future') || overview.includes('space')) defaultGenres.push('Science Fiction');
            if (title.includes('fantasy') || overview.includes('fantasy') || overview.includes('magic')) defaultGenres.push('Fantasy');
            
            updatedItem.genres = defaultGenres.length > 0 ? defaultGenres : ['Drama'];
          }

          // Add cast if missing
          if (!item.cast || item.cast.length === 0) {
            const title = item.title.toLowerCase();
            let defaultCast = [];
            
            // Basic cast detection for well-known movies/shows
            if (title.includes('inception')) defaultCast = ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy', 'Elliot Page'];
            else if (title.includes('avengers') || title.includes('endgame')) defaultCast = ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth', 'Scarlett Johansson', 'Jeremy Renner'];
            else if (title.includes('stranger things')) defaultCast = ['Millie Bobby Brown', 'Finn Wolfhard', 'Gaten Matarazzo', 'Caleb McLaughlin', 'Noah Schnapp'];
            else if (title.includes('dark knight')) defaultCast = ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'];
            else if (title.includes('pulp fiction')) defaultCast = ['John Travolta', 'Samuel L. Jackson', 'Uma Thurman', 'Bruce Willis'];
            else if (title.includes('iron man')) defaultCast = ['Robert Downey Jr.', 'Gwyneth Paltrow', 'Jeff Bridges', 'Terrence Howard'];
            else defaultCast = ['Various Actors'];
            
            updatedItem.cast = defaultCast;
          }

          // Add director if missing
          if (!item.director) {
            const title = item.title.toLowerCase();
            let defaultDirector = '';
            
            // Basic director detection for well-known movies/shows
            if (title.includes('inception') || title.includes('interstellar') || title.includes('dark knight')) defaultDirector = 'Christopher Nolan';
            else if (title.includes('avengers') || title.includes('endgame') || title.includes('infinity war')) defaultDirector = 'Russo Brothers';
            else if (title.includes('stranger things')) defaultDirector = 'The Duffer Brothers';
            else if (title.includes('pulp fiction') || title.includes('kill bill') || title.includes('django')) defaultDirector = 'Quentin Tarantino';
            else if (title.includes('star wars') && (title.includes('new hope') || title.includes('empire') || title.includes('return'))) defaultDirector = 'George Lucas';
            else if (title.includes('lord of the rings') || title.includes('hobbit')) defaultDirector = 'Peter Jackson';
            else if (title.includes('marvel') || title.includes('spider-man') || title.includes('iron man')) defaultDirector = 'Marvel Studios';
            else if (item.type === 'series') defaultDirector = 'Various Directors';
            else defaultDirector = 'Various Directors';
            
            updatedItem.director = defaultDirector;
          }
          
          return updatedItem;
        });
        setWatchedItems(updatedItems);
      }
    }
  }, [isInitialized]); // Only run once when initialized

  // Back to top functionality
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Export functions
  const exportToCSV = () => {
    if (watchedItems.length === 0) {
      alert('No items to export');
      return;
    }

    const headers = ['Title', 'Type', 'Rating', 'TMDB Rating', 'Release Date', 'Date Watched', 'Director', 'Cast', 'Genres', 'Overview'];
    const csvData = watchedItems.map(item => [
      `"${item.title}"`,
      item.type,
      item.rating || 'Not rated',
      item.tmdbRating || 'N/A',
      item.releaseDate || 'N/A',
      item.dateWatched || 'N/A',
      `"${item.director || 'N/A'}"`,
      `"${(item.cast || []).join(', ')}"`,
      `"${(item.genres || []).join(', ')}"`,
      `"${(item.overview || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `nextflix-collection-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (watchedItems.length === 0) {
      alert('No items to export');
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalItems: watchedItems.length,
      collection: watchedItems
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `nextflix-collection-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToTXT = () => {
    if (watchedItems.length === 0) {
      alert('No items to export');
      return;
    }

    const textContent = watchedItems.map(item => {
      const rating = item.rating === 'love' ? '❤️' : item.rating === 'up' ? '👍' : item.rating === 'down' ? '👎' : '⚪';
      return `${rating} ${item.title} (${item.type}) - ${item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'Unknown'} - Watched: ${item.dateWatched}`;
    }).join('\n');

    const fullContent = `NextFlix Collection Export\nExported: ${new Date().toLocaleDateString()}\nTotal Items: ${watchedItems.length}\n\n${textContent}`;

    const blob = new Blob([fullContent], { type: 'text/plain' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `nextflix-collection-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // TMDB search function
  const searchTMDB = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    if (TMDB_API_KEY === 'demo_key' || TMDB_API_KEY === 'your_api_key_here') {
      // Fallback to mock data if no API key
      setIsSearching(true);
      try {
        // Enhanced mock database with more specific matches
        const mockDatabase = [
          // Blood-related titles
          { title: 'True Blood', media_type: 'tv', year: '2008', genre_ids: [18, 14], director: 'Alan Ball', cast: ['Anna Paquin', 'Stephen Moyer', 'Sam Trammell'] },
          { title: 'Blood Diamond', media_type: 'movie', year: '2006', genre_ids: [18, 53], director: 'Edward Zwick', cast: ['Leonardo DiCaprio', 'Jennifer Connelly', 'Djimon Hounsou'] },
          { title: 'There Will Be Blood', media_type: 'movie', year: '2007', genre_ids: [18], director: 'Paul Thomas Anderson', cast: ['Daniel Day-Lewis', 'Paul Dano'] },
          { title: 'Blood Simple', media_type: 'movie', year: '1984', genre_ids: [80, 53], director: 'Coen Brothers', cast: ['John Getz', 'Frances McDormand', 'Dan Hedaya'] },
          { title: 'Blood Brothers', media_type: 'movie', year: '2018', genre_ids: [18, 80], director: 'John Pogue', cast: ['Ryan Kwanten', 'Jacinda Barrett', 'Joe Egender'] },
          { title: 'In Blood We Trust', media_type: 'movie', year: '2018', genre_ids: [27, 53], director: 'Demo Director', cast: ['Actor A', 'Actor B'] },
          // Batman titles
          { title: 'The Dark Knight', media_type: 'movie', year: '2008', genre_ids: [28, 80], director: 'Christopher Nolan', cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'] },
          { title: 'Batman Begins', media_type: 'movie', year: '2005', genre_ids: [28, 80], director: 'Christopher Nolan', cast: ['Christian Bale', 'Michael Caine', 'Liam Neeson'] },
          { title: 'The Batman', media_type: 'movie', year: '2022', genre_ids: [28, 80], director: 'Matt Reeves', cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano'] },
          // Other popular titles
          { title: 'Inception', media_type: 'movie', year: '2010', genre_ids: [28, 878], director: 'Christopher Nolan', cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy'] },
          { title: 'Stranger Things', media_type: 'tv', year: '2016', genre_ids: [18, 14], director: 'The Duffer Brothers', cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'David Harbour'] }
        ];

        // Find matching titles
        const matchingTitles = mockDatabase.filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase())
        );

        const mockResults = matchingTitles.length > 0 ? matchingTitles.map(item => ({
          id: Math.random(),
          title: item.title,
          name: item.media_type === 'tv' ? item.title : undefined,
          media_type: item.media_type,
          poster_path: '/path-to-poster.jpg',
          backdrop_path: '/path-to-backdrop.jpg',
          overview: `${item.title} is a compelling ${item.media_type === 'tv' ? 'TV series' : 'movie'} from ${item.year}. A gripping story with incredible performances and stunning visuals.`,
          release_date: `${item.year}-01-01`,
          first_air_date: `${item.year}-01-01`,
          vote_average: Math.random() * 3 + 7, // Random rating between 7-10
          genre_ids: item.genre_ids,
          cast: item.cast,
          director: item.director
        })) : [
          // Fallback generic results if no specific matches
          {
            id: Math.random(),
            title: `${query} Movie`,
            media_type: 'movie',
            poster_path: '/path-to-poster.jpg',
            backdrop_path: '/path-to-backdrop.jpg',
            overview: `A compelling movie about ${query}. A gripping story with incredible performances.`,
            release_date: '2023-01-01',
            vote_average: 7.5,
            genre_ids: [28, 18],
            cast: ['Actor A', 'Actor B', 'Actor C'],
            director: 'Demo Director'
          }
        ];
        const filteredMockResults = mockResults
          .filter(item => isContentAppropriate(item))
          .map(item => ({
            ...item,
            genres: getGenreNames(item.genre_ids, item.media_type),
            cast: item.cast || [],
            director: item.director || ''
          }));
        console.log('Mock search results with cast/director:', filteredMockResults);
        setSearchResults(filteredMockResults);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
      return;
    }

    setIsSearching(true);
    try {
      // Search multiple pages to get more comprehensive results
      const [page1Response, page2Response] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`),
        fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=2&include_adult=false`)
      ]);
      
      if (!page1Response.ok) {
        throw new Error(`HTTP error! status: ${page1Response.status}`);
      }
      
      const [page1Data, page2Data] = await Promise.all([
        page1Response.json(),
        page2Response.ok ? page2Response.json() : { results: [] }
      ]);
      
      // Combine results from both pages
      const allResults = [...page1Data.results, ...page2Data.results];
      const data = { results: allResults };
      
      // Filter and enhance results
      const filteredResults = data.results
        .filter(item => 
          (item.media_type === 'movie' || item.media_type === 'tv') &&
          item.vote_average > 0 &&
          (item.poster_path || item.backdrop_path) &&
          item.poster_path !== null &&
          item.poster_path !== '' &&
          isContentAppropriate(item)
        );

      // Fetch cast and crew for each result (limit to first 10 for performance)
      const enhancedResults = await Promise.all(
        filteredResults.slice(0, 10).map(async (item) => {
          const castAndCrew = await fetchCastAndCrew(item.id, item.media_type);
          return {
            ...item,
            cast: castAndCrew?.cast || [],
            director: castAndCrew?.director || '',
            genres: getGenreNames(item.genre_ids, item.media_type)
          };
        })
      );

      // Add remaining results without cast/crew data
      if (filteredResults.length > 10) {
        const remainingResults = filteredResults.slice(10).map(item => ({
          ...item,
          cast: [],
          director: '',
          genres: getGenreNames(item.genre_ids, item.media_type)
        }));
        enhancedResults.push(...remainingResults);
      }
      
      setSearchResults(enhancedResults);
    } catch (error) {
      console.error('TMDB API error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchTMDB(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch cast and crew details from TMDB
  const fetchCastAndCrew = async (itemId, mediaType) => {
    if (TMDB_API_KEY === 'demo_key' || TMDB_API_KEY === 'your_api_key_here') {
      return null; // Skip API call for demo mode
    }

    try {
      const endpoint = mediaType === 'tv' ? 'tv' : 'movie';
      const response = await fetch(
        `${TMDB_BASE_URL}/${endpoint}/${itemId}/credits?api_key=${TMDB_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract cast (top 10 actors)
      const cast = data.cast ? data.cast.slice(0, 10).map(person => person.name) : [];
      
      // Extract director from crew
      let director = '';
      if (data.crew) {
        const directors = data.crew.filter(person => 
          person.job === 'Director' || 
          (mediaType === 'tv' && (person.job === 'Creator' || person.job === 'Executive Producer'))
        );
        director = directors.length > 0 ? directors[0].name : '';
        
        // For TV shows, if multiple creators/directors, join them
        if (mediaType === 'tv' && directors.length > 1) {
          director = directors.slice(0, 2).map(d => d.name).join(', ');
        }
      }
      
      return { cast, director };
    } catch (error) {
      console.error('Error fetching cast and crew:', error);
      return null;
    }
  };

  const addToWatchlist = (tmdbItem, rating = null) => {
    const mediaType = tmdbItem.media_type === 'tv' ? 'series' : 'movie';
    const now = new Date().toISOString();
    const newItem = {
      id: Date.now(),
      tmdb_id: tmdbItem.id,
      title: tmdbItem.title || tmdbItem.name,
      type: mediaType,
      poster: tmdbItem.poster_path,
      backdrop: tmdbItem.backdrop_path,
      overview: tmdbItem.overview,
      releaseDate: tmdbItem.release_date || tmdbItem.first_air_date,
      rating: rating,
      dateWatched: new Date().toISOString().split('T')[0],
      tmdbRating: tmdbItem.vote_average,
      cast: tmdbItem.cast || [],
      director: tmdbItem.director || '',
      genres: tmdbItem.genres || getGenreNames(tmdbItem.genre_ids, tmdbItem.media_type)
    };

    setWatchedItems([newItem, ...watchedItems]);
    
    // Update last updated timestamp only when adding new items
    setLastUpdated(now);
    localStorage.setItem('nextflix-last-updated', now);
  };

  const updateRating = (id, rating) => {
    setWatchedItems(items =>
      items.map(item =>
        item.id === id ? { ...item, rating } : item
      )
    );
  };

  const deleteItem = (id) => {
    setWatchedItems(items => items.filter(item => item.id !== id));
  };

  const resetSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedItem(null);
  };

  const resetCollectionFilters = () => {
    setFilterType('all');
    setFilterRating('all');
    setSortBy('dateWatched');
    setCollectionSearchTerm('');
    setSelectedItem(null);
  };

  const filteredAndSortedItems = watchedItems
    .filter(item => {
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesRating = filterRating === 'all' || item.rating === filterRating;
      const matchesSearch = collectionSearchTerm === '' || 
        item.title.toLowerCase().includes(collectionSearchTerm.toLowerCase()) ||
        (item.overview && item.overview.toLowerCase().includes(collectionSearchTerm.toLowerCase())) ||
        (item.cast && item.cast.some(actor => actor.toLowerCase().includes(collectionSearchTerm.toLowerCase()))) ||
        (item.genres && item.genres.some(genre => genre.toLowerCase().includes(collectionSearchTerm.toLowerCase())));
      const isAppropriate = isContentAppropriate(item);
      return matchesType && matchesRating && matchesSearch && isAppropriate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'year':
          return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
        case 'rating':
          return (b.tmdbRating || 0) - (a.tmdbRating || 0); // Higher TMDB rating first
        case 'dateWatched':
        default:
          return new Date(b.dateWatched) - new Date(a.dateWatched);
      }
    });


  const MovieListItem = ({ item }) => {
    return (
      <div 
        className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer border border-gray-800"
        onClick={() => setSelectedItem(item)}
      >
        <div className="flex items-center gap-4">
          {/* Poster */}
          <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-800">
            {item.backdrop || item.poster ? (
              <img
                src={`${TMDB_IMAGE_BASE_URL}${item.poster || item.backdrop}`}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full bg-gray-800 flex items-center justify-center" style={{ display: (item.backdrop || item.poster) ? 'none' : 'flex' }}>
              <Eye className="w-6 h-6 text-gray-600" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg truncate">{item.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    item.type === 'series' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {item.type === 'series' ? 'TV SERIES' : 'MOVIE'}
                  </span>
                  {item.tmdbRating && (
                    <span className="flex items-center gap-1 text-sm text-gray-300">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {item.tmdbRating.toFixed(1)}
                    </span>
                  )}
                  {item.releaseDate && (
                    <span className="text-sm text-gray-400">
                      {new Date(item.releaseDate).getFullYear()}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-2 line-clamp-2">{item.overview}</p>
              </div>

              {/* Rating Buttons */}
              <div className="flex gap-1 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateRating(item.id, item.rating === 'love' ? null : 'love');
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    item.rating === 'love'
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-transparent border border-white text-white hover:bg-purple-600 hover:border-purple-600'
                  }`}
                  title="Love this!"
                >
                  <Award className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateRating(item.id, item.rating === 'up' ? null : 'up');
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    item.rating === 'up'
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-transparent border border-white text-white hover:bg-green-600 hover:border-green-600'
                  }`}
                  title="I like it"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateRating(item.id, item.rating === 'down' ? null : 'down');
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    item.rating === 'down'
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-transparent border border-white text-white hover:bg-red-600 hover:border-red-600'
                  }`}
                  title="Not for me"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MovieCard = ({ item, isHero = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div 
        className={`group relative cursor-pointer transition-all duration-300 ${
          isHero ? 'w-full h-96' : 'w-full h-72 hover:scale-105 hover:z-10'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setSelectedItem(item)}
      >
        {/* Backdrop/Poster */}
        <div className={`relative overflow-hidden rounded-lg ${isHero ? 'h-full' : 'h-full'} bg-gradient-to-t from-black/80 to-transparent`}>
          {item.backdrop || item.poster ? (
            <img
              src={`${TMDB_IMAGE_BASE_URL}${item.poster || item.backdrop}`}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center" style={{ display: (item.backdrop || item.poster) ? 'none' : 'flex' }}>
            <Eye className="w-12 h-12 text-gray-600" />
          </div>
          
          {/* Always visible type label */}
          <span className={`absolute top-2 left-2 text-xs px-2 py-1 rounded font-semibold ${
            item.type === 'series' 
              ? 'bg-orange-600 text-white' 
              : 'bg-blue-600 text-white'
          }`}>
            {item.type === 'series' ? 'TV SERIES' : 'MOVIE'}
          </span>
          
          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{item.title}</h3>
              {!isHero && (
                <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                  {item.tmdbRating && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {item.tmdbRating.toFixed(1)}
                    </span>
                  )}
                </div>
              )}
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateRating(item.id, item.rating === 'love' ? null : 'love');
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    item.rating === 'love'
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-transparent border border-white text-white hover:bg-purple-600 hover:border-purple-600'
                  }`}
                  title="Love this!"
                >
                  <Award className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateRating(item.id, item.rating === 'up' ? null : 'up');
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    item.rating === 'up'
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-transparent border border-white text-white hover:bg-green-600 hover:border-green-600'
                  }`}
                  title="I like it"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateRating(item.id, item.rating === 'down' ? null : 'down');
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    item.rating === 'down'
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-transparent border border-white text-white hover:bg-red-600 hover:border-red-600'
                  }`}
                  title="Not for me"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rating indicator */}
        {item.rating && (
          <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
            item.rating === 'love' ? 'bg-purple-600' : 
            item.rating === 'up' ? 'bg-green-600' : 
            'bg-red-600'
          }`}>
            {item.rating === 'love' ? (
              <Award className="w-3 h-3 text-white" />
            ) : item.rating === 'up' ? (
              <ThumbsUp className="w-3 h-3 text-white" />
            ) : (
              <ThumbsDown className="w-3 h-3 text-white" />
            )}
          </div>
        )}
      </div>
    );
  };

  const SearchResultCard = ({ item }) => {
    // Check if this item is already in the user's collection
    // Only match by TMDB ID to ensure exact matches, not by title which can be ambiguous
    const existingItem = watchedItems.find(watchedItem => 
      watchedItem.tmdb_id === item.id
    );
    
    return (
    <div 
      className="group relative w-full h-72 cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
      onClick={() => setSelectedItem({
        ...item,
        tmdb_id: item.id, // Ensure tmdb_id is set for proper matching
        title: item.title || item.name,
        type: item.media_type === 'tv' ? 'series' : 'movie',
        poster: item.poster_path,
        backdrop: item.backdrop_path,
        overview: item.overview,
        releaseDate: item.release_date || item.first_air_date,
        tmdbRating: item.vote_average,
        cast: item.cast || [],
        director: item.director || '',
        genres: item.genres || [],
        dateWatched: null // Search results don't have a watch date
      })}
    >
      <div className="relative overflow-hidden rounded-lg h-full bg-gradient-to-r from-black/80 to-transparent">
        {item.poster_path || item.backdrop_path ? (
          <img
            src={`${TMDB_IMAGE_BASE_URL}${item.poster_path || item.backdrop_path}`}
            alt={item.title || item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="w-full h-full bg-gray-800 flex items-center justify-center" style={{ display: (item.poster_path || item.backdrop_path) ? 'none' : 'flex' }}>
          <Eye className="w-8 h-8 text-gray-500" />
        </div>
        <span className={`absolute top-2 left-2 text-xs px-2 py-1 rounded font-semibold ${
          item.media_type === 'tv' 
            ? 'bg-orange-600 text-white' 
            : 'bg-blue-600 text-white'
        }`}>
          {item.media_type === 'tv' ? 'TV SERIES' : 'MOVIE'}
        </span>
        
        {/* Always visible gradient for title, info, and rating buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent">
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{item.title || item.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
              {item.vote_average && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {item.vote_average.toFixed(1)}
                </span>
              )}
              {(item.release_date || item.first_air_date) && (
                <span>{new Date(item.release_date || item.first_air_date).getFullYear()}</span>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (existingItem) {
                    updateRating(existingItem.id, existingItem.rating === 'love' ? null : 'love');
                  } else {
                    addToWatchlist(item, 'love');
                  }
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  existingItem?.rating === 'love'
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-transparent border border-white text-white hover:bg-purple-600 hover:border-purple-600'
                }`}
                title="Love this!"
              >
                <Award className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (existingItem) {
                    updateRating(existingItem.id, existingItem.rating === 'up' ? null : 'up');
                  } else {
                    addToWatchlist(item, 'up');
                  }
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  existingItem?.rating === 'up'
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-transparent border border-white text-white hover:bg-green-600 hover:border-green-600'
                }`}
                title="I like it"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (existingItem) {
                    updateRating(existingItem.id, existingItem.rating === 'down' ? null : 'down');
                  } else {
                    addToWatchlist(item, 'down');
                  }
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  existingItem?.rating === 'down'
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-transparent border border-white text-white hover:bg-red-600 hover:border-red-600'
                }`}
                title="Not for me"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const DetailModal = ({ item, onClose }) => {
    if (!item) return null;
    
    console.log('DetailModal received item:', item);
    console.log('Item cast:', item.cast);
    console.log('Item director:', item.director);
    
    // Prevent background scrolling when modal is open
    React.useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, []);
    
    // Check if this item is already in the user's collection
    // Use unique IDs for exact matching, avoid title-based matching to prevent cross-contamination
    const existingItem = watchedItems.find(watchedItem => 
      watchedItem.tmdb_id === item.tmdb_id || 
      watchedItem.id === item.id
    );

    return (
      <div 
        className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div 
          className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with backdrop */}
          <div className="relative h-80 overflow-hidden rounded-t-lg">
            {item.backdrop ? (
              <img
                src={`${TMDB_IMAGE_BASE_URL_HIRES}${item.backdrop}`}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center" style={{ display: item.backdrop ? 'none' : 'flex' }}>
              <Eye className="w-20 h-20 text-gray-600" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-black/50 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="absolute bottom-6 left-6">
              <h1 className="text-4xl font-bold text-white mb-2">{item.title}</h1>
              <div className="flex items-center gap-4 text-gray-300 mb-4">
                {item.tmdbRating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    {item.tmdbRating.toFixed(1)}
                  </span>
                )}
                {item.releaseDate && (
                  <span>{new Date(item.releaseDate).getFullYear()}</span>
                )}
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  item.type === 'series' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-blue-600 text-white'
                }`}>
                  {item.type === 'series' ? 'TV SERIES' : 'MOVIE'}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <p className="text-gray-300 text-lg mb-6 leading-relaxed line-clamp-5">{item.overview}</p>
                
                {/* Director */}
                <div className="mb-6">
                  <h3 className="text-white text-xl font-semibold mb-3">{item.type === 'series' ? 'Creator/Director' : 'Director'}</h3>
                  {item.director ? (
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                        {item.director}
                      </span>
                    </div>
                  ) : (
                    <span className="bg-gray-600 px-3 py-1 rounded-full text-gray-400">
                      Information not available
                    </span>
                  )}
                </div>

                {/* Cast */}
                <div className="mb-6">
                  <h3 className="text-white text-xl font-semibold mb-3">Cast</h3>
                  {item.cast && item.cast.length > 0 ? (
                    <div className="flex flex-wrap gap-2 overflow-hidden" style={{maxHeight: '4.5rem'}}>
                      {item.cast.slice(0, 6).map((actor, index) => (
                        <span key={index} className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                          {actor}
                        </span>
                      ))}
                      {item.cast.length > 6 && (
                        <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-400">
                          +{item.cast.length - 6} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="bg-gray-600 px-3 py-1 rounded-full text-gray-400">
                      Information not available
                    </span>
                  )}
                </div>

                {/* Genres */}
                {item.genres && item.genres.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white text-xl font-semibold mb-3">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {item.genres.map((genre, index) => (
                        <span key={index} className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:w-80">
                <div className="bg-gray-800 p-4 rounded-lg">
                  {existingItem ? (
                    <>
                      <h3 className="text-white text-lg font-semibold mb-4">Your Rating</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newRating = existingItem.rating === 'love' ? null : 'love';
                            updateRating(existingItem.id, newRating);
                            setSelectedItem(prev => ({ ...prev, rating: newRating }));
                          }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            existingItem.rating === 'love'
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'bg-transparent border border-white text-white hover:bg-purple-600 hover:border-purple-600'
                          }`}
                          title="Love this!"
                        >
                          <Award className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            const newRating = existingItem.rating === 'up' ? null : 'up';
                            updateRating(existingItem.id, newRating);
                            setSelectedItem(prev => ({ ...prev, rating: newRating }));
                          }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            existingItem.rating === 'up'
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'bg-transparent border border-white text-white hover:bg-green-600 hover:border-green-600'
                          }`}
                          title="I like it"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const newRating = existingItem.rating === 'down' ? null : 'down';
                            updateRating(existingItem.id, newRating);
                            setSelectedItem(prev => ({ ...prev, rating: newRating }));
                          }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            existingItem.rating === 'down'
                              ? 'bg-red-600 border-red-600 text-white'
                              : 'bg-transparent border border-white text-white hover:bg-red-600 hover:border-red-600'
                          }`}
                          title="Not for me"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                      {existingItem.rating && (
                        <p className="text-gray-400 mt-3 text-sm">
                          {existingItem.rating === 'love' ? 'You loved this!' : 
                           existingItem.rating === 'up' ? 'You liked this' : 
                           'This wasn\'t for you'}
                        </p>
                      )}
                      <button
                        onClick={() => {
                          deleteItem(existingItem.id);
                          onClose();
                        }}
                        className="mt-4 w-full bg-red-600/20 hover:bg-red-600 border border-red-600 text-red-400 hover:text-white px-4 py-2 rounded-md transition-colors text-sm"
                      >
                        Remove from Collection
                      </button>
                      {existingItem?.dateWatched && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <h4 className="text-gray-300 font-medium mb-2">Added on</h4>
                          <p className="text-gray-400 text-sm">{new Date(existingItem.dateWatched).toLocaleDateString()}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h3 className="text-white text-lg font-semibold mb-4">Add to Collection</h3>
                      <p className="text-gray-400 text-sm mb-4">Rate this to add it to your watched collection</p>
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            addToWatchlist(item, 'love');
                            onClose();
                          }}
                          className="flex items-center justify-start gap-3 px-4 py-3 w-40 rounded-full transition-colors bg-transparent border border-gray-600 text-white hover:bg-purple-600 hover:border-purple-600"
                        >
                          <Award className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm font-medium whitespace-nowrap">Love this!</span>
                        </button>
                        <button
                          onClick={() => {
                            addToWatchlist(item, 'up');
                            onClose();
                          }}
                          className="flex items-center justify-start gap-3 px-4 py-3 w-40 rounded-full transition-colors bg-transparent border border-gray-600 text-white hover:bg-green-600 hover:border-green-600"
                        >
                          <ThumbsUp className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium whitespace-nowrap">I like it</span>
                        </button>
                        <button
                          onClick={() => {
                            addToWatchlist(item, 'down');
                            onClose();
                          }}
                          className="flex items-center justify-start gap-3 px-4 py-3 w-40 rounded-full transition-colors bg-transparent border border-gray-600 text-white hover:bg-red-600 hover:border-red-600"
                        >
                          <ThumbsDown className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium whitespace-nowrap">Not for me</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Netflix-style Header */}
      <header className="w-full bg-gradient-to-b from-black/80 to-transparent h-[300px]">
        <div className="px-4 h-full flex items-center justify-center w-full">
          <div className="w-full max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            {/* Centered Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-4xl sm:text-5xl font-bold text-red-500 text-center">NextFlix</h1>
            </div>
            
            {/* Search Section - Centered below logo */}
            <div className="w-full max-w-2xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 w-full">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5 z-10" />
                  <input
                    type="text"
                    placeholder="Search movies and TV series..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-black/50 border border-gray-600 text-white pl-10 pr-4 py-2 rounded-md w-full focus:border-red-500 focus:outline-none backdrop-blur-sm text-sm sm:text-base"
                  />
                </div>
                
                {/* Reset Search Button - Only show when there's search activity */}
                {(searchTerm || searchResults.length > 0) && (
                  <button
                    onClick={resetSearch}
                    className="bg-gray-800/80 hover:bg-gray-700 border border-gray-600 text-white px-3 sm:px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-1 sm:gap-2 backdrop-blur-sm text-sm"
                    title="Clear search"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </header>

      <div>
        {/* Search Results */}
        {(searchResults.length > 0 || isSearching) && (
          <section className="px-4 py-4 bg-gray-900/50">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                {isSearching ? 'Searching...' : 'Search Results'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                {isSearching ? (
                  <div className="col-span-4 flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  </div>
                ) : (
                  searchResults.map(item => (
                    <SearchResultCard key={item.id} item={item} />
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* Stats Row */}
        <section className="px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-w-3xl mx-auto">
              {[
                { label: 'Total Watched', value: watchedItems.length, color: 'text-white' },
                { label: 'Movies', value: watchedItems.filter(item => item.type === 'movie').length, color: 'text-white' },
                { label: 'TV Series', value: watchedItems.filter(item => item.type === 'series').length, color: 'text-white' },
                { label: 'Love This!', value: watchedItems.filter(item => item.rating === 'love').length, color: 'text-purple-500' },
                { label: 'I Like It', value: watchedItems.filter(item => item.rating === 'up').length, color: 'text-green-500' },
                { label: 'Not For Me', value: watchedItems.filter(item => item.rating === 'down').length, color: 'text-red-500' }
              ].map((stat, index) => (
                <div key={index} className="bg-gray-900/80 p-2 rounded backdrop-blur-sm border border-gray-800">
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-gray-400 text-xs leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            {watchedItems.length === 0 ? (
              <div className="text-center py-20">
                <Eye className="w-24 h-24 text-gray-600 mx-auto mb-6" />
                <h3 className="text-3xl font-semibold text-white mb-4">Your NextFlix is empty</h3>
                <p className="text-gray-400 text-lg">Start searching for movies and TV series to build your collection</p>
              </div>
            ) : (
              <section>
                {/* Title Row */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Your Collection</h2>
                  {lastUpdated && (
                    <div className="text-sm text-gray-400">
                      Last added: {new Date(lastUpdated).toLocaleDateString()} {new Date(lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  )}
                </div>

                {/* Search and Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full mb-6 sm:justify-between">
                  {/* Left Side: Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 flex-1">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search your collection..."
                        value={collectionSearchTerm}
                        onChange={(e) => setCollectionSearchTerm(e.target.value)}
                        className="bg-gray-800/80 border border-gray-600 text-white pl-10 pr-10 py-2 rounded-md w-full focus:border-red-500 focus:outline-none text-sm"
                      />
                      {collectionSearchTerm && (
                        <button
                          onClick={() => setCollectionSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          title="Clear search"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Collection Filters */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-gray-800/80 border border-gray-600 rounded-md">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-l-md transition-colors ${
                          viewMode === 'grid' 
                            ? 'bg-red-600 text-white' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                        title="Grid view"
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-r-md transition-colors ${
                          viewMode === 'list' 
                            ? 'bg-red-600 text-white' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                        title="List view"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-gray-800/80 border border-gray-600 text-white pl-3 pr-8 py-2 rounded-md focus:border-red-500 focus:outline-none text-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDEuNUw2IDYuNUwxMSAxLjUiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[right_0.75rem_center]"
                    >
                      <option value="all">All</option>
                      <option value="movie">Movies</option>
                      <option value="series">TV Series</option>
                    </select>
                    
                    <select
                      value={filterRating}
                      onChange={(e) => setFilterRating(e.target.value)}
                      className="bg-gray-800/80 border border-gray-600 text-white pl-3 pr-8 py-2 rounded-md focus:border-red-500 focus:outline-none text-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDEuNUw2IDYuNUwxMSAxLjUiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[right_0.75rem_center]"
                    >
                      <option value="all">All Ratings</option>
                      <option value="love">Love This!</option>
                      <option value="up">I Like It</option>
                      <option value="down">Not For Me</option>
                    </select>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-gray-800/80 border border-gray-600 text-white pl-3 pr-8 py-2 rounded-md focus:border-red-500 focus:outline-none text-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDEuNUw2IDYuNUwxMSAxLjUiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[right_0.75rem_center]"
                    >
                      <option value="dateWatched">Recently Watched</option>
                      <option value="title">By Title (A-Z)</option>
                      <option value="year">By Year (Latest)</option>
                      <option value="rating">By Rating (Best)</option>
                    </select>
                    
                      {/* Reset Collection Filters Button - Only show when filters are active */}
                      {(filterType !== 'all' || filterRating !== 'all' || sortBy !== 'dateWatched' || collectionSearchTerm !== '') && (
                        <button
                          onClick={resetCollectionFilters}
                          className="bg-gray-800/80 hover:bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md transition-colors flex items-center gap-1 text-sm"
                          title="Reset collection filters"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span className="hidden sm:inline">Reset</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Export Button */}
                  <div className="flex items-center">
                    {/* Export Dropdown */}
                    <div className="relative group">
                      <button className="bg-gray-800/80 hover:bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md transition-colors flex items-center gap-2 text-sm">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-32">
                        <button
                          onClick={exportToCSV}
                          className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded-t-md transition-colors text-sm"
                        >
                          Export CSV
                        </button>
                        <button
                          onClick={exportToJSON}
                          className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors text-sm"
                        >
                          Export JSON
                        </button>
                        <button
                          onClick={exportToTXT}
                          className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded-b-md transition-colors text-sm"
                        >
                          Export TXT
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {filteredAndSortedItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No matches in your collection</h3>
                    <p className="text-gray-400">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                        {filteredAndSortedItems.map(item => (
                          <MovieCard key={item.id} item={item} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredAndSortedItems.map(item => (
                          <MovieListItem key={item.id} item={item} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-40 hover:scale-110"
          title="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default NextFlix;