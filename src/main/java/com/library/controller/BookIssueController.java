package com.library.controller;

import com.library.entity.BookIssue;
import com.library.service.BookIssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Module 3: Book Issue Controller
 * REST endpoints for issuing books to library members.
 */
@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*")
public class BookIssueController {

    @Autowired
    private BookIssueService bookIssueService;

    // GET /api/issues - Get all issue records
    @GetMapping
    public ResponseEntity<List<BookIssue>> getAllIssues() {
        return ResponseEntity.ok(bookIssueService.getAllIssues());
    }

    // GET /api/issues/active - Get currently active issues
    @GetMapping("/active")
    public ResponseEntity<List<BookIssue>> getActiveIssues() {
        return ResponseEntity.ok(bookIssueService.getActiveIssues());
    }

    // GET /api/issues/{id} - Get issue by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getIssueById(@PathVariable Long id) {
        BookIssue issue = bookIssueService.getIssueById(id);
        if (issue != null) {
            return ResponseEntity.ok(issue);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Issue record not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // GET /api/issues/user/{userId} - Get issues for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookIssue>> getIssuesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(bookIssueService.getIssuesByUser(userId));
    }

    // POST /api/issues - Issue a book
    @PostMapping
    public ResponseEntity<?> issueBook(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long bookId = Long.valueOf(request.get("bookId").toString());
            
            Integer loanDays = null;
            if (request.containsKey("loanDays") && request.get("loanDays") != null) {
                loanDays = Integer.parseInt(request.get("loanDays").toString());
            }

            String remarks = (request.get("remarks") != null) ? request.get("remarks").toString() : "";

            BookIssue issued = bookIssueService.issueBook(userId, bookId, loanDays, remarks);
            return ResponseEntity.status(HttpStatus.CREATED).body(issued);
        } catch (IllegalArgumentException | IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to issue book: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
