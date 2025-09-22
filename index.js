const searchInput = document.getElementById("search-input")
const searchBtn = document.getElementById("search-button")
let watchlist = JSON.parse(localStorage.getItem("watchlist")) || []

let searchResult = []

document.addEventListener("click", (e)=>{
    if(e.target.dataset.addwatchlist){
        const movie = searchResult.find(movie => movie.imdbID === e.target.dataset.addwatchlist)
        if(!watchlist.find(item => item.imdbID === movie.imdbID)){
            watchlist.unshift(movie)
            localStorage.setItem("watchlist", JSON.stringify(watchlist))
            document.querySelector(`#watchlist-button.${movie.imdbID}`).innerHTML = `<span id="added-watchlist"><i class="fa-solid fa-circle-check fa-xl"> </i> Added</span>`
        }else{
        }
    }

    else if(e.target.dataset.imdbid){
        const movie = searchResult.find(movie => movie.imdbID === e.target.dataset.imdbid)
        if(movie){
            const vidsrcUrl = `https://vidsrc.xyz/embed/movie?imdb=${encodeURIComponent(movie.imdbID)}`
            window.open(vidsrcUrl, '_blank', 'noopener')
        }   
    }
})

searchInput.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        searchBtn.click()
    }
})

searchBtn.addEventListener("click", function(){
    fetch(`https://www.omdbapi.com/?apikey=511297ae&s=${searchInput.value}`)
    .then(res => res.json())
    .then(data => {
        if (data.Response === "True") {
            let searchResultHtml = [];
            data.Search.forEach(movie => {
                fetch(`https://www.omdbapi.com/?apikey=511297ae&i=${movie.imdbID}`)
                    .then(res => res.json())
                    .then(movieDetails => {
                        searchResult.unshift(movieDetails)

                        const tmdbApiKey = "0289f710200880e871f592ad0ea20d41"
                        const tmdbSearchUrl = `https://api.themoviedb.org/3/find/${movieDetails.imdbID}?api_key=${tmdbApiKey}&external_source=imdb_id`;
                        fetch(tmdbSearchUrl)
                            .then(tmdbRes => tmdbRes.json())
                            .then(tmdbData => {
                                console.log(tmdbData)
                                const tmdbMovie = tmdbData.movie_results && tmdbData.movie_results[0];
                                if (!tmdbMovie) {
                                    appendMovie(movieDetails, null);
                                    return;
                                }

                                fetch(`https://api.themoviedb.org/3/movie/${tmdbMovie.id}/videos?api_key=${tmdbApiKey}`)
                                    .then(trailerRes => trailerRes.json())
                                    .then(trailerData => {
                                        console.log(trailerData)
                                        const trailer = trailerData.results && trailerData.results.find(
                                            video => video.site === "YouTube" && video.type === "Trailer"
                                        );
                                        appendMovie(movieDetails, trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null)
                                    })
                                    .catch(() => appendMovie(movieDetails, null))
                            })
                            .catch(() => appendMovie(movieDetails, null))
                    });
            });

            function appendMovie(data, trailerUrl) {
                searchResultHtml.unshift(
                    `<div class="movie-list" id="movie-list">
                        <div id="movie-poster">
                            <img src="${data.Poster}" alt="${data.Title}">
                        </div>
                        <div class="movie-details">
                            <div id="movie-title">
                                <h2>${data.Title}</h2>
                                <p>⭐ ${data.imdbRating}</p>
                            </div>
                            <div id="movie-description">
                                <p id="length">${data.Runtime}</p>
                                <p id="genre">${data.Genre}</p>
                                <div id="watchlist-button" class="${data.imdbID}"></div>
                            </div>
                            <div id="movie-content">${data.Plot}</div>
                        </div>
                        <div class="watch-video">
                            <button class="watch-video-btn" data-imdbid="${data.imdbID}">
                                <i class="fa-solid fa-play fa-xl"></i> Watch
                            </button>
                            ${trailerUrl ? `<a href="${trailerUrl}" target="_blank" class="trailer-btn">Watch Trailer</a>` : `<span class="no-trailer">Trailer Not Available</span>`}
                        </div>
                    </div>`
                );
                document.getElementById("search-result").innerHTML = searchResultHtml.join('');
            }
        }
        if(data.Response==="False"){
            document.getElementById("no-state").classList.add("hide") 
            document.getElementById("no-result").classList.remove("hide")
        }
        
    })
})
