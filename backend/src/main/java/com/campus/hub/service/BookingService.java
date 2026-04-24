package com.campus.hub.service;

import com.campus.hub.dto.BookingResponseDTO;
import com.campus.hub.dto.BookingRequest;
import com.campus.hub.entity.Booking;
import com.campus.hub.entity.BookingStatus;
import com.campus.hub.entity.Role;
import com.campus.hub.entity.Resource;
import com.campus.hub.repository.BookingRepository;
import com.campus.hub.repository.ResourceRepository;
import com.campus.hub.dto.NotificationCreateRequest;
import com.campus.hub.entity.NotificationCategory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class BookingService {
    
    @Autowired
    private ResourceRepository resourceRepository;
    
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;
    
    // Convert Booking to DTO with resource details
    public BookingResponseDTO convertToDTO(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(booking.getId());
        dto.setResourceId(booking.getResourceId());
        dto.setUserId(booking.getUserId());
        dto.setBookingDate(booking.getBookingDate());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setPurpose(booking.getPurpose());
        dto.setExpectedAttendees(booking.getExpectedAttendees());
        dto.setSpecialRequests(booking.getSpecialRequests());
        dto.setStatus(booking.getStatus().name());
        dto.setRejectionReason(booking.getRejectionReason());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        dto.setCheckedIn(booking.isCheckedIn());
        dto.setCheckedInAt(booking.getCheckedInAt());
        dto.setQrCodeGeneratedAt(booking.getQrCodeGeneratedAt());
        
        // Get resource details
        resourceRepository.findById(booking.getResourceId()).ifPresent(resource -> {
            dto.setResourceName(resource.getName());
            dto.setResourceImage(resource.getImageUrl());
        });
        
        return dto;
    }
    
    // Create booking and return DTO with full backend validations
    public BookingResponseDTO createBooking(BookingRequest request, Long authenticatedUserId) {
        // ========== BACKEND VALIDATIONS ==========
        
        // 1. Validate authenticated user ID is not null
        Objects.requireNonNull(authenticatedUserId, "Authenticated user ID cannot be null");
        
        // 2. Validate request is not null
        Objects.requireNonNull(request, "Booking request cannot be null");
        
        // 3. Get and validate resource exists
        Resource resource = resourceRepository.findById(request.getResourceId())
            .orElseThrow(() -> new RuntimeException("Resource not found with ID: " + request.getResourceId()));
        
        // 4. Date range validation (present to 2031 / 5 years from now)
        LocalDate bookingDate = LocalDate.parse(request.getBookingDate());
        LocalDate today = LocalDate.now();
        LocalDate maxDate = today.plusYears(5);
        
        if (bookingDate.isBefore(today)) {
            throw new RuntimeException("Booking date cannot be in the past");
        }
        if (bookingDate.isAfter(maxDate)) {
            throw new RuntimeException("Booking date cannot be more than 5 years from now (maximum: " + maxDate + ")");
        }
        
        // 5. Weekend validation (if resource doesn't allow weekends)
        if (!resource.isAvailableWeekends()) {
            DayOfWeek dayOfWeek = bookingDate.getDayOfWeek();
            if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
                throw new RuntimeException("This resource is not available on weekends");
            }
        }
        
        // 6. Operating hours validation
        LocalTime startTime = LocalTime.parse(request.getStartTime());
        LocalTime endTime = LocalTime.parse(request.getEndTime());
        LocalTime openTime = resource.getOpenTime();
        LocalTime closeTime = resource.getCloseTime();
        
        // Check for overnight hours (e.g., 17:00 to 05:00)
        boolean crossesMidnight = closeTime.isBefore(openTime);
        
        if (crossesMidnight) {
            // Overnight operating hours
            if (startTime.isBefore(openTime) && startTime.isAfter(closeTime)) {
                throw new RuntimeException("Start time must be between " + openTime + " and " + closeTime + " (overnight)");
            }
            if (endTime.isBefore(openTime) && endTime.isAfter(closeTime)) {
                throw new RuntimeException("End time must be between " + openTime + " and " + closeTime + " (overnight)");
            }
        } else {
            // Normal operating hours
            if (startTime.isBefore(openTime) || startTime.isAfter(closeTime)) {
                throw new RuntimeException("Start time must be between " + openTime + " and " + closeTime);
            }
            if (endTime.isBefore(openTime) || endTime.isAfter(closeTime)) {
                throw new RuntimeException("End time must be between " + openTime + " and " + closeTime);
            }
        }
        
        // 7. Character limit validation
        if (request.getPurpose() != null && request.getPurpose().length() > 250) {
            throw new RuntimeException("Purpose must not exceed 250 characters (current: " + request.getPurpose().length() + ")");
        }
        if (request.getSpecialRequests() != null && request.getSpecialRequests().length() > 250) {
            throw new RuntimeException("Special requests must not exceed 250 characters (current: " + request.getSpecialRequests().length() + ")");
        }
        
        // 8. Capacity validation (for non-EQUIPMENT resources)
        if (!"EQUIPMENT".equals(resource.getType())) {
            if (request.getExpectedAttendees() == null) {
                throw new RuntimeException("Expected attendees is required");
            }
            if (request.getExpectedAttendees() <= 0) {
                throw new RuntimeException("Expected attendees must be at least 1");
            }
            if (request.getExpectedAttendees() > resource.getCapacity()) {
                throw new RuntimeException("Expected attendees cannot exceed resource capacity of " + resource.getCapacity());
            }
        }
        
        // 9. Validate start time is before end time
        if (startTime.equals(endTime)) {
            throw new RuntimeException("Start time and end time cannot be the same");
        }
        
        // 10. Check for conflicts before creating
        boolean hasConflict = checkConflict(
            request.getResourceId(),
            request.getBookingDate(),
            request.getStartTime(),
            request.getEndTime()
        );
        
        if (hasConflict) {
            throw new RuntimeException("Time slot conflict! This resource is already booked during the selected time.");
        }
        
        // ========== END OF BACKEND VALIDATIONS ==========
        
        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setUserId(authenticatedUserId);
        booking.setBookingDate(bookingDate);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setSpecialRequests(request.getSpecialRequests());
        
        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }
    
    // Check for conflicts
    public boolean checkConflict(Long resourceId, String date, String startTime, String endTime) {
        LocalDate bookingDate = LocalDate.parse(date);
        LocalTime start = LocalTime.parse(startTime);
        LocalTime end = LocalTime.parse(endTime);
        
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            resourceId, bookingDate, start, end
        );
        
        // Debug logging
        System.out.println("=== Conflict Check ===");
        System.out.println("Resource ID: " + resourceId);
        System.out.println("Date: " + bookingDate);
        System.out.println("Requested Time: " + start + " - " + end);
        System.out.println("Conflicts found: " + conflicts.size());
        
        for (Booking b : conflicts) {
            System.out.println("  - Existing: " + b.getStartTime() + " - " + b.getEndTime() + " (Status: " + b.getStatus() + ")");
        }
        
        return !conflicts.isEmpty();
    }
    
    // Get user bookings as DTOs
    public List<BookingResponseDTO> getUserBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return bookings.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    // Cancel booking
    public Booking cancelBooking(Long id) {
        Objects.requireNonNull(id, "Booking ID cannot be null");
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }
    
    // Approve booking - Also generate QR code
    public Booking approveBooking(Long id) {
        Objects.requireNonNull(id, "Booking ID cannot be null");
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(LocalDateTime.now());
        
        // Generate unique QR code token when approved
        String qrToken = generateQRToken(booking);
        booking.setQrCode(qrToken);
        booking.setQrCodeGeneratedAt(LocalDateTime.now());
        
        Booking saved = bookingRepository.save(booking);

        try {
            notificationService.create(new NotificationCreateRequest(
                saved.getUserId(),
                "SPECIFIC",
                NotificationCategory.BOOKING,
                "Booking Approved",
                "Your booking has been approved.",
                "BOOKING",
                String.valueOf(saved.getId())
            ));
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        return saved;
    }
    
    // Method for QR Token Generation 
    private String generateQRToken(Booking booking) {
        // Simple approach: encode booking ID + timestamp + secret
        String data = booking.getId() + "-" + System.currentTimeMillis() + "-CAMPUSHUB";
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(data.getBytes(StandardCharsets.UTF_8));
    }

    // Reject booking
    public Booking rejectBooking(Long id, String reason) {
        Objects.requireNonNull(id, "Booking ID cannot be null");
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking saved = bookingRepository.save(booking);

        try {
            notificationService.create(new NotificationCreateRequest(
                saved.getUserId(),
                "SPECIFIC",
                NotificationCategory.BOOKING,
                "Booking Rejected",
                "Your booking has been rejected. Reason: " + reason,
                "BOOKING",
                String.valueOf(saved.getId())
            ));
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        return saved;
    }
    
    // Get all bookings as DTOs
    public List<BookingResponseDTO> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        return bookings.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Delete booking permanently
    public void deleteBooking(Long id) {
        Objects.requireNonNull(id, "Booking ID cannot be null");
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        bookingRepository.delete(booking);
    }

    public BookingResponseDTO getBookingById(Long id) {
        Objects.requireNonNull(id, "Booking ID cannot be null");
        return bookingRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
    }

    // Generate QR code image as byte array
    public byte[] generateQRCodeImage(Long bookingId) {
        Objects.requireNonNull(bookingId, "Booking ID cannot be null");
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        if (booking.getQrCode() == null) {
            throw new RuntimeException("QR code not generated for this booking");
        }
        
        try {
            com.google.zxing.MultiFormatWriter qrCodeWriter = new com.google.zxing.MultiFormatWriter();
            java.util.Map<com.google.zxing.EncodeHintType, Object> hints = new java.util.HashMap<>();
            hints.put(com.google.zxing.EncodeHintType.CHARACTER_SET, "UTF-8");
            
            com.google.zxing.common.BitMatrix bitMatrix = qrCodeWriter.encode(
                booking.getQrCode(),
                com.google.zxing.BarcodeFormat.QR_CODE,
                300, 300,
                hints
            );
            
            javax.imageio.ImageIO.setUseCache(false);
            java.awt.image.BufferedImage qrImage = com.google.zxing.client.j2se.MatrixToImageWriter.toBufferedImage(bitMatrix);
            
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            javax.imageio.ImageIO.write(qrImage, "PNG", baos);
            
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }
    
    // Verify QR code and check-in with full validation
    public Booking verifyAndCheckin(String qrData) {
        return verifyAndCheckin(qrData, getCurrentUserId(), null);
    }

    // Validate QR and booking rules without checking in
    public Booking validateCheckin(String qrData, Long currentUserId, Role currentUserRole) {
        return resolveAndValidateCheckinBooking(qrData, currentUserId, currentUserRole);
    }

    // Resolve booking by QR data without applying check-in validations
    public Booking findBookingByQr(String qrData) {
        if (qrData == null || qrData.trim().isEmpty()) {
            throw new RuntimeException("Invalid QR code");
        }
        String normalizedQrData = normalizeQrData(qrData);
        return bookingRepository.findByQrCode(qrData)
            .orElseGet(() -> bookingRepository.findByQrCode(normalizedQrData).orElseThrow(() -> new RuntimeException("Invalid QR code")));
    }

    // Verify QR code and check-in with authenticated user context
    public Booking verifyAndCheckin(String qrData, Long currentUserId, Role currentUserRole) {
        Booking booking = resolveAndValidateCheckinBooking(qrData, currentUserId, currentUserRole);
        
        // Mark as checked in
        booking.setCheckedIn(true);
        booking.setCheckedInAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        
        return bookingRepository.save(booking);
    }

    private Booking resolveAndValidateCheckinBooking(String qrData, Long currentUserId, Role currentUserRole) {
        if (qrData == null || qrData.trim().isEmpty()) {
            throw new RuntimeException("Invalid QR code");
        }

        // Find booking by QR code
        Booking booking = findBookingByQr(qrData);
        
        // Check if booking is approved
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new RuntimeException("Booking is not approved. Current status: " + booking.getStatus());
        }
        
        // Check if already checked in
        if (booking.isCheckedIn()) {
            throw new RuntimeException("Already checked in on " + booking.getCheckedInAt());
        }
        
        // Check if booking date is TODAY
        LocalDate today = LocalDate.now();
        if (!booking.getBookingDate().equals(today)) {
            throw new RuntimeException("Booking is for " + booking.getBookingDate() + ", not today");
        }
        
        // VALIDATION 1: Check current time is within booking time slot
        LocalTime now = LocalTime.now();
        LocalTime startTime = booking.getStartTime();
        LocalTime endTime = booking.getEndTime();
        
        if (now.isBefore(startTime)) {
            throw new RuntimeException("Check-in too early! Booking starts at " + startTime);
        }
        
        if (now.isAfter(endTime)) {
            throw new RuntimeException("Check-in too late! Booking ended at " + endTime);
        }
        
        // VALIDATION 2: Check QR code expiry (72 hours from generation)
        if (booking.getQrCodeGeneratedAt() != null) {
            LocalDateTime qrExpiry = booking.getQrCodeGeneratedAt().plusHours(72);
            if (LocalDateTime.now().isAfter(qrExpiry)) {
                throw new RuntimeException("QR code has expired. Please contact administrator.");
            }
        }
        
        // VALIDATION 3: Allow staff/admin scanners; enforce ownership for end users
        boolean isStaffScanner = currentUserRole != null && (
                currentUserRole == Role.ADMIN
                        || currentUserRole == Role.TECHNICIAN
                        || currentUserRole == Role.SECURITY);
        if (!isStaffScanner && currentUserId != null && !booking.getUserId().equals(currentUserId)) {
            throw new RuntimeException("You are not authorized to check in for this booking");
        }

        return booking;
    }

    // Normalize scanner input to reduce false "invalid QR" mismatches
    private String normalizeQrData(String qrData) {
        String normalized = qrData.trim();

        if (normalized.contains("%")) {
            try {
                normalized = URLDecoder.decode(normalized, StandardCharsets.UTF_8);
            } catch (IllegalArgumentException ignored) {
                // Keep raw value when scanner output is not URL-encoded.
            }
        }

        // Some scanner/transport layers can convert '+' into spaces.
        normalized = normalized.replace(" ", "+");
        return normalized;
    }
    
    // Helper method to get current logged-in user ID
    private Long getCurrentUserId() {
        return null;
    }
}