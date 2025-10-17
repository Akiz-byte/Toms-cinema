import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieList from './MovieList';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

function Watchlist() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'watchlist'));
      const watchlistData = querySnapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data(),
        id: doc.data().tmdbId
      }));
      setWatchlist(watchlistData);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      const movieToRemove = watchlist.find(movie => movie.tmdbId === movieId || movie.id === movieId);
      if (movieToRemove) {
        await deleteDoc(doc(db, 'watchlist', movieToRemove.firestoreId));
        setWatchlist(watchlist.filter(movie => movie.tmdbId !== movieId && movie.id !== movieId));
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const sortedWatchlist = [...watchlist].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.vote_average || 0) - (a.vote_average || 0);
    } else if (sortBy === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    } else if (sortBy === 'year') {
      return (b.release_date || '').localeCompare(a.release_date || '');
    }
  return 0;
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {watchlist.length > 0 && (
        <div className="sort-options">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="dateAdded">Date Added</option>
            <option value="rating">Rating</option>
            <option value="title">Title</option>
            <option value="year">Release Year</option>
          </select>
        </div>
      )}

      <div id="search-result">
        {sortedWatchlist.length === 0 ? (
          <div className="no-state">
            <i className="fa-solid fa-bookmark fa-2xl"></i>
            <p>Your watchlist is looking a little empty...</p>
            <button onClick={() => navigate('/')} className="explore-btn">
              Let's add some movies!
            </button>
          </div>
        ) : (
          <MovieList
            movies={sortedWatchlist}
            onAddToWatchlist={null}
            showRemoveButton={true}
            onRemoveFromWatchlist={removeFromWatchlist}
          />
        )}
      </div>
    </div>
  );
}

export default Watchlist;