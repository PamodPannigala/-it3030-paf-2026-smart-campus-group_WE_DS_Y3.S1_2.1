package com.campus.hub.support.service;

import com.campus.hub.support.dto.SupportRequestAdminUpdateRequest;
import com.campus.hub.support.dto.SupportRequestCreateRequest;
import com.campus.hub.support.dto.SupportRequestResponse;
import java.util.List;

public interface SupportRequestService {

    SupportRequestResponse create(Long userId, SupportRequestCreateRequest request);

    List<SupportRequestResponse> listForUser(Long userId);

    List<SupportRequestResponse> listAll();

    SupportRequestResponse updateByAdmin(Long requestId, SupportRequestAdminUpdateRequest request);
}
