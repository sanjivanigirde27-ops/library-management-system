/**
 * Library Management System - Frontend JavaScript (All 8 Modules)
 * Fully connected to Spring Boot REST APIs
 */

const API_BASE = '/api';

// State management
let allBooksCache = [];
let allUsersCache = [];
let activeIssuesCache = [];

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadDashboardNotice();
    loadAllModuleData();
    setupEventListeners();
});

// Navigation Handler for EXACTLY 8 Modules
function initNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-menu .nav-link, .module-card-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetModule = link.getAttribute('data-module');
            showModule(targetModule);
        });
    });
}

function showModule(moduleId) {
    // Update active nav link
    document.querySelectorAll('.sidebar-menu .nav-link').forEach(link => {
        if (link.getAttribute('data-module') === moduleId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Hide all modules and show target
    document.querySelectorAll('.module-section').forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(`module-${moduleId}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Refresh specific module data
    switch (moduleId) {
        case 'users':
            loadUsers();
            break;
        case 'books':
            loadBooks();
            break;
        case 'issue':
            loadIssueFormOptions();
            loadActiveIssues();
            break;
        case 'return':
            loadReturnIssueOptions();
            loadReturnHistory();
            break;
        case 'fines':
            loadFines();
            loadFineSummary();
            break;
        case 'search':
            loadSearchCategories();
            executeSearch();
            break;
        case 'reports':
            loadReportsSummary();
            loadMostIssuedReport();
            loadOverdueReport();
            loadFineReport();
            loadUserActivityReport();
            break;
        case 'admin':
            loadAdminSettings();
            break;
    }
}

function loadAllModuleData() {
    loadUsers();
    loadBooks();
    loadActiveIssues();
    loadFineSummary();
    loadReportsSummary();
    loadAdminSettings();
}

function setupEventListeners() {
    // User Form
    document.getElementById('userForm')?.addEventListener('submit', handleUserFormSubmit);
    
    // Book Form
    document.getElementById('bookForm')?.addEventListener('submit', handleBookFormSubmit);
    
    // Issue Book Form
    document.getElementById('issueBookForm')?.addEventListener('submit', handleIssueBookSubmit);
    
    // Return Book Form
    document.getElementById('returnBookForm')?.addEventListener('submit', handleReturnBookSubmit);
    
    // Pay Fine Form
    document.getElementById('payFineForm')?.addEventListener('submit', handlePayFineSubmit);
    
    // Search Form
    document.getElementById('searchQuery')?.addEventListener('input', debounce(executeSearch, 300));
    document.getElementById('searchCategory')?.addEventListener('change', executeSearch);
    document.getElementById('inStockOnly')?.addEventListener('change', executeSearch);
    
    // Admin Settings Form
    document.getElementById('adminSettingsForm')?.addEventListener('submit', handleAdminSettingsSubmit);
}

// -------------------------------------------------------------
// MODULE 1: USER MANAGEMENT
// -------------------------------------------------------------
async function loadUsers() {
    try {
        const res = await fetch(`${API_BASE}/users`);
        const users = await res.json();
        allUsersCache = users;

        const tbody = document.getElementById('userTableBody');
        if (!tbody) return;

        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No users registered yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td><strong>#${user.id}</strong></td>
                <td>
                    <div class="fw-semibold">${escapeHtml(user.name)}</div>
                    <small class="text-muted">${escapeHtml(user.email)}</small>
                </td>
                <td>${escapeHtml(user.phone || 'N/A')}</td>
                <td><span class="badge bg-secondary">${escapeHtml(user.membershipType || 'Student')}</span></td>
                <td>
                    <span class="badge ${user.status === 'Active' ? 'badge-active' : 'badge-inactive'}">
                        ${escapeHtml(user.status || 'Active')}
                    </span>
                </td>
                <td>${user.createdDate || '-'}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm btn-action me-1" onclick="openEditUserModal(${user.id})" title="Edit User">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm btn-action" onclick="deleteUser(${user.id})" title="Delete User">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Update counts
        const activeCount = users.filter(u => u.status === 'Active').length;
        document.getElementById('userCountTotal').innerText = users.length;
        document.getElementById('userCountActive').innerText = activeCount;
    } catch (err) {
        console.error('Error loading users:', err);
    }
}

function openAddUserModal() {
    document.getElementById('userModalTitle').innerText = 'Add New Member';
    document.getElementById('userId').value = '';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userPhone').value = '';
    document.getElementById('userMembershipType').value = 'Student';
    document.getElementById('userStatus').value = 'Active';
    new bootstrap.Modal(document.getElementById('userModal')).show();
}

function openEditUserModal(id) {
    const user = allUsersCache.find(u => u.id === id);
    if (!user) return;

    document.getElementById('userModalTitle').innerText = 'Edit Member Details';
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userMembershipType').value = user.membershipType || 'Student';
    document.getElementById('userStatus').value = user.status || 'Active';
    new bootstrap.Modal(document.getElementById('userModal')).show();
}

async function handleUserFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('userId').value;
    const userData = {
        name: document.getElementById('userName').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        phone: document.getElementById('userPhone').value.trim(),
        membershipType: document.getElementById('userMembershipType').value,
        status: document.getElementById('userStatus').value
    };

    try {
        const url = id ? `${API_BASE}/users/${id}` : `${API_BASE}/users`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await res.json();
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
            showToast(id ? 'User updated successfully!' : 'New user created successfully!', 'success');
            loadUsers();
        } else {
            showToast(data.error || 'Failed to save user', 'danger');
        }
    } catch (err) {
        showToast('Network error while saving user', 'danger');
    }
}

async function deleteUser(id) {
    if (!confirm(`Are you sure you want to delete user #${id}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok && data.success) {
            showToast('User deleted successfully!', 'success');
            loadUsers();
        } else {
            showToast(data.error || 'Failed to delete user', 'danger');
        }
    } catch (err) {
        showToast('Network error while deleting user', 'danger');
    }
}

// -------------------------------------------------------------
// MODULE 2: BOOK MANAGEMENT
// -------------------------------------------------------------
async function loadBooks() {
    try {
        const res = await fetch(`${API_BASE}/books`);
        const books = await res.json();
        allBooksCache = books;

        const tbody = document.getElementById('bookTableBody');
        if (!tbody) return;

        if (books.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No books in catalog yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = books.map(book => `
            <tr>
                <td><strong>#${book.id}</strong></td>
                <td>
                    <div class="fw-semibold">${escapeHtml(book.title)}</div>
                    <small class="text-muted">ISBN: ${escapeHtml(book.isbn)}</small>
                </td>
                <td>${escapeHtml(book.author)}</td>
                <td><span class="badge bg-light text-dark border">${escapeHtml(book.category)}</span></td>
                <td><small class="text-muted"><i class="bi bi-geo-alt"></i> ${escapeHtml(book.rackNumber || 'N/A')}</small></td>
                <td>
                    <span class="badge ${book.availableCopies > 0 ? 'badge-active' : 'badge-inactive'}">
                        ${book.availableCopies} / ${book.totalCopies} Available
                    </span>
                </td>
                <td>$${Number(book.price || 0).toFixed(2)}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm btn-action me-1" onclick="openEditBookModal(${book.id})" title="Edit Book">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm btn-action" onclick="deleteBook(${book.id})" title="Delete Book">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Update counts
        const totalTitles = books.length;
        const totalCopies = books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
        const availableCopies = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);

        document.getElementById('bookCountTitles').innerText = totalTitles;
        document.getElementById('bookCountCopies').innerText = totalCopies;
        document.getElementById('bookCountAvailable').innerText = availableCopies;
    } catch (err) {
        console.error('Error loading books:', err);
    }
}

function openAddBookModal() {
    document.getElementById('bookModalTitle').innerText = 'Add New Book';
    document.getElementById('bookId').value = '';
    document.getElementById('bookTitle').value = '';
    document.getElementById('bookAuthor').value = '';
    document.getElementById('bookIsbn').value = '';
    document.getElementById('bookCategory').value = 'Computer Science';
    document.getElementById('bookPublisher').value = '';
    document.getElementById('bookRackNumber').value = '';
    document.getElementById('bookTotalCopies').value = '3';
    document.getElementById('bookPrice').value = '25.00';
    new bootstrap.Modal(document.getElementById('bookModal')).show();
}

function openEditBookModal(id) {
    const book = allBooksCache.find(b => b.id === id);
    if (!book) return;

    document.getElementById('bookModalTitle').innerText = 'Edit Book Details';
    document.getElementById('bookId').value = book.id;
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookIsbn').value = book.isbn;
    document.getElementById('bookCategory').value = book.category;
    document.getElementById('bookPublisher').value = book.publisher || '';
    document.getElementById('bookRackNumber').value = book.rackNumber || '';
    document.getElementById('bookTotalCopies').value = book.totalCopies || 1;
    document.getElementById('bookPrice').value = book.price || 0.0;
    new bootstrap.Modal(document.getElementById('bookModal')).show();
}

async function handleBookFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('bookId').value;
    const bookData = {
        title: document.getElementById('bookTitle').value.trim(),
        author: document.getElementById('bookAuthor').value.trim(),
        isbn: document.getElementById('bookIsbn').value.trim(),
        category: document.getElementById('bookCategory').value.trim(),
        publisher: document.getElementById('bookPublisher').value.trim(),
        rackNumber: document.getElementById('bookRackNumber').value.trim(),
        totalCopies: parseInt(document.getElementById('bookTotalCopies').value, 10),
        price: parseFloat(document.getElementById('bookPrice').value)
    };

    try {
        const url = id ? `${API_BASE}/books/${id}` : `${API_BASE}/books`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });

        const data = await res.json();
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('bookModal')).hide();
            showToast(id ? 'Book updated successfully!' : 'Book added to catalog successfully!', 'success');
            loadBooks();
        } else {
            showToast(data.error || 'Failed to save book', 'danger');
        }
    } catch (err) {
        showToast('Network error while saving book', 'danger');
    }
}

async function deleteBook(id) {
    if (!confirm(`Are you sure you want to delete book #${id}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok && data.success) {
            showToast('Book removed from catalog!', 'success');
            loadBooks();
        } else {
            showToast(data.error || 'Failed to delete book', 'danger');
        }
    } catch (err) {
        showToast('Network error while deleting book', 'danger');
    }
}

// -------------------------------------------------------------
// MODULE 3: BOOK ISSUE
// -------------------------------------------------------------
async function loadIssueFormOptions() {
    // Populate Active Users Dropdown
    try {
        const resUsers = await fetch(`${API_BASE}/users/active`);
        const users = await resUsers.json();
        const userSelect = document.getElementById('issueUserId');
        if (userSelect) {
            userSelect.innerHTML = '<option value="">-- Choose Active Member --</option>' +
                users.map(u => `<option value="${u.id}">#${u.id} - ${escapeHtml(u.name)} (${escapeHtml(u.membershipType)})</option>`).join('');
        }

        // Populate Available Books Dropdown
        const resBooks = await fetch(`${API_BASE}/books/available`);
        const books = await resBooks.json();
        const bookSelect = document.getElementById('issueBookId');
        if (bookSelect) {
            bookSelect.innerHTML = '<option value="">-- Choose Book in Stock --</option>' +
                books.map(b => `<option value="${b.id}">#${b.id} - ${escapeHtml(b.title)} [Stock: ${b.availableCopies}]</option>`).join('');
        }
    } catch (err) {
        console.error('Error loading issue options:', err);
    }
}

async function loadActiveIssues() {
    try {
        const res = await fetch(`${API_BASE}/issues/active`);
        const issues = await res.json();
        activeIssuesCache = issues;

        const tbody = document.getElementById('activeIssuesTableBody');
        if (!tbody) return;

        const activeOnly = issues.filter(i => i.status !== 'RETURNED');
        if (activeOnly.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No books currently issued out.</td></tr>`;
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        tbody.innerHTML = activeOnly.map(issue => {
            const isOverdue = issue.dueDate < today;
            const badgeClass = isOverdue ? 'badge-overdue' : 'badge-issued';
            const statusText = isOverdue ? 'OVERDUE' : 'ISSUED';

            return `
                <tr>
                    <td><strong>#${issue.id}</strong></td>
                    <td>
                        <div class="fw-semibold">${escapeHtml(issue.user.name)}</div>
                        <small class="text-muted">ID: #${issue.user.id} | ${escapeHtml(issue.user.email)}</small>
                    </td>
                    <td>
                        <div class="fw-semibold">${escapeHtml(issue.book.title)}</div>
                        <small class="text-muted">ISBN: ${escapeHtml(issue.book.isbn)}</small>
                    </td>
                    <td>${issue.issueDate}</td>
                    <td class="${isOverdue ? 'text-danger fw-bold' : ''}">${issue.dueDate}</td>
                    <td><span class="badge ${badgeClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="quickReturnSelect(${issue.id})" title="Return this book">
                            <i class="bi bi-arrow-return-left"></i> Return
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        document.getElementById('activeIssueCount').innerText = activeOnly.length;
    } catch (err) {
        console.error('Error loading active issues:', err);
    }
}

async function handleIssueBookSubmit(e) {
    e.preventDefault();
    const payload = {
        userId: document.getElementById('issueUserId').value,
        bookId: document.getElementById('issueBookId').value,
        loanDays: parseInt(document.getElementById('issueLoanDays').value, 10),
        remarks: document.getElementById('issueRemarks').value.trim()
    };

    if (!payload.userId || !payload.bookId) {
        showToast('Please select both a member and a book.', 'warning');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/issues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
            showToast(`Book successfully issued to ${data.user.name}! Due Date: ${data.dueDate}`, 'success');
            document.getElementById('issueBookForm').reset();
            loadIssueFormOptions();
            loadActiveIssues();
            loadBooks(); // refresh stock numbers
        } else {
            showToast(data.error || 'Failed to issue book', 'danger');
        }
    } catch (err) {
        showToast('Network error while issuing book', 'danger');
    }
}

// -------------------------------------------------------------
// MODULE 4: BOOK RETURN
// -------------------------------------------------------------
async function loadReturnIssueOptions() {
    try {
        const res = await fetch(`${API_BASE}/issues/active`);
        const issues = await res.json();
        const activeOnly = issues.filter(i => i.status !== 'RETURNED');

        const select = document.getElementById('returnIssueSelect');
        if (select) {
            select.innerHTML = '<option value="">-- Select Active Issue Transaction --</option>' +
                activeOnly.map(i => `<option value="${i.id}">#${i.id} - ${escapeHtml(i.book.title)} (Member: ${escapeHtml(i.user.name)})</option>`).join('');
        }
    } catch (err) {
        console.error('Error loading return issue options:', err);
    }
}

function onReturnIssueSelected() {
    const issueId = document.getElementById('returnIssueSelect').value;
    const previewBox = document.getElementById('returnCalcPreview');

    if (!issueId) {
        previewBox.classList.add('d-none');
        return;
    }

    const issue = activeIssuesCache.find(i => i.id == issueId);
    if (!issue) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const dueDate = new Date(issue.dueDate);
    const today = new Date(todayStr);

    const diffTime = today - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const overdueDays = diffDays > 0 ? diffDays : 0;
    const finePerDay = 5.0; // standard default
    const estFine = overdueDays * finePerDay;

    document.getElementById('previewBookTitle').innerText = issue.book.title;
    document.getElementById('previewUserName').innerText = issue.user.name;
    document.getElementById('previewIssueDate').innerText = issue.issueDate;
    document.getElementById('previewDueDate').innerText = issue.dueDate;
    document.getElementById('previewOverdueDays').innerText = `${overdueDays} days`;
    document.getElementById('previewFineAmount').innerText = `$${estFine.toFixed(2)}`;

    if (overdueDays > 0) {
        document.getElementById('previewFineAmount').className = 'text-danger fw-bold fs-5';
    } else {
        document.getElementById('previewFineAmount').className = 'text-success fw-bold fs-5';
    }

    previewBox.classList.remove('d-none');
}

function quickReturnSelect(issueId) {
    showModule('return');
    setTimeout(() => {
        const select = document.getElementById('returnIssueSelect');
        if (select) {
            select.value = issueId;
            onReturnIssueSelected();
        }
    }, 200);
}

async function handleReturnBookSubmit(e) {
    e.preventDefault();
    const issueId = document.getElementById('returnIssueSelect').value;
    const remarks = document.getElementById('returnRemarks').value.trim();

    if (!issueId) {
        showToast('Please select an active issue record to return.', 'warning');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/returns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ issueId, remarks })
        });

        const data = await res.json();
        if (res.ok && data.success) {
            showToast(data.message, data.fineAmount > 0 ? 'warning' : 'success');
            document.getElementById('returnBookForm').reset();
            document.getElementById('returnCalcPreview').classList.add('d-none');
            loadReturnIssueOptions();
            loadReturnHistory();
            loadActiveIssues();
            loadBooks(); // refresh stock
            loadFineSummary();
        } else {
            showToast(data.error || 'Failed to process return', 'danger');
        }
    } catch (err) {
        showToast('Network error while processing return', 'danger');
    }
}

