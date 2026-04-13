package com.campus.hub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    private String priority; // LOW, MEDIUM, HIGH

    private String reporterName;
    private String reporterEmail;

    // ✅ Keep old string technician name for compatibility
    private String assignedTechnician;

    // ✅ NEW technician entity relation
    @ManyToOne
    @JoinColumn(name = "technician_id")
    private Technician technician;

    private String location;

    @ElementCollection
    @CollectionTable(
            name = "ticket_images",
            joinColumns = @JoinColumn(name = "ticket_id")
    )
    @Column(name = "image_url")
    private List<String> imageUrls;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String rejectionReason;

    // ===== NEW FIELDS =====
    @Column(name = "repair_count")
    private Integer repairCount = 0;

    @Column(name = "last_repair_date")
    private LocalDateTime lastRepairDate;

    // ===== EXTRA FORM FIELDS =====
    private String category;
    private String contactNumber;
    private LocalDateTime incidentDate;

    // ✅ NEW resolution notes
    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    // =========================
    // CONSTRUCTOR
    // =========================
    public Ticket() {
        this.status = TicketStatus.OPEN;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.repairCount = 0;
    }

    // =========================
    // GETTERS & SETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Technician getTechnician() {
        return technician;
    }

    public void setTechnician(Technician technician) {
        this.technician = technician;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getReporterName() {
        return reporterName;
    }

    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
    }

    public String getReporterEmail() {
        return reporterEmail;
    }

    public void setReporterEmail(String reporterEmail) {
        this.reporterEmail = reporterEmail;
    }

    public String getAssignedTechnician() {
        return assignedTechnician;
    }

    public void setAssignedTechnician(String assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Integer getRepairCount() {
        return repairCount;
    }

    public void setRepairCount(Integer repairCount) {
        this.repairCount = repairCount;
    }

    public LocalDateTime getLastRepairDate() {
        return lastRepairDate;
    }

    public void setLastRepairDate(LocalDateTime lastRepairDate) {
        this.lastRepairDate = lastRepairDate;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public LocalDateTime getIncidentDate() {
        return incidentDate;
    }

    public void setIncidentDate(LocalDateTime incidentDate) {
        this.incidentDate = incidentDate;
    }
}