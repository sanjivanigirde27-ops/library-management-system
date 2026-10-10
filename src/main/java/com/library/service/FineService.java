package com.library.service;

import com.library.entity.Fine;
import com.library.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Module 5: Fine Management Service
 * Provides business logic for overdue fine collection, receipts, waivers, and tracking.
 */
@Service
public class FineService {

    @Autowired
    private FineRepository fineRepository;

    // 1. Get all fines
    public List<Fine> getAllFines() {
        return fineRepository.findAll();
    }

    // 2. Get fine by ID
    public Fine getFineById(Long id) {
        Optional<Fine> optionalFine = fineRepository.findById(id);
        return optionalFine.orElse(null);
    }

    // 3. Get unpaid fines
    public List<Fine> getUnpaidFines() {
        return fineRepository.findByStatus("UNPAID");
    }

    // 4. Get paid fines
    public List<Fine> getPaidFines() {
        return fineRepository.findByStatus("PAID");
    }

    // 5. Pay a fine
    public Fine payFine(Long fineId, String paymentMode, String remarks) {
        Optional<Fine> optionalFine = fineRepository.findById(fineId);
        if (!optionalFine.isPresent()) {
            throw new IllegalArgumentException("Fine record with ID " + fineId + " not found.");
        }

        Fine fine = optionalFine.get();
        if ("PAID".equalsIgnoreCase(fine.getStatus())) {
            throw new IllegalStateException("This fine has already been paid on " + fine.getPaidDate() + ".");
        }

        fine.setStatus("PAID");
        fine.setPaidDate(LocalDate.now());
        fine.setPaymentMode(paymentMode != null ? paymentMode : "Cash");
        if (remarks != null && !remarks.trim().isEmpty()) {
            fine.setRemarks(remarks);
        }

        return fineRepository.save(fine);
    }

    // 6. Waive a fine
    public Fine waiveFine(Long fineId, String remarks) {
        Optional<Fine> optionalFine = fineRepository.findById(fineId);
        if (!optionalFine.isPresent()) {
            throw new IllegalArgumentException("Fine record with ID " + fineId + " not found.");
        }

        Fine fine = optionalFine.get();
        fine.setStatus("WAIVED");
        fine.setPaidDate(LocalDate.now());
        fine.setRemarks("Waived by Librarian: " + (remarks != null ? remarks : "N/A"));

        return fineRepository.save(fine);
    }

    // 7. Get fine statistics summary
    public Map<String, Object> getFineSummary() {
        Map<String, Object> summary = new HashMap<>();
        Double totalFine = fineRepository.sumTotalFines();
        Double collectedFine = fineRepository.sumCollectedFines();
        Double pendingFine = fineRepository.sumPendingFines();

        summary.put("totalFineAmount", totalFine != null ? totalFine : 0.0);
        summary.put("totalCollectedFine", collectedFine != null ? collectedFine : 0.0);
        summary.put("totalPendingFine", pendingFine != null ? pendingFine : 0.0);
        summary.put("totalFinesCount", fineRepository.count());
        summary.put("unpaidCount", fineRepository.countByStatus("UNPAID"));
        summary.put("paidCount", fineRepository.countByStatus("PAID"));
        summary.put("waivedCount", fineRepository.countByStatus("WAIVED"));

        return summary;
    }
}
