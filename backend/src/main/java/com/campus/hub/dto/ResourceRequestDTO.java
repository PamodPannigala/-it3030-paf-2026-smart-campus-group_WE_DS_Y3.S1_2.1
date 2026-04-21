package com.campus.hub.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalTime;

public class ResourceRequestDTO {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Type is required")
    private String type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    @Pattern(regexp = "ACTIVE|AVAILABLE|MAINTENANCE|OUT_OF_SERVICE", message = "Status must be ACTIVE, AVAILABLE, MAINTENANCE, or OUT_OF_SERVICE")
    private String status;
    private String purchaseDate;
    private String lastMaintenanceDate;
    private String usageCount;
    private LocalTime openTime;
    private LocalTime closeTime;
    private boolean availableWeekends;
    private String imageUrl;

    @Min(2000)
    private Integer purchaseYear;

    public ResourceRequestDTO() {}

    public ResourceRequestDTO(String name, String type, Integer capacity, String location, String status,
                             String purchaseDate, String lastMaintenanceDate, String usageCount,
                             LocalTime openTime, LocalTime closeTime, boolean availableWeekends,
                             String imageUrl, Integer purchaseYear) {
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.status = status;
        this.purchaseDate = purchaseDate;
        this.lastMaintenanceDate = lastMaintenanceDate;
        this.usageCount = usageCount;
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.availableWeekends = availableWeekends;
        this.imageUrl = imageUrl;
        this.purchaseYear = purchaseYear;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(String purchaseDate) { this.purchaseDate = purchaseDate; }
    public String getLastMaintenanceDate() { return lastMaintenanceDate; }
    public void setLastMaintenanceDate(String lastMaintenanceDate) { this.lastMaintenanceDate = lastMaintenanceDate; }
    public String getUsageCount() { return usageCount; }
    public void setUsageCount(String usageCount) { this.usageCount = usageCount; }
    public LocalTime getOpenTime() { return openTime; }
    public void setOpenTime(LocalTime openTime) { this.openTime = openTime; }
    public LocalTime getCloseTime() { return closeTime; }
    public void setCloseTime(LocalTime closeTime) { this.closeTime = closeTime; }
    public boolean isAvailableWeekends() { return availableWeekends; }
    public void setAvailableWeekends(boolean availableWeekends) { this.availableWeekends = availableWeekends; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Integer getPurchaseYear() { return purchaseYear; }
    public void setPurchaseYear(Integer purchaseYear) { this.purchaseYear = purchaseYear; }
}