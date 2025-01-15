const API_KEY = '443b194f61669958f19d3ae1327f123d';
const BASE_URL = 'https://api.themoviedb.org/3';

const searchInput = document.getElementById('search-input');
const suggestionsList = document.getElementById('suggestions');
const watchlistItems = document.getElementById('watchlist-items');
const themeToggle = document.getElementById('toggle-theme');

// Load watchlist from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedWatchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    savedWatchlist.forEach(item => addToWatchlist(item, false));
});

// Example genre mapping
const genreMapping = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
};

function getGenreNames(genreIds) {
    return genreIds.map(id => genreMapping[id] || 'Unknown').join(', ');
}

// Fetch movie suggestions
searchInput.addEventListener('input', async (e) => {
    const query = e.target.value;
    if (query.length < 3) {
        suggestionsList.innerHTML = '';
        return;
    }

    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
    const data = await response.json();
    const suggestions = data.results.slice(0, 5);

    suggestionsList.innerHTML = '';
    suggestions.forEach(movie => {
        const li = document.createElement('li');
        li.className = 'movie-suggestion';
        li.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w92${movie.poster_path}" alt="${movie.title}">
            <div>
                <h3><strong>${movie.title}</strong> (${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'})</h3>
                <p><strong>Genre:</strong> ${getGenreNames(movie.genre_ids)}</p>
                <p><strong>Rating:</strong> ${movie.vote_average}</p>
                <p><strong>Summary:</strong> ${movie.overview ? movie.overview : 'No description available.'}</p>
                <p><strong>Main Cast:</strong> ${movie.cast ? movie.cast.slice(0, 3).join(', ') : 'Information not available'}</p>
            </div>
        `;
        li.addEventListener('click', () => addToWatchlist(movie));
        suggestionsList.appendChild(li);
    });
});

// Add movie to watchlist
function addToWatchlist(movie, saveToLocalStorage = true) {
    const li = document.createElement('li');
    li.className = 'movie-suggestion';
    li.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w92${movie.poster_path}" alt="${movie.title}">
        <div class="movie-details">
            <h3><strong>${movie.title}</strong> (${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'})</h3>
            <p><strong>Genre:</strong> ${getGenreNames(movie.genre_ids)}</p>
            <p><strong>Rating:</strong> ${movie.vote_average}</p>
            <p><strong>Summary:</strong> ${movie.overview ? movie.overview : 'No description available.'}</p>
        </div>
        <button class="remove-button">Remove</button>
    `;

    // Fetch cast and crew data
    const movieId = movie.id;
    const creditsUrl = `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`;

    fetch(creditsUrl)
        .then(response => response.json())
        .then(data => {
            const mainCast = data.cast.slice(0, 3).map(actor => actor.name).join(', ');
            const mainCrew = data.crew.slice(0, 3).map(member => member.name).join(', ');

            const detailsDiv = li.querySelector('.movie-details');
            detailsDiv.innerHTML += `
                <p><strong>Main Cast:</strong> ${mainCast || 'Information not available'}</p>
            `;
        })
        .catch(error => console.error('Error fetching credits:', error));

    const removeButton = li.querySelector('.remove-button');
    removeButton.addEventListener('click', () => removeFromWatchlist(movie, li));

    watchlistItems.appendChild(li);

    if (saveToLocalStorage) {
        const currentWatchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        currentWatchlist.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(currentWatchlist));
    }
}


// Remove movie from watchlist
function removeFromWatchlist(movie, listItem) {
    listItem.remove();

    const currentWatchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const updatedWatchlist = currentWatchlist.filter(item => item.id !== movie.id);
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
}