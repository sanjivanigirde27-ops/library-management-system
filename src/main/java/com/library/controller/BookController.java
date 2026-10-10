package com.library.controller;

import com.library.entity.Book;
import com.library.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Module 2: Book Management Controller
 * REST endpoints for catalog management, book addition, inventory updates, and deletion.
 */
@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private BookService bookService;

    // GET /api/books - Get all books
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    // GET /api/books/{id} - Get book by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookById(@PathVariable Long id) {
        Book book = bookService.getBookById(id);
        if (book != null) {
            return ResponseEntity.ok(book);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Book not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // GET /api/books/available - Get available books (copies > 0)
    @GetMapping("/available")
    public ResponseEntity<List<Book>> getAvailableBooks() {
        return ResponseEntity.ok(bookService.getAvailableBooks());
    }

    // POST /api/books - Add a new book
    @PostMapping
    public ResponseEntity<?> createBook(@RequestBody Book book) {
        try {
            Book created = bookService.createBook(book);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // PUT /api/books/{id} - Update book details
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBook(@PathVariable Long id, @RequestBody Book book) {
        try {
            Book updated = bookService.updateBook(id, book);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Book not found with ID: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // DELETE /api/books/{id} - Delete book
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        boolean deleted = bookService.deleteBook(id);
        Map<String, Object> response = new HashMap<>();
        if (deleted) {
            response.put("success", true);
            response.put("message", "Book deleted successfully.");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", "Book not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}
