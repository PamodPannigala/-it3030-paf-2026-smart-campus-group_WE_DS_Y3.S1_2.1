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
    
    // Approve booking
    public Booking approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
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
}