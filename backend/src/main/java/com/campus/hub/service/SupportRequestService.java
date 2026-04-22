package com.campus.hub.service;

import com.campus.hub.dto.SupportRequestAdminUpdateRequest;
import com.campus.hub.dto.SupportRequestCreateRequest;
import com.campus.hub.dto.SupportRequestResponse;
import java.util.List;

public interface SupportRequestService {

    SupportRequestResponse create(Long userId, SupportRequestCreateRequest request);

    List<SupportRequestResponse> listForUser(Long userId);

    List<SupportRequestResponse> listAll();

    SupportRequestResponse updateByAdmin(Long requestId, SupportRequestAdminUpdateRequest request);
}
