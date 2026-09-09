package library_management.controller;

import library_management.dto.ReturnBookRequest;
import library_management.entity.Book;
import library_management.entity.BookIssue;
import library_management.entity.BookReturn;
import library_management.entity.Fine;

import library_management.repository.BookIssueRepository;
import library_management.repository.BookRepository;
import library_management.repository.BookReturnRepository;
import library_management.repository.FineRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;


@RestController
@RequestMapping("/api/returns")
@CrossOrigin(origins = "*")
public class ReturnController {

    private final BookReturnRepository bookReturnRepository;
    private final BookIssueRepository bookIssueRepository;
    private final BookRepository bookRepository;
    private final FineRepository fineRepository;

    public ReturnController(BookReturnRepository bookReturnRepository,
                            BookIssueRepository bookIssueRepository,
                            BookRepository bookRepository,
                            FineRepository fineRepository) {
        this.bookReturnRepository = bookReturnRepository;
        this.bookIssueRepository = bookIssueRepository;
        this.bookRepository = bookRepository;
        this.fineRepository = fineRepository;
    }

    @GetMapping
    public List<BookReturn> getAllReturns() {
        return bookReturnRepository.findAll();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> returnBook(@RequestBody ReturnBookRequest request) {

        if (bookReturnRepository.existsByIssueId(request.getIssueId())) {
            return ResponseEntity.badRequest()
                    .body("This book has already been returned.");
        }

        BookIssue issue = bookIssueRepository.findById(request.getIssueId())
                .orElse(null);

        if (issue == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Issue record not found.");
        }

        if (!"ISSUED".equalsIgnoreCase(issue.getStatus())) {
            return ResponseEntity.badRequest()
                    .body("This issue is not currently active.");
        }

        Book book = bookRepository.findById(issue.getBookId())
                .orElse(null);

        if (book == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Book not found.");
        }

        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        issue.setStatus("RETURNED");
        bookIssueRepository.save(issue);
        long overdueDays = ChronoUnit.DAYS.between(
        issue.getDueDate(),
        LocalDate.now()
);

if (overdueDays > 0) {
    Fine fine = new Fine();
    fine.setIssueId(issue.getIssueId());
    fine.setFineAmount(BigDecimal.valueOf(overdueDays * 2));
    fine.setReason("Overdue by " + overdueDays + " day(s)");
    fine.setPaymentStatus("PENDING");

    fineRepository.save(fine);
}

        BookReturn returnedBook = new BookReturn();
        returnedBook.setIssueId(request.getIssueId());
        returnedBook.setReturnDate(LocalDate.now());
        returnedBook.setRemarks(request.getRemarks());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookReturnRepository.save(returnedBook));
                
    }
}