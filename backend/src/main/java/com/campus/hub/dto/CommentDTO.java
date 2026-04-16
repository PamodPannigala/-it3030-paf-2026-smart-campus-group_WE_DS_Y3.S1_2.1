package com.campus.hub.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CommentDTO {

    private Long id;
    private Long ticketId;
    private String author;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;  // NEW: Track edit time

    // =========================
    // PHASE 2 UPGRADE FIELDS
    // =========================
    private Long parentCommentId;

    // 🔥 FIXED: support multiple images
    private List<String> imageUrls;

    private Boolean isAdminResponse;

    // NEW (IMPORTANT FOR UI BADGES)
    private String authorRole;

    public CommentDTO() {}

    public CommentDTO(Long id, Long ticketId, String author,
                      String message, LocalDateTime createdAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.author = author;
        this.message = message;
        this.createdAt = createdAt;
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

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
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

    // NEW: updatedAt getter and setter
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // =========================
    // THREAD SUPPORT
    // =========================
    public Long getParentCommentId() {
        return parentCommentId;
    }

    public void setParentCommentId(Long parentCommentId) {
        this.parentCommentId = parentCommentId;
    }

    // =========================
    // IMAGE SUPPORT (FIXED)
    // =========================
    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    // =========================
    // ROLE BADGE SUPPORT
    // =========================
    public String getAuthorRole() {
        return authorRole;
    }

    public void setAuthorRole(String authorRole) {
        this.authorRole = authorRole;
    }

    // =========================
    // ADMIN RESPONSE FLAG
    // =========================
    public Boolean getIsAdminResponse() {
        return isAdminResponse;
    }

    public void setIsAdminResponse(Boolean isAdminResponse) {
        this.isAdminResponse = isAdminResponse;
    }
}