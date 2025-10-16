import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function MovieDetails() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const loadWatchlist = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'watchlist'));
      const watchlistData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWatchlist(watchlistData);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  }, []);

  const fetchMovieDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`);
      setMovie(response.data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  useEffect(() => {
    fetchMovieDetails();
  }, [fetchMovieDetails]);

  useEffect(() => {
    if (movie) {
      const inWatchlist = watchlist.some(item => item.tmdbId === movie.id);
      setIsInWatchlist(inWatchlist);
    }
  }, [movie, watchlist]);

  const addToWatchlist = async () => {
    if (!movie || isInWatchlist) return;

    try {
      const movieData = {
        tmdbId: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        overview: movie.overview,
        genres: movie.genres,
        runtime: movie.runtime,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'watchlist'), movieData);
      setIsInWatchlist(true);
      setWatchlist([
        ...watchlist,
        { id: docRef.id, ...movieData, createdAt: new Date() },
      ]);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const removeFromWatchlist = async () => {
    const item = watchlist.find((w) => w.tmdbId === movie?.id);
    if (!item) return;
    try {
      await deleteDoc(doc(db, 'watchlist', item.id));
      setWatchlist(watchlist.filter((w) => w.id !== item.id));
      setIsInWatchlist(false);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const watchMovie = () => {
    if (movie && movie.imdb_id) {
      const url = `https://vidsrc.to/embed/movie/${movie.imdb_id}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const watchTrailer = () => {
    if (movie && movie.videos && movie.videos.results) {
      const trailer = movie.videos.results.find(video =>
        video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
      );
      if (trailer) {
        const url = `https://www.youtube.com/watch?v=${trailer.key}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const watchOnIMDb = () => {
    if (movie && movie.imdb_id) {
      const url = `https://www.imdb.com/title/${movie.imdb_id}/`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="error-state">
        <i className="fa-solid fa-exclamation-triangle fa-2xl"></i>
        <p>Movie not found</p>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Search
        </button>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
    : '/images/placeholder.jpg';

  const director = movie.credits?.crew?.find(person => person.job === 'Director');
  const cast = movie.credits?.cast?.slice(0, 5) || [];

  const formatRuntime = (mins) => {
    if (mins === null || mins === undefined) return '—';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  };

  // removed addedMeta display per request

  return (
    <div className="movie-details-page">
      {backdropUrl && (
        <div
          className="movie-backdrop"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}

      <div className="movie-details-container">
        <div className="movie-poster-section">
          <img src={posterUrl} alt={movie.title} className="movie-detail-poster" />
        </div>

        <div className="movie-info-section">
          <div className="movie-header">
            <h1>{movie.title}</h1>
            <div className="movie-meta-details">
              <span className="release-year"><i className="fa-solid fa-calendar-alt"></i> {movie.release_date?.split('-')[0]}</span>
              <span className="rating"><i className="fa-solid fa-star"></i> {movie.vote_average?.toFixed(1)}</span>
              <span className="runtime"><i className="fa-solid fa-clock"></i> {formatRuntime(movie.runtime)}</span>
            </div>
          </div>

          {movie.genres?.length > 0 && (
            <div className="genre-block">
              <i className="fa-solid fa-tags" aria-hidden="true"></i>
              <span className="genre-list">
                {movie.genres.map(g => g.name).join(' • ')}
              </span>
            </div>
          )}

          <div className="movie-overview">
            <h3>Overview</h3>
            <p>{movie.overview}</p>
          </div>

          {director && (
            <div className="movie-director">
              <h4>Director</h4>
              <p>{director.name}</p>
            </div>
          )}

          {cast.length > 0 && (
            <div className="movie-cast">
              <h4>Cast</h4>
              <div className="cast-list">
                {cast.map(actor => (
                  <span key={actor.id} className="cast-member">{actor.name}</span>
                ))}
              </div>
            </div>
          )}

          <div className="movie-actions">
            <button
              className="action-btn watch-btn"
              onClick={watchMovie}
              disabled={!movie.imdb_id}
            >
              <i className="fa-solid fa-play"></i>
              Watch Movie
            </button>

            <button
              className="action-btn trailer-btn"
              onClick={watchTrailer}
              disabled={!movie.videos?.results?.some(video =>
                video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
              )}
            >
              <i className="fa-solid fa-film"></i>
              Watch Trailer
            </button>

            <button
              className="action-btn imdb-btn"
              onClick={watchOnIMDb}
              disabled={!movie.imdb_id}
            >
              <i className="fa-solid fa-external-link"></i>
              Where to Watch
            </button>

            {isInWatchlist ? (
              <button
                className="action-btn ghost-btn"
                onClick={removeFromWatchlist}
                type="button"
              >
                <i className="fa-solid fa-trash"></i>
                Remove
              </button>
            ) : (
              <button
                className="action-btn watchlist-btn"
                onClick={addToWatchlist}
                type="button"
              >
                <i className="fa-solid fa-plus"></i>
                Add to Watchlist
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default MovieDetails;