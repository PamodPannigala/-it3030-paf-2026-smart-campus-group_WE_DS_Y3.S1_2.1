package com.campus.hub.dto;

import com.campus.hub.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;

public class TicketStatusUpdateDTO {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    private String assignedTechnician;

    private String rejectionReason; // Added for admin rejection

    public TicketStatusUpdateDTO() {
    }

    public TicketStatusUpdateDTO(TicketStatus status, String assignedTechnician, String rejectionReason) {
        this.status = status;
        this.assignedTechnician = assignedTechnician;
        this.rejectionReason = rejectionReason;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public String getAssignedTechnician() {
        return assignedTechnician;
    }

    public void setAssignedTechnician(String assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}