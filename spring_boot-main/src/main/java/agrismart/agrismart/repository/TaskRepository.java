package agrismart.agrismart.repository;

import agrismart.agrismart.model.AgriTask;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<AgriTask, String> {
    List<AgriTask> findByOwnerEmail(String ownerEmail);

    List<AgriTask> findByAssignedTo(String assignedTo);
}
