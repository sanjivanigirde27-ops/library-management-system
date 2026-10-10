package com.library.controller;

import com.library.entity.SystemSetting;
import com.library.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Module 8: Admin / Librarian Controller
 * REST endpoints for librarian profile, library policies, loan durations, and fine rate configuration.
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // GET /api/admin/settings - Get settings & librarian profile
    @GetMapping("/settings")
    public ResponseEntity<SystemSetting> getSettings() {
        return ResponseEntity.ok(adminService.getSettings());
    }

    // PUT /api/admin/settings - Update settings & librarian profile
    @PutMapping("/settings")
    public ResponseEntity<SystemSetting> updateSettings(@RequestBody SystemSetting settings) {
        SystemSetting updated = adminService.updateSettings(settings);
        return ResponseEntity.ok(updated);
    }
}
