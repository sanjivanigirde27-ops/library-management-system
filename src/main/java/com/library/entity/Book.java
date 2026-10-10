package com.library.entity;

import jakarta.persistence.*;

/**
 * Module 2: Book Management Entity
 * Represents books in the library catalog.
 */
@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 100)
    private String author;

    @Column(nullable = false, unique = true, length = 50)
    private String isbn;

    @Column(nullable = false, length = 50)
    private String category; // e.g. Computer Science, Mathematics, Literature

    @Column(length = 100)
    private String publisher;

    @Column(name = "rack_number", length = 30)
    private String rackNumber; // Shelf/Rack location in library

    @Column(name = "total_copies")
    private Integer totalCopies;

    @Column(name = "available_copies")
    private Integer availableCopies;

    private Double price;

    public Book() {
        this.totalCopies = 1;
        this.availableCopies = 1;
        this.price = 0.0;
    }

    public Book(String title, String author, String isbn, String category, String publisher, String rackNumber, Integer totalCopies, Double price) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.category = category;
        this.publisher = publisher;
        this.rackNumber = rackNumber;
        this.totalCopies = totalCopies != null ? totalCopies : 1;
        this.availableCopies = this.totalCopies;
        this.price = price != null ? price : 0.0;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public String getRackNumber() {
        return rackNumber;
    }

    public void setRackNumber(String rackNumber) {
        this.rackNumber = rackNumber;
    }

    public Integer getTotalCopies() {
        return totalCopies;
    }

    public void setTotalCopies(Integer totalCopies) {
        this.totalCopies = totalCopies;
    }

    public Integer getAvailableCopies() {
        return availableCopies;
    }

    public void setAvailableCopies(Integer availableCopies) {
        this.availableCopies = availableCopies;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}
