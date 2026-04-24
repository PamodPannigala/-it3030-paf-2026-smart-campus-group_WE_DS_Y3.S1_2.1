package com.campus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating new support requests.
 * Manually implemented as a class to support JSON deserialization and
 * mutability.
 */
public class SupportRequestCreateRequest {

        @NotBlank(message = "subject is required")
        @Size(max = 200, message = "subject is too long")
        private String subject;

        @NotBlank(message = "description is required")
        @Size(max = 4000, message = "description is too long")
        private String description;

        // --- Constructors ---

        /**
         * Default constructor required for Jackson to instantiate the object
         * during the JSON-to-Java conversion process.
         */
        public SupportRequestCreateRequest() {
        }

        /**
         * All-args constructor for manual instantiation.
         */
        public SupportRequestCreateRequest(String subject, String description) {
                this.subject = subject;
                this.description = description;
        }

        // --- Getters and Setters ---

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
}