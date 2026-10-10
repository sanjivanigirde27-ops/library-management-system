package com.library.service;

import com.library.entity.User;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Module 1: User Management Service
 * Provides business logic for creating, viewing, updating, and deleting library users.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 1. Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 2. Get user by ID
    public User getUserById(Long id) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            return optionalUser.get();
        } else {
            return null;
        }
    }

    // 3. Create a new user
    public User createUser(User user) {
        // Validate if email already exists
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("User with email '" + user.getEmail() + "' already exists.");
        }
        if (user.getStatus() == null || user.getStatus().trim().isEmpty()) {
            user.setStatus("Active");
        }
        return userRepository.save(user);
    }

    // 4. Update an existing user
    public User updateUser(Long id, User userDetails) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (!optionalUser.isPresent()) {
            return null;
        }

        User existingUser = optionalUser.get();
        
        // Update user fields
        if (userDetails.getName() != null && !userDetails.getName().trim().isEmpty()) {
            existingUser.setName(userDetails.getName().trim());
        }
        if (userDetails.getEmail() != null && !userDetails.getEmail().trim().isEmpty()) {
            // If email changed, verify uniqueness
            if (!existingUser.getEmail().equalsIgnoreCase(userDetails.getEmail().trim())) {
                Optional<User> otherUser = userRepository.findByEmail(userDetails.getEmail().trim());
                if (otherUser.isPresent()) {
                    throw new IllegalArgumentException("Email is already used by another user.");
                }
                existingUser.setEmail(userDetails.getEmail().trim());
            }
        }
        if (userDetails.getPhone() != null) {
            existingUser.setPhone(userDetails.getPhone().trim());
        }
        if (userDetails.getMembershipType() != null) {
            existingUser.setMembershipType(userDetails.getMembershipType());
        }
        if (userDetails.getStatus() != null) {
            existingUser.setStatus(userDetails.getStatus());
        }

        return userRepository.save(existingUser);
    }

    // 5. Delete a user by ID
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }

    // 6. Get active users only
    public List<User> getActiveUsers() {
        return userRepository.findByStatus("Active");
    }
}
