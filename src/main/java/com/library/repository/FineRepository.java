package com.library.repository;

import com.library.entity.Fine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Module 5 & 7: Fine Management Repository
 */
@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {
    List<Fine> findByStatus(String status);
    List<Fine> findByUserId(Long userId);
    Optional<Fine> findByBookIssueId(Long issueId);

    @Query("SELECT SUM(f.amount) FROM Fine f")
    Double sumTotalFines();

    @Query("SELECT SUM(f.amount) FROM Fine f WHERE f.status = 'PAID'")
    Double sumCollectedFines();

    @Query("SELECT SUM(f.amount) FROM Fine f WHERE f.status = 'UNPAID'")
    Double sumPendingFines();

    long countByStatus(String status);
}
