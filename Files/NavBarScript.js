// Fetch and add navbar
fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-placeholder').innerHTML = data;

        initializeCart();
        console.log("navbar inladdad");
    })
    .catch(error => console.log("Fel vid laddning av navbar:", error));

// Cart items
const cart = [];

// Initialize cart functions
function initializeCart() {
    const cartDropdown = document.getElementById('cart-dropdown');
    const cartCount = document.getElementById('cart-count');
    const emptyMessage = document.getElementById('empty-cart-message');

    if (!cartDropdown || !cartCount) {
        console.error("Kundvagnselement kunde inte hittas!");
        return;
    }

    // Update cart
    function updateCart() {
        cartDropdown.innerHTML = `
            <li><strong class="dropdown-header">Din Varukorg</strong></li>
            <li><hr class="dropdown-divider"></li>
        `;

        if (cart.length === 0) {
            cartDropdown.innerHTML += '<li id="empty-cart-message"><em>Din varukorg är tom.</em></li>';
        } else {
            cart.forEach((product, index) => {
                cartDropdown.innerHTML += `
                    <li class="dropdown-item d-flex justify-content-between align-items-center">
                        ${product.name}
                        <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">Ta bort</button>
                    </li>
                `;
            });
        }
        cartCount.textContent = cart.length;
    }

    // Add products to cart
    window.addToCart = function (productName) {
        cart.push({ name: productName });
        updateCart();
    };

    // Delete products from cart
    window.removeFromCart = function (index) {
        cart.splice(index, 1);
        updateCart();
    };

    // Initialize cart
    updateCart();
}

// Open modal and fetch detailed book info
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
            addToCart(bookData.title);
        });
    } else {
        console.error("Kunde inte hitta knappen 'add-to-cart-btn' i modalen!");
    }

    const myModal = new bootstrap.Modal(document.getElementById('bookModal'));
    myModal.show();
}

