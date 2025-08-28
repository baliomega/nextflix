import React, { useState, useEffect } from 'react';
import { Search, Eye, ThumbsUp, ThumbsDown, Star, X, RotateCcw, Award } from 'lucide-react';

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

  // TMDB API configuration
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'demo_key';
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const TMDB_IMAGE_BASE_URL_HIRES = 'https://image.tmdb.org/t/p/w1280';

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nextflix-data');
    if (saved) {
      setWatchedItems(JSON.parse(saved));
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('nextflix-data', JSON.stringify(watchedItems));
    }
  }, [watchedItems, isInitialized]);

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
        const mockResults = [
          {
            id: Math.random(),
            title: query.includes('inception') ? 'Inception' : `${query} Movie`,
            name: query.includes('stranger') ? 'Stranger Things' : undefined,
            media_type: query.includes('stranger') || query.includes('series') || query.includes('tv') ? 'tv' : 'movie',
            poster_path: '/path-to-poster.jpg',
            backdrop_path: '/path-to-backdrop.jpg',
            overview: `This is a compelling ${query.includes('stranger') || query.includes('tv') ? 'TV series' : 'movie'} about ${query}. A gripping story that will keep you on the edge of your seat with incredible performances and stunning visuals that showcase the best of modern entertainment.`,
            release_date: '2023-01-01',
            first_air_date: '2023-01-01',
            vote_average: 8.5,
            genre_ids: [28, 12],
            cast: ['Ryan Gosling', 'Emma Stone', 'Ryan Reynolds', 'Margot Robbie'],
            genres: ['Action', 'Drama', 'Thriller']
          },
          {
            id: Math.random(),
            title: `${query} 2: The Sequel`,
            media_type: 'movie',
            poster_path: '/another-poster.jpg',
            backdrop_path: '/another-backdrop.jpg',
            overview: `The highly anticipated sequel to ${query}. With even more action, drama, and compelling characters that will keep you entertained from start to finish.`,
            release_date: '2024-06-15',
            vote_average: 7.8,
            genre_ids: [28, 53],
            cast: ['Chris Evans', 'Scarlett Johansson', 'Robert Downey Jr.'],
            genres: ['Action', 'Thriller', 'Adventure']
          },
          {
            id: Math.random(),
            title: `The ${query} Chronicles`,
            media_type: 'tv',
            poster_path: '/series-poster.jpg',
            backdrop_path: '/series-backdrop.jpg',
            overview: `A captivating TV series exploring the world of ${query}. Multiple seasons of compelling storytelling with complex characters and intricate plotlines.`,
            first_air_date: '2022-09-12',
            vote_average: 9.1,
            genre_ids: [18, 9648],
            cast: ['Pedro Pascal', 'Zendaya', 'Oscar Isaac'],
            genres: ['Drama', 'Mystery', 'Thriller']
          }
        ];
        setSearchResults(mockResults);
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
      const response = await fetch(
        `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter and enhance results
      const enhancedResults = data.results
        .filter(item => 
          (item.media_type === 'movie' || item.media_type === 'tv') &&
          item.vote_average > 0 &&
          (item.poster_path || item.backdrop_path) &&
          item.poster_path !== null &&
          item.poster_path !== ''
        )
        .map(item => ({
          ...item,
          cast: [], // Will be populated by separate API call if needed
          genres: [] // Will be populated by separate API call if needed
        }));
      
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

  const addToWatchlist = (tmdbItem, rating = null) => {
    const newItem = {
      id: Date.now(),
      tmdb_id: tmdbItem.id,
      title: tmdbItem.title || tmdbItem.name,
      type: tmdbItem.media_type === 'tv' ? 'series' : 'movie',
      poster: tmdbItem.poster_path,
      backdrop: tmdbItem.backdrop_path,
      overview: tmdbItem.overview,
      releaseDate: tmdbItem.release_date || tmdbItem.first_air_date,
      rating: rating,
      dateWatched: new Date().toISOString().split('T')[0],
      tmdbRating: tmdbItem.vote_average,
      cast: tmdbItem.cast || [],
      genres: tmdbItem.genres || []
    };

    setWatchedItems([newItem, ...watchedItems]);
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
    setSelectedItem(null);
  };

  const filteredAndSortedItems = watchedItems
    .filter(item => {
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesRating = filterRating === 'all' || item.rating === filterRating;
      return matchesType && matchesRating;
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
            {item.type === 'series' ? 'SERIES' : 'MOVIE'}
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
    const existingItem = watchedItems.find(watchedItem => 
      watchedItem.tmdb_id === item.id || 
      (watchedItem.title.toLowerCase() === (item.title || item.name).toLowerCase() && 
       watchedItem.type === (item.media_type === 'tv' ? 'series' : 'movie'))
    );
    
    return (
    <div 
      className="group relative w-full h-72 cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
      onClick={() => setSelectedItem({
        ...item,
        title: item.title || item.name,
        type: item.media_type === 'tv' ? 'series' : 'movie',
        poster: item.poster_path,
        backdrop: item.backdrop_path,
        overview: item.overview,
        releaseDate: item.release_date || item.first_air_date,
        tmdbRating: item.vote_average,
        cast: item.cast || [],
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
          {item.media_type === 'tv' ? 'SERIES' : 'MOVIE'}
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
    
    // Check if this item is already in the user's collection
    const existingItem = watchedItems.find(watchedItem => 
      watchedItem.tmdb_id === item.tmdb_id || 
      watchedItem.id === item.id ||
      (watchedItem.title.toLowerCase() === item.title.toLowerCase() && 
       watchedItem.type === item.type)
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
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">{item.overview}</p>
                
                {item.cast && item.cast.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white text-xl font-semibold mb-3">Cast</h3>
                    <div className="flex flex-wrap gap-2">
                      {item.cast.slice(0, 6).map((actor, index) => (
                        <span key={index} className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                          {actor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

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

                {existingItem?.dateWatched && (
                  <div className="mb-6">
                    <h3 className="text-white text-xl font-semibold mb-3">Watched on</h3>
                    <p className="text-gray-300">{new Date(existingItem.dateWatched).toLocaleDateString()}</p>
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
                    </>
                  ) : (
                    <div className="text-center">
                      <h3 className="text-white text-lg font-semibold mb-4">Add to Collection</h3>
                      <p className="text-gray-400 text-sm mb-4">Rate this to add it to your watched collection</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            addToWatchlist(item, 'love');
                            onClose();
                          }}
                          className="bg-transparent border border-white text-white hover:bg-purple-600 hover:border-purple-600 px-4 py-2 rounded-full text-sm flex items-center gap-1 transition-colors"
                        >
                          <Award className="w-4 h-4" />
                          Love
                        </button>
                        <button
                          onClick={() => {
                            addToWatchlist(item, 'up');
                            onClose();
                          }}
                          className="bg-transparent border border-white text-white hover:bg-green-600 hover:border-green-600 px-4 py-2 rounded-full text-sm flex items-center gap-1 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Like
                        </button>
                        <button
                          onClick={() => {
                            addToWatchlist(item, 'down');
                            onClose();
                          }}
                          className="bg-transparent border border-white text-white hover:bg-red-600 hover:border-red-600 px-4 py-2 rounded-full text-sm flex items-center gap-1 transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Meh
                        </button>
                      </div>
                    </div>
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
      <header className="fixed top-0 w-full bg-gradient-to-b from-black/80 to-transparent z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-0 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-bold text-red-500">NextFlix</h1>
            </div>
            
            {/* Center Search with Clear Button */}
            <div className="flex-1 flex justify-center px-8">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search movies and series..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-black/50 border border-gray-600 text-white px-2 pr-4 py-2 rounded-md w-96 focus:border-red-500 focus:outline-none backdrop-blur-sm"
                  />
                </div>
                
                {/* Reset Search Button - Only show when there's search activity */}
                {(searchTerm || searchResults.length > 0) && (
                  <button
                    onClick={resetSearch}
                    className="bg-gray-800/80 hover:bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 backdrop-blur-sm"
                    title="Clear search"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {/* Right side spacer */}
            <div className="flex-shrink-0 w-0"></div>
          </div>
        </div>
      </header>

      <div className="pt-16">
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
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[
                { label: 'Total Watched', value: watchedItems.length, color: 'text-white' },
                { label: 'Movies', value: watchedItems.filter(item => item.type === 'movie').length, color: 'text-white' },
                { label: 'TV Series', value: watchedItems.filter(item => item.type === 'series').length, color: 'text-white' },
                { label: 'Love This!', value: watchedItems.filter(item => item.rating === 'love').length, color: 'text-purple-500' },
                { label: 'I Like It', value: watchedItems.filter(item => item.rating === 'up').length, color: 'text-green-500' },
                { label: 'Not For Me', value: watchedItems.filter(item => item.rating === 'down').length, color: 'text-red-500' }
              ].map((stat, index) => (
                <div key={index} className="bg-gray-900/80 p-4 rounded-lg backdrop-blur-sm border border-gray-800">
                  <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
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
                <p className="text-gray-400 text-lg">Start searching for movies and shows to build your collection</p>
              </div>
            ) : (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Collection</h2>
                  
                  {/* Collection Filters */}
                  <div className="flex items-center gap-4">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-gray-800/80 border border-gray-600 text-white pl-3 pr-8 py-2 rounded-md focus:border-red-500 focus:outline-none text-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDEuNUw2IDYuNUwxMSAxLjUiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[right_0.75rem_center]"
                    >
                      <option value="all">All</option>
                      <option value="movie">Movies</option>
                      <option value="series">Series</option>
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
                    {(filterType !== 'all' || filterRating !== 'all' || sortBy !== 'dateWatched') && (
                      <button
                        onClick={resetCollectionFilters}
                        className="bg-gray-800/80 hover:bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                        title="Reset collection filters"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {filteredAndSortedItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No matches in your collection</h3>
                    <p className="text-gray-400">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                    {filteredAndSortedItems.map(item => (
                      <MovieCard key={item.id} item={item} />
                    ))}
                  </div>
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
    </div>
  );
};

export default NextFlix;