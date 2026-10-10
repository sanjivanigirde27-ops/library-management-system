package com.library.controller;

import com.library.entity.BookIssue;
import com.library.service.BookReturnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Module 4: Book Return Controller
 * REST endpoints for book return processing, overdue calculation, and stock restoration.
 */
@RestController
@RequestMapping("/api/returns")
@CrossOrigin(origins = "*")
public class BookReturnController {

    @Autowired
    private BookReturnService bookReturnService;

    // POST /api/returns - Process book return
    @PostMapping
    public ResponseEntity<?> processReturn(@RequestBody Map<String, Object> request) {
        try {
            if (!request.containsKey("issueId") || request.get("issueId") == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "issueId is required.");
                return ResponseEntity.badRequest().body(error);
            }

            Long issueId = Long.valueOf(request.get("issueId").toString());
            String remarks = request.containsKey("remarks") && request.get("remarks") != null
                    ? request.get("remarks").toString()
                    : "";

            Map<String, Object> result = bookReturnService.processReturn(issueId, remarks);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException | IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to return book: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // GET /api/returns/history - Return history
    @GetMapping("/history")
    public ResponseEntity<List<BookIssue>> getReturnHistory() {
        return ResponseEntity.ok(bookReturnService.getReturnHistory());
    }
}
