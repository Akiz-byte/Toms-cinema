# Toms-Cinema (Movie-watchlist)

A React single-page app to search movies (TMDB) and manage a personal watchlist stored in Firebase Firestore using Fire Auth.

## Result Snapshots

Here are a few snapshots of the app in action:

**Home Page**
![Home Page](public/result%20snap/home.JPG)

**Movie Details Page**
![Movie Details Page](public/result%20snap/movie.JPG)

**Watchlist Page**
![Watchlist Page](public/result%20snap/watchlist.JPG)

## Setup

1. Create a `.env` file in the project root with the following variables:

```
REACT_APP_TMDB_KEY=your_tmdb_api_key
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm start
```


