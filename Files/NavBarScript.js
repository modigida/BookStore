// Fetch and add navbar
fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-placeholder').innerHTML = data;

        initializeCart();
    })
    .catch(error => console.log("Fel vid laddning av navbar:", error));

// Cart items
const cart = [];

// Initialize cart functions
function initializeCart() {
    const cartDropdown = document.getElementById('cart-dropdown');
    const cartCount = document.getElementById('cart-count');

    if (!cartDropdown || !cartCount) {
        console.error("Kundvagnselement kunde inte hittas!");
        return;
    }
    window.addToCart = addToCart;
    window.incrementQuantity = incrementQuantity;
    window.decrementQuantity = decrementQuantity;
    window.openBookModalFromCart = openBookModalFromCart;

    updateCart();
}

async function openBookModal(isbn) {
    const bookData = await fetchBookData(isbn);

    document.getElementById('bookModalLabel').textContent = bookData.title;
    document.getElementById('bookModalImage').src = bookData.imageUrl;
    
    const author = bookData.authors ? bookData.authors.join(', ') : 'Okänd';
    document.getElementById('bookModalAuthor').textContent = author;

    const addToCartButton = document.getElementById('add-to-cart-btn');
    if (addToCartButton) {
        addToCartButton.replaceWith(addToCartButton.cloneNode(true));
        const freshAddToCartButton = document.getElementById('add-to-cart-btn');

        freshAddToCartButton.addEventListener('click', () => {
            addToCart(bookData);

            showNotification("Bok tillagd i varukorg");
            
            const modalEl = document.getElementById('bookModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    } else {
        console.error("Kunde inte hitta knappen 'add-to-cart-btn' i modalen!");
    }

    const myModal = new bootstrap.Modal(document.getElementById('bookModal'));
    myModal.show();
}

function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;

    notif.style.position = 'fixed';
    notif.style.top = '50%';
    notif.style.left = '50%';
    notif.style.transform = 'translate(-50%, -50%)';
    notif.style.background = 'rgba(0, 0, 0, 0.7)';
    notif.style.color = '#fff';
    notif.style.padding = '1em 2em';
    notif.style.borderRadius = '5px';
    notif.style.zIndex = '1050';
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.remove();
    }, 2000);
}

function addToCart(bookData) {
    const existing = cart.find(item => item.isbn === bookData.isbn);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            isbn: bookData.isbn,
            name: bookData.title,
            imageUrl: bookData.imageUrl,
            quantity: 1
        });
    }
    updateCart();
}

function incrementQuantity(isbn) {
    const item = cart.find(item => item.isbn === isbn);
    if (item) {
        item.quantity++;
        updateCart();
    }
}

function decrementQuantity(isbn) {
    const item = cart.find(item => item.isbn === isbn);
    if (item) {
        item.quantity--;
        if (item.quantity <= 0) {
            const index = cart.findIndex(item => item.isbn === isbn);
            if (index > -1) {
                cart.splice(index, 1);
            }
        }
        updateCart();
    }
}

function updateCart() {
    const cartDropdown = document.getElementById('cart-dropdown');
    const cartCount = document.getElementById('cart-count');
    cartDropdown.innerHTML = `
        <li><strong class="dropdown-header">Din Varukorg</strong></li>
        <li><hr class="dropdown-divider"></li>
    `;

    if (cart.length === 0) {
        cartDropdown.innerHTML += '<li id="empty-cart-message"><em>Din varukorg är tom.</em></li>';
    } else {
        cart.forEach(item => {
            cartDropdown.innerHTML += `
                <li class="dropdown-item">
                    <div class="d-flex align-items-center">
                        <img src="${item.imageUrl}" alt="${item.name}" style="width:40px; cursor:pointer;" onclick="openBookModalFromCart('${item.isbn}')">
                        <span style="margin-left: 10px; cursor:pointer;" onclick="openBookModalFromCart('${item.isbn}')">${item.name}</span>
                        <div class="ms-auto d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary" onclick="event.stopPropagation(); decrementQuantity('${item.isbn}')">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary" onclick="event.stopPropagation(); incrementQuantity('${item.isbn}')">+</button>
                        </div>
                    </div>
                </li>
            `;
        });
    }
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

function openBookModalFromCart(isbn) {
    openBookModal(isbn);
}

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
                imageUrl: book.cover ? book.cover.medium : 'https://via.placeholder.com/150?text=No+Cover'
            };
        } else {
            console.error(`No data found for ISBN: ${isbn}`);
            return { title: 'Unknown Title', imageUrl: 'https://via.placeholder.com/150?text=No+Cover' };
        }
    } catch (error) {
        console.error(`Error fetching data for ISBN: ${isbn}`, error);
        return { title: 'Error fetching data', imageUrl: 'https://via.placeholder.com/150?text=Error' };
    }
}