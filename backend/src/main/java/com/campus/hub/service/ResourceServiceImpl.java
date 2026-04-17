package com.campus.hub.service;

import com.campus.hub.dto.ResourceRequestDTO;
import com.campus.hub.dto.ResourceResponseDTO;
import com.campus.hub.entity.Resource;
import com.campus.hub.exception.BusinessException;
import com.campus.hub.exception.ResourceNotFoundException;
import com.campus.hub.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ResourceServiceImpl implements ResourceService {
    private final ResourceRepository resourceRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public ResourceResponseDTO createResource(ResourceRequestDTO dto) {

        // method call to validate the uniqueness of the resource name during creation
        validateResourceNameUniqueness(dto.getName(), null);

        Resource resource = new Resource();
        mapToEntity(dto, resource);
        Resource saved = resourceRepository.save(resource);
        return mapToResponseDTO(saved);
    }

    @Override
    public List<ResourceResponseDTO> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceResponseDTO> getResourcesWithFilters(String type, String location, Integer capacity) {
        return resourceRepository.findWithFilters(type, location, capacity).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceResponseDTO getResourceById(Long id) {
        return resourceRepository.findById(id)
                .map(this::mapToResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    @Override
    public ResourceResponseDTO updateResource(Long id, ResourceRequestDTO dto) {
        return resourceRepository.findById(id)
                .map(existing -> {
                    // method call to validate the uniqueness of the resource name during update
                    // (excluding the current resource)
                    validateResourceNameUniqueness(dto.getName(), id);

                    mapToEntity(dto, existing);
                    return mapToResponseDTO(resourceRepository.save(existing));
                }).orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

    }

    @Override
    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    @Override
    public Map<String, Object> getResourceAnalytics() {
        List<Resource> resources = resourceRepository.findAll();
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalResources", resources.size());
        analytics.put("availableResources", resources.stream()
                .filter(r -> r.getStatus() != null && "ACTIVE".equalsIgnoreCase(r.getStatus()))
                .count());
        analytics.put("maintenanceResources", resources.stream()
                .filter(r -> r.getStatus() != null &&
                        ("UNDER_REPAIR".equalsIgnoreCase(r.getStatus()) ||
                                "MAINTENANCE".equalsIgnoreCase(r.getStatus()) ||
                                "OUT_OF_SERVICE".equalsIgnoreCase(r.getStatus())))
                .count());
        return analytics;
    }

    private void mapToEntity(ResourceRequestDTO dto, Resource resource) {
        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setStatus(dto.getStatus());
        resource.setPurchaseDate(dto.getPurchaseDate());
        resource.setLastMaintenanceDate(dto.getLastMaintenanceDate());
        resource.setUsageCount(dto.getUsageCount());
        resource.setOpenTime(dto.getOpenTime());
        resource.setCloseTime(dto.getCloseTime());
        resource.setAvailableWeekends(dto.isAvailableWeekends());
        resource.setPurchaseYear(dto.getPurchaseYear());
        resource.setImageUrl(dto.getImageUrl());
    }

    private ResourceResponseDTO mapToResponseDTO(Resource resource) {
        ResourceResponseDTO dto = new ResourceResponseDTO();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setCapacity(resource.getCapacity());
        dto.setLocation(resource.getLocation());
        dto.setStatus(resource.getStatus());
        dto.setPurchaseDate(resource.getPurchaseDate());
        dto.setLastMaintenanceDate(resource.getLastMaintenanceDate());
        dto.setUsageCount(resource.getUsageCount());
        dto.setOpenTime(resource.getOpenTime());
        dto.setCloseTime(resource.getCloseTime());
        dto.setAvailableWeekends(resource.isAvailableWeekends());
        dto.setPurchaseYear(resource.getPurchaseYear());
        dto.setImageUrl(resource.getImageUrl());
        return dto;
    }

    // Helper Method: logic for checking name uniqueness during create and update
    // operations
    private void validateResourceNameUniqueness(String name, Long id) {
        boolean exists;

        if (id == null) {
            // creating a new resource - just check if the name already exists
            exists = resourceRepository.existsByName(name);
        } else {
            // updating an existing resource - check if the name is already taken by another
            // resource
            exists = resourceRepository.existsByNameAndIdNot(name, id);
        }

        if (exists) {
            // If the name already exists, throw a BusinessException with a clear message
            throw new BusinessException(
                    "Resource Name '" + name + "' is already in use. Please select a different name.");
        }
    }

}
