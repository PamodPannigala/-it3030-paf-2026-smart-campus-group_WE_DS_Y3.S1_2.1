package com.campus.hub.service;

import com.campus.hub.dto.TechnicianResponse;
import com.campus.hub.dto.TicketRequestDTO;
import com.campus.hub.dto.TicketResponseDTO;
import com.campus.hub.entity.Technician;
import com.campus.hub.entity.Ticket;
import com.campus.hub.entity.TicketStatus;
import com.campus.hub.repository.TechnicianRepository;
import com.campus.hub.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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

    public TicketService(TicketRepository ticketRepository,
                         TechnicianRepository technicianRepository) {
        this.ticketRepository = ticketRepository;
        this.technicianRepository = technicianRepository;
    }

    // =========================
    // FILE UPLOAD
    // =========================
    private List<String> saveFiles(List<MultipartFile> files) throws IOException {

        List<String> urls = new ArrayList<>();
        if (files == null || files.isEmpty()) return urls;

        Path uploadPath = Paths.get("uploads");

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        for (MultipartFile file : files) {

            if (file.isEmpty()) continue;

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

        // IMPORTANT: STRING ONLY
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

        return convertToDTO(ticketRepository.save(ticket));
    }

    // ✅ ADDED: GET TICKETS BY TECHNICIAN EMAIL
    // =========================
    public List<TicketResponseDTO> getTicketsByTechnician(String email) {
        // Find technician by email to get their name
        Technician technician = technicianRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Technician not found with email: " + email));
        
        // Get all tickets assigned to this technician (by name - String)
        List<Ticket> tickets = ticketRepository.findByAssignedTechnician(technician.getName());
        
        // Convert to DTOs and return
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

        return convertToDTO(ticketRepository.save(ticket));
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
            List<MultipartFile> attachments
    ) throws IOException {

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

        return convertToDTO(ticketRepository.save(ticket));
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
            List<MultipartFile> attachments
    ) throws IOException {

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
            String userName
    ) {

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
            }
        }

        if ("TECHNICIAN".equalsIgnoreCase(role)) {

            if (!userName.equalsIgnoreCase(ticket.getAssignedTechnician())) {
                throw new RuntimeException("Not assigned technician");
            }

            ticket.setStatus(status);
        }

        ticket.setUpdatedAt(LocalDateTime.now());

        return convertToDTO(ticketRepository.save(ticket));
    }
}