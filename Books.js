const toggleBtn = document.getElementById('toggle-view-btn');
const toggleIcon = document.getElementById('toggle-icon');
const booksContainer = document.getElementById('books-container');

const isbnList = [
    '9789152731130', '9780375842207', '9780571365470', '9780385490818',
    '9781408728512', '9780743273565', '9780374602604', '9781476738017',
    '9781250301697', '9780735219090', '9780143469131', '9780525559474',
    '9780399590504', '9781471156267', '9780062797155', '9780399167065' 
];

let books = [];

function checkForCachedBooks() {
    console.log("Checking for cached books...");
    const cachedBooks = localStorage.getItem('books');
    const cacheTimestamp = localStorage.getItem('cacheTimestamp');
    const now = Date.now();

    if (cachedBooks && cacheTimestamp && now - cacheTimestamp < 86400000) {
        const loadingContainer = document.getElementById('loading-container');
            if (loadingContainer) {
                loadingContainer.remove();
            } else {
                console.error("Loading-container hittades inte!");
            }
        displayBooks(JSON.parse(cachedBooks));
    } else {
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
        }, 200);
    });
}

async function fetchBookSummaryData(isbn) {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const bookKey = `ISBN:${isbn}`;
        if (data[bookKey]) {
            const book = data[bookKey];
            const imageUrl = book.cover ? book.cover.medium : 'https://via.placeholder.com/150?text=No+Cover';

            const convertedImage = await convertImageToFormat(imageUrl, 'webp'); 

            return {
                title: book.title,
                imageUrl: convertedImage
            };
        }
        return { title: 'Unknown Title', imageUrl: 'https://via.placeholder.com/150?text=No+Cover' };
    } catch (error) {
        console.error(`Error fetching data for ISBN: ${isbn}`, error);
        return { title: 'Error fetching data', imageUrl: 'https://via.placeholder.com/150?text=Error' };
    }
}

async function convertImageToFormat(imageUrl, format = 'webp') {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; 
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const convertedImageUrl = canvas.toDataURL(`image/${format}`);
            console.log(convertedImageUrl);
            resolve(convertedImageUrl);
        };

        img.onerror = () => {
            console.error(`Failed to load image: ${imageUrl}`);
            resolve(imageUrl); 
        };
    });
}

async function loadBooks() {
    let index = 0;

    const loadNextBatch = async () => {
        const batch = isbnList.slice(index, index + 4);
        const batchBooks = [];

        for (const isbn of batch) {
            const bookData = await fetchBookSummaryData(isbn);
            batchBooks.push({ title: bookData.title, imageUrl: bookData.imageUrl, isbn: isbn });
        }

        books.push(...batchBooks);
        displayBooks(batchBooks); 

        if (index === 0) {
            const loadingContainer = document.getElementById('loading-container');
            if (loadingContainer) {
                loadingContainer.remove();
            } else {
                console.error("Loading-container hittades inte!");
            }
        }

        index += 4;

        if (index < isbnList.length) {
            loadNextBatch();
        } else {
            localStorage.setItem('books', JSON.stringify(books)); 
            localStorage.setItem('cacheTimestamp', Date.now());
        }
    };

    loadNextBatch(); 
}


function createBookCard(title, imageUrl, isbn) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col book-item';
    colDiv.setAttribute('data-isbn', isbn);

    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.dataset.isbn = isbn;

    const img = createImageElement(imageUrl, title);
    const cardBody = createCardBody(title);

    cardDiv.appendChild(img);
    cardDiv.appendChild(cardBody);
    colDiv.appendChild(cardDiv);

    cardDiv.addEventListener('click', () => openBookModal(isbn));

    return colDiv;
}

function createImageElement(imageUrl, title) {
    let altText = "Cover image of " + title;
    const img = document.createElement('img');
    img.className = 'card-img-top lazy';
    img.dataset.src = imageUrl;
    img.alt = altText;

    img.style.height = '200px'; 
    img.style.width = '100%';
    img.style.objectFit = 'contain'; 

    img.onerror = () => {
        img.src = 'https://via.placeholder.com/150?text=No+Cover';
    };

    return img;
}

function createCardBody(title) {
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = title;

    cardBody.appendChild(cardTitle);

    return cardBody;
}

function displayBooks(bookList) {
   const fragment = document.createDocumentFragment();
    bookList.forEach(book => {
        const bookCard = createBookCard(book.title, book.imageUrl, book.isbn);
        fragment.appendChild(bookCard);
    });

    booksContainer.appendChild(fragment);

    lazyLoadImages(); 
}


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
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    }, options);

    images.forEach(image => {
        observer.observe(image);
    });
}

function openBookModal(isbn) {
    const book = books.find(b => b.isbn === isbn);

    if (!book) { console.error("Boken hittades inte."); return; }

    document.getElementById('bookModalLabel').textContent = book.title;
    document.getElementById('bookModalImage').src = book.imageUrl;
    document.getElementById('bookModalISBN').textContent = isbn;

    const modal = new bootstrap.Modal(document.getElementById('bookModal'));
    modal.show();

    const addToCartBtn = document.getElementById('add-to-cart-btn');
    addToCartBtn.onclick = function () {
        addToCart(book);
        showNotification(`${book.title} har lagts till i varukorgen!`);
    };
}

const closeModal = () => {
    const modal = document.getElementById("modal");
    modal.setAttribute("aria-hidden", "true");

    document.getElementById("openModalButton").focus();
};

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded event triggered.");
    const cachedBooks = localStorage.getItem('books');
    if (cachedBooks) {
        books = JSON.parse(cachedBooks);
    }

    if (booksContainer) {
        checkForCachedBooks();
    }
});

// Used for development:

/* window.addEventListener('beforeunload', () => {
    localStorage.clear(); // Tömmer hela localStorage
});  */