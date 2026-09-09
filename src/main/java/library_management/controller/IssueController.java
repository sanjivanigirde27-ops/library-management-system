package library_management.controller;

import library_management.dto.IssueBookRequest;
import library_management.entity.Book;
import library_management.entity.BookIssue;
import library_management.entity.LibraryUser;
import library_management.repository.BookIssueRepository;
import library_management.repository.BookRepository;
import library_management.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*")
public class IssueController {

    private final BookIssueRepository bookIssueRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public IssueController(BookIssueRepository bookIssueRepository,
                           BookRepository bookRepository,
                           UserRepository userRepository) {
        this.bookIssueRepository = bookIssueRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<BookIssue> getAllIssues() {
        return bookIssueRepository.findAll();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> issueBook(@RequestBody IssueBookRequest request) {

        LibraryUser user = userRepository.findById(request.getUserId())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found.");
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            return ResponseEntity.badRequest()
                    .body("This user is inactive.");
        }

        Book book = bookRepository.findById(request.getBookId())
                .orElse(null);

        if (book == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Book not found.");
        }

        if (book.getAvailableCopies() <= 0) {
            return ResponseEntity.badRequest()
                    .body("Book is not available.");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        BookIssue issue = new BookIssue();
        issue.setUserId(request.getUserId());
        issue.setBookId(request.getBookId());
        issue.setIssueDate(LocalDate.now());
        issue.setDueDate(LocalDate.now().plusDays(14));
        issue.setStatus("ISSUED");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookIssueRepository.save(issue));
    }
}