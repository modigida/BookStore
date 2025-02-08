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

// Grid as default layout
let isGridView = true;

toggleBtn.addEventListener('click', () => {
    isGridView = !isGridView;

    // Change icon and layout 
    if (isGridView) {
        toggleIcon.classList.replace('bi-list', 'bi-grid');
        toggleIcon.classList.add('icon-active');
        booksContainer.classList.remove('list-view');
        booksContainer.classList.add('row');
    } else {
        toggleIcon.classList.replace('bi-grid', 'bi-list');
        toggleIcon.classList.remove('icon-active');
        booksContainer.classList.remove('row');
        booksContainer.classList.add('list-view');
    }
});

// Get short book data (title and image)
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
        } else {
            console.error(`No data found for ISBN: ${isbn}`);
            return {
                title: 'Unknown Title',
                imageUrl: 'https://via.placeholder.com/150?text=No+Cover'
            };
        }
    } catch (error) {
        console.error(`Error fetching data for ISBN: ${isbn}`, error);
        return {
            title: 'Error fetching data',
            imageUrl: 'https://via.placeholder.com/150?text=Error'
        };
    }
}

// Get detailed book data for the modal
async function fetchBookData(isbn) {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const bookKey = `ISBN:${isbn}`;
        if (data[bookKey]) {
            const book = data[bookKey];
            return {
                title: book.title,
                authors: book.authors ? book.authors.map(author => author.name) : [],
                numberOfPages: book.number_of_pages || 'N/A',
                publisher: book.publishers ? book.publishers[0].name : 'Unknown Publisher',
                publishDate: book.publish_date || 'Unknown Date',
                publishPlace: book.publish_places ? book.publish_places[0].name : 'Unknown Place',
                isbn: isbn,
                imageUrl: book.cover ? book.cover.medium : 'https://via.placeholder.com/150?text=No+Cover',
            };
        } else {
            console.error(`No data found for ISBN: ${isbn}`);
            return {
                title: 'Unknown Title',
                imageUrl: 'https://via.placeholder.com/150?text=No+Cover',
            };
        }
    } catch (error) {
        console.error(`Error fetching data for ISBN: ${isbn}`, error);
        return {
            title: 'Error fetching data',
            imageUrl: 'https://via.placeholder.com/150?text=Error',
        };
    }
}

// Create book item and add to DOM (using fetchBookSummaryData)
function createBookCard(title, imageUrl, isbn) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col book-item';
    colDiv.setAttribute('data-isbn', isbn);

    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';

    cardDiv.dataset.isbn = isbn;

    const img = document.createElement('img');
    img.className = 'card-img-top';
    img.src = imageUrl;
    img.alt = title;

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = title;

    cardBody.appendChild(cardTitle);
    cardDiv.appendChild(img);
    cardDiv.appendChild(cardBody);
    colDiv.appendChild(cardDiv);

    cardDiv.addEventListener('click', () => {
        openBookModal(isbn);
    });

    return colDiv;
}

// Open modal and fetch detailed book info
async function openBookModal(isbn) {
    const bookData = await fetchBookData(isbn);

    document.getElementById('bookModalLabel').textContent = bookData.title;
    document.getElementById('bookModalImage').src = bookData.imageUrl;

    const author = bookData.authors ? bookData.authors.join(', ') : 'Okänd';
    const numberOfPages = bookData.numberOfPages === "N/A" ? 'Okänt antal sidor' : (bookData.numberOfPages || 'Okänt antal sidor');
    const publisher = bookData.publisher === "Unknown" ? 'Okänt förlag' : (bookData.publisher || 'Okänt förlag');
    const publishDate = bookData.publishDate === "N/A" ? 'Okänt publiceringsår' : (bookData.publishDate || 'Okänt publiceringsår');
    const publishPlace = bookData.publishPlace === "Unknown Place" ? 'Okänd plats' : (bookData.publishPlace || 'Okänd plats');
    const isbnNumber = bookData.isbn === "N/A" ? 'Okänt ISBN' : (bookData.isbn || 'Okänt ISBN');

    document.getElementById('bookModalAuthor').textContent = author;
    document.getElementById('bookModalPages').textContent = numberOfPages;
    document.getElementById('bookModalPublisher').textContent = publisher;
    const publishYear = new Date(publishDate).getFullYear();
    document.getElementById('bookModalPublishDate').textContent = publishYear;
    document.getElementById('bookModalPublishPlace').textContent = publishPlace;
    document.getElementById('bookModalISBN').textContent = isbnNumber;

    const myModal = new bootstrap.Modal(document.getElementById('bookModal'));
    myModal.show();
}

// Load all books from ISBN-array using fetchBookSummaryData for basic display
async function loadBooks() {
    booksContainer.innerHTML = '';

    for (const isbn of isbnList) {
        const bookData = await fetchBookSummaryData(isbn);
        const bookCard = createBookCard(bookData.title, bookData.imageUrl, isbn);
        booksContainer.appendChild(bookCard);
    }
}

// Load books when page is loaded
loadBooks();
