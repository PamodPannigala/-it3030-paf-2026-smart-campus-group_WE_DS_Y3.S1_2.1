package com.campus.hub.service;

import com.campus.hub.dto.TechnicianResponse;
import com.campus.hub.dto.TicketRequestDTO;
import com.campus.hub.dto.TicketResponseDTO;
import com.campus.hub.entity.Technician;
import com.campus.hub.entity.Ticket;
import com.campus.hub.entity.TicketStatus;
import com.campus.hub.repository.CommentRepository;
import com.campus.hub.repository.TechnicianRepository;
import com.campus.hub.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import com.campus.hub.repository.CampusUserRepository;
import com.campus.hub.dto.NotificationCreateRequest;
import com.campus.hub.entity.NotificationCategory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TechnicianRepository technicianRepository;
    private final CommentRepository commentRepository;
    // ✅ NEW: Inject SLA Service
    private final SlaService slaService;
    private final CampusUserRepository campusUserRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository,
            TechnicianRepository technicianRepository,
            CommentRepository commentRepository,
            SlaService slaService,
            CampusUserRepository campusUserRepository,
            NotificationService notificationService) { // ✅ NEW parameter
        this.ticketRepository = ticketRepository;
        this.technicianRepository = technicianRepository;
        this.commentRepository = commentRepository;
        this.slaService = slaService; // ✅ NEW
        this.campusUserRepository = campusUserRepository;
        this.notificationService = notificationService;
    }

    // =========================
    // FILE UPLOAD
    // =========================
    private List<String> saveFiles(List<MultipartFile> files) throws IOException {

        List<String> urls = new ArrayList<>();
        if (files == null || files.isEmpty())
            return urls;

        Path uploadPath = Paths.get("uploads");

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        for (MultipartFile file : files) {

            if (file.isEmpty())
                continue;

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            Files.write(filePath, file.getBytes());

            urls.add("/uploads/" + fileName);
        }

        return urls;
    }

    // =========================
    // ENTITY → DTO
    // =========================
    private TicketResponseDTO convertToDTO(Ticket ticket) {

        TicketResponseDTO dto = new TicketResponseDTO();

        dto.setId(ticket.getId());
        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setStatus(ticket.getStatus().name());
        dto.setPriority(ticket.getPriority());
        dto.setReporterName(ticket.getReporterName());
        dto.setReporterEmail(ticket.getReporterEmail());

        if (ticket.getAssignedTechnician() != null) {
            TechnicianResponse tech = new TechnicianResponse();
            tech.setName(ticket.getAssignedTechnician());
            dto.setAssignedTechnician(tech);
        }

        dto.setLocation(ticket.getLocation());
        dto.setImageUrls(ticket.getImageUrls());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setRejectionReason(ticket.getRejectionReason());
        dto.setRepairCount(ticket.getRepairCount());
        dto.setLastRepairDate(ticket.getLastRepairDate());
        dto.setCategory(ticket.getCategory());
        dto.setContactNumber(ticket.getContactNumber());
        dto.setIncidentDate(ticket.getIncidentDate());

        // NEW: Add SLA fields to DTO
        dto.setSlaFirstResponseDue(ticket.getSlaFirstResponseDue());
        dto.setSlaResolutionDue(ticket.getSlaResolutionDue());
        dto.setSlaStatus(ticket.getSlaStatus() != null ? ticket.getSlaStatus().name() : null);
        dto.setFirstResponseAt(ticket.getFirstResponseAt());
        dto.setResolvedAt(ticket.getResolvedAt());

        return dto;
    }

    // =========================
    // TECHNICIAN → DTO
    // =========================
    private TechnicianResponse convertTechDTO(Technician tech) {

        TechnicianResponse dto = new TechnicianResponse();

        dto.setId(tech.getId());
        dto.setName(tech.getName());
        dto.setEmail(tech.getEmail());
        dto.setTeam(tech.getTeam());
        dto.setSpecialization(tech.getSpecialization());
        dto.setPhone(tech.getPhone());
        dto.setStatus(tech.getStatus());

        return dto;
    }

    public List<TechnicianResponse> getAllTechnicians() {
        return technicianRepository.findAll()
                .stream()
                .map(this::convertTechDTO)
                .collect(Collectors.toList());
    }

    // =========================
    // ASSIGN TECHNICIAN
    // =========================
    public TicketResponseDTO assignTechnician(Long ticketId, Long technicianId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Technician tech = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        ticket.setAssignedTechnician(tech.getName());
        ticket.setUpdatedAt(LocalDateTime.now());

        // ✅ NEW: Record first response (technician assignment)
        slaService.recordFirstResponse(ticket);

        // Notify Admins about the assignment
        try {
            NotificationCreateRequest notifyAdmin = new NotificationCreateRequest();
            notifyAdmin.setTargetGroup("ALL_ADMINS");
            notifyAdmin.setCategory(NotificationCategory.TICKET_STATUS);
            notifyAdmin.setTitle("Technician Assigned to Ticket");
            notifyAdmin.setMessage(String.format("Technician '%s' has been assigned to Ticket #%d.", tech.getName(), ticket.getId()));
            notifyAdmin.setReferenceType("TICKET");
            notifyAdmin.setReferenceId(ticket.getId().toString());
            notificationService.create(notifyAdmin);
        } catch (Exception e) {
            // Silently fail notification
        }

        return convertToDTO(ticketRepository.save(ticket));
    }

    // =========================
    // GET TICKETS BY TECHNICIAN EMAIL
    // =========================
    public List<TicketResponseDTO> getTicketsByTechnician(String email) {
        Technician technician = technicianRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Technician not found with email: " + email));

        List<Ticket> tickets = ticketRepository.findByAssignedTechnician(technician.getName());

        return tickets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // =========================
    // CREATE TICKET
    // =========================
    public TicketResponseDTO createTicket(TicketRequestDTO request) {

        Ticket ticket = new Ticket();

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setReporterName(request.getReporterName());
        ticket.setReporterEmail(request.getReporterEmail());
        ticket.setLocation(request.getLocation());
        ticket.setImageUrls(request.getImageUrls());

        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        // ✅ NEW: Calculate SLA deadlines
        slaService.calculateSlaDeadlines(ticket);

        Ticket saved = ticketRepository.save(ticket);

        campusUserRepository.findByEmailIgnoreCase(saved.getReporterEmail()).ifPresent(user -> {
            try {
                notificationService.create(new NotificationCreateRequest(
                    user.getId(),
                    "SPECIFIC",
                    NotificationCategory.TICKET_STATUS,
                    "Ticket Created",
                    "Your ticket '" + saved.getTitle() + "' has been submitted successfully.",
                    "TICKET",
                    String.valueOf(saved.getId())
                ));
            } catch (Exception e) {
                System.err.println("Failed to send notification: " + e.getMessage());
            }
        });

        return convertToDTO(saved);
    }

    // =========================
    // CREATE WITH FILES
    // =========================
    public TicketResponseDTO createTicketWithFiles(
            String title,
            String description,
            String priority,
            String reporterName,
            String reporterEmail,
            String location,
            String category,
            String contactNumber,
            LocalDateTime incidentDate,
            List<MultipartFile> attachments) throws IOException {

        Ticket ticket = new Ticket();

        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setPriority(priority);
        ticket.setReporterName(reporterName);
        ticket.setReporterEmail(reporterEmail);
        ticket.setLocation(location);

        ticket.setCategory(category);
        ticket.setContactNumber(contactNumber);
        ticket.setIncidentDate(incidentDate);

        ticket.setImageUrls(saveFiles(attachments));

        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        // ✅ NEW: Calculate SLA deadlines
        slaService.calculateSlaDeadlines(ticket);

        Ticket saved = ticketRepository.save(ticket);

        campusUserRepository.findByEmailIgnoreCase(saved.getReporterEmail()).ifPresent(user -> {
            try {
                notificationService.create(new NotificationCreateRequest(
                    user.getId(),
                    "SPECIFIC",
                    NotificationCategory.TICKET_STATUS,
                    "Ticket Created",
                    "Your ticket '" + saved.getTitle() + "' with attachments has been submitted.",
                    "TICKET",
                    String.valueOf(saved.getId())
                ));
            } catch (Exception e) {
                System.err.println("Failed to send notification: " + e.getMessage());
            }
        });

        return convertToDTO(saved);
    }

    // =========================
    // EDIT WITH FILES
    // =========================
    public TicketResponseDTO editTicketWithFiles(
            Long id,
            String reporterEmail,
            String title,
            String description,
            String priority,
            String location,
            String category,
            String contactNumber,
            LocalDateTime incidentDate,
            List<MultipartFile> attachments) throws IOException {

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getReporterEmail().equalsIgnoreCase(reporterEmail)) {
            throw new RuntimeException("Not allowed");
        }

        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setPriority(priority);
        ticket.setLocation(location);

        ticket.setCategory(category);
        ticket.setContactNumber(contactNumber);
        ticket.setIncidentDate(incidentDate);

        if (attachments != null && !attachments.isEmpty()) {
            ticket.setImageUrls(saveFiles(attachments));
        }

        ticket.setUpdatedAt(LocalDateTime.now());

        return convertToDTO(ticketRepository.save(ticket));
    }

    // =========================
    // GET METHODS
    // =========================
    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TicketResponseDTO getTicketById(Long id) {
        return ticketRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public List<TicketResponseDTO> getTicketsByReporter(String email) {
        return ticketRepository.findByReporterEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TicketResponseDTO> getTicketsByStatus(String status) {

        TicketStatus ts = TicketStatus.valueOf(status.toUpperCase());

        return ticketRepository.findByStatusOrderByCreatedAtDesc(ts)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // =========================
    // STATUS UPDATE
    // =========================
    public TicketResponseDTO updateTicketStatus(
            Long ticketId,
            TicketStatus status,
            String technician,
            String rejectionReason,
            String role,
            String userName) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if ("ADMIN".equalsIgnoreCase(role)) {

            ticket.setStatus(status);

            if (status == TicketStatus.REJECTED) {
                ticket.setRejectionReason(rejectionReason);
                ticket.setAssignedTechnician(null);
            }

            if (technician != null) {
                ticket.setAssignedTechnician(technician);
                // ✅ NEW: Record first response when admin assigns technician
                slaService.recordFirstResponse(ticket);
            }
        }

        if ("TECHNICIAN".equalsIgnoreCase(role)) {

            if (!userName.equalsIgnoreCase(ticket.getAssignedTechnician())) {
                throw new RuntimeException("Not assigned technician");
            }

            ticket.setStatus(status);
        }

        ticket.setUpdatedAt(LocalDateTime.now());

        // ✅ NEW: Record resolution if status is RESOLVED or CLOSED
        if (status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED) {
            slaService.recordResolution(ticket);
        }

        Ticket saved = ticketRepository.save(ticket);

        campusUserRepository.findByEmailIgnoreCase(saved.getReporterEmail()).ifPresent(user -> {
            try {
                notificationService.create(new NotificationCreateRequest(
                    user.getId(),
                    "SPECIFIC",
                    NotificationCategory.TICKET_STATUS,
                    "Ticket Status Updated",
                    "Your ticket '" + saved.getTitle() + "' status is now: " + saved.getStatus().name(),
                    "TICKET",
                    String.valueOf(saved.getId())
                ));
            } catch (Exception e) {
                System.err.println("Failed to send notification: " + e.getMessage());
            }
        });

        return convertToDTO(saved);
    }

    // =========================
    // DELETE TICKET
    // =========================
    @Transactional
    public void deleteTicket(Long id, String reporterEmail) {
        if (reporterEmail == null || reporterEmail.trim().isEmpty()) {
            throw new RuntimeException("Reporter email is required");
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        String normalizedEmail = reporterEmail.trim();
        String ticketEmail = ticket.getReporterEmail() != null ? ticket.getReporterEmail().trim() : "";

        if (!ticketEmail.equalsIgnoreCase(normalizedEmail)) {
            throw new RuntimeException("You can only delete your own tickets");
        }

        // Delete comments first (works whether 0 or many comments)
        commentRepository.deleteByTicketId(id);

        // Delete the ticket
        ticketRepository.delete(ticket);
    }
}