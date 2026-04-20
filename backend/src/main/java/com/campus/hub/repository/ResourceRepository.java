package com.campus.hub.repository;

import com.campus.hub.entity.Resource;

import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    // check name when always create a new resource
    boolean existsByName(String name);

    // When updating a resource, we need to check if the new name already exists for
    // another resource
    boolean existsByNameAndIdNot(String name, Long id);


    
    // Check for overlapping facilities in the same location
    @Query("SELECT COUNT(r) > 0 FROM Resource r " +
            "WHERE r.type = 'FACILITY' " +
            "AND r.location = :location " +
            "AND (:id IS NULL OR r.id <> :id) " +
            "AND (r.openTime < :closeTime AND r.closeTime > :openTime)")

    // This query checks if there are any existing facilities in the same location that have overlapping open and close times.
    boolean isFacilityOverlapping(@Param("location") String location,
            @Param("openTime") LocalTime openTime,
            @Param("closeTime") LocalTime closeTime,
            @Param("id") Long id);


     // Check if there is any facility in the same location (used for both create and update)
     @Query("SELECT COUNT(r) > 0 FROM Resource r WHERE r.location = :location " +
           "AND r.type = 'FACILITY' AND (:id IS NULL OR r.id <> :id)")
    boolean existsByLocationAndFacilityType(@Param("location") String location, @Param("id") Long id);

    // Custom query for filtering resources based on type, location, and capacity
    @Query("SELECT r FROM Resource r WHERE (:type IS NULL OR r.type = :type) AND (:location IS NULL OR r.location = :location) AND (:capacity IS NULL OR r.capacity >= :capacity)")
    List<Resource> findWithFilters(@Param("type") String type, @Param("location") String location,
            @Param("capacity") Integer capacity);
}
