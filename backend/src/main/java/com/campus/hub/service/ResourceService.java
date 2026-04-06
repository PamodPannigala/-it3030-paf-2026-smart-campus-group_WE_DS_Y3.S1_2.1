package com.campus.hub.service;

import com.campus.hub.dto.ResourceRequestDTO;
import com.campus.hub.dto.ResourceResponseDTO;
import java.util.List;

import java.util.Map;

public interface ResourceService {
    ResourceResponseDTO createResource(ResourceRequestDTO dto);
    List<ResourceResponseDTO> getAllResources();
    List<ResourceResponseDTO> getResourcesWithFilters(String type, String location, Integer capacity);
    ResourceResponseDTO getResourceById(Long id);
    ResourceResponseDTO updateResource(Long id, ResourceRequestDTO dto);
    void deleteResource(Long id);
    Map<String, Object> getResourceAnalytics();
}
