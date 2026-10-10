package com.library.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Module 5: Fine Management Entity
 * Tracks overdue charges, payment status, and fine receipts.
 */
@Entity
@Table(name = "fines")
public class Fine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "issue_id", nullable = false)
    private BookIssue bookIssue;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "overdue_days")
    private Integer overdueDays;

    @Column(length = 30)
    private String status; // "UNPAID", "PAID", "WAIVED"

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "payment_mode", length = 50)
    private String paymentMode; // "Cash", "UPI", "Card", "Online"

    @Column(length = 255)
    private String remarks;

    public Fine() {
        this.status = "UNPAID";
        this.amount = 0.0;
        this.overdueDays = 0;
    }

    public Fine(BookIssue bookIssue, User user, Double amount, Integer overdueDays, String remarks) {
        this.bookIssue = bookIssue;
        this.user = user;
        this.amount = amount != null ? amount : 0.0;
        this.overdueDays = overdueDays != null ? overdueDays : 0;
        this.status = "UNPAID";
        this.remarks = remarks;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BookIssue getBookIssue() {
        return bookIssue;
    }

    public void setBookIssue(BookIssue bookIssue) {
        this.bookIssue = bookIssue;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Integer getOverdueDays() {
        return overdueDays;
    }

    public void setOverdueDays(Integer overdueDays) {
        this.overdueDays = overdueDays;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getPaidDate() {
        return paidDate;
    }

    public void setPaidDate(LocalDate paidDate) {
        this.paidDate = paidDate;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
