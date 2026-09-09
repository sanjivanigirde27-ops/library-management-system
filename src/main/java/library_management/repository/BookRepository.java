package library_management.repository;

import library_management.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Integer> {
    List<Book> findByTitleContainingIgnoreCase(String title);

List<Book> findByAuthorContainingIgnoreCase(String author);

List<Book> findByCategoryContainingIgnoreCase(String category);

List<Book> findByIsbn(String isbn);

List<Book> findByAvailableCopiesGreaterThan(Integer availableCopies);
}