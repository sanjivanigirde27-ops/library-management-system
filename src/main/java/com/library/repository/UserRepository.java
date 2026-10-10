package com.library.repository;

import com.library.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Module 1: User Management Repository
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByStatus(String status);
    List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);
    long countByStatus(String status);
}
