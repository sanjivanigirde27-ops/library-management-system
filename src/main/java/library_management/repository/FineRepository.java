package library_management.repository;

import library_management.entity.Fine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FineRepository extends JpaRepository<Fine, Integer> {
    List<Fine> findByPaymentStatus(String paymentStatus);
}