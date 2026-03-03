package agrismart.agrismart.repository;

import agrismart.agrismart.model.Plot;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PlotRepository extends MongoRepository<Plot, String> {
    List<Plot> findByFarmId(String farmId);
}
