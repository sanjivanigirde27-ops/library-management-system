# Library Management System (College Mini-Project)

A complete, beginner-friendly **Library Management System** built with **Java Spring Boot**, **MySQL Database**, **HTML5**, **CSS3**, **JavaScript**, and **Bootstrap 5**.

This project contains **EXACTLY 8 Business Modules**, with clean, simple, and readable Java code designed specifically for academic evaluation, viva questions, and mini-project submissions.

---

## 🎯 Exactly 8 Business Modules

| Module # | Module Name | Description & Core Functionalities |
| :--- | :--- | :--- |
| **1** | **User Management** | Register new members (Students, Faculty, Guests), edit member details, update status (Active/Inactive), and delete members. |
| **2** | **Book Management** | Add books to the catalog with ISBN, title, author, category, publisher, rack location, price, and copy tracking. Full CRUD operations. |
| **3** | **Book Issue** | Issue books to active members with real-time stock validation, automated due date calculation, and user borrowing limit enforcement. |
| **4** | **Book Return** | Process returns, calculate elapsed days, check for overdue status, calculate fines automatically, and increment available stock back into catalog. |
| **5** | **Fine Management** | List all overdue fines, filter by Paid/Unpaid, collect fine payments (Cash, UPI, Card, Online), generate payment receipts, and handle waivers. |
| **6** | **Search Book** | Live multi-criteria book search by Title, Author, ISBN, or Category with real-time availability and stock status indicators. |
| **7** | **Library Reports** | Statistical dashboard metrics, Most Issued Books report, Overdue Defaulters list, Fine Collection audits, and Member Borrowing activity. |
| **8** | **Admin / Librarian** | Librarian profile management, operational policies configuration (fine rate per day, loan duration, max allowed books), and notice board updates. |

---

## 🛠️ Technology Stack

- **Backend:** Java 17+, Spring Boot 3.2.5 (Spring Web, Spring Data JPA, Hibernate)
- **Database:** MySQL 8.0+ (with optional H2 in-memory fallback support)
- **Frontend:** HTML5, CSS3, JavaScript (ES6), Bootstrap 5.3, Bootstrap Icons
- **Architecture:** Controller-Service-Repository-Entity Pattern (Simple & Clean MVC)
- **Build Tool:** Maven

---

## 📂 Project Folder Structure

```
library-management-system/
├── pom.xml                                      # Maven dependencies & build configuration
├── README.md                                    # Project documentation & run guide
├── database/
│   ├── library_db.sql                           # MySQL database schema & sample seed data
│   └── seed_data.sql                            # Standalone SQL test records
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── library/
        │           ├── LibraryManagementApplication.java  # Main Spring Boot Runner
        │           ├── config/
        │           │   └── CorsConfig.java                # Web & CORS Configuration
        │           ├── entity/
        │           │   ├── User.java                      # Module 1 Entity
        │           │   ├── Book.java                      # Module 2 & 6 Entity
        │           │   ├── BookIssue.java                 # Module 3 & 4 Entity
        │           │   ├── Fine.java                      # Module 5 Entity
        │           │   └── SystemSetting.java             # Module 8 Entity
        │           ├── repository/
        │           │   ├── UserRepository.java            # Module 1 Data Access
        │           │   ├── BookRepository.java            # Module 2 & 6 Data Access
        │           │   ├── BookIssueRepository.java       # Module 3, 4 & 7 Data Access
        │           │   ├── FineRepository.java            # Module 5 & 7 Data Access
        │           │   └── SystemSettingRepository.java   # Module 8 Data Access
        │           ├── service/
        │           │   ├── UserService.java               # Module 1 Business Logic
        │           │   ├── BookService.java               # Module 2 Business Logic
        │           │   ├── BookIssueService.java          # Module 3 Business Logic
        │           │   ├── BookReturnService.java         # Module 4 Business Logic
        │           │   ├── FineService.java               # Module 5 Business Logic
        │           │   ├── SearchBookService.java         # Module 6 Business Logic
        │           │   ├── LibraryReportService.java      # Module 7 Business Logic
        │           │   └── AdminService.java              # Module 8 Business Logic
        │           └── controller/
        │               ├── UserController.java            # Module 1 REST Endpoints (/api/users)
        │               ├── BookController.java            # Module 2 REST Endpoints (/api/books)
        │               ├── BookIssueController.java       # Module 3 REST Endpoints (/api/issues)
        │               ├── BookReturnController.java      # Module 4 REST Endpoints (/api/returns)
        │               ├── FineController.java            # Module 5 REST Endpoints (/api/fines)
        │               ├── SearchBookController.java      # Module 6 REST Endpoints (/api/search)
        │               ├── LibraryReportController.java   # Module 7 REST Endpoints (/api/reports)
        │               └── AdminController.java           # Module 8 REST Endpoints (/api/admin)
        └── resources/
            ├── application.properties                     # Database & Server settings
            ├── data.sql                                   # Auto-seed database records
            └── static/
                ├── index.html                             # Single Unified Dashboard UI
                ├── css/
                │   └── style.css                          # Custom styling & responsive layout
                └── js/
                    └── app.js                             # Frontend REST client for 8 modules
```

