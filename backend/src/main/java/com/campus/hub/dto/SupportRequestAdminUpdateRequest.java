package com.campus.hub.dto;

import com.campus.hub.entity.SupportRequestStatus;
import jakarta.validation.constraints.Size;

/**
 * DTO for administrative updates to support requests.
 * Manually implemented as a class to support JSON deserialization and
 * mutability.
 */
public class SupportRequestAdminUpdateRequest {

        private SupportRequestStatus status;

        @Size(max = 4000, message = "adminNotes is too long")
        private String adminNotes;

        // --- Constructors ---

        /**
         * Default constructor required for Jackson to instantiate the object
         * before filling the fields via setters.
         */
        public SupportRequestAdminUpdateRequest() {
        }

        /**
         * All-args constructor for manual instantiation.
         */
        public SupportRequestAdminUpdateRequest(SupportRequestStatus status, String adminNotes) {
                this.status = status;
                this.adminNotes = adminNotes;
        }

        // --- Getters and Setters ---

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
}