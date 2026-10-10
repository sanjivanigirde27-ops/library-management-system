package com.library;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Application Entry Point
 * Library Management System - Exactly 8 Modules
 * 
 * 1. User Management
 * 2. Book Management
 * 3. Book Issue
 * 4. Book Return
 * 5. Fine Management
 * 6. Search Book
 * 7. Library Reports
 * 8. Admin / Librarian
 */
@SpringBootApplication
public class LibraryManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(LibraryManagementApplication.class, args);
        System.out.println("==========================================================");
        System.out.println(" Library Management System Started Successfully!");
        System.out.println(" Open your browser at: http://localhost:8080");
        System.out.println(" Exactly 8 Modules Ready to Use");
        System.out.println("==========================================================");
    }
}
