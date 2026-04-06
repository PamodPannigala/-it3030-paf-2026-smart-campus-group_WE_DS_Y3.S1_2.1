package com.campus.hub.dto;

import lombok.*;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponseDTO {
    private Long id;
    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String status;
    private String purchaseDate;
    private String lastMaintenanceDate;
    private String usageCount;
    private LocalTime openTime;
    private LocalTime closeTime;
    private boolean availableWeekends;
    private String imageUrl;
}