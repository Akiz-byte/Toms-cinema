import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieList from './MovieList';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [currentView, setCurrentView] = useState('trending'); // 'trending' or 'search'

  useEffect(() => {
    loadWatchlist();
    loadTrendingMovies();
    loadGenres();
  }, []);

  const loadWatchlist = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'watchlist'));
      const watchlistData = querySnapshot.docs.map(doc => ({ 
        firestoreId: doc.id, 
        ...doc.data() 
      }));
      setWatchlist(watchlistData);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
      setTrendingMovies(response.data.results.slice(0, 12));
      setMovies(response.data.results.slice(0, 12));
    } catch (error) {
      console.error('Error loading trending movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGenres = async () => {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`);
      setGenres(response.data.genres);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const searchMovies = async () => {
    if (!searchQuery.trim()) {
      setCurrentView('trending');
      setMovies(trendingMovies);
      return;
    }

    setLoading(true);
    setCurrentView('search');

    try {
      let url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`;

      if (selectedGenre) {
        // Search with genre filter
        url += `&with_genres=${selectedGenre}`;
      }

      const response = await axios.get(url);
      setMovies(response.data.results);
    } catch (error) {
      console.error('Error searching movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (movie) => {
    if (!movie) return;

    // Check if already in watchlist
    const isAlreadyInWatchlist = watchlist.some(item => item.tmdbId === movie.id);
    if (isAlreadyInWatchlist) return;

    try {
      const movieData = {
        tmdbId: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        overview: movie.overview,
        genres: movie.genres || []
      };

      const docRef = await addDoc(collection(db, 'watchlist'), movieData);
      setWatchlist([...watchlist, { firestoreId: docRef.id, ...movieData }]);
      return true; // Success
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      const movieToRemove = watchlist.find(movie => movie.tmdbId === movieId);
      if (movieToRemove) {
        await deleteDoc(doc(db, 'watchlist', movieToRemove.firestoreId));
        setWatchlist(watchlist.filter(movie => movie.tmdbId !== movieId));
        return true; // Success
      }
      return false;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchMovies();
    }
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    // Auto-search when genre changes
    setTimeout(() => {
      if (searchQuery.trim()) {
        searchMovies();
      }
    }, 100);
  };

  return (
    <div>
      <div className="search-container">
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          type="text"
          id="search-input"
          placeholder="Search for movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <select
          className="genre-dropdown"
          value={selectedGenre}
          onChange={handleGenreChange}
        >
          <option value="">All</option>
          {genres.map(genre => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
        <button id="search-button" onClick={searchMovies}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div id="search-result">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : movies.length === 0 ? (
          <div className="no-state">
            <i className="fa-solid fa-film fa-2xl"></i>
            <p>{currentView === 'search' ? 'No movies found' : 'Loading trending movies...'}</p>
          </div>
        ) : (
          <MovieList
            movies={movies}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            watchlist={watchlist}
          />
        )}
      </div>
    </div>
  );
}

export default Search;