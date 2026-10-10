package com.library.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Module 1: User Management Entity
 * Represents library members/students/faculty.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "membership_type", length = 50)
    private String membershipType; // e.g. Student, Faculty, Guest

    @Column(length = 20)
    private String status; // Active, Inactive

    @Column(name = "created_date")
    private LocalDate createdDate;

    public User() {
        this.createdDate = LocalDate.now();
        this.status = "Active";
        this.membershipType = "Student";
    }

    public User(String name, String email, String phone, String membershipType, String status) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.membershipType = membershipType != null ? membershipType : "Student";
        this.status = status != null ? status : "Active";
        this.createdDate = LocalDate.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getMembershipType() {
        return membershipType;
    }

    public void setMembershipType(String membershipType) {
        this.membershipType = membershipType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }
}
