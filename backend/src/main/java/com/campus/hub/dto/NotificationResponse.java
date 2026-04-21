package com.campus.hub.dto;

import com.campus.hub.entity.NotificationCategory;
import java.time.LocalDateTime;

/**
 * DTO for sending notification details to the client.
 * Manually implemented as a class to support standard JavaBean conventions.
 */
public class NotificationResponse {

    private Long id;
    private NotificationCategory category;
    private String title;
    private String message;
    private boolean isRead;
    private String referenceType;
    private String referenceId;
    private LocalDateTime createdAt;

    // --- Constructors ---

    /**
     * Default constructor required by Jackson for JSON deserialization.
     */
    public NotificationResponse() {
    }

    /**
     * All-args constructor for manual instantiation.
     */
    public NotificationResponse(Long id, NotificationCategory category, String title, 
                                String message, boolean isRead, String referenceType, 
                                String referenceId, LocalDateTime createdAt) {
        this.id = id;
        this.category = category;
        this.title = title;
        this.message = message;
        this.isRead = isRead;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.createdAt = createdAt;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public NotificationCategory getCategory() {
        return category;
    }

    public void setCategory(NotificationCategory category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean isRead) {
        this.isRead = isRead;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}