package com.campus.hub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    private String author;

    @Column(length = 1000)
    private String message;

    private LocalDateTime createdAt;

    // =========================
    // THREAD SUPPORT (KEEP DB AS parentId)
    // =========================
    private Long parentId;

    // =========================
    // ROLE (ADMIN / USER / SUPPORT)
    // =========================
    private String authorRole;

    // =========================
    // IMAGE SUPPORT (MULTIPLE IMAGES)
    // =========================
    @ElementCollection
    @CollectionTable(
            name = "comment_images",
            joinColumns = @JoinColumn(name = "comment_id")
    )
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();

    // =========================
    // CONSTRUCTOR
    // =========================
    public Comment() {
        this.createdAt = LocalDateTime.now();
    }

    // =========================
    // GETTERS & SETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // =========================
    // THREAD (parentId)
    // =========================
    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    // =========================
    // ROLE
    // =========================
    public String getAuthorRole() {
        return authorRole;
    }

    public void setAuthorRole(String authorRole) {
        this.authorRole = authorRole;
    }

    // =========================
    // IMAGES
    // =========================
    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
}