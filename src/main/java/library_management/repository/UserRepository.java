package library_management.repository;

import library_management.entity.LibraryUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<LibraryUser, Integer> {
}