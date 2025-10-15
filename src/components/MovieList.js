import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MovieList({ movies, onAddToWatchlist, showRemoveButton = false, onRemoveFromWatchlist, watchlist = [] }) {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState({ movieId: null, message: '' });

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const showToast = (movieId, message) => {
    setToastMessage({ movieId, message });
    setTimeout(() => {
      setToastMessage({ movieId: null, message: '' });
    }, 2000);
  };

  const handleAddClick = async (e, movie) => {
    e.stopPropagation();
    if (onAddToWatchlist) {
      const success = await onAddToWatchlist(movie);
      if (success) {
        showToast(movie.id, 'Added');
      }
    }
  };

  const handleRemoveClick = async (e, movieId) => {
    e.stopPropagation();
    if (onRemoveFromWatchlist) {
      const success = await onRemoveFromWatchlist(movieId);
      if (success) {
        showToast(movieId, 'Removed');
      }
    }
  };

  const isInWatchlist = (movieId) => {
    return watchlist.some(item => item.tmdbId === movieId);
  };

  return (
    <div className="movies-grid">
      {movies.map((movie) => {
        const posterUrl = movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : '/images/placeholder.jpg';

        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';

        return (
          <div
            key={movie.id || movie.tmdbId}
            className="movie-card"
            onClick={() => handleMovieClick(movie.id || movie.tmdbId)}
          >
            <div className="movie-poster">
              <img src={posterUrl} alt={movie.title || movie.Title} />
              <div className="movie-overlay">
                {toastMessage.movieId === (movie.id || movie.tmdbId) && (
                  <div className="toast-message">{toastMessage.message}</div>
                )}
                {showRemoveButton ? (
                  <button
                    className="remove-btn"
                    onClick={(e) => handleRemoveClick(e, movie.id || movie.tmdbId)}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                ) : (
                  <>
                    {isInWatchlist(movie.id || movie.tmdbId) ? (
                      <button
                        className="remove-btn"
                        onClick={(e) => handleRemoveClick(e, movie.id || movie.tmdbId)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    ) : (
                      onAddToWatchlist && (
                        <button
                          className="quick-add-btn"
                          onClick={(e) => handleAddClick(e, movie)}
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      )
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="movie-info">
              <h3 className="movie-title">{movie.title || movie.Title}</h3>
              <div className="movie-meta">
                <span className="movie-year">{releaseYear}</span>
                <span className="movie-rating">⭐ {rating}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MovieList;