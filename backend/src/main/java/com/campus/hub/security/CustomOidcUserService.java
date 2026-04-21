package com.campus.hub.security;

import com.campus.hub.entity.CampusUser;
import com.campus.hub.entity.Role;
import com.campus.hub.repository.CampusUserRepository;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
public class CustomOidcUserService extends OidcUserService {

    private final CampusUserRepository campusUserRepository;

    public CustomOidcUserService(CampusUserRepository campusUserRepository) {
        this.campusUserRepository = campusUserRepository;
    }


    @Value("${app.seed.admin-email:}")
    private String seedAdminEmail;

    @Value("${app.seed.admin-name:System Admin}")
    private String seedAdminName;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);
        Map<String, Object> attributes = oidcUser.getAttributes();

        String email = normalizeEmail(readString(attributes, "email"));
        if (email == null) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_user_info"), "Email is missing in OAuth2 user info");
        }

        String nameFromOAuth = readString(attributes, "name");
        final String fullName = nameFromOAuth != null
                ? nameFromOAuth
                : (isSeedAdmin(email) && !seedAdminName.isBlank() ? seedAdminName : email);

        final String provider = userRequest.getClientRegistration().getRegistrationId().toUpperCase(Locale.ROOT);

        CampusUser user = campusUserRepository.findByEmailIgnoreCase(email)
                .map(existing -> updateExistingUser(existing, fullName, provider, email))
                .orElseGet(() -> createNewUser(email, fullName, provider));

        user = campusUserRepository.save(user);

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        String nameAttributeKey = userRequest.getClientRegistration()
                .getProviderDetails()
                .getUserInfoEndpoint()
                .getUserNameAttributeName();

        if (nameAttributeKey == null || !attributes.containsKey(nameAttributeKey)) {
            nameAttributeKey = attributes.containsKey("email") ? "email" : "sub";
        }

        return new DefaultOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo(), nameAttributeKey);
    }

    private CampusUser createNewUser(String email, String fullName, String provider) {
        Role role = isSeedAdmin(email) ? Role.ADMIN : Role.USER;
        return CampusUser.builder()
                .email(email)
                .fullName(fullName)
                .role(role)
                .authProvider(provider)
                .enabled(true)
                .build();
    }

    private CampusUser updateExistingUser(CampusUser existing, String fullName, String provider, String email) {
        existing.setFullName(fullName);
        existing.setAuthProvider(provider);
        existing.setEnabled(true);
        if (isSeedAdmin(email)) {
            existing.setRole(Role.ADMIN);
        }
        return existing;
    }

    private boolean isSeedAdmin(String email) {
        return seedAdminEmail != null
                && !seedAdminEmail.isBlank()
                && seedAdminEmail.equalsIgnoreCase(email);
    }

    private String readString(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        if (value == null) {
            return null;
        }
        String text = value.toString().trim();
        return text.isEmpty() ? null : text;
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        return normalized.isEmpty() ? null : normalized;
    }
}
