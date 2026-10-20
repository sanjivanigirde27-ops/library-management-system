/**
 * ==============================================================================
 * EduLibrary - Library Management System (Frontend Application Logic)
 * 8 Dedicated Business Modules + Dashboard Overview
 * Connected to Java Spring Boot REST Backend & MySQL Database
 * ==============================================================================
 */

// Configurable API Base URL (defaults to '/api' for same-origin or localhost:8080)
const API_BASE = '/api';

// ------------------------------------------------------------------------------
// Reusable API Client Helper
// ------------------------------------------------------------------------------
const apiClient = {
    async request(endpoint, options = {}) {
        showLoading(true);
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const contentType = response.headers.get('content-type');
            let data = null;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMessage = (data && data.error) ? data.error : `HTTP Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
            throw error;
        } finally {
            showLoading(false);
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// ------------------------------------------------------------------------------
// Global In-Memory Data State
// ------------------------------------------------------------------------------
let state = {
    currentModule: 'dashboard',
    users: [],
    books: [],
    categories: [],
    activeIssues: [],
    returnHistory: [],
    fines: [],
    fineSummary: {},
    reportSummary: {},
    settings: {},
    searchViewMode: 'grid',
    lastReturnResult: null
};

// ------------------------------------------------------------------------------
// Application Initialization
// ------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initNavigation();
    initSearchInputs();
    initFormHandlers();
    
    // Initial data load
    loadInitialData();
});

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (window.innerWidth <= 992) {
                sidebar.classList.toggle('show');
                overlay.classList.toggle('active');
            } else {
                document.body.classList.toggle('sidebar-collapsed');
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('show');
            overlay.classList.remove('active');
        });
    }
}

function initNavigation() {
    // Navigation links in sidebar
    document.querySelectorAll('.sidebar-menu .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const moduleName = link.getAttribute('data-module');
            if (moduleName) {
                switchModule(moduleName);
                if (window.innerWidth <= 992) {
                    document.getElementById('sidebar')?.classList.remove('show');
                    document.getElementById('sidebarOverlay')?.classList.remove('active');
                }
            }
        });
    });

    // Top navbar global search
    const navSearch = document.getElementById('navSearchInput');
    if (navSearch) {
        navSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = navSearch.value.trim();
                switchModule('search');
                const heroSearch = document.getElementById('searchHeroInput');
                if (heroSearch) {
                    heroSearch.value = query;
                    executeSearch();
                }
            }
        });
    }
}

function switchModule(moduleId) {
    state.currentModule = moduleId;

    // Update active nav link
    document.querySelectorAll('.sidebar-menu .nav-link').forEach(link => {
        if (link.getAttribute('data-module') === moduleId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update page title and breadcrumb in topbar
    const titleElem = document.getElementById('pageTitle');
    const breadcrumbElem = document.getElementById('pageBreadcrumb');
    const titles = {
        dashboard: { title: 'Dashboard', desc: 'Central Overview & Key Metrics' },
        users: { title: 'User Management', desc: 'Module 1: Member Registration & Profiles' },
        books: { title: 'Book Management', desc: 'Module 2: Catalog & Inventory Management' },
        issue: { title: 'Book Issue', desc: 'Module 3: Circulation Borrowing Desk' },
        return: { title: 'Book Return', desc: 'Module 4: Book Return Desk & Check-in' },
        fines: { title: 'Fine Management', desc: 'Module 5: Overdue Fee Collection & Waivers' },
        search: { title: 'Search Book', desc: 'Module 6: Multi-Criteria Real-Time Catalog' },
        reports: { title: 'Library Reports', desc: 'Module 7: Statistical Reports & Audits' },
        admin: { title: 'Admin / Librarian', desc: 'Module 8: Operational Policies & System Rules' }
    };

    if (titles[moduleId]) {
        if (titleElem) titleElem.innerText = titles[moduleId].title;
        if (breadcrumbElem) breadcrumbElem.innerText = titles[moduleId].desc;
    }

    // Toggle module sections
    document.querySelectorAll('.module-section').forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(`module-${moduleId}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Trigger data refresh for the target module
    switch (moduleId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'users':
            loadUsers();
            break;
        case 'books':
            loadBooks();
            break;
        case 'issue':
            loadIssueDesk();
            break;
        case 'return':
            loadReturnDesk();
            break;
        case 'fines':
            loadFines();
            break;
        case 'search':
            loadSearchCategories();
            executeSearch();
            break;
        case 'reports':
            loadAllReports();
            break;
        case 'admin':
            loadAdminSettings();
            break;
    }
}

function refreshCurrentModule() {
    switchModule(state.currentModule);
    showToast('Module data refreshed', 'info');
}

// ------------------------------------------------------------------------------
// Initial Data Load
// ------------------------------------------------------------------------------
async function loadInitialData() {
    try {
        await Promise.allSettled([
            loadAdminSettings(),
            loadDashboard(),
            loadUsers(),
            loadBooks(),
            loadActiveIssues()
        ]);
    } catch (err) {
        console.error('Initial data load error:', err);
    }
}

// ==============================================================================
// DASHBOARD OVERVIEW
// ==============================================================================
async function loadDashboard() {
    try {
        const [summary, issues, fines] = await Promise.all([
            apiClient.get('/reports/summary').catch(() => ({})),
            apiClient.get('/issues/active').catch(() => []),
            apiClient.get('/fines/summary').catch(() => ({}))
        ]);

        state.reportSummary = summary;
        state.activeIssues = issues;
        state.fineSummary = fines;

        // Populate Dashboard 8-module summary metrics
        document.getElementById('dashTotalUsers').innerText = summary.totalUsers || 0;
        document.getElementById('dashActiveUsers').innerText = summary.activeUsers || 0;
        document.getElementById('dashTotalTitles').innerText = summary.totalBookTitles || 0;
        document.getElementById('dashTotalCopies').innerText = summary.totalCopies || 0;
        document.getElementById('dashAvailableCopies').innerText = summary.availableCopies || 0;
        document.getElementById('dashActiveIssues').innerText = summary.activeIssues || 0;
        document.getElementById('dashReturnedCount').innerText = summary.returnedIssues || 0;
        document.getElementById('dashOverdueCount').innerText = summary.overdueIssues || 0;
        document.getElementById('dashPendingFines').innerText = formatCurrency(fines.totalPendingFine || summary.pendingFineAmount || 0);
        document.getElementById('dashCollectedFines').innerText = formatCurrency(fines.totalCollectedFine || summary.collectedFineAmount || 0);

        // Update Overdue notification badge in topbar
        const notifBadge = document.getElementById('navNotificationCount');
        const overdueCount = summary.overdueIssues || 0;
        if (notifBadge) {
            if (overdueCount > 0) {
                notifBadge.innerText = overdueCount;
                notifBadge.style.display = 'inline-block';
            } else {
                notifBadge.style.display = 'none';
            }
        }

        // Calculate and render progress ratios
        const totalCopies = summary.totalCopies || 1;
        const issuedCopies = summary.issuedCopies || 0;
        const circPercent = Math.min(100, Math.round((issuedCopies / totalCopies) * 100));
        document.getElementById('circPercentText').innerText = `${circPercent}%`;
        document.getElementById('circIssuedText').innerText = issuedCopies;
        document.getElementById('circTotalText').innerText = totalCopies;
        document.getElementById('circProgressBar').style.width = `${circPercent}%`;

        const totalFine = (fines.totalFineAmount || 0);
        const collectedFine = (fines.totalCollectedFine || 0);
        const finePercent = totalFine > 0 ? Math.min(100, Math.round((collectedFine / totalFine) * 100)) : 100;
        document.getElementById('finePercentText').innerText = `${finePercent}%`;
        document.getElementById('fineCollectedText').innerText = formatCurrency(collectedFine);
        document.getElementById('fineTotalText').innerText = formatCurrency(totalFine);
        document.getElementById('fineProgressBar').style.width = `${finePercent}%`;

        const totalUsers = summary.totalUsers || 1;
        const activeUsers = summary.activeUsers || 0;
        const userPercent = Math.min(100, Math.round((activeUsers / totalUsers) * 100));
        document.getElementById('userPercentText').innerText = `${userPercent}%`;
        document.getElementById('userActiveText').innerText = activeUsers;
        document.getElementById('userProgressBar').style.width = `${userPercent}%`;

        // Render Recent Issues on Dashboard table
        renderDashboardIssues(issues);
    } catch (err) {
        console.error('Error loading dashboard:', err);
    }
}

function renderDashboardIssues(issues) {
    const tbody = document.getElementById('dashIssuesTableBody');
    if (!tbody) return;

    const activeList = issues.filter(i => i.status !== 'RETURNED');
    if (activeList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No books currently borrowed out. All copies on shelf!</td></tr>`;
        return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    tbody.innerHTML = activeList.slice(0, 6).map(issue => {
        const isOverdue = issue.dueDate < todayStr;
        return `
            <tr>
                <td><strong>#${issue.id}</strong></td>
                <td>
                    <div class="fw-semibold">${escapeHtml(issue.user ? issue.user.name : 'Unknown')}</div>
                    <small class="text-muted">${escapeHtml(issue.user ? issue.user.email : '')}</small>
                </td>
                <td>
                    <div class="fw-semibold">${escapeHtml(issue.book ? issue.book.title : 'Unknown')}</div>
                    <small class="text-muted">ISBN: ${escapeHtml(issue.book ? issue.book.isbn : '-')}</small>
                </td>
                <td>${issue.issueDate}</td>
                <td class="${isOverdue ? 'text-danger fw-bold' : ''}">${issue.dueDate}</td>
                <td>
                    <span class="badge ${isOverdue ? 'badge-soft-danger' : 'badge-soft-primary'}">
                        ${isOverdue ? 'OVERDUE' : 'ISSUED'}
                    </span>
                </td>
                <td class="text-end">
                    <button class="btn btn-warning btn-sm text-dark py-1 px-2" onclick="openReturnModal(${issue.id})">
                        <i class="bi bi-arrow-return-left me-1"></i> Return
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ==============================================================================
// MODULE 1: USER MANAGEMENT
// ==============================================================================
async function loadUsers() {
    try {
        const users = await apiClient.get('/users');
        state.users = users;
        filterAndRenderUsers();
    } catch (err) {
        showToast(`Failed to load users: ${err.message}`, 'danger');
    }
}

function filterAndRenderUsers() {
    const query = document.getElementById('userSearchInput')?.value.toLowerCase().trim() || '';
    const roleFilter = document.getElementById('userRoleFilter')?.value || 'ALL';
    const statusFilter = document.getElementById('userStatusFilter')?.value || 'ALL';

    let filtered = state.users.filter(u => {
        const matchesQuery = !query || 
            (u.name && u.name.toLowerCase().includes(query)) || 
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.phone && u.phone.includes(query));
        
        const matchesRole = (roleFilter === 'ALL') || (u.membershipType === roleFilter);
        const matchesStatus = (statusFilter === 'ALL') || (u.status === statusFilter);

        return matchesQuery && matchesRole && matchesStatus;
    });

    const tbody = document.getElementById('userTableBody');
    const countBadge = document.getElementById('userTableCount');
    if (countBadge) countBadge.innerText = filtered.length;
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No users found matching the filter criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(u => {
        const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
        const isActive = (u.status || 'Active').toLowerCase() === 'active';

        return `
            <tr>
                <td><strong>#${u.id}</strong></td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="avatar-initial">${initials}</div>
                        <div>
                            <div class="fw-bold">${escapeHtml(u.name)}</div>
                            <small class="text-muted">${escapeHtml(u.email)}</small>
                        </div>
                    </div>
                </td>
                <td>${escapeHtml(u.phone || 'N/A')}</td>
                <td>
                    <span class="badge ${u.membershipType === 'Faculty' ? 'bg-indigo text-white' : 'badge-soft-secondary'}">
                        ${escapeHtml(u.membershipType || 'Student')}
                    </span>
                </td>
                <td>
                    <span class="badge ${isActive ? 'badge-soft-success' : 'badge-soft-danger'}">
                        ${isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${u.createdDate || '-'}</td>
                <td class="text-end">
                    <button class="btn-action-icon me-1" onclick="openEditUserModal(${u.id})" title="Edit Member">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-action-icon me-1 ${isActive ? 'btn-danger-hover' : 'btn-success-hover'}" 
                            onclick="toggleUserStatus(${u.id}, '${u.status}')" 
                            title="${isActive ? 'Deactivate Member' : 'Activate Member'}">
                        <i class="bi ${isActive ? 'bi-person-slash' : 'bi-person-check'}"></i>
                    </button>
                    <button class="btn-action-icon btn-danger-hover" onclick="confirmDeleteUser(${u.id})" title="Delete Member">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function clearUserSearch() {
    const input = document.getElementById('userSearchInput');
    if (input) input.value = '';
    filterAndRenderUsers();
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
    const user = state.users.find(u => u.id === id);
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
    const payload = {
        name: document.getElementById('userName').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        phone: document.getElementById('userPhone').value.trim(),
        membershipType: document.getElementById('userMembershipType').value,
        status: document.getElementById('userStatus').value
    };

    const submitBtn = document.getElementById('btnUserSubmit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Saving...`;

    try {
        if (id) {
            await apiClient.put(`/users/${id}`, payload);
            showToast('Member details updated successfully!', 'success');
        } else {
            await apiClient.post('/users', payload);
            showToast('New member registered successfully!', 'success');
        }

        bootstrap.Modal.getInstance(document.getElementById('userModal'))?.hide();
        await loadUsers();
        loadDashboard();
    } catch (err) {
        showToast(err.message, 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Save Member';
    }
}

async function toggleUserStatus(id, currentStatus) {
    const newStatus = (currentStatus === 'Active') ? 'Inactive' : 'Active';
    const actionWord = (newStatus === 'Active') ? 'activate' : 'deactivate';

    showConfirmModal(
        `${actionWord.toUpperCase()} User`,
        `Are you sure you want to ${actionWord} this member? ${newStatus === 'Inactive' ? 'Inactive users cannot borrow books.' : ''}`,
        async () => {
            try {
                const user = state.users.find(u => u.id === id);
                if (!user) return;
                await apiClient.put(`/users/${id}`, { ...user, status: newStatus });
                showToast(`User status set to ${newStatus}`, 'success');
                await loadUsers();
                loadDashboard();
            } catch (err) {
                showToast(err.message, 'danger');
            }
        }
    );
}

function confirmDeleteUser(id) {
    showConfirmModal(
        'Delete Member',
        `Are you sure you want to permanently delete member #${id}? This will remove all borrowing associations.`,
        async () => {
            try {
                await apiClient.delete(`/users/${id}`);
                showToast('User deleted successfully!', 'success');
                await loadUsers();
                loadDashboard();
            } catch (err) {
                showToast(err.message, 'danger');
            }
        }
    );
}

// ==============================================================================
// MODULE 2: BOOK MANAGEMENT
// ==============================================================================
async function loadBooks() {
    try {
        const books = await apiClient.get('/books');
        state.books = books;
        populateCategoryFilter(books);
        filterAndRenderBooks();
    } catch (err) {
        showToast(`Failed to load books: ${err.message}`, 'danger');
    }
}

function populateCategoryFilter(books) {
    const select = document.getElementById('bookCategoryFilter');
    if (!select) return;

    const currentVal = select.value;
    const cats = Array.from(new Set(books.map(b => b.category).filter(Boolean))).sort();

    select.innerHTML = '<option value="ALL">All Categories</option>' +
        cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');

    if (cats.includes(currentVal)) {
        select.value = currentVal;
    }
}

function filterAndRenderBooks() {
    const query = document.getElementById('bookSearchInput')?.value.toLowerCase().trim() || '';
    const category = document.getElementById('bookCategoryFilter')?.value || 'ALL';

    let filtered = state.books.filter(b => {
        const matchesQuery = !query ||
            (b.title && b.title.toLowerCase().includes(query)) ||
            (b.author && b.author.toLowerCase().includes(query)) ||
            (b.isbn && b.isbn.toLowerCase().includes(query)) ||
            (b.category && b.category.toLowerCase().includes(query));

        const matchesCat = (category === 'ALL') || (b.category === category);
        return matchesQuery && matchesCat;
    });

    const tbody = document.getElementById('bookTableBody');
    document.getElementById('bookTotalTitlesBadge').innerText = state.books.length;
    const availableTotal = state.books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
    document.getElementById('bookInStockBadge').innerText = availableTotal;

    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">No books found matching the filter criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(b => {
        const isAvailable = (b.availableCopies || 0) > 0;
        let stockBadge = `<span class="badge badge-soft-success">In Stock (${b.availableCopies})</span>`;
        if (b.availableCopies === 1) {
            stockBadge = `<span class="badge badge-soft-warning">Low Stock (1)</span>`;
        } else if (b.availableCopies <= 0) {
            stockBadge = `<span class="badge badge-soft-danger">Out of Stock</span>`;
        }

        return `
            <tr>
                <td><strong>#${b.id}</strong></td>
                <td>
                    <div class="fw-bold">${escapeHtml(b.title)}</div>
                    <small class="text-muted"><i class="bi bi-upc-scan me-1"></i>ISBN: ${escapeHtml(b.isbn)}</small>
                </td>
                <td>${escapeHtml(b.author)}</td>
                <td><span class="badge badge-soft-primary">${escapeHtml(b.category)}</span></td>
                <td><small><i class="bi bi-geo-alt text-muted me-1"></i>${escapeHtml(b.rackNumber || 'General')}</small></td>
                <td><strong>${b.availableCopies}</strong> / ${b.totalCopies}</td>
                <td>₹${Number(b.price || 0).toFixed(2)}</td>
                <td>${stockBadge}</td>
                <td class="text-end">
                    <button class="btn-action-icon me-1" onclick="openEditBookModal(${b.id})" title="Edit Book">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-action-icon btn-danger-hover" onclick="confirmDeleteBook(${b.id})" title="Delete Book">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function clearBookSearch() {
    const input = document.getElementById('bookSearchInput');
    if (input) input.value = '';
    filterAndRenderBooks();
}

function openAddBookModal() {
    document.getElementById('bookModalTitle').innerText = 'Add New Book to Catalog';
    document.getElementById('bookId').value = '';
    document.getElementById('bookTitle').value = '';
    document.getElementById('bookAuthor').value = '';
    document.getElementById('bookIsbn').value = '';
    document.getElementById('bookCategory').value = 'Computer Science';
    document.getElementById('bookPublisher').value = '';
    document.getElementById('bookRackNumber').value = '';
    document.getElementById('bookTotalCopies').value = '3';
    document.getElementById('bookPrice').value = '29.99';
    new bootstrap.Modal(document.getElementById('bookModal')).show();
}

function openEditBookModal(id) {
    const book = state.books.find(b => b.id === id);
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
    const payload = {
        title: document.getElementById('bookTitle').value.trim(),
        author: document.getElementById('bookAuthor').value.trim(),
        isbn: document.getElementById('bookIsbn').value.trim(),
        category: document.getElementById('bookCategory').value.trim(),
        publisher: document.getElementById('bookPublisher').value.trim(),
        rackNumber: document.getElementById('bookRackNumber').value.trim(),
        totalCopies: parseInt(document.getElementById('bookTotalCopies').value, 10),
        price: parseFloat(document.getElementById('bookPrice').value)
    };

    const submitBtn = document.getElementById('btnBookSubmit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Saving...`;

    try {
        if (id) {
            await apiClient.put(`/books/${id}`, payload);
            showToast('Book details updated successfully!', 'success');
        } else {
            await apiClient.post('/books', payload);
            showToast('New book added to library catalog!', 'success');
        }

        bootstrap.Modal.getInstance(document.getElementById('bookModal'))?.hide();
        await loadBooks();
        loadDashboard();
    } catch (err) {
        showToast(err.message, 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Save Book';
    }
}

function confirmDeleteBook(id) {
    showConfirmModal(
        'Delete Book',
        `Are you sure you want to remove book #${id} from the catalog? This action cannot be undone.`,
        async () => {
            try {
                await apiClient.delete(`/books/${id}`);
                showToast('Book deleted successfully!', 'success');
                await loadBooks();
                loadDashboard();
            } catch (err) {
                showToast(err.message, 'danger');
            }
        }
    );
}

// ==============================================================================
// MODULE 3: BOOK ISSUE
// ==============================================================================
async function loadIssueDesk() {
    await Promise.all([
        populateIssueDropdowns(),
        loadActiveIssues()
    ]);
}

async function populateIssueDropdowns() {
    try {
        const [activeUsers, availableBooks] = await Promise.all([
            apiClient.get('/users/active'),
            apiClient.get('/books/available')
        ]);

        const userSelect = document.getElementById('issueUserId');
        if (userSelect) {
            userSelect.innerHTML = '<option value="">-- Choose Active Member --</option>' +
                activeUsers.map(u => `<option value="${u.id}">#${u.id} - ${escapeHtml(u.name)} (${escapeHtml(u.membershipType)})</option>`).join('');
        }

        const bookSelect = document.getElementById('issueBookId');
        if (bookSelect) {
            bookSelect.innerHTML = '<option value="">-- Choose Book in Stock --</option>' +
                availableBooks.map(b => `<option value="${b.id}">#${b.id} - ${escapeHtml(b.title)} [${b.availableCopies} in stock]</option>`).join('');
        }

        updateIssueDueDatePreview();
    } catch (err) {
        console.error('Error populating issue dropdowns:', err);
    }
}

function updateIssueDueDatePreview() {
    const loanDaysInput = document.getElementById('issueLoanDays');
    const preview = document.getElementById('issueDueDatePreview');
    if (!loanDaysInput || !preview) return;

    const days = parseInt(loanDaysInput.value, 10) || 14;
    const date = new Date();
    date.setDate(date.getDate() + days);
    preview.innerText = date.toISOString().split('T')[0];
}

async function loadActiveIssues() {
    try {
        const issues = await apiClient.get('/issues/active');
        state.activeIssues = issues;
        renderActiveIssuesTable(issues);
        renderReturnDeskTable(issues);
    } catch (err) {
        console.error('Error loading active issues:', err);
    }
}

function renderActiveIssuesTable(issues) {
    const tbody = document.getElementById('activeIssuesTableBody');
    const badge = document.getElementById('activeIssuesCountBadge');
    if (!tbody) return;

    const activeList = issues.filter(i => i.status !== 'RETURNED');
    if (badge) badge.innerText = `${activeList.length} Active`;

    if (activeList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No books currently issued out.</td></tr>`;
        return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    tbody.innerHTML = activeList.map(i => {
        const isOverdue = i.dueDate < todayStr;
        return `
            <tr>
                <td><strong>#${i.id}</strong></td>
                <td>
                    <div class="fw-bold">${escapeHtml(i.user ? i.user.name : '-')}</div>
                    <small class="text-muted">User #${i.user ? i.user.id : ''}</small>
                </td>
                <td>
                    <div class="fw-semibold">${escapeHtml(i.book ? i.book.title : '-')}</div>
                    <small class="text-muted">Book #${i.book ? i.book.id : ''}</small>
                </td>
                <td>${i.issueDate}</td>
                <td class="${isOverdue ? 'text-danger fw-bold' : ''}">${i.dueDate}</td>
                <td>
                    <span class="badge ${isOverdue ? 'badge-soft-danger' : 'badge-soft-primary'}">
                        ${isOverdue ? 'OVERDUE' : 'ISSUED'}
                    </span>
                </td>
                <td class="text-end">
                    <button class="btn btn-warning btn-sm text-dark py-1 px-2" onclick="openReturnModal(${i.id})">
                        <i class="bi bi-arrow-return-left me-1"></i> Return
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function handleIssueBookSubmit(e) {
    e.preventDefault();
    const userId = document.getElementById('issueUserId').value;
    const bookId = document.getElementById('issueBookId').value;
    const loanDays = parseInt(document.getElementById('issueLoanDays').value, 10);
    const remarks = document.getElementById('issueRemarks').value.trim();

    if (!userId || !bookId) {
        showToast('Please select both a registered member and an available book.', 'warning');
        return;
    }

    const submitBtn = document.getElementById('btnIssueSubmit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Processing...`;

    try {
        const result = await apiClient.post('/issues', { userId, bookId, loanDays, remarks });
        showToast(`Book issued successfully to ${result.user.name}! Due date: ${result.dueDate}`, 'success');

        document.getElementById('issueBookForm').reset();
        document.getElementById('issueLoanDays').value = 14;
        updateIssueDueDatePreview();

        await loadIssueDesk();
        loadBooks();
        loadDashboard();
    } catch (err) {
        showToast(err.message, 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="bi bi-check2-circle me-1"></i> Confirm & Issue Book`;
    }
}

// ==============================================================================
// MODULE 4: BOOK RETURN
// ==============================================================================
async function loadReturnDesk() {
    await Promise.all([
        loadActiveIssues(),
        loadReturnHistory()
    ]);
}

function renderReturnDeskTable(issues) {
    const tbody = document.getElementById('returnDeskTableBody');
    const searchVal = document.getElementById('returnSearchInput')?.value.toLowerCase().trim() || '';
    if (!tbody) return;

    let activeList = issues.filter(i => i.status !== 'RETURNED');
    if (searchVal) {
        activeList = activeList.filter(i => 
            (i.user && i.user.name && i.user.name.toLowerCase().includes(searchVal)) ||
            (i.book && i.book.title && i.book.title.toLowerCase().includes(searchVal)) ||
            String(i.id).includes(searchVal)
        );
    }

    if (activeList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No active borrowings waiting for return.</td></tr>`;
        return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    tbody.innerHTML = activeList.map(i => {
        const dueDate = new Date(i.dueDate);
        const diffTime = today - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const overdueDays = diffDays > 0 ? diffDays : 0;

        return `
            <tr>
                <td><strong>#${i.id}</strong></td>
                <td>
                    <div class="fw-bold">${escapeHtml(i.user ? i.user.name : '-')}</div>
                    <small class="text-muted">User #${i.user ? i.user.id : ''} | ${escapeHtml(i.user ? i.user.email : '')}</small>
                </td>
                <td>
                    <div class="fw-semibold">${escapeHtml(i.book ? i.book.title : '-')}</div>
                    <small class="text-muted">ISBN: ${escapeHtml(i.book ? i.book.isbn : '')}</small>
                </td>
                <td>${i.issueDate}</td>
                <td class="${overdueDays > 0 ? 'text-danger fw-bold' : ''}">${i.dueDate}</td>
                <td>
                    <span class="badge ${overdueDays > 0 ? 'badge-soft-danger' : 'badge-soft-success'}">
                        ${overdueDays > 0 ? `${overdueDays} days late` : 'On Time'}
                    </span>
                </td>
                <td>
                    <span class="badge ${overdueDays > 0 ? 'badge-soft-danger' : 'badge-soft-primary'}">
                        ${overdueDays > 0 ? 'OVERDUE' : 'ISSUED'}
                    </span>
                </td>
                <td class="text-end">
                    <button class="btn btn-warning btn-sm text-dark fw-semibold" onclick="openReturnModal(${i.id})">
                        <i class="bi bi-arrow-return-left me-1"></i> Return Book
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function openReturnModal(issueId) {
    const issue = state.activeIssues.find(i => i.id === issueId);
    if (!issue) {
        showToast('Issue record not found.', 'danger');
        return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const dueDate = new Date(issue.dueDate);
    const today = new Date(todayStr);
    const diffTime = today - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const overdueDays = diffDays > 0 ? diffDays : 0;
    const fineRate = state.settings.fineRatePerDay || 5.0;
    const fineEst = overdueDays * fineRate;

    document.getElementById('returnIssueId').value = issue.id;
    document.getElementById('returnModalBookTitle').innerText = issue.book ? issue.book.title : 'Book';
    document.getElementById('returnModalUserName').innerText = issue.user ? issue.user.name : 'User';
    document.getElementById('returnModalIssueDate').innerText = issue.issueDate;
    document.getElementById('returnModalDueDate').innerText = issue.dueDate;
    document.getElementById('returnModalOverdueDays').innerText = `${overdueDays} days late`;
    document.getElementById('returnModalFineEst').innerText = formatCurrency(fineEst);

    if (overdueDays > 0) {
        document.getElementById('returnModalFineEst').className = 'fs-5 fw-bold text-danger';
        document.getElementById('returnModalOverdueDays').className = 'badge bg-danger';
    } else {
        document.getElementById('returnModalFineEst').className = 'fs-5 fw-bold text-success';
        document.getElementById('returnModalOverdueDays').className = 'badge bg-success';
    }

    document.getElementById('returnModalRemarks').value = overdueDays > 0 
        ? `Returned ${overdueDays} days late` 
        : 'Returned on time in good condition';

    new bootstrap.Modal(document.getElementById('returnModal')).show();
}

async function handleReturnConfirmSubmit(e) {
    e.preventDefault();
    const issueId = document.getElementById('returnIssueId').value;
    const remarks = document.getElementById('returnModalRemarks').value.trim();

    const submitBtn = document.getElementById('btnReturnConfirmSubmit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Processing...`;

    try {
        const result = await apiClient.post('/returns', { issueId, remarks });
        bootstrap.Modal.getInstance(document.getElementById('returnModal'))?.hide();

        state.lastReturnResult = result;
        showReturnResultModal(result);

        await Promise.all([
            loadActiveIssues(),
            loadReturnHistory(),
            loadBooks(),
            loadFines(),
            loadDashboard()
        ]);
    } catch (err) {
        showToast(err.message, 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="bi bi-check2-circle me-1"></i> Process Return`;
    }
}

function showReturnResultModal(result) {
    document.getElementById('returnResultTitle').innerText = `Book Returned: "${escapeHtml(result.bookTitle)}"`;
    document.getElementById('returnResultMessage').innerText = result.message || 'Book check-in completed successfully.';

    const fineBox = document.getElementById('returnResultFineBox');
    const payBtn = document.getElementById('btnGoToFinePay');

    if (result.fineAmount && result.fineAmount > 0) {
        fineBox.classList.remove('d-none');
        payBtn.classList.remove('d-none');
        document.getElementById('returnResultOverdueDays').innerText = `${result.overdueDays} days`;
        document.getElementById('returnResultFineAmount').innerText = formatCurrency(result.fineAmount);
    } else {
        fineBox.classList.add('d-none');
        payBtn.classList.add('d-none');
    }

    new bootstrap.Modal(document.getElementById('returnResultModal')).show();
}

function goToFinePayFromReturn() {
    bootstrap.Modal.getInstance(document.getElementById('returnResultModal'))?.hide();
    switchModule('fines');
    if (state.lastReturnResult && state.lastReturnResult.fineId) {
        setTimeout(() => {
            openPayFineModal(state.lastReturnResult.fineId, state.lastReturnResult.fineAmount);
        }, 300);
    }
}

async function loadReturnHistory() {
    try {
        const history = await apiClient.get('/returns/history');
        state.returnHistory = history;

        const tbody = document.getElementById('returnHistoryTableBody');
        if (!tbody) return;

        if (history.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No books returned yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = history.slice(0, 10).map(h => `
            <tr>
                <td><strong>#${h.id}</strong></td>
                <td>${escapeHtml(h.user ? h.user.name : '-')}</td>
                <td>${escapeHtml(h.book ? h.book.title : '-')}</td>
                <td>${h.issueDate}</td>
                <td>${h.dueDate}</td>
                <td class="text-success fw-bold">${h.returnDate || '-'}</td>
                <td><span class="badge badge-soft-success">RETURNED</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading return history:', err);
    }
}

// ==============================================================================
// MODULE 5: FINE MANAGEMENT
// ==============================================================================
let currentFineFilter = 'ALL';

async function loadFines() {
    try {
        const [fines, summary] = await Promise.all([
            apiClient.get('/fines'),
            apiClient.get('/fines/summary')
        ]);

        state.fines = fines;
        state.fineSummary = summary;

        document.getElementById('fineMetricTotal').innerText = formatCurrency(summary.totalFineAmount || 0);
        document.getElementById('fineMetricCollected').innerText = formatCurrency(summary.totalCollectedFine || 0);
        document.getElementById('fineMetricPending').innerText = formatCurrency(summary.totalPendingFine || 0);
        document.getElementById('fineMetricUnpaidCount').innerText = summary.unpaidCount || 0;

        renderFinesTable();
    } catch (err) {
        showToast(`Failed to load fines: ${err.message}`, 'danger');
    }
}

function setFineFilter(status) {
    currentFineFilter = status;
    ['All', 'Unpaid', 'Paid', 'Waived'].forEach(s => {
        const btn = document.getElementById(`btnFilterFine${s}`);
        if (btn) {
            if (s.toUpperCase() === status) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
    renderFinesTable();
}

function renderFinesTable() {
    const tbody = document.getElementById('fineTableBody');
    if (!tbody) return;

    let filtered = state.fines;
    if (currentFineFilter !== 'ALL') {
        filtered = filtered.filter(f => f.status === currentFineFilter);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">No fines found matching status "${currentFineFilter}".</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(f => {
        let badgeClass = 'badge-soft-warning';
        if (f.status === 'PAID') badgeClass = 'badge-soft-success';
        if (f.status === 'WAIVED') badgeClass = 'badge-soft-secondary';

        const isUnpaid = f.status === 'UNPAID';

        return `
            <tr>
                <td><strong>#${f.id}</strong></td>
                <td>
                    <div class="fw-bold">${escapeHtml(f.user ? f.user.name : '-')}</div>
                    <small class="text-muted">Issue #${f.bookIssue ? f.bookIssue.id : '-'}</small>
                </td>
                <td>${escapeHtml(f.bookIssue && f.bookIssue.book ? f.bookIssue.book.title : 'Book')}</td>
                <td><span class="badge badge-soft-danger">${f.overdueDays} days</span></td>
                <td class="fw-bold fs-6">${formatCurrency(f.amount)}</td>
                <td><span class="badge ${badgeClass}">${f.status}</span></td>
                <td>
                    ${f.paidDate ? `<span class="fw-semibold">${f.paidDate}</span>` : '<span class="text-muted">-</span>'}
                    ${f.paymentMode ? `<br><small class="badge bg-light text-dark border">${f.paymentMode}</small>` : ''}
                </td>
                <td><small class="text-muted">${escapeHtml(f.remarks || '-')}</small></td>
                <td class="text-end">
                    ${isUnpaid ? `
                        <button class="btn btn-success btn-sm py-1 px-2 me-1" onclick="openPayFineModal(${f.id}, ${f.amount})" title="Mark as Paid">
                            <i class="bi bi-cash-coin me-1"></i> Pay
                        </button>
                        <button class="btn btn-outline-secondary btn-sm py-1 px-2" onclick="confirmWaiveFine(${f.id})" title="Waive Fine">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    ` : `
                        <span class="text-success small fw-semibold"><i class="bi bi-check-circle-fill me-1"></i>Settled</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

function openPayFineModal(fineId, amount) {
    document.getElementById('payFineId').value = fineId;
    document.getElementById('payFineAmount').innerText = formatCurrency(amount);
    document.getElementById('payFineMode').value = 'Cash';
    document.getElementById('payFineRemarks').value = 'Paid at Circulation Desk';
    new bootstrap.Modal(document.getElementById('payFineModal')).show();
}

async function handlePayFineSubmit(e) {
    e.preventDefault();
    const fineId = document.getElementById('payFineId').value;
    const paymentMode = document.getElementById('payFineMode').value;
    const remarks = document.getElementById('payFineRemarks').value.trim();

    const submitBtn = document.getElementById('btnPayFineSubmit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Recording...`;

    try {
        await apiClient.post(`/fines/${fineId}/pay`, { paymentMode, remarks });
        showToast(`Fine #${fineId} payment recorded successfully!`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('payFineModal'))?.hide();

        await loadFines();
        loadDashboard();
    } catch (err) {
        showToast(err.message, 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="bi bi-check-lg me-1"></i> Record Payment`;
    }
}

function confirmWaiveFine(fineId) {
    showConfirmModal(
        'Waive Fine',
        `Are you sure you want to waive fine #${fineId}? A waiver remark will be recorded.`,
        async () => {
            try {
                await apiClient.post(`/fines/${fineId}/waive`, { remarks: 'Waived by Chief Librarian' });
                showToast(`Fine #${fineId} has been waived.`, 'info');
                await loadFines();
                loadDashboard();
            } catch (err) {
                showToast(err.message, 'danger');
            }
        }
    );
}

// ==============================================================================
// MODULE 6: SEARCH BOOK
// ==============================================================================
async function loadSearchCategories() {
    try {
        const categories = await apiClient.get('/search/categories');
        state.categories = categories;

        const select = document.getElementById('searchCategorySelect');
        if (!select) return;

        select.innerHTML = '<option value="All">All Categories</option>' +
            categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    } catch (err) {
        console.error('Error loading search categories:', err);
    }
}

function initSearchInputs() {
    const heroInput = document.getElementById('searchHeroInput');
    const heroClear = document.getElementById('searchHeroClear');
    const catSelect = document.getElementById('searchCategorySelect');
    const stockToggle = document.getElementById('searchInStockToggle');

    if (heroInput) {
        heroInput.addEventListener('input', debounce(() => {
            if (heroClear) heroClear.style.display = heroInput.value ? 'block' : 'none';
            executeSearch();
        }, 300));
    }

    if (catSelect) catSelect.addEventListener('change', executeSearch);
    if (stockToggle) stockToggle.addEventListener('change', executeSearch);

    // Module 1 User search
    const userSearch = document.getElementById('userSearchInput');
    const userRole = document.getElementById('userRoleFilter');
    const userStatus = document.getElementById('userStatusFilter');
    if (userSearch) userSearch.addEventListener('input', debounce(filterAndRenderUsers, 200));
    if (userRole) userRole.addEventListener('change', filterAndRenderUsers);
    if (userStatus) userStatus.addEventListener('change', filterAndRenderUsers);

    // Module 2 Book search
    const bookSearch = document.getElementById('bookSearchInput');
    const bookCat = document.getElementById('bookCategoryFilter');
    if (bookSearch) bookSearch.addEventListener('input', debounce(filterAndRenderBooks, 200));
    if (bookCat) bookCat.addEventListener('change', filterAndRenderBooks);

    // Module 4 Return search
    const returnSearch = document.getElementById('returnSearchInput');
    if (returnSearch) returnSearch.addEventListener('input', debounce(() => renderReturnDeskTable(state.activeIssues), 200));

    // Module 3 Loan period change
    const loanDays = document.getElementById('issueLoanDays');
    if (loanDays) loanDays.addEventListener('input', updateIssueDueDatePreview);
}

function clearHeroSearch() {
    const heroInput = document.getElementById('searchHeroInput');
    const heroClear = document.getElementById('searchHeroClear');
    if (heroInput) heroInput.value = '';
    if (heroClear) heroClear.style.display = 'none';
    executeSearch();
}

function setSearchViewMode(mode) {
    state.searchViewMode = mode;
    document.getElementById('btnViewGrid')?.classList.toggle('active', mode === 'grid');
    document.getElementById('btnViewTable')?.classList.toggle('active', mode === 'table');
    executeSearch();
}

async function executeSearch() {
    const query = document.getElementById('searchHeroInput')?.value.trim() || '';
    const category = document.getElementById('searchCategorySelect')?.value || 'All';
    const inStockOnly = document.getElementById('searchInStockToggle')?.checked || false;

    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category && category !== 'All') params.append('category', category);
    if (inStockOnly) params.append('inStockOnly', 'true');

    try {
        const books = await apiClient.get(`/search?${params.toString()}`);
        renderSearchResults(books);
    } catch (err) {
        console.error('Error executing search:', err);
    }
}

function renderSearchResults(books) {
    const container = document.getElementById('searchResultsContainer');
    if (!container) return;

    if (books.length === 0) {
        container.innerHTML = `
            <div class="empty-state-box">
                <i class="bi bi-journal-x empty-state-icon"></i>
                <h5 class="fw-bold text-secondary">No Books Found</h5>
                <p class="text-muted small mb-0">We couldn't find any books matching your search filters. Try clearing your keyword or changing category.</p>
            </div>
        `;
        return;
    }

    if (state.searchViewMode === 'table') {
        container.innerHTML = `
            <div class="table-responsive">
                <table class="table custom-table">
                    <thead>
                        <tr>
                            <th>Book ID</th>
                            <th>Title & ISBN</th>
                            <th>Author</th>
                            <th>Category</th>
                            <th>Rack Location</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th class="text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${books.map(b => `
                            <tr>
                                <td><strong>#${b.id}</strong></td>
                                <td>
                                    <div class="fw-bold">${escapeHtml(b.title)}</div>
                                    <small class="text-muted">ISBN: ${escapeHtml(b.isbn)}</small>
                                </td>
                                <td>${escapeHtml(b.author)}</td>
                                <td><span class="badge badge-soft-primary">${escapeHtml(b.category)}</span></td>
                                <td><small>${escapeHtml(b.rackNumber || 'General')}</small></td>
                                <td>
                                    <span class="badge ${b.availableCopies > 0 ? 'badge-soft-success' : 'badge-soft-danger'}">
                                        ${b.availableCopies} of ${b.totalCopies} Available
                                    </span>
                                </td>
                                <td>₹${Number(b.price || 0).toFixed(2)}</td>
                                <td class="text-end">
                                    ${b.availableCopies > 0 ? `
                                        <button class="btn btn-primary btn-sm py-1 px-2" onclick="quickIssueFromSearch(${b.id})">
                                            <i class="bi bi-journal-arrow-up me-1"></i> Issue
                                        </button>
                                    ` : `<span class="badge bg-secondary">Out of Stock</span>`}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="row g-3">
                ${books.map(b => {
                    const inStock = b.availableCopies > 0;
                    return `
                        <div class="col-md-6 col-lg-4">
                            <div class="book-card-item">
                                <div>
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <span class="badge badge-soft-primary">${escapeHtml(b.category)}</span>
                                        <span class="badge ${inStock ? 'badge-soft-success' : 'badge-soft-danger'}">
                                            ${inStock ? `${b.availableCopies} on Shelf` : 'Out of Stock'}
                                        </span>
                                    </div>
                                    <h6 class="book-card-title">${escapeHtml(b.title)}</h6>
                                    <div class="book-card-author"><i class="bi bi-person me-1"></i>${escapeHtml(b.author)}</div>
                                    <div class="small text-muted mb-3">
                                        <div><i class="bi bi-upc-scan me-1"></i><strong>ISBN:</strong> ${escapeHtml(b.isbn)}</div>
                                        <div><i class="bi bi-geo-alt me-1"></i><strong>Location:</strong> ${escapeHtml(b.rackNumber || 'Main Stacks')}</div>
                                        <div><i class="bi bi-building me-1"></i><strong>Publisher:</strong> ${escapeHtml(b.publisher || 'N/A')}</div>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                                    <span class="fw-bold fs-6 text-primary">₹${Number(b.price || 0).toFixed(2)}</span>
                                    ${inStock ? `
                                        <button class="btn btn-outline-primary btn-sm" onclick="quickIssueFromSearch(${b.id})">
                                            <i class="bi bi-journal-arrow-up me-1"></i> Issue Book
                                        </button>
                                    ` : `
                                        <button class="btn btn-secondary btn-sm" disabled>Unavailable</button>
                                    `}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
}

function quickIssueFromSearch(bookId) {
    switchModule('issue');
    setTimeout(() => {
        const select = document.getElementById('issueBookId');
        if (select) select.value = bookId;
    }, 200);
}

// ==============================================================================
// MODULE 7: LIBRARY REPORTS
// ==============================================================================
async function loadAllReports() {
    try {
        const [summary, mostIssued, overdue, fines, activity] = await Promise.all([
            apiClient.get('/reports/summary'),
            apiClient.get('/reports/most-issued'),
            apiClient.get('/reports/overdue'),
            apiClient.get('/reports/fines'),
            apiClient.get('/reports/user-activity')
        ]);

        // Render 9 Exact KPI Cards
        document.getElementById('repTotalTitles').innerText = summary.totalBookTitles || 0;
        document.getElementById('repTotalCopies').innerText = summary.totalCopies || 0;
        document.getElementById('repAvailableCopies').innerText = summary.availableCopies || 0;
        document.getElementById('repIssuedCopies').innerText = summary.issuedCopies || 0;
        document.getElementById('repRegisteredUsers').innerText = summary.totalUsers || 0;
        document.getElementById('repActiveIssues').innerText = summary.activeIssues || 0;
        document.getElementById('repOverdueIssues').innerText = summary.overdueIssues || 0;
        document.getElementById('repPendingFines').innerText = formatCurrency(summary.pendingFineAmount || 0);
        document.getElementById('repCollectedFines').innerText = formatCurrency(summary.collectedFineAmount || 0);

        // Render Report Panes
        renderMostIssuedReport(mostIssued);
        renderOverdueReport(overdue);
        renderFineAuditReport(fines);
        renderUserActivityReport(activity);

        showToast('Library reports updated from real-time database.', 'success');
    } catch (err) {
        showToast(`Failed to load reports: ${err.message}`, 'danger');
    }
}

function renderMostIssuedReport(list) {
    const tbody = document.getElementById('repMostIssuedTableBody');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No book issue statistics recorded yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map((item, idx) => `
        <tr>
            <td><strong>#${idx + 1}</strong></td>
            <td><div class="fw-bold">${escapeHtml(item.title)}</div></td>
            <td>${escapeHtml(item.author)}</td>
            <td><span class="badge badge-soft-primary">${escapeHtml(item.category)}</span></td>
            <td><span class="badge bg-primary fs-6 px-3 py-1">${item.timesIssued} times</span></td>
            <td>${item.availableCopies} available</td>
        </tr>
    `).join('');
}

function renderOverdueReport(list) {
    const tbody = document.getElementById('repOverdueTableBody');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-success py-4"><i class="bi bi-check-circle-fill fs-5 me-2"></i>Great news! Zero overdue defaulters currently.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(item => `
        <tr>
            <td><strong>#${item.issueId}</strong></td>
            <td>
                <div class="fw-bold">${escapeHtml(item.userName)}</div>
                <small class="text-muted">${escapeHtml(item.userPhone || item.userEmail)}</small>
            </td>
            <td>${escapeHtml(item.bookTitle)}</td>
            <td class="text-danger fw-bold">${item.dueDate}</td>
            <td><span class="badge badge-soft-danger">${item.daysOverdue} days late</span></td>
            <td class="text-danger fw-bold fs-6">${formatCurrency(item.estimatedFine)}</td>
            <td class="text-end">
                <button class="btn btn-warning btn-sm text-dark" onclick="openReturnModal(${item.issueId})">
                    <i class="bi bi-arrow-return-left me-1"></i> Return
                </button>
            </td>
        </tr>
    `).join('');
}

function renderFineAuditReport(list) {
    const tbody = document.getElementById('repFineAuditTableBody');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No fine collection records found.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(f => {
        let badge = 'badge-soft-warning';
        if (f.status === 'PAID') badge = 'badge-soft-success';
        if (f.status === 'WAIVED') badge = 'badge-soft-secondary';

        return `
            <tr>
                <td><strong>#${f.id}</strong></td>
                <td>${escapeHtml(f.user ? f.user.name : '-')}</td>
                <td class="fw-bold">${formatCurrency(f.amount)}</td>
                <td><span class="badge ${badge}">${f.status}</span></td>
                <td>${f.paidDate || '-'}</td>
                <td>${f.paymentMode || '-'}</td>
            </tr>
        `;
    }).join('');
}

function renderUserActivityReport(list) {
    const tbody = document.getElementById('repUserActivityTableBody');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No member activity recorded.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(u => `
        <tr>
            <td><strong>#${u.userId}</strong></td>
            <td>
                <div class="fw-bold">${escapeHtml(u.userName)}</div>
                <small class="text-muted">${escapeHtml(u.userEmail)}</small>
            </td>
            <td><span class="badge badge-soft-secondary">${escapeHtml(u.membershipType || 'Student')}</span></td>
            <td><span class="badge bg-primary px-2">${u.totalBorrowed}</span></td>
            <td><span class="badge ${u.currentlyHolding > 0 ? 'bg-warning text-dark' : 'bg-light text-muted border'} px-2">${u.currentlyHolding}</span></td>
            <td><span class="badge bg-success px-2">${u.totalReturned}</span></td>
        </tr>
    `).join('');
}

// ==============================================================================
// MODULE 8: ADMIN / LIBRARIAN
// ==============================================================================
async function loadAdminSettings() {
    try {
        const s = await apiClient.get('/admin/settings');
        state.settings = s;

        // Populate Form
        document.getElementById('settingLibraryName').value = s.libraryName || '';
        document.getElementById('settingLibrarianName').value = s.librarianName || '';
        document.getElementById('settingLibrarianEmail').value = s.librarianEmail || '';
        document.getElementById('settingLibrarianPhone').value = s.librarianPhone || '';
        document.getElementById('settingMaxBooks').value = s.maxBooksPerUser || 3;
        document.getElementById('settingLoanPeriod').value = s.loanPeriodDays || 14;
        document.getElementById('settingFineRate').value = s.fineRatePerDay || 5.0;
        document.getElementById('settingNotice').value = s.systemNotice || '';

        // Populate Profile Card
        document.getElementById('adminProfileName').innerText = s.librarianName || 'Chief Librarian';
        document.getElementById('adminProfileLibraryName').innerText = s.libraryName || 'College Library';
        document.getElementById('adminProfileEmail').innerText = s.librarianEmail || '-';
        document.getElementById('adminProfilePhone').innerText = s.librarianPhone || '-';
        document.getElementById('adminProfileMaxBooks').innerText = `${s.maxBooksPerUser || 3} Books`;
        document.getElementById('adminProfileLoanDays').innerText = `${s.loanPeriodDays || 14} Days`;
        document.getElementById('adminProfileFineRate').innerText = `${formatCurrency(s.fineRatePerDay || 5.0)} / day`;

        // Update Global UI
        document.getElementById('dashLibrarianName').innerText = s.librarianName || 'Dr. Sarah Jenkins';
        document.getElementById('navLibrarianName').innerText = s.librarianName || 'Chief Librarian';
        document.getElementById('systemNoticeText').innerText = s.systemNotice || 'Welcome to EduLibrary.';
        
        const avatarInitial = s.librarianName ? s.librarianName[0].toUpperCase() : 'L';
        document.getElementById('navProfileAvatar').innerText = avatarInitial;
    } catch (err) {
        console.error('Error loading admin settings:', err);
    }
}

async function handleAdminSettingsSubmit(e) {
    e.preventDefault();
    const payload = {
        libraryName: document.getElementById('settingLibraryName').value.trim(),
        librarianName: document.getElementById('settingLibrarianName').value.trim(),
        librarianEmail: document.getElementById('settingLibrarianEmail').value.trim(),
        librarianPhone: document.getElementById('settingLibrarianPhone').value.trim(),
        maxBooksPerUser: parseInt(document.getElementById('settingMaxBooks').value, 10),
        loanPeriodDays: parseInt(document.getElementById('settingLoanPeriod').value, 10),
        fineRatePerDay: parseFloat(document.getElementById('settingFineRate').value),
        systemNotice: document.getElementById('settingNotice').value.trim()
    };

    const submitBtn = document.getElementById('btnAdminSave');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Saving Policies...`;

    try {
        await apiClient.put('/admin/settings', payload);
        showToast('Library configuration & policies updated successfully!', 'success');
        await loadAdminSettings();
    } catch (err) {
        showToast(err.message, 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="bi bi-save me-1"></i> Save Configuration`;
    }
}

// ------------------------------------------------------------------------------
// Form Submit Event Listeners Initialization
// ------------------------------------------------------------------------------
function initFormHandlers() {
    document.getElementById('userForm')?.addEventListener('submit', handleUserFormSubmit);
    document.getElementById('bookForm')?.addEventListener('submit', handleBookFormSubmit);
    document.getElementById('issueBookForm')?.addEventListener('submit', handleIssueBookSubmit);
    document.getElementById('returnConfirmForm')?.addEventListener('submit', handleReturnConfirmSubmit);
    document.getElementById('payFineForm')?.addEventListener('submit', handlePayFineSubmit);
    document.getElementById('adminSettingsForm')?.addEventListener('submit', handleAdminSettingsSubmit);
}

// ------------------------------------------------------------------------------
// Modal & Dialog Utilities
// ------------------------------------------------------------------------------
function showConfirmModal(title, message, onConfirm) {
    const modalElem = document.getElementById('confirmModal');
    if (!modalElem) return;

    document.getElementById('confirmModalTitle').innerText = title;
    document.getElementById('confirmModalBody').innerText = message;

    const actionBtn = document.getElementById('confirmModalActionBtn');
    const newBtn = actionBtn.cloneNode(true);
    actionBtn.parentNode.replaceChild(newBtn, actionBtn);

    const modalInstance = new bootstrap.Modal(modalElem);

    newBtn.addEventListener('click', async () => {
        modalInstance.hide();
        if (typeof onConfirm === 'function') {
            await onConfirm();
        }
    });

    modalInstance.show();
}

function showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toastId = 'toast-' + Date.now();
    const iconClass = type === 'success' ? 'bi-check-circle-fill text-success' :
                      type === 'danger' ? 'bi-exclamation-triangle-fill text-danger' :
                      type === 'warning' ? 'bi-exclamation-circle-fill text-warning' :
                      'bi-info-circle-fill text-primary';

    const toastHtml = `
        <div id="${toastId}" class="custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
            <i class="bi ${iconClass} fs-5"></i>
            <div class="flex-grow-1">
                ${title ? `<div class="fw-bold small mb-1">${escapeHtml(title)}</div>` : ''}
                <div class="small text-secondary">${escapeHtml(message)}</div>
            </div>
            <button type="button" class="btn-close btn-close-sm" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastElem = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElem, { delay: 4500 });
    toast.show();

    toastElem.addEventListener('hidden.bs.toast', () => {
        toastElem.remove();
    });
}

function showLoading(show) {
    const bar = document.getElementById('globalLoadingBar');
    if (!bar) return;

    if (show) {
        bar.className = 'loading';
    } else {
        bar.className = 'done';
        setTimeout(() => {
            bar.className = '';
        }, 350);
    }
}

// ------------------------------------------------------------------------------
// Formatting & Helper Functions
// ------------------------------------------------------------------------------
function formatCurrency(amount) {
    const val = Number(amount) || 0;
    return `₹${val.toFixed(2)}`;
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function debounce(func, delay = 250) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}


