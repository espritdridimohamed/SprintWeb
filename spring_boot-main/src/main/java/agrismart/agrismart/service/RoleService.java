package agrismart.agrismart.service;

import agrismart.agrismart.model.Role;
import agrismart.agrismart.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RoleService {
    @Autowired
    private RoleRepository roleRepository;

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Optional<Role> getRoleByName(String name) {
        return roleRepository.findByName(name);
    }

    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    public void initializeRoles() {
        // Migrate old "buyer" role to "VIEWER"
        roleRepository.findByNameIgnoreCase("buyer").ifPresent(buyerRole -> {
            buyerRole.setName("VIEWER");
            buyerRole.setDescription("Viewer");
            roleRepository.save(buyerRole);
        });

        // Use UPPERCASE role names to match DataInitializer and @PreAuthorize checks
        String[] roleNames = {"PRODUCTEUR", "TECHNICIEN", "COOPERATIVE", "ONG", "ETAT", "ADMIN", "VIEWER"};
        String[] roleDescriptions = {
            "Agriculteur",
            "Technicien Agricole",
            "Coopérative Agricole",
            "ONG",
            "Acteur Étatique",
            "Administrateur Système",
            "Viewer"
        };

        for (int i = 0; i < roleNames.length; i++) {
            if (roleRepository.findByNameIgnoreCase(roleNames[i]).isEmpty()) {
                roleRepository.save(new Role(roleNames[i], roleDescriptions[i]));
            }
        }
    }
}
