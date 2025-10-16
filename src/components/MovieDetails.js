import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

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

      const inWatchlist = watchlist.some(item => item.tmdbId === response.data.id);
      setIsInWatchlist(inWatchlist);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  }, [movieId, watchlist]);

  useEffect(() => {
    loadWatchlist();
    fetchMovieDetails();
  }, [loadWatchlist, fetchMovieDetails]);

  const addToWatchlist = async () => {
    if (!movie) return;

    try {
      const movieData = {
        tmdbId: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        overview: movie.overview,
        genres: movie.genres,
        runtime: movie.runtime
      };

      await addDoc(collection(db, 'watchlist'), movieData);
      setIsInWatchlist(true);
      setWatchlist([...watchlist, movieData]);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const watchMovie = () => {
    if (movie && movie.imdb_id) {
      const url = `https://vidsrc.xyz/embed/movie?imdb=${movie.imdb_id}`;
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
            <div className="movie-meta">
              <span className="release-year">{movie.release_date?.split('-')[0]}</span>
              <span className="rating">⭐ {movie.vote_average?.toFixed(1)}</span>
              <span className="runtime">{movie.runtime} min</span>
            </div>
          </div>

          <div className="movie-genres">
            {movie.genres?.map(genre => (
              <span key={genre.id} className="genre-tag">{genre.name}</span>
            ))}
          </div>

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
              className={`action-btn watchlist-btn ${isInWatchlist ? 'in-watchlist' : ''}`}
              onClick={addToWatchlist}
              disabled={isInWatchlist}
            >
              <i className="fa-solid fa-plus"></i>
              {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;