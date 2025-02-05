fetch('navbar.html')
.then(response => response.text())
.then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;
});
    
    const cart = [];

    // Update shopping cart
    function updateCart() {
        const cartDropdown = document.getElementById('cart-dropdown');
        const cartCount = document.getElementById('cart-count');
        const emptyMessage = document.getElementById('empty-cart-message');

        // Töm dropdown-menyn
        cartDropdown.innerHTML = `
            <li><strong class="dropdown-header">Din Varukorg</strong></li>
            <li><hr class="dropdown-divider"></li>
        `;

        if (cart.length === 0) {
            // Empty shopping cart message
            cartDropdown.innerHTML += '<li id="empty-cart-message"><em>Din varukorg är tom.</em></li>';
        } else {
            // Add items in shopping cart drop-down
            cart.forEach((product, index) => {
                cartDropdown.innerHTML += `
                    <li class="dropdown-item d-flex justify-content-between align-items-center">
                        ${product.name}
                        <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">Ta bort</button>
                    </li>
                `;
            });
        }

        // Amount of items in shopping cart
        cartCount.textContent = cart.length;
    }

    // Add item to shopping cart
    function addToCart(productName) {
        cart.push({ name: productName });
        updateCart();
    }

    // Delete product from shopping cart 
    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCart();
    }

    // Initialize shopping cart on start
    document.addEventListener('DOMContentLoaded', updateCart);
