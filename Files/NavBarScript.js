// Hämta och lägg till navbar
fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-placeholder').innerHTML = data;

        // Kör koden som använder elementen från navbar.html efter att de har lagts till i DOM:en
        initializeCart();
    });

// Globala variabler för kundvagnen
const cart = [];

// Funktionen som initierar kundvagnens funktionalitet
function initializeCart() {
    const cartDropdown = document.getElementById('cart-dropdown');
    const cartCount = document.getElementById('cart-count');
    const emptyMessage = document.getElementById('empty-cart-message');

    // Funktion för att uppdatera kundvagnen
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

    // Lägg till produkt i kundvagnen
    window.addToCart = function (productName) {
        cart.push({ name: productName });
        updateCart();
    };

    // Ta bort produkt från kundvagnen
    window.removeFromCart = function (index) {
        cart.splice(index, 1);
        updateCart();
    };

    // Initiera kundvagnen
    updateCart();
}
