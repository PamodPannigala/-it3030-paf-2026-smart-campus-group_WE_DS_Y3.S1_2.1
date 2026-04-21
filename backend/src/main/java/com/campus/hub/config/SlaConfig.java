package com.campus.hub.config;

import java.time.Duration;
import java.util.Map;

public class SlaConfig {
    
    // First Response SLA targets (when technician is assigned)
    public static final Map<String, Duration> FIRST_RESPONSE_SLA = Map.of(
        "LOW", Duration.ofHours(24),
        "MEDIUM", Duration.ofHours(8),
        "HIGH", Duration.ofHours(2),
        "URGENT", Duration.ofMinutes(30)
    );
    
    // Resolution SLA targets
    public static final Map<String, Duration> RESOLUTION_SLA = Map.of(
        "LOW", Duration.ofDays(5),
        "MEDIUM", Duration.ofDays(3),
        "HIGH", Duration.ofDays(1),
        "URGENT", Duration.ofHours(4)
    );
    
    // Risk threshold - when less than 20% time remains
    public static final double RISK_THRESHOLD_PERCENT = 0.20;
}