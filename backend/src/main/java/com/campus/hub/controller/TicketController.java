package com.campus.hub.controller;

import com.campus.hub.dto.CommentDTO;
import com.campus.hub.dto.TechnicianResponse;
import com.campus.hub.dto.TicketRequestDTO;
import com.campus.hub.dto.TicketResponseDTO;
import com.campus.hub.dto.TicketStatusUpdateDTO;
import com.campus.hub.entity.Technician;
import com.campus.hub.repository.TechnicianRepository;
import com.campus.hub.service.CommentService;
import com.campus.hub.service.TicketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private TechnicianRepository technicianRepository;

    // =========================
    // CREATE TICKET (JSON)
    // =========================
    @PostMapping
    public ResponseEntity<?> createTicket(@Valid @RequestBody TicketRequestDTO request) {
        try {
            TicketResponseDTO ticket = ticketService.createTicket(request);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // =========================
    // CREATE TICKET WITH FILES
    // =========================
    @PostMapping(value = "/with-files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createTicketWithFiles(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String priority,
            @RequestParam String reporterName,
            @RequestParam String reporterEmail,
            @RequestParam String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String contactNumber,
            @RequestParam(required = false) String incidentDate,
            @RequestParam(value = "attachments", required = false) List<MultipartFile> attachments
    ) {
        try {
            System.out.println("=== CREATE TICKET DEBUG ===");
            System.out.println("Title: " + title);
            System.out.println("Incident Date String: " + incidentDate);
            System.out.println("Attachments: " + (attachments != null ? attachments.size() : "null"));

            LocalDateTime incidentDateTime = parseIncidentDate(incidentDate);
            System.out.println("Parsed DateTime: " + incidentDateTime);

            TicketResponseDTO ticket = ticketService.createTicketWithFiles(
                    title, description, priority, reporterName, reporterEmail,
                    location, category, contactNumber, incidentDateTime, attachments
            );

            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // =========================
    // EDIT TICKET
    // =========================
    @PutMapping(value = "/{id}/edit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> editTicket(
            @PathVariable Long id,
            @RequestParam String reporterEmail,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String priority,
            @RequestParam String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String contactNumber,
            @RequestParam(required = false) String incidentDate,
            @RequestParam(required = false) List<MultipartFile> attachments
    ) {
        try {
            LocalDateTime incidentDateTime = parseIncidentDate(incidentDate);

            TicketResponseDTO updated = ticketService.editTicketWithFiles(
                    id,
                    reporterEmail,
                    title,
                    description,
                    priority,
                    location,
                    category,
                    contactNumber,
                    incidentDateTime,
                    attachments
            );

            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // =========================
    // GET ALL TICKETS
    // =========================
    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // =========================
    // GET TICKET BY ID
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ticketService.getTicketById(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // =========================
    // REPORTER TICKETS
    // =========================
    @GetMapping("/reporter")
    public ResponseEntity<List<TicketResponseDTO>> getTicketsByReporter(@RequestParam String email) {
        return ResponseEntity.ok(ticketService.getTicketsByReporter(email));
    }

    // =========================
    // STATUS FILTER
    // =========================
    @GetMapping("/admin/status/{status}")
    public ResponseEntity<List<TicketResponseDTO>> getTicketsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ticketService.getTicketsByStatus(status));
    }

    // =========================
    // UPDATE STATUS
    // =========================
    @PutMapping("/{id}/status/{role}")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable Long id,
            @PathVariable String role,
            @RequestParam(required = false) String userName,
            @RequestBody TicketStatusUpdateDTO request
    ) {
        try {
            TicketResponseDTO updated = ticketService.updateTicketStatus(
                    id,
                    request.getStatus(),
                    request.getAssignedTechnician(),
                    request.getRejectionReason(),
                    role,
                    userName
            );
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // =========================
    // GET ALL TECHNICIANS
    // =========================
    @GetMapping("/technicians")
    public ResponseEntity<List<TechnicianResponse>> getAllTechnicians() {
        return ResponseEntity.ok(ticketService.getAllTechnicians());
    }

    // =========================
    // ASSIGN TECHNICIAN TO TICKET
    // =========================
    @PutMapping("/{ticketId}/assign/{technicianId}")
    public ResponseEntity<?> assignTechnician(
            @PathVariable Long ticketId,
            @PathVariable Long technicianId
    ) {
        try {
            TicketResponseDTO updated = ticketService.assignTechnician(ticketId, technicianId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // =========================
    // TECHNICIAN TICKETS
    // =========================
    @GetMapping("/technician")
    public ResponseEntity<List<TicketResponseDTO>> getTicketsForTechnician(
            @RequestParam String email
    ) {
        return ResponseEntity.ok(ticketService.getTicketsByTechnician(email));
    }

    // =========================
    // COMMENTS
    // =========================
    @PostMapping(value = "/{ticketId}/comments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addComment(
            @PathVariable Long ticketId,
            @RequestParam String author,
            @RequestParam String message,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) List<MultipartFile> images,
            @RequestParam(defaultValue = "USER") String authorRole
    ) {
        try {
            CommentDTO savedComment = commentService.addCommentWithImage(
                    ticketId,
                    author,
                    message,
                    parentId,
                    images,
                    authorRole
            );
            return ResponseEntity.ok(savedComment);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<CommentDTO>> getCommentsByTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicket(ticketId));
    }

    @PostMapping(value = "/{ticketId}/comments/{commentId}/edit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> editComment(
        @PathVariable Long ticketId,
        @PathVariable Long commentId,
        @RequestParam String author,
        @RequestParam String authorRole,
        @RequestParam String message,
        @RequestParam(required = false) List<MultipartFile> images,
        @RequestParam(required = false) String existingImages
) {
    try {
        // Parse existing images JSON
        List<String> keptImageUrls = new ArrayList<>();
        if (existingImages != null && !existingImages.isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            keptImageUrls = mapper.readValue(existingImages, new TypeReference<List<String>>() {});
        }

        CommentDTO updated = commentService.editCommentWithImages(
                commentId,
                author,
                authorRole,
                message,
                images,
                keptImageUrls
        );

        return ResponseEntity.ok(updated);

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
}

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestParam String author,
            @RequestParam String authorRole
    ) {
        try {
            commentService.deleteComment(commentId, author, authorRole);

            return ResponseEntity.ok(Map.of(
                    "message", "Comment deleted successfully"
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // =========================
    // TECHNICIAN MANAGEMENT
    // =========================
    @GetMapping("/technicians/verify")
    public ResponseEntity<?> verifyTechnician(@RequestParam String email) {
        try {
            Technician tech = technicianRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Technician not found"));
            return ResponseEntity.ok(tech);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/technicians")
    public ResponseEntity<?> createTechnician(@RequestBody Technician technician) {
        try {
            if (technicianRepository.findByEmail(technician.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
            }
            Technician saved = technicianRepository.save(technician);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/technicians/{id}")
    public ResponseEntity<?> updateTechnician(@PathVariable Long id, @RequestBody Technician technician) {
        try {
            Technician existing = technicianRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Technician not found"));

            if (!existing.getEmail().equals(technician.getEmail())) {
                if (technicianRepository.findByEmail(technician.getEmail()).isPresent()) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
                }
            }

            existing.setName(technician.getName());
            existing.setEmail(technician.getEmail());
            existing.setPhone(technician.getPhone());
            existing.setSpecialization(technician.getSpecialization());
            existing.setTeam(technician.getTeam());
            existing.setStatus(technician.getStatus());

            return ResponseEntity.ok(technicianRepository.save(existing));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/technicians/{id}")
    public ResponseEntity<?> deleteTechnician(@PathVariable Long id) {
        try {
            if (!technicianRepository.existsById(id)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Technician not found"));
            }
            technicianRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Technician deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // =========================
    // UTILITY - FIXED DATE PARSING
    // =========================
    private LocalDateTime parseIncidentDate(String incidentDate) {
        if (incidentDate == null || incidentDate.isEmpty()) {
            return null;
        }

        try {
            // Try ISO_LOCAL_DATE_TIME first (e.g., "2024-01-15T10:30:00")
            return LocalDateTime.parse(incidentDate);
        } catch (Exception e1) {
            try {
                // Try ISO_DATE (e.g., "2024-01-15") - HTML date input format
                return LocalDate.parse(incidentDate, DateTimeFormatter.ISO_DATE).atStartOfDay();
            } catch (Exception e2) {
                try {
                    // Try common date formats
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                    return LocalDate.parse(incidentDate, formatter).atStartOfDay();
                } catch (Exception e3) {
                    System.err.println("Failed to parse date: " + incidentDate);
                    return null;
                }
            }
        }
    }
}