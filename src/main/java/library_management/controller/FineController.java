package library_management.controller;

import library_management.entity.Fine;
import library_management.repository.FineRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/fines")
@CrossOrigin(origins = "*")
public class FineController {

    private final FineRepository fineRepository;

    public FineController(FineRepository fineRepository) {
        this.fineRepository = fineRepository;
    }

    @GetMapping
    public List<Fine> getAllFines() {
        return fineRepository.findAll();
    }

    @GetMapping("/pending")
    public List<Fine> getPendingFines() {
        return fineRepository.findByPaymentStatus("PENDING");
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<?> payFine(@PathVariable Integer id) {
        return fineRepository.findById(id)
                .map(fine -> {
                    fine.setPaymentStatus("PAID");
                    fine.setPaidDate(LocalDate.now());
                    return ResponseEntity.ok(fineRepository.save(fine));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}