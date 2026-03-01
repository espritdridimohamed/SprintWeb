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
        // Migrate old "buyer" role to "viewer"
        roleRepository.findByName("buyer").ifPresent(buyerRole -> {
            buyerRole.setName("viewer");
            buyerRole.setDescription("Viewer");
            roleRepository.save(buyerRole);
        });

        String[] roleNames = {"producteur", "technicien", "cooperative", "ong", "etat", "admin", "viewer"};
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
            if (roleRepository.findByName(roleNames[i]).isEmpty()) {
                roleRepository.save(new Role(roleNames[i], roleDescriptions[i]));
            }
        }
    }
}
