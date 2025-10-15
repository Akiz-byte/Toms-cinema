import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    if (location.pathname.startsWith('/movie/')) {
      return 'Movie Details';
    }
    return location.pathname === '/' ? 'Discover Movies' : 'My Watchlist';
  };

  const getNavLinks = () => {
    if (location.pathname.startsWith('/movie/')) {
      return [
        { to: '/', label: 'Home' },
        { to: '/watchlist', label: 'Watchlist' }
      ];
    }
    return [
      { to: location.pathname === '/' ? '/watchlist' : '/', label: location.pathname === '/' ? 'My Watchlist' : 'Discover Movies' }
    ];
  };

  return (
    <header className="app-header">
      <div className="header-backdrop"></div>

      <div className="header-content">
        <div className="header-left">
          <button
            className="logo-button"
            onClick={() => navigate('/')}
            aria-label="Go to home"
          >
            <i className="fa-solid fa-film"></i>
            <span>Toms-Cinema</span>
          </button>
        </div>

        <div className="header-center">
          <h1 className="page-title">{getPageTitle()}</h1>
        </div>

        <div className="header-right">
          <nav className="header-nav">
            {getNavLinks().map((link, index) => (
              <Link key={index} to={link.to} className="nav-link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Breadcrumb for movie details page */}
      {location.pathname.startsWith('/movie/') && (
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Movie Details</span>
        </div>
      )}
    </header>
  );
}

export default Header;