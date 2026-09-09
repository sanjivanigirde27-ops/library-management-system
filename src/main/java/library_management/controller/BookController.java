package library_management.controller;

import library_management.entity.Book;
import library_management.repository.BookRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    private final BookRepository bookRepository;

    public BookController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    // View all books
    @GetMapping
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // View one book by ID
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Integer id) {
        return bookRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Add a new book
    @PostMapping
public Book addBook(@RequestBody Book book) {

    System.out.println("Received Book:");
    System.out.println("ISBN: " + book.getIsbn());
    System.out.println("Title: " + book.getTitle());
    System.out.println("Total Copies: " + book.getTotalCopies());
    System.out.println("Available Copies: " + book.getAvailableCopies());

    return bookRepository.save(book);
}

    // Update a book
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(
            @PathVariable Integer id,
            @RequestBody Book updatedBook) {

        return bookRepository.findById(id)
                .map(book -> {
                    book.setIsbn(updatedBook.getIsbn());
                    book.setTitle(updatedBook.getTitle());
                    book.setAuthor(updatedBook.getAuthor());
                    book.setPublisher(updatedBook.getPublisher());
                    book.setCategory(updatedBook.getCategory());
                    book.setTotalCopies(updatedBook.getTotalCopies());
                    book.setAvailableCopies(updatedBook.getAvailableCopies());
                    book.setShelfLocation(updatedBook.getShelfLocation());

                    return ResponseEntity.ok(bookRepository.save(book));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a book
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Integer id) {
        if (!bookRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        bookRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}