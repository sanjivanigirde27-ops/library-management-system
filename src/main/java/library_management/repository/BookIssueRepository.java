package library_management.repository;

import library_management.entity.BookIssue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookIssueRepository extends JpaRepository<BookIssue, Integer> {
}