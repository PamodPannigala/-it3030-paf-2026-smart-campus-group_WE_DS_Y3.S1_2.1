package com.campus.hub.dto;

/**
 * DTO for updating user notification preferences.
 * Using Boolean wrapper objects to allow null values (no change) during updates.
 */
public class NotificationPreferenceUpdateRequest {

    private Boolean systemEnabled;
    private Boolean bookingEnabled;
    private Boolean facilityEnabled;
    private Boolean ticketStatusEnabled;
    private Boolean ticketCommentEnabled;
    private Boolean emailEnabled;
    private Boolean pushEnabled;

    // --- Constructors ---

    /**
     * Default constructor required for Jackson to instantiate the DTO.
     */
    public NotificationPreferenceUpdateRequest() {
    }

    /**
     * All-args constructor for manual instantiation.
     */
    public NotificationPreferenceUpdateRequest(Boolean systemEnabled, Boolean bookingEnabled, 
                                             Boolean facilityEnabled, Boolean ticketStatusEnabled, 
                                             Boolean ticketCommentEnabled, Boolean emailEnabled, 
                                             Boolean pushEnabled) {
        this.systemEnabled = systemEnabled;
        this.bookingEnabled = bookingEnabled;
        this.facilityEnabled = facilityEnabled;
        this.ticketStatusEnabled = ticketStatusEnabled;
        this.ticketCommentEnabled = ticketCommentEnabled;
        this.emailEnabled = emailEnabled;
        this.pushEnabled = pushEnabled;
    }

    // --- Getters and Setters ---

    public Boolean getSystemEnabled() {
        return systemEnabled;
    }

    public void setSystemEnabled(Boolean systemEnabled) {
        this.systemEnabled = systemEnabled;
    }

    public Boolean getBookingEnabled() {
        return bookingEnabled;
    }

    public void setBookingEnabled(Boolean bookingEnabled) {
        this.bookingEnabled = bookingEnabled;
    }

    public Boolean getFacilityEnabled() {
        return facilityEnabled;
    }

    public void setFacilityEnabled(Boolean facilityEnabled) {
        this.facilityEnabled = facilityEnabled;
    }

    public Boolean getTicketStatusEnabled() {
        return ticketStatusEnabled;
    }

    public void setTicketStatusEnabled(Boolean ticketStatusEnabled) {
        this.ticketStatusEnabled = ticketStatusEnabled;
    }

    public Boolean getTicketCommentEnabled() {
        return ticketCommentEnabled;
    }

    public void setTicketCommentEnabled(Boolean ticketCommentEnabled) {
        this.ticketCommentEnabled = ticketCommentEnabled;
    }

    public Boolean getEmailEnabled() {
        return emailEnabled;
    }

    public void setEmailEnabled(Boolean emailEnabled) {
        this.emailEnabled = emailEnabled;
    }

    public Boolean getPushEnabled() {
        return pushEnabled;
    }

    public void setPushEnabled(Boolean pushEnabled) {
        this.pushEnabled = pushEnabled;
    }
}