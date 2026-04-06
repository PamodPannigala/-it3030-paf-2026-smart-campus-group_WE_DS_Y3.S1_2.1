package com.campus.hub.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceRequestDTO {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Type is required")
    private String type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location ;

    @Pattern(regexp = "ACTIVE|AVAILABLE|MAINTENANCE|OUT_OF_SERVICE", 
         message = "Status must be ACTIVE, AVAILABLE, MAINTENANCE, or OUT_OF_SERVICE")
    private String status;
    private String purchaseDate;
    private String lastMaintenanceDate;
    private String usageCount;
    private LocalTime openTime;
    private LocalTime closeTime;
    private boolean availableWeekends;
    private String imageUrl;
}