---

## 🚀 How to Run the Project

### Prerequisites
1. **Java JDK 17 or higher** installed.
2. **MySQL Server** installed and running (or MySQL Workbench / XAMPP MySQL).
3. **Maven** or IDE (Eclipse, IntelliJ IDEA, or VS Code).

---

### Step 1: Set Up MySQL Database

1. Open **MySQL Workbench** or MySQL Command Line:
   ```sql
   CREATE DATABASE library_db;
   ```
2. Import the script from `database/library_db.sql` or run it directly in MySQL.
3. Open `src/main/resources/application.properties` and verify your MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/library_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=root
   ```
   *(Change `root` to your MySQL username and password if different).*

---

### Step 2: Run the Spring Boot Application

#### Option A: Using Maven Command Line
In the `library-management-system` folder, execute:
```bash
mvn spring-boot:run
```

#### Option B: In IntelliJ IDEA / Eclipse / VS Code
1. Open the `library-management-system` folder as a Maven Project.
2. Navigate to `src/main/java/com/library/LibraryManagementApplication.java`.
3. Right-click and choose **Run 'LibraryManagementApplication.main()'**.

---

### Step 3: Access the Web Application

Open your browser and navigate to:
```
http://localhost:8080
```

You will see the **EduLibrary Dashboard** with immediate navigation to all **8 business modules**.

---

## 📡 REST API Reference

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **1. Users** | `GET` | `/api/users` | List all registered members |
| | `POST` | `/api/users` | Add new member |
| | `PUT` | `/api/users/{id}` | Update member details |
| | `DELETE` | `/api/users/{id}` | Delete member |
| **2. Books** | `GET` | `/api/books` | Get all catalog books |
| | `POST` | `/api/books` | Add new book |
| | `PUT` | `/api/books/{id}` | Update book details |
| | `DELETE` | `/api/books/{id}` | Delete book |
| **3. Issue** | `POST` | `/api/issues` | Issue a book to member |
| | `GET` | `/api/issues/active` | Get active issued books |
| **4. Return** | `POST` | `/api/returns` | Process book return & calculate fine |
| | `GET` | `/api/returns/history` | Get return transaction history |
| **5. Fines** | `GET` | `/api/fines` | List all fines |
| | `GET` | `/api/fines/summary` | Get total, collected & pending fine stats |
| | `POST` | `/api/fines/{id}/pay` | Pay / collect fine |
| | `POST` | `/api/fines/{id}/waive` | Waive fine |
| **6. Search** | `GET` | `/api/search?q={query}` | Search catalog by title/author/ISBN |
| | `GET` | `/api/search/categories` | Get category list |
| **7. Reports** | `GET` | `/api/reports/summary` | Get executive stats |
| | `GET` | `/api/reports/most-issued`| Most borrowed books report |
| | `GET` | `/api/reports/overdue` | Overdue defaulters list |
| | `GET` | `/api/reports/fines` | Fine collection audit report |
| | `GET` | `/api/reports/user-activity`| Member borrowing activity report |
| **8. Admin** | `GET` | `/api/admin/settings` | Get librarian profile & settings |
| | `PUT` | `/api/admin/settings` | Update operational policies & notice |

---

