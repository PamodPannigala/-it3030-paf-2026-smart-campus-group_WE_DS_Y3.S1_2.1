package com.campus.hub.controller;

import com.campus.hub.dto.ResourceRequestDTO;
import com.campus.hub.dto.ResourceResponseDTO;
import com.campus.hub.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*",allowedHeaders = "*")
// @CrossOrigin(origins = "http://localhost:5173")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public List<ResourceResponseDTO> getAllResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer capacity) {
        if (type != null || location != null || capacity != null) {
            return resourceService.getResourcesWithFilters(type, location, capacity);
        }
        return resourceService.getAllResources();
    }

    @PostMapping
    public ResourceResponseDTO createResource(@Valid @RequestBody ResourceRequestDTO dto) {
        return resourceService.createResource(dto);
    }

    @GetMapping("/{id}")
    public ResourceResponseDTO getResourceById(@PathVariable Long id) {
        return resourceService.getResourceById(id);
    }

    @PutMapping("/{id}")
    public ResourceResponseDTO updateResource(@PathVariable Long id, @Valid @RequestBody ResourceRequestDTO dto) {
        return resourceService.updateResource(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
    }

    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics() {
        return resourceService.getResourceAnalytics();
    }
}
