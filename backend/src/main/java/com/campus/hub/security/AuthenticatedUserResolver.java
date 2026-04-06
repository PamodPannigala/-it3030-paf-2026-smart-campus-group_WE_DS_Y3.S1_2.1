package com.campus.hub.security;

import com.campus.hub.exception.ResourceNotFoundException;
import com.campus.hub.user.entity.CampusUser;
import com.campus.hub.user.repository.CampusUserRepository;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthenticatedUserResolver {

    private final CampusUserRepository campusUserRepository;

    public CampusUser resolve(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User is not authenticated");
        }

        String email = resolveEmail(authentication.getPrincipal());
        return campusUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + email));
    }

    private String resolveEmail(Object principal) {
        if (principal instanceof OAuth2User oauth2User) {
            Object emailAttribute = oauth2User.getAttributes().get("email");
            if (emailAttribute != null && !emailAttribute.toString().isBlank()) {
                return emailAttribute.toString();
            }
        }

        if (principal instanceof UserDetails userDetails && !userDetails.getUsername().isBlank()) {
            return userDetails.getUsername();
        }

        if (principal instanceof Map<?, ?> attributes) {
            Object email = attributes.get("email");
            if (email != null && !email.toString().isBlank()) {
                return email.toString();
            }
        }

        if (principal instanceof String value && !value.isBlank() && !"anonymousUser".equals(value)) {
            return value;
        }

        throw new AccessDeniedException("Unable to resolve authenticated user identity");
    }
}
