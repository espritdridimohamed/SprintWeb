package agrismart.agrismart.repository;

import agrismart.agrismart.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByFacebookId(String facebookId);
    boolean existsByEmail(String email);
}
