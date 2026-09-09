package library_management.controller;

import library_management.entity.Book;
import library_management.repository.BookRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {

    private final BookRepository bookRepository;

    public SearchController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    // Search books by title
    @GetMapping("/title")
    public List<Book> searchByTitle(@RequestParam String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title);
    }

    // Search books by author
    @GetMapping("/author")
    public List<Book> searchByAuthor(@RequestParam String author) {
        return bookRepository.findByAuthorContainingIgnoreCase(author);
    }

    // Search books by category
    @GetMapping("/category")
    public List<Book> searchByCategory(@RequestParam String category) {
        return bookRepository.findByCategoryContainingIgnoreCase(category);
    }

    // Search book by ISBN
    @GetMapping("/isbn")
    public List<Book> searchByIsbn(@RequestParam String isbn) {
        return bookRepository.findByIsbn(isbn);
    }

    // Search available books
    @GetMapping("/available")
    public List<Book> getAvailableBooks() {
        return bookRepository.findByAvailableCopiesGreaterThan(0);
    }
}