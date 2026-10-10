package com.library.service;

import com.library.entity.Book;
import com.library.entity.BookIssue;
import com.library.entity.Fine;
import com.library.entity.SystemSetting;
import com.library.repository.BookIssueRepository;
import com.library.repository.BookRepository;
import com.library.repository.FineRepository;
import com.library.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Module 4: Book Return Service
 * Handles book return processing, stock restoration, overdue calculation, and automated fine generation.
 */
@Service
public class BookReturnService {

    @Autowired
    private BookIssueRepository bookIssueRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    // 1. Process Book Return
    public Map<String, Object> processReturn(Long issueId, String returnRemarks) {
        Map<String, Object> result = new HashMap<>();

        // Validate issue record
        Optional<BookIssue> optionalIssue = bookIssueRepository.findById(issueId);
        if (!optionalIssue.isPresent()) {
            throw new IllegalArgumentException("Book Issue record with ID " + issueId + " not found.");
        }

        BookIssue issue = optionalIssue.get();
        if ("RETURNED".equalsIgnoreCase(issue.getStatus())) {
            throw new IllegalStateException("Book has already been returned on " + issue.getReturnDate() + ".");
        }

        // Set return date
        LocalDate today = LocalDate.now();
        issue.setReturnDate(today);
        issue.setStatus("RETURNED");
        if (returnRemarks != null && !returnRemarks.trim().isEmpty()) {
            issue.setRemarks(returnRemarks);
        }

        // Increment book available copies
        Book book = issue.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        // Check if overdue
        long overdueDays = 0;
        double fineAmount = 0.0;
        Fine fineRecord = null;

        if (today.isAfter(issue.getDueDate())) {
            overdueDays = ChronoUnit.DAYS.between(issue.getDueDate(), today);
            
            // Get fine rate from system settings
            SystemSetting settings = systemSettingRepository.findById(1L).orElse(new SystemSetting());
            double fineRate = settings.getFineRatePerDay() != null ? settings.getFineRatePerDay() : 5.0;
            fineAmount = overdueDays * fineRate;

            // Generate Fine record
            fineRecord = new Fine();
            fineRecord.setBookIssue(issue);
            fineRecord.setUser(issue.getUser());
            fineRecord.setAmount(fineAmount);
            fineRecord.setOverdueDays((int) overdueDays);
            fineRecord.setStatus("UNPAID");
            fineRecord.setRemarks("Overdue fine for " + overdueDays + " days late return.");
            fineRecord = fineRepository.save(fineRecord);
        }

        // Save updated issue
        bookIssueRepository.save(issue);

        // Prepare return response
        result.put("success", true);
        result.put("issueId", issue.getId());
        result.put("bookTitle", book.getTitle());
        result.put("userName", issue.getUser().getName());
        result.put("issueDate", issue.getIssueDate());
        result.put("dueDate", issue.getDueDate());
        result.put("returnDate", issue.getReturnDate());
        result.put("overdueDays", overdueDays);
        result.put("fineAmount", fineAmount);
        result.put("fineId", fineRecord != null ? fineRecord.getId() : null);
        result.put("message", overdueDays > 0 
                ? "Book returned successfully with " + overdueDays + " overdue days. Fine generated: ₹" + fineAmount 
                : "Book returned successfully on time. No fine incurred.");

        return result;
    }

    // 2. Get return history (all returned issues)
    public List<BookIssue> getReturnHistory() {
        return bookIssueRepository.findByStatus("RETURNED");
    }
}
