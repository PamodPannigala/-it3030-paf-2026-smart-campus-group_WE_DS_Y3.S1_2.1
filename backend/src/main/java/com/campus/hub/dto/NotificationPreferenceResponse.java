package com.campus.hub.dto;

/**
 * DTO for sending user notification preferences to the frontend.
 * Manually implemented as a class to support JSON deserialization and
 * mutability.
 */
public class NotificationPreferenceResponse {

        private boolean systemEnabled;
        private boolean bookingEnabled;
        private boolean facilityEnabled;
        private boolean ticketStatusEnabled;
        private boolean ticketCommentEnabled;
        private boolean emailEnabled;
        private boolean pushEnabled;

        // --- Constructors ---

        /**
         * Default constructor required by Jackson for JSON-to-Object mapping.
         */
        public NotificationPreferenceResponse() {
        }

        /**
         * All-args constructor for manual instantiation.
         */
        public NotificationPreferenceResponse(boolean systemEnabled, boolean bookingEnabled,
                        boolean facilityEnabled, boolean ticketStatusEnabled,
                        boolean ticketCommentEnabled, boolean emailEnabled,
                        boolean pushEnabled) {
                this.systemEnabled = systemEnabled;
                this.bookingEnabled = bookingEnabled;
                this.facilityEnabled = facilityEnabled;
                this.ticketStatusEnabled = ticketStatusEnabled;
                this.ticketCommentEnabled = ticketCommentEnabled;
                this.emailEnabled = emailEnabled;
                this.pushEnabled = pushEnabled;
        }

        // --- Getters and Setters ---

        public boolean isSystemEnabled() {
                return systemEnabled;
        }

        public void setSystemEnabled(boolean systemEnabled) {
                this.systemEnabled = systemEnabled;
        }

        public boolean isBookingEnabled() {
                return bookingEnabled;
        }

        public void setBookingEnabled(boolean bookingEnabled) {
                this.bookingEnabled = bookingEnabled;
        }

        public boolean isFacilityEnabled() {
                return facilityEnabled;
        }

        public void setFacilityEnabled(boolean facilityEnabled) {
                this.facilityEnabled = facilityEnabled;
        }

        public boolean isTicketStatusEnabled() {
                return ticketStatusEnabled;
        }

        public void setTicketStatusEnabled(boolean ticketStatusEnabled) {
                this.ticketStatusEnabled = ticketStatusEnabled;
        }

        public boolean isTicketCommentEnabled() {
                return ticketCommentEnabled;
        }

        public void setTicketCommentEnabled(boolean ticketCommentEnabled) {
                this.ticketCommentEnabled = ticketCommentEnabled;
        }

        public boolean isEmailEnabled() {
                return emailEnabled;
        }

        public void setEmailEnabled(boolean emailEnabled) {
                this.emailEnabled = emailEnabled;
        }

        public boolean isPushEnabled() {
                return pushEnabled;
        }

        public void setPushEnabled(boolean pushEnabled) {
                this.pushEnabled = pushEnabled;
        }
}