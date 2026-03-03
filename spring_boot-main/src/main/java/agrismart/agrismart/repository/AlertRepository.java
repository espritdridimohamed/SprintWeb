package agrismart.agrismart.repository;

import agrismart.agrismart.model.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AlertRepository extends MongoRepository<Alert, String> {
    List<Alert> findAllByOrderByCreatedAtDesc();
    List<Alert> findByResolvedFalseOrderByCreatedAtDesc();
    List<Alert> findByResolvedTrueOrderByResolvedAtDesc();
    List<Alert> findByTargetOrderByCreatedAtDesc(String target);
    List<Alert> findByTargetAndResolvedFalseOrderByCreatedAtDesc(String target);
}
