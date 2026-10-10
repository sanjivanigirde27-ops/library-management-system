package com.library.controller;

import com.library.entity.Fine;
import com.library.service.FineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Module 5: Fine Management Controller
 * REST endpoints for fine tracking, collection receipts, waivers, and statistics.
 */
@RestController
@RequestMapping("/api/fines")
@CrossOrigin(origins = "*")
public class FineController {

    @Autowired
    private FineService fineService;

    // GET /api/fines - Get all fines
    @GetMapping
    public ResponseEntity<List<Fine>> getAllFines() {
        return ResponseEntity.ok(fineService.getAllFines());
    }

    // GET /api/fines/unpaid - Get unpaid fines
    @GetMapping("/unpaid")
    public ResponseEntity<List<Fine>> getUnpaidFines() {
        return ResponseEntity.ok(fineService.getUnpaidFines());
    }

    // GET /api/fines/paid - Get paid fines
    @GetMapping("/paid")
    public ResponseEntity<List<Fine>> getPaidFines() {
        return ResponseEntity.ok(fineService.getPaidFines());
    }

    // GET /api/fines/summary - Fine summary statistics
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getFineSummary() {
        return ResponseEntity.ok(fineService.getFineSummary());
    }

    // POST /api/fines/{id}/pay - Pay fine
    @PostMapping("/{id}/pay")
    public ResponseEntity<?> payFine(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> request) {
        try {
            String paymentMode = (request != null && request.containsKey("paymentMode"))
                    ? request.get("paymentMode").toString()
                    : "Cash";
            String remarks = (request != null && request.containsKey("remarks"))
                    ? request.get("remarks").toString()
                    : "Paid in full";

            Fine paidFine = fineService.payFine(id, paymentMode, remarks);
            return ResponseEntity.ok(paidFine);
        } catch (IllegalArgumentException | IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to pay fine: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // POST /api/fines/{id}/waive - Waive fine
    @PostMapping("/{id}/waive")
    public ResponseEntity<?> waiveFine(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> request) {
        try {
            String remarks = (request != null && request.containsKey("remarks"))
                    ? request.get("remarks").toString()
                    : "Waived by librarian";

            Fine waivedFine = fineService.waiveFine(id, remarks);
            return ResponseEntity.ok(waivedFine);
        } catch (IllegalArgumentException | IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to waive fine: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
