package com.campus.hub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private CampusUser user;

    @Column(nullable = false)
    private boolean systemEnabled = true;

    @Column(nullable = false)
    private boolean bookingEnabled = true;

    @Column(nullable = false)
    private boolean facilityEnabled = true;

    @Column(nullable = false)
    private boolean ticketStatusEnabled = true;

    @Column(nullable = false)
    private boolean ticketCommentEnabled = true;

    @Column(nullable = false)
    private boolean emailEnabled = false;

    @Column(nullable = false)
    private boolean pushEnabled = false;

    // --- Constructors ---

    /**
     * Default constructor required by JPA.
     */
    public NotificationPreference() {
    }

    /**
     * Full constructor for manual creation.
     */
    public NotificationPreference(Long id, CampusUser user, boolean systemEnabled, 
                                  boolean bookingEnabled, boolean facilityEnabled, 
                                  boolean ticketStatusEnabled, boolean ticketCommentEnabled, 
                                  boolean emailEnabled, boolean pushEnabled) {
        this.id = id;
        this.user = user;
        this.systemEnabled = systemEnabled;
        this.bookingEnabled = bookingEnabled;
        this.facilityEnabled = facilityEnabled;
        this.ticketStatusEnabled = ticketStatusEnabled;
        this.ticketCommentEnabled = ticketCommentEnabled;
        this.emailEnabled = emailEnabled;
        this.pushEnabled = pushEnabled;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CampusUser getUser() {
        return user;
    }

    public void setUser(CampusUser user) {
        this.user = user;
    }

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