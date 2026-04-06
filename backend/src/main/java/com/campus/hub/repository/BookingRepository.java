package com.campus.hub.repository;

import com.campus.hub.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Booking> findAllByOrderByCreatedAtDesc();
    
    // Exclude CANCELLED and REJECTED bookings from conflict checking
    // Only PENDING and APPROVED bookings block new bookings
    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId " +
           "AND b.bookingDate = :date " +
           "AND b.status NOT IN ('CANCELLED', 'REJECTED') " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookings(@Param("resourceId") Long resourceId,
                                          @Param("date") LocalDate date,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime);
}