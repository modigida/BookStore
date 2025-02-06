const toggleBtn = document.getElementById('toggle-view-btn');
const toggleIcon = document.getElementById('toggle-icon');
const booksContainer = document.getElementById('books-container');

let isGridView = true; // Grid as default layout

toggleBtn.addEventListener('click', () => {
    isGridView = !isGridView;

    // Change icon depending on layout
    if (isGridView) {
        toggleIcon.classList.replace('bi-list', 'bi-grid');
        booksContainer.classList.remove('list-view');
        booksContainer.classList.add('row');
    } else {
        toggleIcon.classList.replace('bi-grid', 'bi-list');
        booksContainer.classList.remove('row');
        booksContainer.classList.add('list-view');
    }
});