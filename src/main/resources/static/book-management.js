const API_URL = "/api/books";

let allBooks = [];
let editingBookId = null;


// ==========================================
// LOAD BOOKS
// ==========================================

async function loadBooks() {

    const tableBody = document.getElementById("bookTableBody");

    if (!tableBody) {
        console.error("bookTableBody not found");
        return;
    }

    try {

        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-message">
                    Loading books...
                </td>
            </tr>
        `;

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        allBooks = await response.json();

        displayBooks(allBooks);

        updateStatistics();

        populateCategories();

    } catch (error) {

        console.error("Error loading books:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-message">
                    Unable to load books.
                    Make sure the Spring Boot server is running.
                </td>
            </tr>
        `;

        showMessage(
            "Unable to connect to the Book Management API.",
            "error"
        );
    }
}


// ==========================================
// DISPLAY BOOKS
// ==========================================

function displayBooks(books) {

    const tableBody = document.getElementById("bookTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (books.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-message">
                    No books found.
                </td>
            </tr>
        `;

        return;
    }

    books.forEach(book => {

        const row = document.createElement("tr");

        const available = Number(book.availableCopies || 0);

        const availabilityClass =
            available > 0
                ? "available"
                : "unavailable";

        row.innerHTML = `

            <td>${book.bookId ?? ""}</td>

            <td>${escapeHTML(book.isbn)}</td>

            <td>${escapeHTML(book.title)}</td>

            <td>${escapeHTML(book.author)}</td>

            <td>${escapeHTML(book.publisher || "-")}</td>

            <td>${escapeHTML(book.category || "-")}</td>

            <td>${book.totalCopies ?? 0}</td>

            <td>
                <span class="availability ${availabilityClass}">
                    ${available}
                </span>
            </td>

            <td>${escapeHTML(book.shelfLocation || "-")}</td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editBook(${book.bookId})"
                >
                    Edit
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteBook(${book.bookId})"
                >
                    Delete
                </button>

            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ==========================================
// SEARCH BOOKS
// ==========================================

function searchBooks() {

    const searchInput = document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const searchText =
        searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

    const category =
        categoryFilter
            ? categoryFilter.value.toLowerCase()
            : "";

    const filteredBooks = allBooks.filter(book => {

        const matchesSearch =

            String(book.title || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(book.author || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(book.isbn || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(book.category || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(book.publisher || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(book.shelfLocation || "")
                .toLowerCase()
                .includes(searchText);

        const matchesCategory =
            category === "" ||
            String(book.category || "")
                .toLowerCase() === category;

        return matchesSearch && matchesCategory;
    });

    displayBooks(filteredBooks);
}


// ==========================================
// CATEGORY FILTER
// ==========================================

function populateCategories() {

    const categorySelect =
        document.getElementById("categoryFilter");

    if (!categorySelect) return;

    const currentCategory =
        categorySelect.value;

    const categories = [
        ...new Set(
            allBooks
                .map(book => book.category)
                .filter(category => category)
        )
    ].sort();

    categorySelect.innerHTML = `
        <option value="">All Categories</option>
    `;

    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        categorySelect.appendChild(option);
    });

    categorySelect.value = currentCategory;
}


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    const totalTitles =
        allBooks.length;

    const totalCopies =
        allBooks.reduce(
            (sum, book) =>
                sum + Number(book.totalCopies || 0),
            0
        );

    const availableCopies =
        allBooks.reduce(
            (sum, book) =>
                sum + Number(book.availableCopies || 0),
            0
        );

    const issuedCopies =
        totalCopies - availableCopies;


    const totalTitlesElement =
        document.getElementById("totalTitles");

    const totalCopiesElement =
        document.getElementById("totalCopies");

    const availableCopiesElement =
        document.getElementById("availableCopies");

    const issuedCopiesElement =
        document.getElementById("issuedCopies");


    if (totalTitlesElement) {
        totalTitlesElement.textContent = totalTitles;
    }

    if (totalCopiesElement) {
        totalCopiesElement.textContent = totalCopies;
    }

    if (availableCopiesElement) {
        availableCopiesElement.textContent = availableCopies;
    }

    if (issuedCopiesElement) {
        issuedCopiesElement.textContent = issuedCopies;
    }
}


// ==========================================
// OPEN ADD BOOK MODAL
// ==========================================

function openAddBookModal() {

    editingBookId = null;

    document.getElementById("modalTitle")
        .textContent = "Add New Book";

    document.getElementById("bookForm")
        .reset();

    document.getElementById("bookId")
        .value = "";

    document.getElementById("bookModal")
        .classList.add("show");
}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeBookModal() {

    document.getElementById("bookModal")
        .classList.remove("show");

    editingBookId = null;
}


// ==========================================
// EDIT BOOK
// ==========================================

async function editBook(id) {

    try {

        const response =
            await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error("Book not found");
        }

        const book =
            await response.json();

        editingBookId = id;

        document.getElementById("modalTitle")
            .textContent = "Edit Book";

        document.getElementById("bookId")
            .value = book.bookId ?? "";

        document.getElementById("isbn")
            .value = book.isbn || "";

        document.getElementById("title")
            .value = book.title || "";

        document.getElementById("author")
            .value = book.author || "";

        document.getElementById("publisher")
            .value = book.publisher || "";

        document.getElementById("category")
            .value = book.category || "";

        document.getElementById("totalCopies")
            .value = book.totalCopies ?? "";

        document.getElementById("availableCopies")
            .value = book.availableCopies ?? "";

        document.getElementById("shelfLocation")
            .value = book.shelfLocation || "";

        document.getElementById("bookModal")
            .classList.add("show");

    } catch (error) {

        console.error("Error getting book:", error);

        showMessage(
            "Unable to load book details.",
            "error"
        );
    }
}


// ==========================================
// ADD / UPDATE BOOK
// ==========================================

// ==========================================
// ADD / UPDATE BOOK
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const bookForm = document.getElementById("bookForm");

    if (!bookForm) {
        console.error("bookForm not found!");
        return;
    }

    bookForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        // -------------------------------
        // GET FORM ELEMENTS
        // -------------------------------

        const isbnElement = bookForm.querySelector("#isbn");
        const titleElement = bookForm.querySelector("#title");
        const authorElement = bookForm.querySelector("#author");
        const publisherElement = bookForm.querySelector("#publisher");
        const categoryElement = bookForm.querySelector("#category");
        const shelfLocationElement = bookForm.querySelector("#shelfLocation");
        const totalCopiesElement = bookForm.querySelector("#totalCopies");
        const availableCopiesElement = bookForm.querySelector("#availableCopies");

        // Check elements
        if (
            !isbnElement ||
            !titleElement ||
            !authorElement ||
            !publisherElement ||
            !categoryElement ||
            !shelfLocationElement ||
            !totalCopiesElement ||
            !availableCopiesElement
        ) {
            console.error("One or more book form fields were not found.");
            alert("Book form fields are missing. Check the IDs in book-management.html.");
            return;
        }

        // -------------------------------
        // GET VALUES
        // -------------------------------

        const isbn = isbnElement.value.trim();
        const title = titleElement.value.trim();
        const author = authorElement.value.trim();
        const publisher = publisherElement.value.trim();
        const category = categoryElement.value.trim();
        const shelfLocation = shelfLocationElement.value.trim();

        const totalCopiesText = totalCopiesElement.value.trim();
        const availableCopiesText = availableCopiesElement.value.trim();

        console.log("ISBN:", isbn);
        console.log("Title:", title);
        console.log("Total Copies TEXT:", totalCopiesText);
        console.log("Available Copies TEXT:", availableCopiesText);

        // -------------------------------
        // REQUIRED FIELDS
        // -------------------------------

        if (!isbn || !title || !author) {
            alert("Please fill all required fields.");
            return;
        }

        // -------------------------------
        // COPIES CONVERSION
        // -------------------------------

        const totalCopies = Number(totalCopiesText);
        const availableCopies = Number(availableCopiesText);

        console.log("Total Copies NUMBER:", totalCopies);
        console.log("Available Copies NUMBER:", availableCopies);

        // -------------------------------
        // COPIES VALIDATION
        // -------------------------------

        if (
            totalCopiesText === "" ||
            !Number.isInteger(totalCopies) ||
            totalCopies <= 0
        ) {
            alert("Please enter a valid Total Copies.");
            return;
        }

        if (
            availableCopiesText === "" ||
            !Number.isInteger(availableCopies) ||
            availableCopies < 0
        ) {
            alert("Please enter a valid Available Copies.");
            return;
        }

        if (availableCopies > totalCopies) {
            alert("Available Copies cannot be greater than Total Copies.");
            return;
        }

        // -------------------------------
        // BOOK DATA
        // -------------------------------

        const bookData = {
            isbn: isbn,
            title: title,
            author: author,
            publisher: publisher,
            category: category,
            shelfLocation: shelfLocation,
            totalCopies: totalCopies,
            availableCopies: availableCopies
        };

        console.log("BOOK DATA BEING SENT:", bookData);

        // -------------------------------
        // ADD OR UPDATE
        // -------------------------------

        const isEditing = editingBookId !== null;

        const url = isEditing
            ? `${API_URL}/${editingBookId}`
            : API_URL;

        const method = isEditing
            ? "PUT"
            : "POST";

        try {

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(bookData)
            });

            const responseText = await response.text();

            console.log("SERVER RESPONSE:", responseText);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${
                        responseText || "Server rejected the request"
                    }`
                );
            }

            // -------------------------------
            // SUCCESS
            // -------------------------------

            closeBookModal();

            await loadBooks();

            showMessage(
                isEditing
                    ? "Book updated successfully!"
                    : "Book added successfully!",
                "success"
            );

        } catch (error) {

            console.error("Error saving book:", error);

            alert(
                "Unable to save book.\n\n" +
                error.message
            );

        }

    });

});

// ==========================================
// DELETE BOOK
// ==========================================

async function deleteBook(id) {

    const book =
        allBooks.find(
            b => b.bookId === id
        );

    const bookTitle =
        book
            ? book.title
            : "this book";

    const confirmed =
        confirm(
            `Are you sure you want to delete "${bookTitle}"?`
        );

    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            if (response.status === 404) {
                throw new Error("Book not found");
            }

            throw new Error(
                `HTTP ${response.status}: Delete operation failed`
            );
        }


        await loadBooks();


        showMessage(
            "Book deleted successfully!",
            "success"
        );


    } catch (error) {

        console.error(
            "Error deleting book:",
            error
        );

        showMessage(
            "Unable to delete book.",
            "error"
        );
    }
}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(text, type) {

    const message =
        document.getElementById("message");

    if (!message) {

        // Fallback if message element does not exist
        alert(text);

        return;
    }


    message.textContent = text;

    message.className =
        `message ${type}`;


    setTimeout(() => {

        message.className =
            "message";

    }, 3000);
}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


// ==========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==========================================

const bookModal =
    document.getElementById("bookModal");

if (bookModal) {

    bookModal.addEventListener(
        "click",
        function(event) {

            if (event.target === this) {
                closeBookModal();
            }

        }
    );
}


// ==========================================
// INITIAL LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadBooks();

    }
);