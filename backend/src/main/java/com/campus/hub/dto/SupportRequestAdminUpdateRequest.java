package com.campus.hub.dto;

import com.campus.hub.entity.SupportRequestStatus;
import jakarta.validation.constraints.Size;

public record SupportRequestAdminUpdateRequest(
        SupportRequestStatus status,

        @Size(max = 4000, message = "adminNotes is too long")
        String adminNotes
) {
}
