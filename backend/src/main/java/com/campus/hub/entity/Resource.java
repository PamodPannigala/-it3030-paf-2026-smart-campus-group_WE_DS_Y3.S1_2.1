package com.campus.hub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    
    @Column(name = "image_url")
    private String imageUrl;
}