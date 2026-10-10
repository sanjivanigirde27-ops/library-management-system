package com.library.service;

import com.library.entity.Book;
import com.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Module 2: Book Management Service
 * Provides business logic for creating, viewing, updating, and deleting books in the library.
 */
@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    // 1. Get all books
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // 2. Get book by ID
    public Book getBookById(Long id) {
        Optional<Book> optionalBook = bookRepository.findById(id);
        if (optionalBook.isPresent()) {
            return optionalBook.get();
        } else {
            return null;
        }
    }

    // 3. Create a new book
    public Book createBook(Book book) {
        // Validate ISBN uniqueness
        Optional<Book> existingBook = bookRepository.findByIsbn(book.getIsbn().trim());
        if (existingBook.isPresent()) {
            throw new IllegalArgumentException("Book with ISBN '" + book.getIsbn() + "' already exists.");
        }

        if (book.getTotalCopies() == null || book.getTotalCopies() < 1) {
            book.setTotalCopies(1);
        }
        if (book.getAvailableCopies() == null) {
            book.setAvailableCopies(book.getTotalCopies());
        }
        if (book.getPrice() == null) {
            book.setPrice(0.0);
        }

        return bookRepository.save(book);
    }

    // 4. Update an existing book
    public Book updateBook(Long id, Book bookDetails) {
        Optional<Book> optionalBook = bookRepository.findById(id);
        if (!optionalBook.isPresent()) {
            return null;
        }

        Book existingBook = optionalBook.get();

        if (bookDetails.getTitle() != null) {
            existingBook.setTitle(bookDetails.getTitle().trim());
        }
        if (bookDetails.getAuthor() != null) {
            existingBook.setAuthor(bookDetails.getAuthor().trim());
        }
        if (bookDetails.getIsbn() != null && !existingBook.getIsbn().equalsIgnoreCase(bookDetails.getIsbn().trim())) {
            Optional<Book> otherBook = bookRepository.findByIsbn(bookDetails.getIsbn().trim());
            if (otherBook.isPresent()) {
                throw new IllegalArgumentException("ISBN is already used by another book.");
            }
            existingBook.setIsbn(bookDetails.getIsbn().trim());
        }
        if (bookDetails.getCategory() != null) {
            existingBook.setCategory(bookDetails.getCategory().trim());
        }
        if (bookDetails.getPublisher() != null) {
            existingBook.setPublisher(bookDetails.getPublisher().trim());
        }
        if (bookDetails.getRackNumber() != null) {
            existingBook.setRackNumber(bookDetails.getRackNumber().trim());
        }
        if (bookDetails.getTotalCopies() != null) {
            int difference = bookDetails.getTotalCopies() - existingBook.getTotalCopies();
            existingBook.setTotalCopies(bookDetails.getTotalCopies());
            existingBook.setAvailableCopies(Math.max(0, existingBook.getAvailableCopies() + difference));
        }
        if (bookDetails.getPrice() != null) {
            existingBook.setPrice(bookDetails.getPrice());
        }

        return bookRepository.save(existingBook);
    }

    // 5. Delete a book by ID
    public boolean deleteBook(Long id) {
        if (bookRepository.existsById(id)) {
            bookRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }

    // 6. Get available books (copies > 0)
    public List<Book> getAvailableBooks() {
        return bookRepository.findByAvailableCopiesGreaterThan(0);
    }
}
