package com.campus.hub.service;

import com.campus.hub.dto.BookingResponseDTO;
import com.campus.hub.dto.BookingRequest;
import com.campus.hub.entity.Booking;
import com.campus.hub.entity.BookingStatus;
import com.campus.hub.repository.BookingRepository;
import com.campus.hub.repository.ResourceRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {
    
    @Autowired
    private ResourceRepository resourceRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    // Convert Booking to DTO with resource details
    private BookingResponseDTO convertToDTO(Booking booking) {
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
        
        // Get resource details
        resourceRepository.findById(booking.getResourceId()).ifPresent(resource -> {
            dto.setResourceName(resource.getName());
            dto.setResourceImage(resource.getImageUrl());
        });
        
        return dto;
    }
    
    // Create booking and return DTO
    public BookingResponseDTO createBooking(BookingRequest request) {
        // Check for conflicts before creating
        boolean hasConflict = checkConflict(
            request.getResourceId(),
            request.getBookingDate(),
            request.getStartTime(),
            request.getEndTime()
        );
        
        if (hasConflict) {
            throw new RuntimeException("Time slot conflict! This resource is already booked during the selected time.");
        }
        
        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setUserId(request.getUserId() != null ? request.getUserId() : 1L);
        booking.setBookingDate(LocalDate.parse(request.getBookingDate()));
        booking.setStartTime(LocalTime.parse(request.getStartTime()));
        booking.setEndTime(LocalTime.parse(request.getEndTime()));
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
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }
    
    // Approve booking - Also generate QR code
    public Booking approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(LocalDateTime.now());
        
        // Generate unique QR code token when approved
        String qrToken = generateQRToken(booking);
        booking.setQrCode(qrToken);
        booking.setQrCodeGeneratedAt(LocalDateTime.now());
        
        return bookingRepository.save(booking);
    }
    
    // Method for QR Token Generation 
    private String generateQRToken(Booking booking) {
        // Simple approach: encode booking ID + timestamp + secret
        String data = booking.getId() + "-" + System.currentTimeMillis() + "-CAMPUSHUB";
        return java.util.Base64.getEncoder().encodeToString(data.getBytes());
    }

    // Reject booking
    public Booking rejectBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }
    
    // Get all bookings as DTOs
    public List<BookingResponseDTO> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        return bookings.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Delete booking permanently
    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        bookingRepository.delete(booking);
    }

    // Generate QR code image as byte array
    public byte[] generateQRCodeImage(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
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
        // Find booking by QR code
        Booking booking = bookingRepository.findByQrCode(qrData)
            .orElseThrow(() -> new RuntimeException("Invalid QR code"));
        
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
        
        // VALIDATION 3: Check if user is the one who made the booking
        Long currentUserId = getCurrentUserId();
        if (currentUserId != null && !booking.getUserId().equals(currentUserId)) {
            throw new RuntimeException("You are not authorized to check in for this booking");
        }
        
        // Mark as checked in
        booking.setCheckedIn(true);
        booking.setCheckedInAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        
        return bookingRepository.save(booking);
    }
    
    // Helper method to get current logged-in user ID
    // Implement this based on your authentication method (JWT, Session, etc.)
    private Long getCurrentUserId() {
        // TODO: Implement based on your authentication method
        // For now, return 1L for testing
        // When you have authentication, uncomment and implement:
        
        // Option 1: If using Spring Security
        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
        //     CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
        //     return user.getId();
        // }
        
        // Option 2: If using JWT token
        // String token = request.getHeader("Authorization");
        // if (token != null && token.startsWith("Bearer ")) {
        //     token = token.substring(7);
        //     return jwtUtil.extractUserId(token);
        // }
        
        // Temporary for testing - returns default user ID 1
        // Remove this line when implementing real authentication
        return 1L;
    }
}