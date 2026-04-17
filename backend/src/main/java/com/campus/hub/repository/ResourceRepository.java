package com.campus.hub.repository;

import com.campus.hub.entity.Resource;
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

    @Query("SELECT r FROM Resource r WHERE (:type IS NULL OR r.type = :type) AND (:location IS NULL OR r.location = :location) AND (:capacity IS NULL OR r.capacity >= :capacity)")
    List<Resource> findWithFilters(@Param("type") String type, @Param("location") String location,
            @Param("capacity") Integer capacity);
}
