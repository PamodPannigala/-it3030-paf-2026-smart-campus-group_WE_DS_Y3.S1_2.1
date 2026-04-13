package com.campus.hub.dto;

import java.time.LocalDateTime;
import java.util.List;

public class TicketResponseDTO {

    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String reporterName;
    private String reporterEmail;

    // ✅ FIXED: now supports Technician object (not String)
    private TechnicianResponse assignedTechnician;

    private String location;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String rejectionReason;

    // ===== EXISTING NEW FIELDS =====
    private Integer repairCount;
    private LocalDateTime lastRepairDate;

    // ===== NEW FIELDS FOR FORM =====
    private String category;
    private String contactNumber;
    private LocalDateTime incidentDate;

    public TicketResponseDTO() {
    }

    public TicketResponseDTO(Long id, String title, String description, String status,
                             String priority, String reporterName, String reporterEmail,
                             TechnicianResponse assignedTechnician, String location,
                             List<String> imageUrls,
                             LocalDateTime createdAt, LocalDateTime updatedAt,
                             String rejectionReason, Integer repairCount,
                             LocalDateTime lastRepairDate, String category,
                             String contactNumber, LocalDateTime incidentDate) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.reporterName = reporterName;
        this.reporterEmail = reporterEmail;
        this.assignedTechnician = assignedTechnician;
        this.location = location;
        this.imageUrls = imageUrls;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.rejectionReason = rejectionReason;
        this.repairCount = repairCount;
        this.lastRepairDate = lastRepairDate;
        this.category = category;
        this.contactNumber = contactNumber;
        this.incidentDate = incidentDate;
    }

    // ===== GETTERS & SETTERS =====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getReporterEmail() { return reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }

    public TechnicianResponse getAssignedTechnician() {
        return assignedTechnician;
    }

    public void setAssignedTechnician(TechnicianResponse assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Integer getRepairCount() { return repairCount; }
    public void setRepairCount(Integer repairCount) { this.repairCount = repairCount; }

    public LocalDateTime getLastRepairDate() { return lastRepairDate; }
    public void setLastRepairDate(LocalDateTime lastRepairDate) { this.lastRepairDate = lastRepairDate; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public LocalDateTime getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDateTime incidentDate) { this.incidentDate = incidentDate; }
}