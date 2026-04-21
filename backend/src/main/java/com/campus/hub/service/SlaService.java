package com.campus.hub.service;

import com.campus.hub.config.SlaConfig;
import com.campus.hub.entity.SlaStatus;
import com.campus.hub.entity.Ticket;
import com.campus.hub.entity.TicketStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class SlaService {

    /**
     * Calculate and set SLA deadlines when ticket is created
     */
    public void calculateSlaDeadlines(Ticket ticket) {
        String priority = ticket.getPriority();
        LocalDateTime createdAt = ticket.getCreatedAt();

        // Get SLA durations (default to LOW if priority not found)
        Duration firstResponseDuration = SlaConfig.FIRST_RESPONSE_SLA.getOrDefault(priority,
                SlaConfig.FIRST_RESPONSE_SLA.get("LOW"));
        Duration resolutionDuration = SlaConfig.RESOLUTION_SLA.getOrDefault(priority,
                SlaConfig.RESOLUTION_SLA.get("LOW"));

        // Calculate deadlines
        ticket.setSlaFirstResponseDue(createdAt.plus(firstResponseDuration));
        ticket.setSlaResolutionDue(createdAt.plus(resolutionDuration));
        ticket.setSlaStatus(SlaStatus.ON_TRACK);
    }

    /**
     * Update SLA status when technician is assigned (first response)
     */
    @Transactional
    public void recordFirstResponse(Ticket ticket) {
        if (ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(LocalDateTime.now());
            updateSlaStatus(ticket);
        }
    }

    /**
     * Update SLA status when ticket is resolved
     */
    @Transactional
    public void recordResolution(Ticket ticket) {
        if (ticket.getResolvedAt() == null &&
                (ticket.getStatus() == TicketStatus.RESOLVED ||
                        ticket.getStatus() == TicketStatus.CLOSED)) {
            ticket.setResolvedAt(LocalDateTime.now());
            updateSlaStatus(ticket);
        }
    }

    /**
     * Check and update SLA status for a ticket
     */
    public void updateSlaStatus(Ticket ticket) {
        LocalDateTime now = LocalDateTime.now();
        SlaStatus newStatus = calculateCurrentSlaStatus(ticket, now);
        ticket.setSlaStatus(newStatus);
    }

    /**
     * Calculate current SLA status based on time remaining
     */
    private SlaStatus calculateCurrentSlaStatus(Ticket ticket, LocalDateTime now) {
        // If already resolved, keep last status or check if breached
        if (ticket.getResolvedAt() != null) {
            return (ticket.getResolvedAt().isAfter(ticket.getSlaResolutionDue()))
                    ? SlaStatus.BREACHED
                    : ticket.getSlaStatus();
        }

        // Check resolution deadline first (most critical)
        if (ticket.getSlaResolutionDue() != null) {
            if (now.isAfter(ticket.getSlaResolutionDue())) {
                return SlaStatus.BREACHED;
            }

            Duration totalResolution = Duration.between(ticket.getCreatedAt(), ticket.getSlaResolutionDue());
            Duration remainingResolution = Duration.between(now, ticket.getSlaResolutionDue());

            if (remainingResolution.toMillis() < totalResolution.toMillis() * SlaConfig.RISK_THRESHOLD_PERCENT) {
                return SlaStatus.AT_RISK;
            }
        }

        // Check first response deadline if not yet responded
        if (ticket.getFirstResponseAt() == null && ticket.getSlaFirstResponseDue() != null) {
            if (now.isAfter(ticket.getSlaFirstResponseDue())) {
                return SlaStatus.BREACHED;
            }

            Duration totalResponse = Duration.between(ticket.getCreatedAt(), ticket.getSlaFirstResponseDue());
            Duration remainingResponse = Duration.between(now, ticket.getSlaFirstResponseDue());

            if (remainingResponse.toMillis() < totalResponse.toMillis() * SlaConfig.RISK_THRESHOLD_PERCENT) {
                return SlaStatus.AT_RISK;
            }
        }

        return SlaStatus.ON_TRACK;
    }
}