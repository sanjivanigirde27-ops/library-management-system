package com.library.repository;

import com.library.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Module 2 & 6: Book Repository
 */
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByIsbn(String isbn);
    List<Book> findByCategory(String category);
    List<Book> findByAvailableCopiesGreaterThan(int copies);

    // Dynamic Search for Module 6: Search Book
    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.category) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Book> searchBooks(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT b.category FROM Book b WHERE b.category IS NOT NULL ORDER BY b.category ASC")
    List<String> findDistinctCategories();

    @Query("SELECT SUM(b.totalCopies) FROM Book b")
    Long sumTotalCopies();

    @Query("SELECT SUM(b.availableCopies) FROM Book b")
    Long sumAvailableCopies();
}
