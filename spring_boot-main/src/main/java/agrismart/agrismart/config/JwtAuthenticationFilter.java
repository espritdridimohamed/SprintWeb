package agrismart.agrismart.config;

import agrismart.agrismart.model.Role;
import agrismart.agrismart.model.User;
import agrismart.agrismart.repository.RoleRepository;
import agrismart.agrismart.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT Authentication Filter
 *
 * Intercepte chaque requête HTTP, extrait et valide le Bearer token,
 * puis peuple le SecurityContext avec l'email + rôle du user.
 *
 * Sécurité : si le token est absent ou invalide → la requête continue
 * sans authentification → les endpoints protégés retournent 401/403.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // No token → continue (Spring Security will deny if route requires auth)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        // Validate token
        if (!jwtUtil.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract claims
        final String email = jwtUtil.extractEmail(token);
        final String role = jwtUtil.extractRole(token);

        // Only set auth if not already set
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            String roleValue = role;
            if (roleValue == null || roleValue.isBlank()) {
                roleValue = resolveRoleFromDb(email);
            }

            String normalizedRole = roleValue == null ? "" : roleValue.trim().toUpperCase();
            if (normalizedRole.startsWith("ROLE_")) {
                normalizedRole = normalizedRole.substring(5);
            }

            normalizedRole = switch (normalizedRole) {
                case "ADMINISTRATEUR", "ADMINISTRATOR", "SYSTEM_ADMIN", "SUPERADMIN" -> "ADMIN";
                case "FARMER", "PRODUCER" -> "PRODUCTEUR";
                case "TECH" -> "TECHNICIEN";
                case "COOP", "COOPERATIF" -> "COOPERATIVE";
                case "STATE", "GOV" -> "ETAT";
                default -> normalizedRole;
            };

            if (normalizedRole.isBlank()) {
                filterChain.doFilter(request, response);
                return;
            }

            String authority = "ROLE_" + normalizedRole;
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    email,
                    null,
                    List.of(new SimpleGrantedAuthority(authority)));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveRoleFromDb(String email) {
        return userRepository.findByEmail(email)
                .map(User::getRoleId)
                .flatMap(roleRepository::findById)
                .map(Role::getName)
                .orElse(null);
    }
}
