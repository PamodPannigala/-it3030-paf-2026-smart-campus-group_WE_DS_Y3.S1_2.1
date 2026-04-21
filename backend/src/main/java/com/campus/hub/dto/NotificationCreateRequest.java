package com.campus.hub.dto;

import com.campus.hub.entity.NotificationCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for creating new notifications.
 * Manually implemented as a class to support JSON deserialization and
 * mutability.
 */
public class NotificationCreateRequest {

        private Long userId;

        @NotBlank(message = "targetGroup is required")
        private String targetGroup; // "SPECIFIC", "ALL_USERS", "ALL_ADMINS"

        @NotNull(message = "category is required")
        private NotificationCategory category;

        @NotBlank(message = "title is required")
        private String title;

        @NotBlank(message = "message is required")
        private String message;

        @NotBlank(message = "referenceType is required")
        private String referenceType;

        private String referenceId;

        // --- Constructors ---

        /**
         * Default constructor required for Jackson to instantiate the object
         * during JSON-to-Object conversion.
         */
        public NotificationCreateRequest() {
        }

        /**
         * All-args constructor for manual instantiation.
         */
        public NotificationCreateRequest(Long userId, String targetGroup, NotificationCategory category,
                        String title, String message, String referenceType, String referenceId) {
                this.userId = userId;
                this.targetGroup = targetGroup;
                this.category = category;
                this.title = title;
                this.message = message;
                this.referenceType = referenceType;
                this.referenceId = referenceId;
        }

        // --- Getters and Setters ---

        public Long getUserId() {
                return userId;
        }

        public void setUserId(Long userId) {
                this.userId = userId;
        }

        public String getTargetGroup() {
                return targetGroup;
        }

        public void setTargetGroup(String targetGroup) {
                this.targetGroup = targetGroup;
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
}