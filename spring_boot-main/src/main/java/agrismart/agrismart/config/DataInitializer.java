package agrismart.agrismart.config;

import agrismart.agrismart.model.Role;
import agrismart.agrismart.model.User;
import agrismart.agrismart.repository.RoleRepository;
import agrismart.agrismart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Initialise la base de données MongoDB au démarrage :
 * - Crée les rôles s'ils n'existent pas.
 * - Crée un administrateur par défaut si aucun admin n'existe.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Initialiser les rôles
        List<String> roleNames = Arrays.asList(
                "ADMIN", "PRODUCTEUR", "COOPERATIVE", "TECHNICIEN", "ONG", "ETAT", "VIEWER");

        for (String name : roleNames) {
            if (roleRepository.findByNameIgnoreCase(name).isEmpty()) {
                roleRepository.save(new Role(name, "Rôle " + name.toLowerCase()));
                System.out.println("Rôle créé : " + name);
            }
        }

        // 2. Initialiser l'administrateur par défaut
        String adminEmail = "admin@agrismart.tn";
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            Role adminRole = roleRepository.findByNameIgnoreCase("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Rôle ADMIN non trouvé après initialisation"));

            User admin = new User(
                    adminEmail,
                    passwordEncoder.encode("admin123"),
                    "System",
                    "Admin",
                    adminRole.getId());
            admin.setOrganization("AgriSmart");
            admin.setStatus("ACTIVE");

            userRepository.save(admin);
            System.out.println("Compte Administrateur par défaut créé : " + adminEmail + " / admin123");
        }
    }
}