async function loadReturnHistory() {
    try {
        const res = await fetch(`${API_BASE}/returns/history`);
        const history = await res.json();

        const tbody = document.getElementById('returnHistoryTableBody');
        if (!tbody) return;

        if (history.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No return records yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = history.map(item => `
            <tr>
                <td><strong>#${item.id}</strong></td>
                <td>${escapeHtml(item.user.name)}</td>
                <td>${escapeHtml(item.book.title)}</td>
                <td>${item.issueDate}</td>
                <td>${item.dueDate}</td>
                <td class="text-success fw-bold">${item.returnDate || '-'}</td>
                <td><span class="badge badge-returned">RETURNED</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading return history:', err);
    }
}

// -------------------------------------------------------------
// MODULE 5: FINE MANAGEMENT
// -------------------------------------------------------------
let allFinesCache = [];

async function loadFines() {
    try {
        const res = await fetch(`${API_BASE}/fines`);
        const fines = await res.json();
        allFinesCache = fines;
        renderFineTable(fines);
    } catch (err) {
        console.error('Error loading fines:', err);
    }
}

function renderFineTable(fines) {
    const tbody = document.getElementById('fineTableBody');
    if (!tbody) return;

    if (fines.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No fine records found.</td></tr>`;
        return;
    }

    tbody.innerHTML = fines.map(fine => {
        let badgeClass = 'badge-unpaid';
        if (fine.status === 'PAID') badgeClass = 'badge-paid';
        if (fine.status === 'WAIVED') badgeClass = 'badge-waived';

        return `
            <tr>
                <td><strong>#${fine.id}</strong></td>
                <td>
                    <div class="fw-semibold">${escapeHtml(fine.user ? fine.user.name : 'N/A')}</div>
                    <small class="text-muted">Issue #${fine.bookIssue ? fine.bookIssue.id : '-'}</small>
                </td>
                <td>${fine.bookIssue && fine.bookIssue.book ? escapeHtml(fine.bookIssue.book.title) : 'Book'}</td>
                <td>${fine.overdueDays} days</td>
                <td class="fw-bold">$${Number(fine.amount).toFixed(2)}</td>
                <td><span class="badge ${badgeClass}">${fine.status}</span></td>
                <td>
                    <small>${fine.paidDate ? fine.paidDate : '-'}</small>
                    ${fine.paymentMode ? `<br><span class="badge bg-secondary">${fine.paymentMode}</span>` : ''}
                </td>
                <td>
                    ${fine.status === 'UNPAID' ? `
                        <button class="btn btn-sm btn-success btn-action me-1" onclick="openPayFineModal(${fine.id}, ${fine.amount})" title="Collect Fine Payment">
                            <i class="bi bi-cash-coin"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary btn-action" onclick="waiveFine(${fine.id})" title="Waive Fine">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    ` : `<span class="text-muted"><i class="bi bi-check-circle-fill text-success"></i> Settled</span>`}
                </td>
            </tr>
        `;
    }).join('');
}

function filterFines(status) {
    if (status === 'ALL') {
        renderFineTable(allFinesCache);
    } else {
        renderFineTable(allFinesCache.filter(f => f.status === status));
    }
}

async function loadFineSummary() {
    try {
        const res = await fetch(`${API_BASE}/fines/summary`);
        const summary = await res.json();

        document.getElementById('fineTotalAmount').innerText = `$${Number(summary.totalFineAmount || 0).toFixed(2)}`;
        document.getElementById('fineCollectedAmount').innerText = `$${Number(summary.totalCollectedFine || 0).toFixed(2)}`;
        document.getElementById('finePendingAmount').innerText = `$${Number(summary.totalPendingFine || 0).toFixed(2)}`;
        document.getElementById('fineUnpaidCount').innerText = summary.unpaidCount || 0;
    } catch (err) {
        console.error('Error loading fine summary:', err);
    }
}

function openPayFineModal(fineId, amount) {
    document.getElementById('payFineId').value = fineId;
    document.getElementById('payFineAmount').innerText = `$${Number(amount).toFixed(2)}`;
    document.getElementById('payFineMode').value = 'Cash';
    document.getElementById('payFineRemarks').value = 'Paid at circulation desk';
    new bootstrap.Modal(document.getElementById('payFineModal')).show();
}

async function handlePayFineSubmit(e) {
    e.preventDefault();
    const fineId = document.getElementById('payFineId').value;
    const paymentMode = document.getElementById('payFineMode').value;
    const remarks = document.getElementById('payFineRemarks').value.trim();

    try {
        const res = await fetch(`${API_BASE}/fines/${fineId}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentMode, remarks })
        });

        const data = await res.json();
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('payFineModal')).hide();
            showToast(`Fine #${fineId} payment recorded successfully via ${paymentMode}!`, 'success');
            loadFines();
            loadFineSummary();
        } else {
            showToast(data.error || 'Failed to record fine payment', 'danger');
        }
    } catch (err) {
        showToast('Network error while paying fine', 'danger');
    }
}

