package com.library.service;

import com.library.entity.Book;
import com.library.entity.BookIssue;
import com.library.entity.Fine;
import com.library.entity.User;
import com.library.repository.BookIssueRepository;
import com.library.repository.BookRepository;
import com.library.repository.FineRepository;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Module 7: Library Reports Service
 * Generates analytics, statistical summaries, overdue tracking, and fine collection reports.
 */
@Service
public class LibraryReportService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookIssueRepository bookIssueRepository;

    @Autowired
    private FineRepository fineRepository;

    // 1. Overall Dashboard Summary Report
    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();

        // Books metrics
        long totalBookTitles = bookRepository.count();
        Long totalCopies = bookRepository.sumTotalCopies();
        Long availableCopies = bookRepository.sumAvailableCopies();
        long issuedCopies = (totalCopies != null && availableCopies != null) ? (totalCopies - availableCopies) : 0;

        // User metrics
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus("Active");

        // Issue metrics
        long totalIssues = bookIssueRepository.count();
        long activeIssues = bookIssueRepository.countByStatus("ISSUED") + bookIssueRepository.countByStatus("OVERDUE");
        long returnedIssues = bookIssueRepository.countByStatus("RETURNED");

        // Overdue count
        List<BookIssue> overdueList = bookIssueRepository.findOverdueIssues(LocalDate.now());
        long overdueCount = overdueList.size();

        // Fine metrics
        Double totalFine = fineRepository.sumTotalFines();
        Double collectedFine = fineRepository.sumCollectedFines();
        Double pendingFine = fineRepository.sumPendingFines();

        summary.put("totalBookTitles", totalBookTitles);
        summary.put("totalCopies", totalCopies != null ? totalCopies : 0);
        summary.put("availableCopies", availableCopies != null ? availableCopies : 0);
        summary.put("issuedCopies", issuedCopies);
        summary.put("totalUsers", totalUsers);
        summary.put("activeUsers", activeUsers);
        summary.put("totalIssues", totalIssues);
        summary.put("activeIssues", activeIssues);
        summary.put("returnedIssues", returnedIssues);
        summary.put("overdueIssues", overdueCount);
        summary.put("totalFineAmount", totalFine != null ? totalFine : 0.0);
        summary.put("collectedFineAmount", collectedFine != null ? collectedFine : 0.0);
        summary.put("pendingFineAmount", pendingFine != null ? pendingFine : 0.0);

        return summary;
    }

    // 2. Most Issued Books Report
    public List<Map<String, Object>> getMostIssuedBooksReport() {
        List<Object[]> rawList = bookIssueRepository.findMostIssuedBooks();
        List<Map<String, Object>> report = new ArrayList<>();

        for (Object[] row : rawList) {
            Book book = (Book) row[0];
            Long count = (Long) row[1];

            Map<String, Object> item = new HashMap<>();
            item.put("bookId", book.getId());
            item.put("title", book.getTitle());
            item.put("author", book.getAuthor());
            item.put("category", book.getCategory());
            item.put("timesIssued", count);
            item.put("availableCopies", book.getAvailableCopies());
            item.put("totalCopies", book.getTotalCopies());
            report.add(item);
        }

        return report;
    }

    // 3. Overdue Books Report
    public List<Map<String, Object>> getOverdueBooksReport() {
        List<BookIssue> allActive = bookIssueRepository.findAll();
        List<Map<String, Object>> overdueReport = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (BookIssue issue : allActive) {
            if (!"RETURNED".equalsIgnoreCase(issue.getStatus()) && issue.getDueDate().isBefore(today)) {
                long daysOverdue = ChronoUnit.DAYS.between(issue.getDueDate(), today);

                Map<String, Object> item = new HashMap<>();
                item.put("issueId", issue.getId());
                item.put("userName", issue.getUser().getName());
                item.put("userEmail", issue.getUser().getEmail());
                item.put("userPhone", issue.getUser().getPhone());
                item.put("bookTitle", issue.getBook().getTitle());
                item.put("isbn", issue.getBook().getIsbn());
                item.put("issueDate", issue.getIssueDate());
                item.put("dueDate", issue.getDueDate());
                item.put("daysOverdue", daysOverdue);
                item.put("estimatedFine", daysOverdue * 5.0); // based on standard fine rate
                overdueReport.add(item);
            }
        }

        return overdueReport;
    }

    // 4. Fine Collection Report
    public List<Fine> getFineCollectionReport() {
        return fineRepository.findAll();
    }

    // 5. User Activity Report
    public List<Map<String, Object>> getUserActivityReport() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> report = new ArrayList<>();

        for (User user : users) {
            List<BookIssue> userIssues = bookIssueRepository.findByUserId(user.getId());
            long activeCount = userIssues.stream().filter(i -> !"RETURNED".equalsIgnoreCase(i.getStatus())).count();
            long returnedCount = userIssues.stream().filter(i -> "RETURNED".equalsIgnoreCase(i.getStatus())).count();

            Map<String, Object> item = new HashMap<>();
            item.put("userId", user.getId());
            item.put("userName", user.getName());
            item.put("userEmail", user.getEmail());
            item.put("membershipType", user.getMembershipType());
            item.put("status", user.getStatus());
            item.put("totalBorrowed", userIssues.size());
            item.put("currentlyHolding", activeCount);
            item.put("totalReturned", returnedCount);
            report.add(item);
        }

        return report;
    }
}
