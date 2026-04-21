package com.campus.hub.dto;

import java.time.LocalDateTime;
import java.util.List;

public class TicketRequestDTO {

    private String title;
    private String description;
    private String priority;
    private String reporterName;
    private String reporterEmail;
    private String location;
    private List<String> imageUrls;

    // ===== NEW FIELDS =====
    private String category;
    private String contactNumber;
    private LocalDateTime incidentDate;

    public TicketRequestDTO() {
    }

    public TicketRequestDTO(String title, String description, String priority,
                            String reporterName, String reporterEmail,
                            String location, List<String> imageUrls,
                            String category, String contactNumber, LocalDateTime incidentDate) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.reporterName = reporterName;
        this.reporterEmail = reporterEmail;
        this.location = location;
        this.imageUrls = imageUrls;
        this.category = category;
        this.contactNumber = contactNumber;
        this.incidentDate = incidentDate;
    }

    // ===== GETTERS & SETTERS =====
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getReporterEmail() { return reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public LocalDateTime getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDateTime incidentDate) { this.incidentDate = incidentDate; }
}