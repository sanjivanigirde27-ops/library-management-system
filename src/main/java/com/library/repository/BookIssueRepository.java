package com.library.repository;

import com.library.entity.BookIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Module 3, 4 & 7: Book Issue & Return Repository
 */
@Repository
public interface BookIssueRepository extends JpaRepository<BookIssue, Long> {
    List<BookIssue> findByStatus(String status);
    List<BookIssue> findByUserId(Long userId);
    List<BookIssue> findByBookId(Long bookId);
    
    // Check how many active issues a user currently has
    @Query("SELECT COUNT(bi) FROM BookIssue bi WHERE bi.user.id = :userId AND bi.status IN ('ISSUED', 'OVERDUE')")
    long countActiveIssuesByUser(@Param("userId") Long userId);

    // Find overdue issues (status = ISSUED and dueDate < today)
    @Query("SELECT bi FROM BookIssue bi WHERE bi.status = 'ISSUED' AND bi.dueDate < :today")
    List<BookIssue> findOverdueIssues(@Param("today") LocalDate today);

    // Module 7: Top Issued Books
    @Query("SELECT bi.book, COUNT(bi) as issueCount FROM BookIssue bi GROUP BY bi.book ORDER BY issueCount DESC")
    List<Object[]> findMostIssuedBooks();

    // Module 7: Issues count by status
    long countByStatus(String status);
}
