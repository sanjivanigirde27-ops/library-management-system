package com.library.controller;

import com.library.entity.Book;
import com.library.service.SearchBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Module 6: Search Book Controller
 * REST endpoints for finding books by keyword, category, and real-time availability.
 */
@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchBookController {

    @Autowired
    private SearchBookService searchBookService;

    // GET /api/search - Search books with filters
    @GetMapping
    public ResponseEntity<List<Book>> searchBooks(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "inStockOnly", required = false) Boolean inStockOnly) {
        
        List<Book> books = searchBookService.search(query, category, inStockOnly);
        return ResponseEntity.ok(books);
    }

    // GET /api/search/categories - Get distinct categories
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(searchBookService.getAllCategories());
    }
}
