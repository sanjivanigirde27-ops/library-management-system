package com.library.service;

import com.library.entity.Book;
import com.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Module 6: Search Book Service
 * Provides multi-criteria search, category filtering, and instant availability query.
 */
@Service
public class SearchBookService {

    @Autowired
    private BookRepository bookRepository;

    // 1. Search books by keyword and optional category/availability filters
    public List<Book> search(String query, String category, Boolean inStockOnly) {
        List<Book> results;

        if (query != null && !query.trim().isEmpty()) {
            results = bookRepository.searchBooks(query.trim());
        } else if (category != null && !category.trim().isEmpty() && !"All".equalsIgnoreCase(category)) {
            results = bookRepository.findByCategory(category.trim());
        } else {
            results = bookRepository.findAll();
        }

        // Apply secondary filtering in-memory for simple, clean logic
        List<Book> filtered = new ArrayList<>();
        for (Book book : results) {
            boolean matchesCategory = true;
            boolean matchesStock = true;

            if (category != null && !category.trim().isEmpty() && !"All".equalsIgnoreCase(category)) {
                matchesCategory = category.equalsIgnoreCase(book.getCategory());
            }

            if (inStockOnly != null && inStockOnly) {
                matchesStock = book.getAvailableCopies() != null && book.getAvailableCopies() > 0;
            }

            if (matchesCategory && matchesStock) {
                filtered.add(book);
            }
        }

        return filtered;
    }

    // 2. Get list of all distinct categories
    public List<String> getAllCategories() {
        return bookRepository.findDistinctCategories();
    }
}
