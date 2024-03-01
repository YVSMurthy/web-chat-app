document.addEventListener('DOMContentLoaded', () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (urlParams.has('error')) {
        const error = urlParams.get('error');

        const errorContainer = document.getElementById('error-signup')
        errorContainer.textContent = 'Error: ' + error;
        errorContainer.style.display = 'block';
    }
})