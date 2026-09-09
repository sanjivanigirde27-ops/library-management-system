package library_management.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final JdbcTemplate jdbcTemplate;

    public ReportController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Total number of books
    @GetMapping("/total-books")
    public Map<String, Object> getTotalBooks() {

        Integer totalBooks = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM books",
                Integer.class
        );

        return Map.of("totalBooks", totalBooks);
    }

    // Total number of users
    @GetMapping("/total-users")
    public Map<String, Object> getTotalUsers() {

        Integer totalUsers = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users",
                Integer.class
        );

        return Map.of("totalUsers", totalUsers);
    }

    // Total issued books
    @GetMapping("/issued-books")
    public Map<String, Object> getIssuedBooks() {

        Integer issuedBooks = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM book_issues",
                Integer.class
        );

        return Map.of("issuedBooks", issuedBooks);
    }

    // Total returned books
    @GetMapping("/returned-books")
    public Map<String, Object> getReturnedBooks() {

        Integer returnedBooks = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM book_returns",
                Integer.class
        );

        return Map.of("returnedBooks", returnedBooks);
    }

    // Pending fines
    @GetMapping("/pending-fines")
    public Map<String, Object> getPendingFines() {

        Integer pendingFines = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM fines WHERE payment_status = 'PENDING'",
                Integer.class
        );

        return Map.of("pendingFines", pendingFines);
    }

    // Total fine amount
    @GetMapping("/total-fines")
    public Map<String, Object> getTotalFines() {

        Object totalFine = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(fine_amount), 0) FROM fines",
                Object.class
        );

        return Map.of("totalFineAmount", totalFine);
    }
}