package com.library.entity;

import jakarta.persistence.*;

/**
 * Module 8: Admin / Librarian System Settings Entity
 * Stores library parameters, librarian contact, loan periods, and fine rules.
 */
@Entity
@Table(name = "system_settings")
public class SystemSetting {

    @Id
    private Long id;

    @Column(name = "library_name", nullable = false, length = 150)
    private String libraryName;

    @Column(name = "librarian_name", nullable = false, length = 100)
    private String librarianName;

    @Column(name = "librarian_email", nullable = false, length = 100)
    private String librarianEmail;

    @Column(name = "librarian_phone", length = 30)
    private String librarianPhone;

    @Column(name = "max_books_per_user")
    private Integer maxBooksPerUser;

    @Column(name = "loan_period_days")
    private Integer loanPeriodDays;

    @Column(name = "fine_rate_per_day")
    private Double fineRatePerDay;

    @Column(name = "system_notice", columnDefinition = "TEXT")
    private String systemNotice;

    public SystemSetting() {
        this.id = 1L;
        this.libraryName = "Central College Library";
        this.librarianName = "Chief Librarian";
        this.librarianEmail = "librarian@college.edu";
        this.librarianPhone = "+1-555-0199";
        this.maxBooksPerUser = 3;
        this.loanPeriodDays = 14;
        this.fineRatePerDay = 5.0;
        this.systemNotice = "Welcome to the Library Management System.";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLibraryName() {
        return libraryName;
    }

    public void setLibraryName(String libraryName) {
        this.libraryName = libraryName;
    }

    public String getLibrarianName() {
        return librarianName;
    }

    public void setLibrarianName(String librarianName) {
        this.librarianName = librarianName;
    }

    public String getLibrarianEmail() {
        return librarianEmail;
    }

    public void setLibrarianEmail(String librarianEmail) {
        this.librarianEmail = librarianEmail;
    }

    public String getLibrarianPhone() {
        return librarianPhone;
    }

    public void setLibrarianPhone(String librarianPhone) {
        this.librarianPhone = librarianPhone;
    }

    public Integer getMaxBooksPerUser() {
        return maxBooksPerUser;
    }

    public void setMaxBooksPerUser(Integer maxBooksPerUser) {
        this.maxBooksPerUser = maxBooksPerUser;
    }

    public Integer getLoanPeriodDays() {
        return loanPeriodDays;
    }

    public void setLoanPeriodDays(Integer loanPeriodDays) {
        this.loanPeriodDays = loanPeriodDays;
    }

    public Double getFineRatePerDay() {
        return fineRatePerDay;
    }

    public void setFineRatePerDay(Double fineRatePerDay) {
        this.fineRatePerDay = fineRatePerDay;
    }

    public String getSystemNotice() {
        return systemNotice;
    }

    public void setSystemNotice(String systemNotice) {
        this.systemNotice = systemNotice;
    }
}
