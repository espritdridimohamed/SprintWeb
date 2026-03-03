package agrismart.agrismart.repository;

import agrismart.agrismart.model.Farm;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FarmRepository extends MongoRepository<Farm, String> {
    List<Farm> findByOwnerUserId(String ownerUserId);
}
