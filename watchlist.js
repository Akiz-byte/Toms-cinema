let data = JSON.parse(localStorage.getItem("watchlist"))

document.addEventListener("click", (e)=>{
    if(e.target.dataset.remove){
        const movieId = e.target.dataset.remove
        data.splice(data.findIndex(movie => movie.imdbID === movieId), 1)
        localStorage.setItem("watchlist", JSON.stringify(data))
        renderWatchList()
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
                        <button id="remove-watchlist" data-remove="${movie.imdbID}"><i class="fa-solid fa-circle-minus fa-xl"></i> Remove</button>
                    </div>
                    <div id="movie-content">${movie.Plot}</div>
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

renderWatchList()