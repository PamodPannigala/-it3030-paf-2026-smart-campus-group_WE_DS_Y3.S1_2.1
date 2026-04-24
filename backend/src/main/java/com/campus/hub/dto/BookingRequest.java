package com.campus.hub.dto;

import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.Length;

public class BookingRequest {
    
    @NotNull(message = "Resource ID is required")
    private Long resourceId;
    
    private Long userId;
    
    @NotBlank(message = "Booking date is required")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Booking date must be in format YYYY-MM-DD")
    private String bookingDate;
    
    @NotBlank(message = "Start time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):([0-5]\\d)$", message = "Start time must be in format HH:MM")
    private String startTime;
    
    @NotBlank(message = "End time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):([0-5]\\d)$", message = "End time must be in format HH:MM")
    private String endTime;
    
    @NotBlank(message = "Purpose is required")
    @Size(max = 250, message = "Purpose must not exceed 250 characters")
    private String purpose;
    
    @Min(value = 0, message = "Expected attendees must be 0 or greater")
    private Integer expectedAttendees;
    
    @Size(max = 250, message = "Special requests must not exceed 250 characters")
    private String specialRequests;
    
    private String status;
    
    // Getters and Setters
    public Long getResourceId() {
        return resourceId;
    }
    
    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getBookingDate() {
        return bookingDate;
    }
    
    public void setBookingDate(String bookingDate) {
        this.bookingDate = bookingDate;
    }
    
    public String getStartTime() {
        return startTime;
    }
    
    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }
    
    public String getEndTime() {
        return endTime;
    }
    
    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
    
    public String getPurpose() {
        return purpose;
    }
    
    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
    
    public Integer getExpectedAttendees() {
        return expectedAttendees;
    }
    
    public void setExpectedAttendees(Integer expectedAttendees) {
        this.expectedAttendees = expectedAttendees;
    }
    
    public String getSpecialRequests() {
        return specialRequests;
    }
    
    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}