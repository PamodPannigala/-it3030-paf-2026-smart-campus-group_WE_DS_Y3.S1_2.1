package com.campus.hub.repository;

import com.campus.hub.entity.Ticket;
import com.campus.hub.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Get all tickets created by a reporter
    List<Ticket> findByReporterEmail(String reporterEmail);

    // Get tickets by reporter email, latest first
    List<Ticket> findByReporterEmailOrderByCreatedAtDesc(String reporterEmail);

    // Get tickets by status
    List<Ticket> findByStatus(TicketStatus status);

    // Get tickets assigned to a technician
    List<Ticket> findByAssignedTechnician(String assignedTechnician);

    // Get tickets by location
    List<Ticket> findByLocation(String location);

    // Get tickets by priority
    List<Ticket> findByPriority(String priority);

    // Get tickets by status ordered by latest
    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    // Get all tickets latest first
    List<Ticket> findAllByOrderByCreatedAtDesc();
}