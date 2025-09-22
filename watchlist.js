let data = JSON.parse(localStorage.getItem("watchlist"))

document.addEventListener("click", (e)=>{
    if(e.target.dataset.remove){ 
        data.splice(data.findIndex(movie => movie.imdbID === e.target.dataset.remove), 1)
        localStorage.setItem("watchlist", JSON.stringify(data))
        renderWatchList()
    }
    if(e.target.dataset.imdbid){
        const movie = data.find(movie => movie.imdbID === e.target.dataset.imdbid)
        if(movie){ 
        const vidsrcUrl = `https://vidsrc.xyz/embed/movie?imdb=${encodeURIComponent(movie.imdbID)}`
        window.open(vidsrcUrl, '_blank', 'noopener')
        }
    }
})


function renderWatchList(){
let watchlistHTML = []
watchlistHTML = data.map(movie =>{
    return `<div class="movie-list" id="movie-list">
                <div id="movie-poster">
                    <img src=${movie.Poster} alt="">
                </div>
                <div class="movie-details">
                    <div id="movie-title">
                        <h2>${movie.Title}</h2>
                        <p>⭐ ${movie.imdbRating}</p>
                    </div>
                    <div id="movie-description">
                        <p id="length">${movie.Runtime}</p>
                        <p id="genre">${movie.Genre}</p>
                        <button id="remove-watchlist" class="add-remove-watchlist" data-remove="${movie.imdbID}"><i class="fa-solid fa-circle-minus fa-xl"></i> Remove</button>
                    </div>
                    <div id="movie-content">${movie.Plot}</div>
                </div>
                <div class="watch-video">
                    <button class="watch-video-btn" data-imdbid="${movie.imdbID}">
                        <i class="fa-solid fa-play fa-xl"></i> Watch
                    </button>
                </div>
            </div>
        `

}).join('') ;

document.getElementById("search-result").innerHTML = watchlistHTML

if(data.length === 0){
    document.getElementById("search-result").innerHTML = `<div class="no-state" id="no-state-watchlist">
        <p>Your watchlist is looking a little empty...</p>
        <a href="index.html"><button id="add-movies"><i class="fa-solid fa-circle-plus fa-2xl"></i> Let's add some movies!</button></a>
    </div>`
}
}
let watchlistHTML = [];
let pending = data.length;
const tmdbApiKey = "0289f710200880e871f592ad0ea20d41"

function getTrailerUrl(imdbID, cb) {
    const tmdbSearchUrl = `https://api.themoviedb.org/3/find/${imdbID}?api_key=${tmdbApiKey}&external_source=imdb_id`;
    fetch(tmdbSearchUrl)
        .then(res => res.json())
        .then(tmdbData => {
            const tmdbMovie = tmdbData.movie_results && tmdbData.movie_results[0];
            if (!tmdbMovie) return cb(null);
            const tmdbMovieId = tmdbMovie.id;
            const trailerUrl = `https://api.themoviedb.org/3/movie/${tmdbMovieId}/videos?api_key=${tmdbApiKey}`;
            fetch(trailerUrl)
                .then(res => res.json())
                .then(trailerData => {
                    const trailer = trailerData.results && trailerData.results.find(
                        video => video.site === "YouTube" && video.type === "Trailer"
                    );
                    cb(trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null);
                })
                .catch(() => cb(null));
        })
        .catch(() => cb(null));
}

if (data.length === 0) {
    document.getElementById("search-result").innerHTML = `<div class="no-state" id="no-state-watchlist">
        <p>Your watchlist is looking a little empty...</p>
        <a href="index.html"><button id="add-movies"><i class="fa-solid fa-circle-plus fa-2xl"></i> Let's add some movies!</button></a>
    </div>`;
}

data.forEach(movie => {
    getTrailerUrl(movie.imdbID, function(trailerUrl) {
        watchlistHTML.push(`
            <div class="movie-list" id="movie-list">
                <div id="movie-poster">
                    <img src=${movie.Poster} alt="">
                </div>
                <div class="movie-details">
                    <div id="movie-title">
                        <h2>${movie.Title}</h2>
                        <p>⭐ ${movie.imdbRating}</p>
                    </div>
                    <div id="movie-description">
                        <p id="length">${movie.Runtime}</p>
                        <p id="genre">${movie.Genre}</p>
                        <button id="remove-watchlist" class="add-remove-watchlist" data-remove="${movie.imdbID}"><i class="fa-solid fa-circle-minus fa-xl"></i> Remove</button>
                    </div>
                    <div id="movie-content">${movie.Plot}</div>
                </div>
                <div class="watch-video">
                    <button class="watch-video-btn" data-imdbid="${movie.imdbID}">
                        <i class="fa-solid fa-play fa-xl"></i> Watch
                    </button>
                    ${trailerUrl ? `<a href="${trailerUrl}" target="_blank" class="trailer-btn">Watch Trailer</a>` : `<span class="no-trailer">Trailer Not Available</span>`}
                </div>
            </div>
        `);
        pending--;
        if (pending === 0) {
            document.getElementById("search-result").innerHTML = watchlistHTML.join('');
        }
    });
});

renderWatchList();
