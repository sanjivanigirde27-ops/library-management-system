package com.library.controller;

import com.library.entity.User;
import com.library.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Module 1: User Management Controller
 * REST endpoints for member registration, update, deletion, and listing.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // GET /api/users - Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // GET /api/users/{id} - Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // GET /api/users/active - Get active users only
    @GetMapping("/active")
    public ResponseEntity<List<User>> getActiveUsers() {
        return ResponseEntity.ok(userService.getActiveUsers());
    }

    // POST /api/users - Create new user
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User created = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // PUT /api/users/{id} - Update user
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updated = userService.updateUser(id, user);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found with ID: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // DELETE /api/users/{id} - Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);
        Map<String, Object> response = new HashMap<>();
        if (deleted) {
            response.put("success", true);
            response.put("message", "User deleted successfully.");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", "User not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}
