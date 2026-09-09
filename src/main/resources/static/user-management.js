const API_URL = "/api/users";

let allUsers = [];
let editingUserId = null;


// ==========================================
// LOAD USERS
// ==========================================

async function loadUsers() {

    const tableBody = document.getElementById("userTableBody");

    try {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-message">
                    Loading users...
                </td>
            </tr>
        `;

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load users");
        }

        allUsers = await response.json();

        displayUsers(allUsers);
        updateStatistics();

    
    } catch (error) {

    console.error("Error saving user:", error);

    showMessage(
        "Error: " + error.message,
        "error"
    );

    alert("Error while saving user:\n\n" + error.message);
}
}


// ==========================================
// DISPLAY USERS
// ==========================================

function displayUsers(users) {

    const tableBody = document.getElementById("userTableBody");

    tableBody.innerHTML = "";

    if (users.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-message">
                    No users found.
                </td>
            </tr>
        `;

        return;
    }


    users.forEach(user => {

        const row = document.createElement("tr");

        const statusClass =
            String(user.status).toLowerCase() === "active"
                ? "active"
                : "inactive";


        row.innerHTML = `

            <td>${user.userId ?? ""}</td>

            <td>${escapeHTML(user.fullName)}</td>

            <td>${escapeHTML(user.userType)}</td>

            <td>${escapeHTML(user.department || "-")}</td>

            <td>${escapeHTML(user.email)}</td>

            <td>${escapeHTML(user.phone)}</td>

            <td>${user.registrationDate || "-"}</td>

            <td>
                <span class="status ${statusClass}">
                    ${escapeHTML(user.status)}
                </span>
            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editUser(${user.userId})"
                >
                    Edit
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteUser(${user.userId})"
                >
                    Delete
                </button>

            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ==========================================
// SEARCH USERS
// ==========================================

function searchUsers() {

    const searchText =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();


    if (searchText === "") {

        displayUsers(allUsers);

        return;
    }


    const filteredUsers = allUsers.filter(user => {

        return (

            String(user.fullName || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(user.email || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(user.phone || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(user.department || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(user.userType || "")
                .toLowerCase()
                .includes(searchText)

            ||

            String(user.status || "")
                .toLowerCase()
                .includes(searchText)
        );
    });


    displayUsers(filteredUsers);
}


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    const total =
        allUsers.length;


    const active =
        allUsers.filter(
            user =>
                String(user.status).toLowerCase() === "active"
        ).length;


    const inactive =
        allUsers.filter(
            user =>
                String(user.status).toLowerCase() === "inactive"
        ).length;


    document.getElementById("totalUsers").textContent = total;

    document.getElementById("activeUsers").textContent = active;

    document.getElementById("inactiveUsers").textContent = inactive;
}


// ==========================================
// OPEN ADD USER MODAL
// ==========================================

function openAddUserModal() {

    editingUserId = null;

    document.getElementById("modalTitle").textContent =
        "Add New User";

    document.getElementById("userForm").reset();

    document.getElementById("userId").value = "";

    // Set today's date
    document.getElementById("registrationDate").value =
        new Date().toISOString().split("T")[0];

    document.getElementById("status").value = "Active";

    document.getElementById("userModal").classList.add("show");
}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeUserModal() {

    document
        .getElementById("userModal")
        .classList.remove("show");

    editingUserId = null;
}


// ==========================================
// EDIT USER
// ==========================================

async function editUser(id) {

    try {

        const response =
            await fetch(`${API_URL}/${id}`);


        if (!response.ok) {

            throw new Error("User not found");
        }


        const user =
            await response.json();


        editingUserId = id;


        document.getElementById("modalTitle").textContent =
            "Edit User";


        document.getElementById("userId").value =
            user.userId;


        document.getElementById("fullName").value =
            user.fullName || "";


        document.getElementById("userType").value =
            user.userType || "";


        document.getElementById("department").value =
            user.department || "";


        document.getElementById("email").value =
            user.email || "";


        document.getElementById("phone").value =
            user.phone || "";


        document.getElementById("address").value =
            user.address || "";


        document.getElementById("registrationDate").value =
            user.registrationDate || "";


        document.getElementById("status").value =
            user.status || "Active";


        document
            .getElementById("userModal")
            .classList.add("show");


    } catch (error) {

        console.error("Error getting user:", error);

        showMessage(
            "Unable to load user details.",
            "error"
        );
    }
}


// ==========================================
// ADD / UPDATE USER
// ==========================================

document
    .getElementById("userForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const userData = {

            fullName:
                document.getElementById("fullName").value.trim(),

            userType:
                document.getElementById("userType").value,

            department:
                document.getElementById("department").value.trim(),

            email:
                document.getElementById("email").value.trim(),

            phone:
                document.getElementById("phone").value.trim(),

            address:
                document.getElementById("address").value.trim(),

            registrationDate:
                document.getElementById("registrationDate").value,

            status:
                document.getElementById("status").value
        };


        try {

            let response;


            // UPDATE
            if (editingUserId !== null) {

                response = await fetch(
                    `${API_URL}/${editingUserId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(userData)
                    }
                );

            }

            // ADD
            else {

                response = await fetch(
                    API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(userData)
                    }
                );
            }


            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText || "Operation failed"
                );
            }


            closeUserModal();

            await loadUsers();


            showMessage(
                editingUserId === null
                    ? "User added successfully!"
                    : "User updated successfully!",
                "success"
            );


        } catch (error) {

            console.error("Error saving user:", error);

            showMessage(
                "Unable to save user. Please check the entered details.",
                "error"
            );
        }

    });


// ==========================================
// DELETE USER
// ==========================================

async function deleteUser(id) {

    const user =
        allUsers.find(
            u => u.userId === id
        );


    const userName =
        user ? user.fullName : "this user";


    const confirmed =
        confirm(
            `Are you sure you want to delete ${userName}?`
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
                throw new Error("User not found");
            }

            throw new Error("Delete failed");
        }


        await loadUsers();


        showMessage(
            "User deleted successfully!",
            "success"
        );


    } catch (error) {

        console.error("Error deleting user:", error);

        showMessage(
            "Unable to delete user.",
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


    message.textContent = text;

    message.className =
        `message ${type}`;


    setTimeout(() => {

        message.className = "message";

    }, 3000);
}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
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

document
    .getElementById("userModal")
    .addEventListener("click", function(event) {

        if (event.target === this) {
            closeUserModal();
        }

    });


// ==========================================
// INITIAL LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function() {

    loadUsers();

});