async function waiveFine(fineId) {
    const reason = prompt('Enter reason for waiving this fine:');
    if (reason === null) return;

    try {
        const res = await fetch(`${API_BASE}/fines/${fineId}/waive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ remarks: reason })
        });

        const data = await res.json();
        if (res.ok) {
            showToast(`Fine #${fineId} has been waived.`, 'info');
            loadFines();
            loadFineSummary();
        } else {
            showToast(data.error || 'Failed to waive fine', 'danger');
        }
    } catch (err) {
        showToast('Network error while waiving fine', 'danger');
    }
}

// -------------------------------------------------------------
// MODULE 6: SEARCH BOOK
// -------------------------------------------------------------
async function loadSearchCategories() {
    try {
        const res = await fetch(`${API_BASE}/search/categories`);
        const categories = await res.json();
        const select = document.getElementById('searchCategory');
        if (select) {
            select.innerHTML = '<option value="All">All Categories</option>' +
                categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
        }
    } catch (err) {
        console.error('Error loading search categories:', err);
    }
}

async function executeSearch() {
    const query = document.getElementById('searchQuery')?.value.trim() || '';
    const category = document.getElementById('searchCategory')?.value || 'All';
    const inStockOnly = document.getElementById('inStockOnly')?.checked || false;

    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category && category !== 'All') params.append('category', category);
    if (inStockOnly) params.append('inStockOnly', 'true');

    try {
        const res = await fetch(`${API_BASE}/search?${params.toString()}`);
        const books = await res.json();

        const grid = document.getElementById('searchResultsGrid');
        if (!grid) return;

        if (books.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search fs-1 text-muted"></i>
                    <h5 class="mt-3 text-muted">No books found matching your search.</h5>
                    <p class="text-secondary small">Try changing your keywords or category filter.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = books.map(book => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="book-card">
                    <div>
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="badge bg-light text-primary border">${escapeHtml(book.category)}</span>
                            <span class="badge ${book.availableCopies > 0 ? 'badge-active' : 'badge-inactive'}">
                                ${book.availableCopies > 0 ? `${book.availableCopies} in Stock` : 'Out of Stock'}
                            </span>
                        </div>
                        <h6 class="book-card-title">${escapeHtml(book.title)}</h6>
                        <div class="book-card-author"><i class="bi bi-person"></i> ${escapeHtml(book.author)}</div>
                        <div class="small text-muted mb-2">
                            <div><i class="bi bi-upc-scan"></i> <strong>ISBN:</strong> ${escapeHtml(book.isbn)}</div>
                            <div><i class="bi bi-geo-alt"></i> <strong>Rack:</strong> ${escapeHtml(book.rackNumber || 'General')}</div>
                            <div><i class="bi bi-building"></i> <strong>Publisher:</strong> ${escapeHtml(book.publisher || '-')}</div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                        <span class="fw-bold text-primary">$${Number(book.price || 0).toFixed(2)}</span>
                        ${book.availableCopies > 0 ? `
                            <button class="btn btn-sm btn-outline-primary" onclick="quickIssueBook(${book.id})">
                                <i class="bi bi-journal-arrow-up"></i> Issue This Book
                            </button>
                        ` : `
                            <button class="btn btn-sm btn-secondary" disabled>Unavailable</button>
                        `}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error executing search:', err);
    }
}

function quickIssueBook(bookId) {
    showModule('issue');
    setTimeout(() => {
        const bookSelect = document.getElementById('issueBookId');
        if (bookSelect) bookSelect.value = bookId;
    }, 200);
}

// -------------------------------------------------------------
// MODULE 7: LIBRARY REPORTS
// -------------------------------------------------------------
async function loadReportsSummary() {
    try {
        const res = await fetch(`${API_BASE}/reports/summary`);
        const summary = await res.json();

        document.getElementById('repTotalBooks').innerText = summary.totalCopies || 0;
        document.getElementById('repAvailableBooks').innerText = summary.availableCopies || 0;
        document.getElementById('repTotalUsers').innerText = summary.totalUsers || 0;
        document.getElementById('repActiveIssues').innerText = summary.activeIssues || 0;
        document.getElementById('repOverdueIssues').innerText = summary.overdueIssues || 0;
        document.getElementById('repFineCollected').innerText = `$${Number(summary.collectedFineAmount || 0).toFixed(2)}`;
    } catch (err) {
        console.error('Error loading report summary:', err);
    }
}

async function loadMostIssuedReport() {
    try {
        const res = await fetch(`${API_BASE}/reports/most-issued`);
        const list = await res.json();

        const tbody = document.getElementById('repMostIssuedBody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No issue data available yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map((item, idx) => `
            <tr>
                <td><strong>#${idx + 1}</strong></td>
                <td><div class="fw-semibold">${escapeHtml(item.title)}</div></td>
                <td>${escapeHtml(item.author)}</td>
                <td><span class="badge bg-light text-dark border">${escapeHtml(item.category)}</span></td>
                <td><span class="badge bg-primary fs-6">${item.timesIssued} times</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading most issued report:', err);
    }
}

async function loadOverdueReport() {
    try {
        const res = await fetch(`${API_BASE}/reports/overdue`);
        const list = await res.json();

        const tbody = document.getElementById('repOverdueBody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-success py-3"><i class="bi bi-check-circle"></i> No overdue books currently! Great job!</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(item => `
            <tr>
                <td><strong>#${item.issueId}</strong></td>
                <td>
                    <div class="fw-semibold">${escapeHtml(item.userName)}</div>
                    <small class="text-muted">${escapeHtml(item.userPhone || item.userEmail)}</small>
                </td>
                <td>${escapeHtml(item.bookTitle)}</td>
                <td class="text-danger fw-bold">${item.dueDate}</td>
                <td><span class="badge badge-overdue">${item.daysOverdue} days late</span></td>
                <td class="text-danger fw-bold">$${Number(item.estimatedFine).toFixed(2)}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading overdue report:', err);
    }
}

async function loadFineReport() {
    try {
        const res = await fetch(`${API_BASE}/reports/fines`);
        const list = await res.json();

        const tbody = document.getElementById('repFineCollectionBody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No fines generated yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(f => `
            <tr>
                <td><strong>#${f.id}</strong></td>
                <td>${escapeHtml(f.user ? f.user.name : '-')}</td>
                <td>$${Number(f.amount).toFixed(2)}</td>
                <td><span class="badge ${f.status === 'PAID' ? 'badge-paid' : 'badge-unpaid'}">${f.status}</span></td>
                <td>${f.paidDate || '-'}</td>
                <td>${f.paymentMode || '-'}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading fine report:', err);
    }
}

async function loadUserActivityReport() {
    try {
        const res = await fetch(`${API_BASE}/reports/user-activity`);
        const list = await res.json();

        const tbody = document.getElementById('repUserActivityBody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No user activity recorded.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(item => `
            <tr>
                <td><strong>#${item.userId}</strong></td>
                <td>
                    <div class="fw-semibold">${escapeHtml(item.userName)}</div>
                    <small class="text-muted">${escapeHtml(item.userEmail)}</small>
                </td>
                <td><span class="badge bg-secondary">${escapeHtml(item.membershipType)}</span></td>
                <td><span class="badge bg-info text-dark">${item.totalBorrowed}</span></td>
                <td><span class="badge bg-warning text-dark">${item.currentlyHolding}</span></td>
                <td><span class="badge bg-success">${item.totalReturned}</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading user activity report:', err);
    }
}

// -------------------------------------------------------------
// MODULE 8: ADMIN / LIBRARIAN
// -------------------------------------------------------------
async function loadAdminSettings() {
    try {
        const res = await fetch(`${API_BASE}/admin/settings`);
        const s = await res.json();

        // Populate Form
        document.getElementById('settingLibraryName').value = s.libraryName || '';
        document.getElementById('settingLibrarianName').value = s.librarianName || '';
        document.getElementById('settingLibrarianEmail').value = s.librarianEmail || '';
        document.getElementById('settingLibrarianPhone').value = s.librarianPhone || '';
        document.getElementById('settingMaxBooks').value = s.maxBooksPerUser || 3;
        document.getElementById('settingLoanPeriod').value = s.loanPeriodDays || 14;
        document.getElementById('settingFineRate').value = s.fineRatePerDay || 5.0;
        document.getElementById('settingNotice').value = s.systemNotice || '';

        // Profile Display Card
        document.getElementById('adminCardLibName').innerText = s.libraryName;
        document.getElementById('adminCardName').innerText = s.librarianName;
        document.getElementById('adminCardEmail').innerText = s.librarianEmail;
        document.getElementById('adminCardPhone').innerText = s.librarianPhone || '+1-555-0199';
        document.getElementById('adminCardLoanDays').innerText = `${s.loanPeriodDays} Days`;
        document.getElementById('adminCardFineRate').innerText = `$${s.fineRatePerDay}/day`;

        // Update topbar banner
        if (s.systemNotice) {
            document.getElementById('dashboardNoticeText').innerText = s.systemNotice;
            document.getElementById('topbarLibraryName').innerText = s.libraryName;
        }
    } catch (err) {
        console.error('Error loading admin settings:', err);
    }
}

async function handleAdminSettingsSubmit(e) {
    e.preventDefault();
    const settings = {
        libraryName: document.getElementById('settingLibraryName').value.trim(),
        librarianName: document.getElementById('settingLibrarianName').value.trim(),
        librarianEmail: document.getElementById('settingLibrarianEmail').value.trim(),
        librarianPhone: document.getElementById('settingLibrarianPhone').value.trim(),
        maxBooksPerUser: parseInt(document.getElementById('settingMaxBooks').value, 10),
        loanPeriodDays: parseInt(document.getElementById('settingLoanPeriod').value, 10),
        fineRatePerDay: parseFloat(document.getElementById('settingFineRate').value),
        systemNotice: document.getElementById('settingNotice').value.trim()
    };

    try {
        const res = await fetch(`${API_BASE}/admin/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });

        if (res.ok) {
            showToast('System configuration & Librarian profile updated successfully!', 'success');
            loadAdminSettings();
        } else {
            showToast('Failed to update system settings.', 'danger');
        }
    } catch (err) {
        showToast('Network error while updating settings', 'danger');
    }
}

function loadDashboardNotice() {
    loadAdminSettings();
}

// -------------------------------------------------------------
// HELPER UTILITIES
// -------------------------------------------------------------
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-info-circle me-2"></i> ${escapeHtml(message)}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
