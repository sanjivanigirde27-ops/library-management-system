package library_management.repository;

import library_management.entity.BookReturn;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookReturnRepository extends JpaRepository<BookReturn, Integer> {
    boolean existsByIssueId(Integer issueId);
}