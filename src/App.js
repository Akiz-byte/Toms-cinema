import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Search from './components/Search';
import MovieDetails from './components/MovieDetails';
import Watchlist from './components/Watchlist';
import Footer from './components/Footer';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Search />} />
            <Route path="/movie/:movieId" element={<MovieDetails />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;