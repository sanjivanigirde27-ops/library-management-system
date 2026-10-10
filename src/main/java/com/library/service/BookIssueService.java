package com.library.service;

import com.library.entity.Book;
import com.library.entity.BookIssue;
import com.library.entity.SystemSetting;
import com.library.entity.User;
import com.library.repository.BookIssueRepository;
import com.library.repository.BookRepository;
import com.library.repository.SystemSettingRepository;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Module 3: Book Issue Service
 * Handles book borrowing transactions, member validation, and stock decrement.
 */
@Service
public class BookIssueService {

    @Autowired
    private BookIssueRepository bookIssueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    // 1. Get all book issue transactions
    public List<BookIssue> getAllIssues() {
        return bookIssueRepository.findAll();
    }

    // 2. Get active issues (ISSUED or OVERDUE)
    public List<BookIssue> getActiveIssues() {
        // Automatically check if any active issue has passed due date and mark as OVERDUE
        List<BookIssue> issues = bookIssueRepository.findByStatus("ISSUED");
        LocalDate today = LocalDate.now();
        for (BookIssue issue : issues) {
            if (issue.getDueDate().isBefore(today)) {
                issue.setStatus("OVERDUE");
                bookIssueRepository.save(issue);
            }
        }
        return bookIssueRepository.findAll();
    }

    // 3. Get single issue by ID
    public BookIssue getIssueById(Long id) {
        Optional<BookIssue> optionalIssue = bookIssueRepository.findById(id);
        if (optionalIssue.isPresent()) {
            return optionalIssue.get();
        } else {
            return null;
        }
    }

    // 4. Issue a book to a user
    public BookIssue issueBook(Long userId, Long bookId, Integer loanDays, String remarks) {
        // Step 1: Validate User
        Optional<User> optionalUser = userRepository.findById(userId);
        if (!optionalUser.isPresent()) {
            throw new IllegalArgumentException("User with ID " + userId + " does not exist.");
        }
        User user = optionalUser.get();
        if (!"Active".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalStateException("User '" + user.getName() + "' is Inactive. Cannot issue book.");
        }

        // Step 2: Validate System Limits (Max books allowed per user)
        SystemSetting settings = systemSettingRepository.findById(1L).orElse(new SystemSetting());
        int maxAllowed = settings.getMaxBooksPerUser() != null ? settings.getMaxBooksPerUser() : 3;
        long activeUserIssues = bookIssueRepository.countActiveIssuesByUser(userId);
        if (activeUserIssues >= maxAllowed) {
            throw new IllegalStateException("User has already reached the maximum limit of " + maxAllowed + " issued books.");
        }

        // Step 3: Validate Book
        Optional<Book> optionalBook = bookRepository.findById(bookId);
        if (!optionalBook.isPresent()) {
            throw new IllegalArgumentException("Book with ID " + bookId + " does not exist.");
        }
        Book book = optionalBook.get();
        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("Book '" + book.getTitle() + "' is currently out of stock.");
        }

        // Step 4: Decrement available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        // Step 5: Calculate issue and due dates
        LocalDate issueDate = LocalDate.now();
        int days = (loanDays != null && loanDays > 0) ? loanDays : (settings.getLoanPeriodDays() != null ? settings.getLoanPeriodDays() : 14);
        LocalDate dueDate = issueDate.plusDays(days);

        // Step 6: Create and save issue record
        BookIssue issue = new BookIssue(user, book, issueDate, dueDate, remarks);
        return bookIssueRepository.save(issue);
    }

    // 5. Get issues by User ID
    public List<BookIssue> getIssuesByUser(Long userId) {
        return bookIssueRepository.findByUserId(userId);
    }
}
