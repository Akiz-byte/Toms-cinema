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
            document.querySelector(`#watchlist-button.${movie.imdbID}`).innerHTML = `<span id="added-watchlist"><i class="fa-solid fa-circle-check fa-xl"> </i>Added</span>`
            alert("Movie added to watchlist")
        }else{
            alert("Movie is already in watchlist")
        }
    }
    })

searchInput.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        searchBtn.click()
    }
})

searchBtn.addEventListener("click", function(){
    fetch(`http://www.omdbapi.com/?apikey=511297ae&s=${searchInput.value}&page=1`)
    .then(res => res.json())
    .then( data =>{
        console.log(data)
        if(data.Response==="True"){
            let searchResultHtml = []
                data.Search.forEach(data =>{
                    fetch(`http://www.omdbapi.com/?apikey=511297ae&i=${data.imdbID}`)
                    .then(res => res.json())
                    .then(data =>{
                        searchResult.unshift(data)
                        searchResultHtml = searchResult.map(data=>{
                            return `<div class="movie-list" id="movie-list">
                                <div id="movie-poster">
                                    <img src=${data.Poster} alt="">
                                </div>
                            <div class="movie-details">
                                <div id="movie-title">
                                    <h2>${data.Title}</h2>
                                    <p>⭐ ${data.imdbRating}</p>
                                </div>
                                <div id="movie-description">
                                    <p id="length">${data.Runtime}</p>
                                    <p id="genre">${data.Genre}</p>
                                    <div id="watchlist-button" class="${data.imdbID}">

                                    </div>
                                </div>
                                <div id="movie-content">${data.Plot}</div>
                            </div>
                            </div>
                    `
                            })
                            
                            
                            document.getElementById("search-result").innerHTML = searchResultHtml.join('')
                            searchResult.forEach(movie =>{
                                if(watchlist.find(item => item.imdbID === movie.imdbID)){
                                    document.querySelector(`#watchlist-button.${movie.imdbID}`).innerHTML = `<span id="added-watchlist"><i class="fa-solid fa-circle-check fa-xl"> </i>Already Added</span>`
                                }else{
                                    document.querySelector(`#watchlist-button.${movie.imdbID}`).innerHTML = `<button id="add-watchlist" data-addwatchlist="${movie.imdbID}"><i class="fa-solid fa-circle-plus fa-xl"></i> Watchlist</button>`
                                }
                                searchInput.value = ""
                            })
                    })
                })
        }
        if(data.Response==="False"){
            document.getElementById("no-state").classList.add("hide") 
            document.getElementById("no-result").classList.remove("hide")
        }
        
    })
})
