package library_management.controller;

import library_management.entity.Admin;
import library_management.repository.AdminRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminRepository adminRepository;

    public AdminController(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    // Get all admins/librarians
    @GetMapping
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    // Get admin/librarian by ID
    @GetMapping("/{id}")
    public ResponseEntity<Admin> getAdminById(@PathVariable Integer id) {
        return adminRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create admin/librarian
    @PostMapping
    public Admin createAdmin(@RequestBody Admin admin) {
        return adminRepository.save(admin);
    }

    // Update admin/librarian
    @PutMapping("/{id}")
    public ResponseEntity<Admin> updateAdmin(
            @PathVariable Integer id,
            @RequestBody Admin updatedAdmin) {

        return adminRepository.findById(id)
                .map(admin -> {

                    admin.setUsername(updatedAdmin.getUsername());
                    admin.setPassword(updatedAdmin.getPassword());
                    admin.setFullName(updatedAdmin.getFullName());
                    admin.setRole(updatedAdmin.getRole());

                    return ResponseEntity.ok(adminRepository.save(admin));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete admin/librarian
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Integer id) {

        if (!adminRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        adminRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}