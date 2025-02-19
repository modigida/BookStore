    const form = document.getElementById("tipsForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const modalBody = document.querySelector("#tipsModal .modal-body");
        modalBody.innerHTML = `<div class="alert alert-success" role="alert">Tack för tipset!</div>`;

        setTimeout(() => {
            const tipsModal = bootstrap.Modal.getInstance(document.getElementById("tipsModal"));
            tipsModal.hide();

            form.reset();

            modalBody.innerHTML = `
                <form id="tipsForm">
                    <div class="mb-3">
                        <label for="bookTitle" class="form-label">Bokens titel</label>
                        <input type="text" class="form-control" id="bookTitle" placeholder="Skriv bokens titel">
                    </div>
                    <div class="mb-3">
                        <label for="bookAuthor" class="form-label">Författare (valfritt)</label>
                        <input type="text" class="form-control" id="bookAuthor" placeholder="Skriv författarens namn">
                    </div>
                    <div class="mb-3">
                        <label for="yourEmail" class="form-label">Din e-post (valfritt)</label>
                        <input type="email" class="form-control" id="yourEmail" placeholder="Ange din e-post">
                    </div>
                    <button type="submit" class="btn btn-primary">Skicka tips</button>
                </form>
            `;
        }, 2000);
    });