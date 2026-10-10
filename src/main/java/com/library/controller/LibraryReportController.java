package com.library.controller;

import com.library.entity.Fine;
import com.library.service.LibraryReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Module 7: Library Reports Controller
 * REST endpoints for statistical summaries, overdue lists, most-issued charts, and user activity.
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class LibraryReportController {

    @Autowired
    private LibraryReportService libraryReportService;

    // GET /api/reports/summary - Overall dashboard metrics
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(libraryReportService.getDashboardSummary());
    }

    // GET /api/reports/most-issued - Most frequently issued books
    @GetMapping("/most-issued")
    public ResponseEntity<List<Map<String, Object>>> getMostIssuedBooks() {
        return ResponseEntity.ok(libraryReportService.getMostIssuedBooksReport());
    }

    // GET /api/reports/overdue - Overdue books report
    @GetMapping("/overdue")
    public ResponseEntity<List<Map<String, Object>>> getOverdueReport() {
        return ResponseEntity.ok(libraryReportService.getOverdueBooksReport());
    }

    // GET /api/reports/fines - Fine collection report
    @GetMapping("/fines")
    public ResponseEntity<List<Fine>> getFineReport() {
        return ResponseEntity.ok(libraryReportService.getFineCollectionReport());
    }

    // GET /api/reports/user-activity - Member activity report
    @GetMapping("/user-activity")
    public ResponseEntity<List<Map<String, Object>>> getUserActivityReport() {
        return ResponseEntity.ok(libraryReportService.getUserActivityReport());
    }
}
