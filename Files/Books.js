const toggleBtn = document.getElementById('toggle-view-btn');
const toggleIcon = document.getElementById('toggle-icon');
const booksContainer = document.getElementById('books-container');

// Array with ISBN for accessible books
const isbnList = [
    '9789152731130', '9780375842207', '9780571365470', '9780385490818',
    '9781408728512', '9780743273565', '9780374602604', '9781476738017',
    '9781250301697', '9780735219090', '9780143469131', '9780525559474',
    '9780399590504', '9781471156267', '9780062797155', '9780399167065'
];

// Check if books are already in localStorage with expiry
function checkForCachedBooks() {
    console.log("Checking for cached books...");
    const cachedBooks = localStorage.getItem('books');
    const cacheTimestamp = localStorage.getItem('cacheTimestamp');
    const now = Date.now();

    if (cachedBooks && cacheTimestamp && now - cacheTimestamp < 86400000) {  // 24 hours in ms
        // If cached books exist and are not expired, load them from storage
        displayBooks(JSON.parse(cachedBooks));
    } else {
        // If no cached books, or expired, fetch and store them
        loadBooks();
    }
}

if (toggleBtn && toggleIcon && booksContainer) {
    let isGridView = true;
    let debounceTimeout;

    toggleBtn.addEventListener('click', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            isGridView = !isGridView;
            toggleIcon.classList.toggle('bi-grid', isGridView);
            toggleIcon.classList.toggle('bi-list', !isGridView);
            booksContainer.classList.toggle('row', isGridView);
            booksContainer.classList.toggle('list-view', !isGridView);
        }, 200);  // Adjust debounce delay for user interaction
    });
}

// Fetch book summary data (title and image)
async function fetchBookSummaryData(isbn) {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const bookKey = `ISBN:${isbn}`;
        if (data[bookKey]) {
            const book = data[bookKey];
            return {
                title: book.title,
                imageUrl: book.cover ? book.cover.medium : 'https://via.placeholder.com/150?text=No+Cover'
            };
        }
        return { title: 'Unknown Title', imageUrl: 'https://via.placeholder.com/150?text=No+Cover' };
    } catch (error) {
        console.error(`Error fetching data for ISBN: ${isbn}`, error);
        return { title: 'Error fetching data', imageUrl: 'https://via.placeholder.com/150?text=Error' };
    }
}

// Load all books from ISBN-array using fetchBookSummaryData for basic display
async function loadBooks() {
    const books = [];
    for (const isbn of isbnList) {
        const bookData = await fetchBookSummaryData(isbn);
        books.push({ title: bookData.title, imageUrl: bookData.imageUrl, isbn: isbn });
    }

    // Store in localStorage
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('cacheTimestamp', Date.now());  // Update cache timestamp

    // Display books on page
    displayBooks(books);
}

// Create book item and add to DOM (using fetchBookSummaryData)
function createBookCard(title, imageUrl, isbn) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col book-item';
    colDiv.setAttribute('data-isbn', isbn);

    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.dataset.isbn = isbn;

    // Create and append image with lazy loading
    const img = createImageElement(imageUrl, title);

    // Create and append card body
    const cardBody = createCardBody(title);

    // Append the image and card body to the card
    cardDiv.appendChild(img);
    cardDiv.appendChild(cardBody);
    colDiv.appendChild(cardDiv);

    // Add event listener for card click
    cardDiv.addEventListener('click', () => openBookModal(isbn));

    return colDiv;
}

// Create and return image element with lazy loading
function createImageElement(imageUrl, altText) {
    const img = document.createElement('img');
    img.className = 'card-img-top lazy';
    img.dataset.src = imageUrl;  // Use data-src for lazy loading
    img.alt = altText;

    // Fallback for broken image links
    img.onerror = () => {
        img.src = 'https://via.placeholder.com/150?text=No+Cover'; // Fallback image
    };

    return img;
}

// Create and return the card body with title
function createCardBody(title) {
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = title;

    cardBody.appendChild(cardTitle);

    return cardBody;
}

// Function to display books from cached or fetched data
function displayBooks(books) {
    const fragment = document.createDocumentFragment();
    books.forEach(book => {
        const bookCard = createBookCard(book.title, book.imageUrl, book.isbn);
        fragment.appendChild(bookCard);
    });

    booksContainer.innerHTML = '';  // Clear the current display
    booksContainer.appendChild(fragment);  // Batch append

    // Trigger lazy loading after books are displayed
    lazyLoadImages();
}

// Lazy load images using Intersection Observer API
function lazyLoadImages() {
    const images = document.querySelectorAll('img.lazy');
    const options = {
        rootMargin: '0px 0px 200px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;  // Load the actual image
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    }, options);

    images.forEach(image => {
        observer.observe(image);
    });
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
    if (booksContainer) {
        // Load books when page is loaded
        checkForCachedBooks();
    }
});
