package agrismart.agrismart.service;

import agrismart.agrismart.model.Role;
import agrismart.agrismart.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class RoleService {
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

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
            // Use upsert to avoid duplicate key errors even if database is corrupted
            Query query = Query.query(Criteria.where("name").is(roleNames[i]));
            Update update = new Update()
                .set("name", roleNames[i])
                .set("description", roleDescriptions[i])
                .setOnInsert("createdAt", new Date());
            
            mongoTemplate.upsert(query, update, Role.class);
        }

        // Clean up any old "buyer" roles (case-insensitive)
        mongoTemplate.remove(Query.query(Criteria.where("name").regex("^buyer$", "i")), Role.class);
    }
}
