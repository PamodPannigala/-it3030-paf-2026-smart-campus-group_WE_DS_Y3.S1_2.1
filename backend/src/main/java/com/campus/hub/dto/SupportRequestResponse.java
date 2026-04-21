package com.campus.hub.dto;

import com.campus.hub.entity.SupportRequestStatus;
import java.time.LocalDateTime;

/**
 * DTO for sending support request details to the client.
 * Manually implemented as a class to support standard JavaBean conventions.
 */
public class SupportRequestResponse {

    private Long id;
    private Long userId;
    private String userEmail;
    private String subject;
    private String description;
    private SupportRequestStatus status;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // --- Constructors ---

    /**
     * Default constructor required for JSON serialization.
     */
    public SupportRequestResponse() {
    }

    /**
     * All-args constructor for manual instantiation within the service layer.
     */
    public SupportRequestResponse(Long id, Long userId, String userEmail, String subject, 
                                  String description, SupportRequestStatus status, 
                                  String adminNotes, LocalDateTime createdAt, 
                                  LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.subject = subject;
        this.description = description;
        this.status = status;
        this.adminNotes = adminNotes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public SupportRequestStatus getStatus() {
        return status;
    }

    public void setStatus(SupportRequestStatus status) {
        this.status = status;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}