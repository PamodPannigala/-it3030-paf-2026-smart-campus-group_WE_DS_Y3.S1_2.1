package com.campus.hub.controller;

import com.campus.hub.dto.BookingRequest;
import com.campus.hub.dto.BookingResponseDTO;
import com.campus.hub.entity.CampusUser;
import com.campus.hub.entity.Booking;
import com.campus.hub.security.AuthenticatedUserResolver;
import com.campus.hub.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173") // For React frontend
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private AuthenticatedUserResolver authenticatedUserResolver;

    // Create a new booking
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request, Authentication authentication) {
        try {
            CampusUser currentUser = authenticatedUserResolver.resolve(authentication);
            BookingResponseDTO booking = bookingService.createBooking(request, currentUser.getId());
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Check for conflicts
    @GetMapping("/check-conflict")
    public ResponseEntity<?> checkConflict(@RequestParam Long resourceId,
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        boolean hasConflict = bookingService.checkConflict(resourceId, date, startTime, endTime);
        return ResponseEntity.ok(Map.of("conflicts", hasConflict ? List.of("Conflict found") : List.of()));
    }

    // Get user's bookings
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponseDTO>> getUserBookings(@PathVariable Long userId, Authentication authentication) {
        CampusUser currentUser = authenticatedUserResolver.resolve(authentication);
        if (!currentUser.getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        List<BookingResponseDTO> bookings = bookingService.getUserBookings(currentUser.getId());
        return ResponseEntity.ok(bookings);
    }

    // Get current session user's bookings
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(Authentication authentication) {
        CampusUser currentUser = authenticatedUserResolver.resolve(authentication);
        List<BookingResponseDTO> bookings = bookingService.getUserBookings(currentUser.getId());
        return ResponseEntity.ok(bookings);
    }

    // Cancel booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            Booking booking = bookingService.cancelBooking(id);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Approve booking (Admin only)
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long id) {
        try {
            Booking booking = bookingService.approveBooking(id);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Reject booking (Admin only)
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String reason = payload.get("reason");
            Booking booking = bookingService.rejectBooking(id, reason);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Get all bookings (Admin only)
    @GetMapping("/all")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        List<BookingResponseDTO> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    // Delete booking (Admin only - permanent deletion)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.ok(Map.of("message", "Booking deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Get QR code image for a booking
    @GetMapping("/{id}/qrcode")
    public ResponseEntity<byte[]> getQRCode(@PathVariable Long id) {
        try {
            byte[] qrImage = bookingService.generateQRCodeImage(id);
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_PNG)
                    .body(qrImage);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Verify check-in (called by scanner)
    @PostMapping("/verify-checkin")
    public ResponseEntity<?> verifyCheckin(@RequestBody Map<String, String> payload, Authentication authentication) {
        try {
            CampusUser currentUser = authenticatedUserResolver.resolve(authentication);
            String qrData = payload.get("qrData");
            Booking booking = bookingService.verifyAndCheckin(qrData, currentUser.getId(), currentUser.getRole());
            return ResponseEntity.ok(Map.of(
                    "message", "Check-in successful",
                    "bookingId", booking.getId(),
                    "resourceName", booking.getResourceId(),
                    "checkedInAt", booking.getCheckedInAt().toString(),
                    "checkedIn", booking.isCheckedIn()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}