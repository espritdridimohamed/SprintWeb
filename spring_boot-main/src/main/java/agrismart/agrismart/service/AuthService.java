package agrismart.agrismart.service;

import agrismart.agrismart.dto.AuthResponse;
import agrismart.agrismart.dto.LoginRequest;
import agrismart.agrismart.dto.RegisterRequest;
import agrismart.agrismart.model.User;
import agrismart.agrismart.model.Role;
import agrismart.agrismart.repository.UserRepository;
import agrismart.agrismart.repository.RoleRepository;
import agrismart.agrismart.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Lookup roleId from role name
        Role role = roleRepository.findByNameIgnoreCase(request.getRole())
            .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRole()));

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFirstName(),
                request.getLastName(),
                role.getId()
        );
        user.setOrganization(request.getOrganization());
        
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), role.getName());
        return new AuthResponse(
            token,
            user.getEmail(),
            role.getName(),
            user.getFirstName(),
            user.getLastName(),
            user.getProfilePictureUrl()
        );
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }
        
        // Lookup role name from roleId
        Role role = roleRepository.findById(user.getRoleId())
            .orElseThrow(() -> new RuntimeException("Role not found"));

        String token = jwtUtil.generateToken(user.getEmail(), role.getName());
        return new AuthResponse(
            token,
            user.getEmail(),
            role.getName(),
            user.getFirstName(),
            user.getLastName(),
            user.getProfilePictureUrl()
        );
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
